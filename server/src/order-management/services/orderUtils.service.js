const _ = require('lodash');
const moment = require('moment-timezone');
const redisClient = require('../../utils/redis');
const { getShopFromCache } = require('../../metadata/shopMetadata.service');
const { getShopTimeZone, getOperatorFromSession } = require('../../middlewares/clsHooked');
const { Order, OrderSession, Cart } = require('../../models');
const { getDishesFromCache } = require('../../metadata/dishMetadata.service');
const { OrderSessionDiscountType, DiscountValueType, OrderSessionStatus } = require('../../utils/constant');
const { throwBadRequest } = require('../../utils/errorHandling');
const { getMessageByLocale } = require('../../locale');
const { getTableFromCache, getTablesFromCache } = require('../../metadata/tableMetadata.service');
const { getUnitsFromCache } = require('../../metadata/unitMetadata.service');
const {
  getRoundTaxAmount,
  getRoundDishPrice,
  getStartTimeOfToday,
  getRoundDiscountAmount,
  divideToNPart,
} = require('../../utils/common');
const { getCustomerFromCache } = require('../../metadata/customerMetadata.service');
const { notifyNewOrder, EventActionType } = require('../../utils/awsUtils/appSync.utils');

// Merge các dish order có trùng tên và giá
const _mergeDishOrders = (dishOrders) => {
  if (_.isEmpty(dishOrders)) {
    return [];
  }

  const dishOrderMap = {};
  // eslint-disable-next-line no-restricted-syntax
  for (const dishOrder of dishOrders) {
    const item = dishOrder;
    const { dishId } = dishOrder;
    let key = `${dishId}-${dishOrder.dishName}-${dishOrder.price}`;
    key = key.replace(/\./g, '');
    const existingItem = dishOrderMap[key];
    const existingDishOrderQuantity = (_.get(existingItem, 'quantity') || 0) * 1;
    const currentOrderQuantity = (dishOrder.quantity || 0) * 1;
    item.quantity = currentOrderQuantity + existingDishOrderQuantity;
    item.beforeTaxTotalPrice = (_.get(existingItem, 'beforeTaxTotalPrice') || 0) + (dishOrder.beforeTaxTotalPrice || 0);
    item.afterTaxTotalPrice = (_.get(existingItem, 'afterTaxTotalPrice') || 0) + (dishOrder.afterTaxTotalPrice || 0);
    item.beforeTaxTotalDiscountAmount =
      (_.get(existingItem, 'beforeTaxTotalDiscountAmount') || 0) + (dishOrder.beforeTaxTotalDiscountAmount || 0);
    item.afterTaxTotalDiscountAmount =
      (_.get(existingItem, 'afterTaxTotalDiscountAmount') || 0) + (dishOrder.afterTaxTotalDiscountAmount || 0);
    item.revenueAmount = (_.get(existingItem, 'revenueAmount') || 0) + (dishOrder.revenueAmount || 0);
    item.paymentAmount = (_.get(existingItem, 'paymentAmount') || 0) + (dishOrder.paymentAmount || 0);
    dishOrderMap[key] = item;
  }
  return Object.values(dishOrderMap);
};

const formatDateTimeToISOStringRegardingReportTime = ({ dateTime, reportTime }) => {
  try {
    const timeZone = getShopTimeZone();
    let rpTime = reportTime;
    if (!rpTime) {
      rpTime = 0;
    }
    return moment(dateTime)
      .subtract(reportTime, 'h')
      .tz(timeZone)
      .toISOString(true)
      .replace(/\+0\d:00/, 'Z');
  } catch (err) {
    return dateTime.toISOString();
  }
};

const getNextAvailableOrderNo = async ({ shopId, keyBase, lastOrderNo }) => {
  let currentOrderNo = lastOrderNo;
  const retryTime = 10;
  if (redisClient.isRedisConnected()) {
    for (let counter = 0; counter < retryTime; counter += 1) {
      currentOrderNo += 1;
      const key = `${shopId}_${keyBase}_${currentOrderNo}`;
      // eslint-disable-next-line no-await-in-loop
      const canUseOrderNo = await redisClient.getCloudLock({ key, periodInSecond: 60 * 5 });
      if (canUseOrderNo) {
        return currentOrderNo;
      }
    }
  }
  return currentOrderNo + 1;
};

const getLastActiveRecord = async ({ model, select, shopId }) => {
  const shop = await getShopFromCache({ shopId });

  const startOfDay = getStartTimeOfToday({
    timezone: shop.timezone || 'Asia/Ho_Chi_Minh',
    reportTime: shop.reportTime || 0,
  });

  const record = await model.findFirst({
    where: {
      shopId,
      createdAt: {
        gt: startOfDay,
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
    select,
  });
  return record;
};

const getOrderSessionNoForNewOrderSession = async ({ shopId }) => {
  const lastActiveOrderSession = await getLastActiveRecord({
    model: OrderSession,
    select: {
      createdAt: true,
      orderSessionNo: true,
    },
    shopId,
  });
  // not existed last active order session in this shop => default = 1
  if (_.isEmpty(lastActiveOrderSession)) {
    return 1;
  }

  const shop = await getShopFromCache({ shopId });
  const reportTime = shop.reportTime || 0;
  const lastActiveOrderSessionNo = _.get(lastActiveOrderSession, 'orderSessionNo', 0);
  const current = formatDateTimeToISOStringRegardingReportTime({ dateTime: new Date(), reportTime });
  const lastActiveOrderSessionCreatedAt = formatDateTimeToISOStringRegardingReportTime({
    dateTime: _.get(lastActiveOrderSession, 'createdAt', new Date()),
    reportTime,
  });
  if (current.substring(0, 10) === lastActiveOrderSessionCreatedAt.substring(0, 10)) {
    return getNextAvailableOrderNo({
      shopId,
      keyBase: 'orderSessionNo',
      lastOrderNo: lastActiveOrderSessionNo,
    });
  }
  return getNextAvailableOrderNo({
    shopId,
    keyBase: 'orderSessionNo',
    lastOrderNo: 0,
  });
};

const getOrderNoForNewOrder = async ({ shopId }) => {
  const lastActiveOrder = await getLastActiveRecord({
    model: Order,
    select: {
      createdAt: true,
      orderNo: true,
    },
    shopId,
  });
  // not existed last active order in this shop => default = 1
  if (_.isEmpty(lastActiveOrder)) {
    return 1;
  }

  const shop = await getShopFromCache({ shopId });
  const reportTime = shop.reportTime || 0;
  const lastActiveOrderSessionNo = _.get(lastActiveOrder, 'orderNo', 0);
  const current = formatDateTimeToISOStringRegardingReportTime({ dateTime: new Date(), reportTime });
  const lastActiveOrderSessionCreatedAt = formatDateTimeToISOStringRegardingReportTime({
    dateTime: _.get(lastActiveOrder, 'createdAt', new Date()),
    reportTime,
  });
  if (current.substring(0, 10) === lastActiveOrderSessionCreatedAt.substring(0, 10)) {
    return getNextAvailableOrderNo({
      shopId,
      keyBase: 'orderNo',
      lastOrderNo: lastActiveOrderSessionNo,
    });
  }
  return getNextAvailableOrderNo({
    shopId,
    keyBase: 'orderNo',
    lastOrderNo: 0,
  });
};

const getActiveOrderSessionStatus = () => {
  return [OrderSessionStatus.unpaid];
};

const getActiveOrderSessionByTable = async ({ tableId, shopId, customerId }) => {
  const filter = {
    where: {
      shopId,
      tableIds: { has: tableId },
      status: { in: getActiveOrderSessionStatus() },
    },
  };
  if (customerId) {
    filter.where.customerId = customerId;
  }
  const orderSession = await OrderSession.findFirst(filter);

  return orderSession;
};

const _getCustomerInfoForCreatingOrderSession = async ({ customerId, numberOfCustomer }) => {
  const customerInfo = {
    numberOfCustomer: numberOfCustomer || 1,
  };
  if (customerId) {
    const customer = await getCustomerFromCache({ customerId });
    if (customer) {
      customerInfo.customerId = customer.id;
      customerInfo.customerName = customer.name;
      customerInfo.customerPhone = customer.phone;
      customerInfo.customerAddress = customer.address;
    }
  }
  return customerInfo;
};

const getOrCreateOrderSession = async ({
  orderSessionId,
  tableId,
  shopId,
  customerId,
  numberOfCustomer,
  isCustomerApp,
  isApproveOrder,
}) => {
  const table = await getTableFromCache({ shopId, tableId });
  throwBadRequest(!table, getMessageByLocale({ key: 'table.notFound' }));

  if (orderSessionId) {
    const orderSession = await OrderSession.findUnique({
      where: { id: orderSessionId },
    });
    if (orderSession) {
      return {
        isNewOrderSession: false,
        orderSession,
      };
    }
  }

  if (!table.allowMultipleOrderSession) {
    const orderSession = await getActiveOrderSessionByTable({ tableId, shopId });
    if (orderSession) {
      throwBadRequest(
        _.get(orderSession, 'customerId') !== customerId,
        getMessageByLocale({ key: 'table.alreadyHasCustomer' })
      );
      return {
        isNewOrderSession: false,
        orderSession,
      };
    }
  }

  if (isCustomerApp || isApproveOrder) {
    const orderSession = await getActiveOrderSessionByTable({ tableId, shopId, customerId });
    if (orderSession) {
      return {
        isNewOrderSession: false,
        orderSession,
      };
    }
  }

  const shop = await getShopFromCache({ shopId });
  const orderSessionNo = await getOrderSessionNoForNewOrderSession({ shopId });
  const customerInfo = await _getCustomerInfoForCreatingOrderSession({ customerId, numberOfCustomer });
  const operator = getOperatorFromSession();
  const orderSession = await OrderSession.create({
    data: {
      ...customerInfo,
      tableIds: [tableId],
      tableNames: [table.name],
      shopId,
      orderSessionNo,
      taxRate: _.get(shop, 'taxRate', 0),
      startedByUserId: _.get(operator, 'user.id'),
      startedByUserName: _.get(operator, 'employee.name') || _.get(operator, 'user.name'),
    },
  });

  return {
    isNewOrderSession: true,
    orderSession,
  };
};

const _getPaymentDetailForDishOrder = ({ price, taxRate, isTaxIncludedPrice, quantity, calculateTaxDirectly = false }) => {
  let beforeTaxPrice = isTaxIncludedPrice ? getRoundDishPrice(price / (1 + taxRate / 100)) : price;
  let afterTaxPrice = isTaxIncludedPrice ? price : getRoundDishPrice(price * (1 + taxRate / 100));
  let beforeTaxTotalPrice = beforeTaxPrice * quantity;
  let afterTaxTotalPrice = afterTaxPrice * quantity;
  if (calculateTaxDirectly) {
    // gia k bao gom thue
    if (!isTaxIncludedPrice) {
      afterTaxTotalPrice = getRoundTaxAmount(beforeTaxTotalPrice * (1 + taxRate / 100));
      afterTaxPrice = getRoundDishPrice(afterTaxTotalPrice / quantity);
    } else {
      // gia bao gom thue
      beforeTaxTotalPrice = getRoundTaxAmount(afterTaxTotalPrice / (1 + taxRate / 100));
      beforeTaxPrice = getRoundDishPrice(beforeTaxTotalPrice / quantity);
    }
  }

  return {
    beforeTaxPrice,
    beforeTaxTotalPrice,
    afterTaxPrice,
    afterTaxTotalPrice,
  };
};

const _setMetatadaForDishOrder = ({ dishOrder, dishById, unitById, orderSessionTaxRate, calculateTaxDirectly = false }) => {
  const { dishId, unitId, quantity, name, price, isTaxIncludedPrice } = dishOrder;
  let taxRate = _.get(dishOrder, 'taxRate', 0) || orderSessionTaxRate;
  if (orderSessionTaxRate < 0.001) {
    taxRate = 0;
  }

  if (!dishId) {
    const { beforeTaxPrice, beforeTaxTotalPrice, afterTaxPrice, afterTaxTotalPrice } = _getPaymentDetailForDishOrder({
      isTaxIncludedPrice,
      price,
      quantity,
      taxRate,
      calculateTaxDirectly,
    });
    return {
      dishId,
      quantity,
      name,
      unit: _.get(unitById[unitId], 'name'),
      taxRate,
      price: beforeTaxPrice,
      taxIncludedPrice: afterTaxPrice,
      isTaxIncludedPrice,
      beforeTaxTotalPrice,
      afterTaxTotalPrice,
      beforeTaxTotalDiscountAmount: 0,
      afterTaxTotalDiscountAmount: 0,
      taxAmount: afterTaxTotalPrice - beforeTaxTotalPrice,
      revenueAmount: beforeTaxTotalPrice,
      paymentAmount: afterTaxTotalPrice,
    };
  }
  const dish = dishById[dishId];
  throwBadRequest(!dish, getMessageByLocale({ key: 'dish.notFound' }));
  taxRate = dish.taxRate || orderSessionTaxRate;
  if (orderSessionTaxRate < 0.001) {
    taxRate = 0;
  }
  const { beforeTaxPrice, beforeTaxTotalPrice, afterTaxPrice, afterTaxTotalPrice } = _getPaymentDetailForDishOrder({
    isTaxIncludedPrice: dish.isTaxIncludedPrice,
    price: dish.price,
    quantity,
    taxRate,
    calculateTaxDirectly,
  });
  return {
    dishId,
    quantity,
    name: dish.name,
    unit: _.get(unitById[dish.unitId], 'name'),
    taxRate,
    price: beforeTaxPrice,
    taxIncludedPrice: afterTaxPrice,
    isTaxIncludedPrice: dish.isTaxIncludedPrice,
    beforeTaxTotalPrice,
    afterTaxTotalPrice,
    beforeTaxTotalDiscountAmount: 0,
    afterTaxTotalDiscountAmount: 0,
    revenueAmount: beforeTaxTotalPrice,
    paymentAmount: afterTaxTotalPrice,
  };
};

const createNewOrder = async ({ tableId, shopId, userId, orderSession, dishOrders, customerId, isNewOrderSession }) => {
  try {
    const shop = await getShopFromCache({ shopId });
    const dishes = await getDishesFromCache({ shopId });
    const units = await getUnitsFromCache({ shopId });
    const unitById = _.keyBy(units, 'id');
    const dishById = _.keyBy(dishes, 'id');
    const orderSessionTaxRate = _.get(orderSession, 'taxRate') || _.get(shop, 'taxRate', 0);
    const orderDishOrders = _.map(
      _.filter(dishOrders, (dishOrder) => dishOrder.quantity > 0),
      (dishOrder, index) => {
        const _dishOrder = _setMetatadaForDishOrder({
          dishById,
          dishOrder,
          unitById,
          orderSessionTaxRate,
          calculateTaxDirectly: shop.calculateTaxDirectly,
        });
        _dishOrder.dishOrderNo = index + 1;
        return _dishOrder;
      }
    );
    const orderNo = await getOrderNoForNewOrder({ shopId });
    const order = await Order.create({
      data: {
        tableId,
        shopId,
        orderSessionId: _.get(orderSession, 'id'),
        orderNo,
        dishOrders: {
          createMany: {
            data: orderDishOrders,
          },
        },
        customerId,
        totalQuantity: _.sumBy(orderDishOrders, 'quantity') || 0,
        totalBeforeTaxAmount: _.sumBy(orderDishOrders, 'beforeTaxTotalPrice') || 0,
        totalAfterTaxAmount: _.sumBy(orderDishOrders, 'afterTaxTotalPrice') || 0,
        beforeTaxTotalDiscountAmount: _.sumBy(orderDishOrders, 'beforeTaxTotalDiscountAmount') || 0,
        afterTaxTotalDiscountAmount: _.sumBy(orderDishOrders, 'afterTaxTotalDiscountAmount') || 0,
        revenueAmount: _.sumBy(orderDishOrders, 'revenueAmount') || 0,
        paymentAmount: _.sumBy(orderDishOrders, 'paymentAmount') || 0,
      },
    });
    if (orderSession) {
      await notifyNewOrder({ order, userId, action: EventActionType.CREATE });
    }

    return order;
  } catch (err) {
    // xoá order session rỗng được tạo ra
    if (isNewOrderSession) {
      await OrderSession.delete({
        where: {
          id: orderSession.id,
        },
      });
    }

    throw err;
  }
};

/**
 * Get order session json with populated datas
 */
const _getOrderSessionJson = async ({ orderSessionId, shopId }) => {
  const orderSession = await OrderSession.findUnique({
    where: {
      id: orderSessionId,
    },
    include: {
      discounts: {
        include: {
          discountProducts: true,
        },
      },
      paymentDetails: true,
      taxDetails: true,
      orders: {
        include: {
          dishOrders: true,
          returnedDishOrders: true,
        },
      },
    },
  });
  throwBadRequest(!orderSession, 'orderSession.notFound');
  throwBadRequest(shopId && orderSession.shopId !== shopId, 'orderSession.notFound');

  const orderSessionJson = _.cloneDeep(orderSession);

  // eslint-disable-next-line no-param-reassign
  shopId = orderSession.shopId;
  const shop = await getShopFromCache({ shopId });
  const tables = await getTablesFromCache({ shopId });
  const tableById = _.keyBy(tables, 'id');
  const dishes = await getDishesFromCache({ shopId });
  const dishById = _.keyBy(dishes, 'id');

  orderSession.orders.forEach((order) => {
    order.dishOrders.forEach((dishOrder) => {
      if (dishOrder.dishId) {
        // eslint-disable-next-line no-param-reassign
        dishOrder.dish = dishById[dishOrder.dish];
      }
    });
  });
  orderSessionJson.shop = shop;
  orderSessionJson.tables = _.map(orderSessionJson.tableIds, (tableId) => tableById[tableId]);
  return {
    orderSession,
    orderSessionJson,
  };
};

const getOrderSessionJsonWithLimit = async ({ shopId, limit }) => {
  const orderSessions = await OrderSession.findMany({
    where: {
      shopId,
    },
    orderBy: {
      createdAt: 'desc',
    },
    take: 1 * limit,
    include: {
      discounts: true,
      paymentDetails: true,
      taxDetails: true,
    },
  });

  const orderSessionIds = _.map(orderSessions, 'id');
  const orders = await Order.findMany({
    where: {
      orderSessionId: { in: orderSessionIds },
    },
    include: {
      dishOrders: true,
      returnedDishOrders: true,
    },
  });

  const orderMapByOrderSessionId = _.groupBy(orders, 'orderSessionId');

  const shop = await getShopFromCache({ shopId });
  const tables = await getTablesFromCache({ shopId });
  const tableById = _.keyBy(tables, 'id');
  const dishes = await getDishesFromCache({ shopId });
  const dishById = _.keyBy(dishes, 'id');

  const orderSessionJsons = _.map(orderSessions, (orderSession) => {
    const orderSessionJson = _.cloneDeep(orderSession);
    const orderJsons = _.map(orderMapByOrderSessionId[orderSessionJson.id], (order) => {
      const orderJson = _.cloneDeep(order);
      orderJson.dishOrders.forEach((dishOrder) => {
        if (dishOrder.dish) {
          // eslint-disable-next-line no-param-reassign
          dishOrder.dish = dishById[dishOrder.dish];
        }
      });
      return orderJson;
    });
    orderSessionJson.shop = shop;
    orderSessionJson.orders = orderJsons;
    orderSessionJson.tables = _.map(orderSessionJson.tableIds, (tableId) => tableById[tableId]);
    return orderSessionJson;
  });

  return orderSessionJsons;
};

const calculateTax = async ({ orderSessionJson, dishOrders, calculateTaxDirectly = false }) => {
  const shopTaxRate = _.get(orderSessionJson, 'taxRate', 0);
  if (shopTaxRate < 0.001) {
    return {
      totalTaxAmount: 0,
      taxDetails: [],
    };
  }

  let totalTaxAmount = 0;
  const taxAmountByTaxRate = {};
  _.forEach(dishOrders, (dishOrder) => {
    const dishTaxRate = dishOrder.taxRate || shopTaxRate;

    if (orderSessionJson.shouldRecalculateTax) {
      const { beforeTaxPrice, beforeTaxTotalPrice, afterTaxPrice, afterTaxTotalPrice } = _getPaymentDetailForDishOrder({
        isTaxIncludedPrice: dishOrder.isTaxIncludedPrice,
        price: dishOrder.price,
        quantity: dishOrder.quantity,
        taxRate: dishTaxRate,
        calculateTaxDirectly,
      });

      // eslint-disable-next-line no-param-reassign
      dishOrder.beforeTaxPrice = beforeTaxPrice;
      // eslint-disable-next-line no-param-reassign
      dishOrder.afterTaxPrice = afterTaxPrice;
      // eslint-disable-next-line no-param-reassign
      dishOrder.taxAmount = afterTaxTotalPrice - beforeTaxTotalPrice;
      // eslint-disable-next-line no-param-reassign
      dishOrder.revenueAmount = beforeTaxTotalPrice;
      // eslint-disable-next-line no-param-reassign
      dishOrder.paymentAmount = afterTaxTotalPrice;
      const dishOrderTotalTaxAmount = afterTaxTotalPrice - beforeTaxTotalPrice;
      totalTaxAmount += dishOrderTotalTaxAmount;
      taxAmountByTaxRate[dishTaxRate] = getRoundTaxAmount((taxAmountByTaxRate[dishTaxRate] || 0) + dishOrderTotalTaxAmount);
      return;
    }

    const dishOrderTotalTaxAmount = dishOrder.afterTaxTotalPrice - dishOrder.beforeTaxTotalPrice;
    totalTaxAmount += dishOrderTotalTaxAmount;
    taxAmountByTaxRate[dishTaxRate] = getRoundTaxAmount((taxAmountByTaxRate[dishTaxRate] || 0) + dishOrderTotalTaxAmount);
  });

  const taxDetails = _.map(taxAmountByTaxRate, (taxAmount, taxRate) => ({ taxRate: _.toNumber(taxRate), taxAmount }));
  return {
    totalTaxAmount,
    taxDetails,
  };
};

/**
 * @param {Object} params
 * @param {{beforeTaxTotalDiscountAmount: number, afterTaxTotalDiscountAmount: number}} params.discount
 * @param {{taxAmount: number, taxRate: number}[]} params.taxDetails
 * @param {{[taxRate]: {beforeTaxTotalDiscountAmount: number, afterTaxTotalDiscountAmount: number}}} params.discountDetailByTax
 */
const _calculateDiscountAmountByTaxRate = ({ discount, taxDetails, discountDetailByTax }) => {
  if (_.sumBy(taxDetails, 'taxAmount') === 0) {
    // eslint-disable-next-line no-param-reassign
    discountDetailByTax[0] = {
      beforeTaxTotalDiscountAmount:
        _.get(discountDetailByTax[0], 'beforeTaxTotalDiscountAmount', 0) + discount.beforeTaxTotalDiscountAmount,
      afterTaxTotalDiscountAmount:
        _.get(discountDetailByTax[0], 'afterTaxTotalDiscountAmount', 0) + discount.afterTaxTotalDiscountAmount,
    };
    return;
  }

  const beforeTaxParts = taxDetails.map(({ taxAmount, taxRate }) => (100 * taxAmount || 0) / (taxRate || 1));
  const afterTaxParts = taxDetails.map(({ taxAmount, taxRate }) => ((100 + taxRate) * (taxAmount || 0)) / (taxRate || 1));
  const beforeTaxDiscountBreakdown = divideToNPart({
    initialSum: discount.beforeTaxTotalDiscountAmount,
    parts: beforeTaxParts,
  });
  const afterTaxDiscountBreakdown = divideToNPart({
    initialSum: discount.afterTaxTotalDiscountAmount,
    parts: afterTaxParts,
  });
  taxDetails.forEach(({ taxRate }, index) => {
    // eslint-disable-next-line no-param-reassign
    discountDetailByTax[taxRate] = {
      beforeTaxTotalDiscountAmount:
        _.get(discountDetailByTax[taxRate], 'beforeTaxTotalDiscountAmount', 0) + beforeTaxDiscountBreakdown[index],
      afterTaxTotalDiscountAmount:
        _.get(discountDetailByTax[taxRate], 'afterTaxTotalDiscountAmount', 0) + afterTaxDiscountBreakdown[index],
    };
  });
};

const _calculateDiscountOnInvoice = ({ discount, pretaxPaymentAmount, totalTaxAmount, taxDetails, discountDetailByTax }) => {
  const { discountValue, discountValueType } = discount;

  let beforeTaxTotalDiscountAmount;
  let afterTaxTotalDiscountAmount;
  let taxTotalDiscountAmount;

  if (discountValueType === DiscountValueType.PERCENTAGE) {
    beforeTaxTotalDiscountAmount = getRoundDiscountAmount((pretaxPaymentAmount * discountValue) / 100);
    afterTaxTotalDiscountAmount = getRoundDiscountAmount(((pretaxPaymentAmount + totalTaxAmount) * discountValue) / 100);
    taxTotalDiscountAmount = getRoundDiscountAmount(afterTaxTotalDiscountAmount - beforeTaxTotalDiscountAmount);
  } else {
    beforeTaxTotalDiscountAmount = getRoundDiscountAmount((pretaxPaymentAmount * discountValue) / 100);
    afterTaxTotalDiscountAmount = getRoundDiscountAmount(((pretaxPaymentAmount + totalTaxAmount) * discountValue) / 100);
    taxTotalDiscountAmount = getRoundDiscountAmount(afterTaxTotalDiscountAmount - beforeTaxTotalDiscountAmount);
  }

  // eslint-disable-next-line no-param-reassign
  discount.beforeTaxTotalDiscountAmount = beforeTaxTotalDiscountAmount;
  // eslint-disable-next-line no-param-reassign
  discount.afterTaxTotalDiscountAmount = afterTaxTotalDiscountAmount;
  // eslint-disable-next-line no-param-reassign
  discount.taxTotalDiscountAmount = taxTotalDiscountAmount;
  _calculateDiscountAmountByTaxRate({ discount, taxDetails, discountDetailByTax });

  return { beforeTaxAmount: beforeTaxTotalDiscountAmount, afterTaxAmount: afterTaxTotalDiscountAmount };
};

const _calculateDiscountOnProduct = ({
  discount,
  dishOrderById,
  orderSessionTaxRate,
  calculateTaxDirectly,
  discountDetailByTax,
}) => {
  let beforeTaxTotalDiscountAmount = 0;
  let afterTaxTotalDiscountAmount = 0;
  let taxTotalDiscountAmount = 0;

  _.forEach(discount.discountProducts, (discountProduct) => {
    const dishOrder = dishOrderById[discountProduct.dishOrderId];
    if (!dishOrder) return;

    const taxRate = dishOrder.taxRate || orderSessionTaxRate;
    const dishQuantity = dishOrder.quantity;
    let dishOrderBeforeTaxTotalDiscountAmount;
    let dishOrderAfterTaxTotalDiscountAmount;
    let dishOrderTaxTotalDiscountAmount;

    if (calculateTaxDirectly) {
      dishOrderAfterTaxTotalDiscountAmount = getRoundDiscountAmount(
        (dishOrder.afterTaxTotalPrice * discountProduct.discountRate) / 100
      );
      dishOrderTaxTotalDiscountAmount = getRoundDiscountAmount(
        ((dishOrder.afterTaxTotalPrice - dishOrder.beforeTaxTotalPrice) * discountProduct.discountRate) / 100
      );
      dishOrderBeforeTaxTotalDiscountAmount = dishOrderAfterTaxTotalDiscountAmount - dishOrderTaxTotalDiscountAmount;
    } else {
      dishOrderBeforeTaxTotalDiscountAmount += discountProduct.beforeTaxDiscountPrice * dishQuantity;
      dishOrderAfterTaxTotalDiscountAmount += discountProduct.afterTaxDiscountPrice * dishQuantity;
      dishOrderTaxTotalDiscountAmount += discountProduct.taxDiscountPrice * dishQuantity;
    }

    beforeTaxTotalDiscountAmount += dishOrderBeforeTaxTotalDiscountAmount;
    afterTaxTotalDiscountAmount += dishOrderAfterTaxTotalDiscountAmount;
    taxTotalDiscountAmount += dishOrderTaxTotalDiscountAmount;
    // eslint-disable-next-line no-param-reassign
    discountDetailByTax[taxRate] = {
      beforeTaxTotalDiscountAmount:
        _.get(discountDetailByTax[taxRate], 'beforeTaxTotalDiscountAmount', 0) + dishOrderBeforeTaxTotalDiscountAmount,
      afterTaxTotalDiscountAmount:
        _.get(discountDetailByTax[taxRate], 'afterTaxTotalDiscountAmount', 0) + dishOrderAfterTaxTotalDiscountAmount,
    };
  });

  // eslint-disable-next-line no-param-reassign
  discount.beforeTaxTotalDiscountAmount = getRoundDiscountAmount(beforeTaxTotalDiscountAmount);
  // eslint-disable-next-line no-param-reassign
  discount.afterTaxTotalDiscountAmount = getRoundDiscountAmount(afterTaxTotalDiscountAmount);
  // eslint-disable-next-line no-param-reassign
  discount.taxTotalDiscountAmount = getRoundDiscountAmount(taxTotalDiscountAmount);

  return { beforeTaxAmount: discount.beforeTaxTotalDiscountAmount, afterTaxAmount: discount.afterTaxTotalDiscountAmount };
};

const _calculateDiscountByDiscountType = {
  [OrderSessionDiscountType.INVOICE]: _calculateDiscountOnInvoice,
  [OrderSessionDiscountType.PRODUCT]: _calculateDiscountOnProduct,
};

const calculateDiscount = async ({ orderSessionJson, pretaxPaymentAmount, totalTaxAmount, calculateTaxDirectly }) => {
  const discounts = _.get(orderSessionJson, 'discounts', []);

  if (_.isEmpty(discounts) || orderSessionJson.endedAt || orderSessionJson.auditedAt) {
    return {
      beforeTaxTotalDiscountAmount: orderSessionJson.beforeTaxTotalDiscountAmount || 0,
      afterTaxTotalDiscountAmount: orderSessionJson.afterTaxTotalDiscountAmount || 0,
      taxDetailsWithDiscountInfo: orderSessionJson.taxDetails,
    };
  }

  const discountDetailByTax = {};
  let beforeTaxTotalDiscountAmount = 0;
  let afterTaxTotalDiscountAmount = 0;
  _.forEach(discounts, (discount) => {
    const { afterTaxAmount, beforeTaxAmount } = _calculateDiscountByDiscountType[discount.discountType]({
      discount,
      pretaxPaymentAmount,
      totalTaxAmount,
      taxDetails: orderSessionJson.taxDetails || [],
      orderSessionTaxRate: orderSessionJson.taxRate || 0,
      calculateTaxDirectly,
      discountDetailByTax,
    });
    beforeTaxTotalDiscountAmount += beforeTaxAmount;
    afterTaxTotalDiscountAmount += afterTaxAmount;
  });
  const taxDetailsWithDiscountInfo = orderSessionJson.taxDetails || [];
  if (taxDetailsWithDiscountInfo.length === 0) {
    taxDetailsWithDiscountInfo.push({ taxRate: 0, taxAmount: 0 });
  }
  taxDetailsWithDiscountInfo.forEach((taxDetail) => {
    // eslint-disable-next-line no-param-reassign
    taxDetail.beforeTaxTotalDiscountAmount = discountDetailByTax[taxDetail.taxRate].beforeTaxTotalDiscountAmount;
    // eslint-disable-next-line no-param-reassign
    taxDetail.afterTaxTotalDiscountAmount = discountDetailByTax[taxDetail.taxRate].afterTaxTotalDiscountAmount;
  });
  return { beforeTaxTotalDiscountAmount, afterTaxTotalDiscountAmount, taxDetailsWithDiscountInfo };
};

/**
 * Normalize discount amount for taxDetailsWithDiscountInfo in case discount amount is larger than payment amount
 * @param {Object} params
 * @param {number} params.beforeTaxTotalDiscountAmount
 * @param {number} params.afterTaxTotalDiscountAmount
 * @param {Object} params.orderSessionJson
 */
const normalizeDiscountAmount = ({ orderSessionJson, beforeTaxTotalDiscountAmount, afterTaxTotalDiscountAmount }) => {
  const { pretaxPaymentAmount, totalTaxAmount } = orderSessionJson;
  if (
    beforeTaxTotalDiscountAmount === 0 ||
    (beforeTaxTotalDiscountAmount <= pretaxPaymentAmount &&
      afterTaxTotalDiscountAmount <= pretaxPaymentAmount + totalTaxAmount)
  ) {
    return;
  }

  const taxDetailsWithDiscountInfo = orderSessionJson.taxDetails;
  const normalizedBeforeTax = divideToNPart({
    initialSum: pretaxPaymentAmount,
    parts: taxDetailsWithDiscountInfo.map((taxDetail) => taxDetail.beforeTaxTotalDiscountAmount),
  });
  const normalizedAfterTax = divideToNPart({
    initialSum: pretaxPaymentAmount + totalTaxAmount,
    parts: taxDetailsWithDiscountInfo.map((taxDetail) => taxDetail.afterTaxTotalDiscountAmount),
  });
  taxDetailsWithDiscountInfo.forEach((taxDetail, index) => {
    // eslint-disable-next-line no-param-reassign
    taxDetail.beforeTaxTotalDiscountAmount = normalizedBeforeTax[index];
    // eslint-disable-next-line no-param-reassign
    taxDetail.afterTaxTotalDiscountAmount = normalizedAfterTax[index];
  });
};

const getOrderSessionById = async (orderSessionId, shopId) => {
  const { orderSession, orderSessionJson } = await _getOrderSessionJson({ orderSessionId, shopId });
  const { shop } = orderSessionJson;
  const { calculateTaxDirectly } = shop;
  const dishOrders = _.flatMap(orderSessionJson.orders, 'dishOrders');

  const pretaxPaymentAmount = _.sumBy(dishOrders, (dishOrder) => dishOrder.price * dishOrder.quantity) || 0;
  orderSessionJson.pretaxPaymentAmount = pretaxPaymentAmount;
  const { totalTaxAmount, taxDetails } = await calculateTax({
    orderSessionJson,
    dishOrders,
    calculateTaxDirectly,
  });
  orderSessionJson.totalTaxAmount = totalTaxAmount;
  orderSessionJson.taxDetails = taxDetails;

  const { beforeTaxTotalDiscountAmount, afterTaxTotalDiscountAmount, taxDetailsWithDiscountInfo } = await calculateDiscount({
    orderSessionJson,
    pretaxPaymentAmount,
    totalTaxAmount,
    calculateTaxDirectly,
  });

  orderSessionJson.taxDetails = taxDetailsWithDiscountInfo;
  orderSessionJson.beforeTaxTotalDiscountAmount = Math.min(beforeTaxTotalDiscountAmount, pretaxPaymentAmount);
  orderSessionJson.afterTaxTotalDiscountAmount = Math.min(afterTaxTotalDiscountAmount, pretaxPaymentAmount + totalTaxAmount);
  orderSessionJson.revenueAmount = pretaxPaymentAmount - orderSessionJson.beforeTaxTotalDiscountAmount;
  orderSessionJson.paymentAmount = pretaxPaymentAmount + totalTaxAmount - orderSessionJson.afterTaxTotalDiscountAmount;
  normalizeDiscountAmount({ orderSessionJson, beforeTaxTotalDiscountAmount, pretaxPaymentAmount });

  // update order if not audited
  if (
    !orderSession.auditedAt &&
    (orderSession.paymentAmount !== orderSessionJson.paymentAmount ||
      orderSession.totalTaxAmount !== orderSessionJson.totalTaxAmount ||
      orderSession.beforeTaxTotalDiscountAmount !== orderSessionJson.beforeTaxTotalDiscountAmount ||
      orderSession.afterTaxTotalDiscountAmount !== orderSessionJson.afterTaxTotalDiscountAmount)
  ) {
    await OrderSession.update({
      data: {
        shouldRecalculateTax: false,
        pretaxPaymentAmount: orderSessionJson.pretaxPaymentAmount,
        revenueAmount: orderSessionJson.revenueAmount,
        paymentAmount: orderSessionJson.paymentAmount,
        beforeTaxTotalDiscountAmount: orderSessionJson.beforeTaxTotalDiscountAmount,
        afterTaxTotalDiscountAmount: orderSessionJson.afterTaxTotalDiscountAmount,
        totalTaxAmount: orderSessionJson.totalTaxAmount,
        taxDetails: {
          deleteMany: {},
          createMany: {
            data: orderSessionJson.taxDetails,
          },
        },
      },
      where: { id: orderSessionId },
    });
  }
  return orderSessionJson;
};

const updateOrderSession = async ({ orderSessionId, shopId, updateBody }) => {
  await OrderSession.update({
    data: updateBody,
    where: {
      id: orderSessionId,
      shopId,
    },
  });

  return getOrderSessionById(orderSessionId);
};

const mergeDishOrdersOfOrders = (orderSessionJson) => {
  const orders = _.get(orderSessionJson, 'orders');
  if (!_.isEmpty(orders)) {
    let dishOrders = _.flatMap(orders, (o) => o.dishOrders);
    dishOrders = _.filter(dishOrders, (dishOrder) => {
      return dishOrder.quantity > 0;
    });
    return _mergeDishOrders(dishOrders);
  }
  return [];
};

const mergeCartItems = (cartItems) => {
  if (!_.isEmpty(cartItems)) {
    const filterdCartItems = _.filter(cartItems, (cartItem) => {
      return cartItem.quantity > 0;
    });
    return _mergeDishOrders(filterdCartItems);
  }
  return [];
};

const getCart = async ({ shopId, customerId }) => {
  const cart = await Cart.upsert({
    where: {
      customer_shop_unique: {
        customerId,
        shopId,
      },
    },
    create: {
      customerId,
      shopId,
    },
    update: {},
    include: {
      cartItems: true,
    },
  });

  return cart;
};

module.exports = {
  createNewOrder,
  getOrCreateOrderSession,
  getOrderSessionById,
  updateOrderSession,
  mergeDishOrdersOfOrders,
  mergeCartItems,
  getCart,
  getActiveOrderSessionStatus,
  getOrderSessionJsonWithLimit,
};
