const _ = require('lodash');
const moment = require('moment-timezone');
const redisClient = require('../../utils/redis');
const { getShopFromCache } = require('../../metadata/shopMetadata.service');
const { getShopTimeZone, getOperatorFromSession } = require('../../middlewares/clsHooked');
const { Order, OrderSession, Cart } = require('../../models');
const { getDishesFromCache } = require('../../metadata/dishMetadata.service');
const { OrderSessionDiscountType, DiscountValueType, OrderSessionStatus, Status } = require('../../utils/constant');
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
  getRoundPaymentAmount,
} = require('../../utils/common');
const { getCustomerFromCache } = require('../../metadata/customerMetadata.service');
const { notifyNewOrder, EventActionType } = require('../../utils/awsUtils/appSync.utils');
const { bulkUpdate, PostgreSQLTable } = require('../../utils/prisma');

// Merge các dish order có trùng tên và giá
const _mergeDishOrders = (dishOrders, isReturnedDishOrders) => {
  if (_.isEmpty(dishOrders)) {
    return [];
  }

  const dishOrderMap = {};
  // eslint-disable-next-line no-restricted-syntax
  for (const dishOrder of dishOrders) {
    const item = dishOrder;
    const { dishId } = dishOrder;
    let key = `${dishId}-${dishOrder.dishName}-${dishOrder.price}-${dishOrder.note}`;
    key = key.replace(/\./g, '');
    const existingItem = dishOrderMap[key];
    const existingDishOrderQuantity = (_.get(existingItem, 'quantity') || 0) * 1;
    const currentOrderQuantity = (dishOrder.quantity || 0) * 1;
    item.quantity = currentOrderQuantity + existingDishOrderQuantity;
    // với returnedDishOrders thì không cần merge các trường này
    if (!isReturnedDishOrders) {
      item.beforeTaxTotalPrice = (_.get(existingItem, 'beforeTaxTotalPrice') || 0) + (dishOrder.beforeTaxTotalPrice || 0);
      item.afterTaxTotalPrice = (_.get(existingItem, 'afterTaxTotalPrice') || 0) + (dishOrder.afterTaxTotalPrice || 0);
      item.beforeTaxTotalDiscountAmount =
        (_.get(existingItem, 'beforeTaxTotalDiscountAmount') || 0) + (dishOrder.beforeTaxTotalDiscountAmount || 0);
      item.afterTaxTotalDiscountAmount =
        (_.get(existingItem, 'afterTaxTotalDiscountAmount') || 0) + (dishOrder.afterTaxTotalDiscountAmount || 0);
      item.revenueAmount = (_.get(existingItem, 'revenueAmount') || 0) + (dishOrder.revenueAmount || 0);
      item.paymentAmount = (_.get(existingItem, 'paymentAmount') || 0) + (dishOrder.paymentAmount || 0);
    }
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

/**
 * Get order session detail from database
 * And a copy with populated datas from redis
 */
const _getOrderSessionDetail = async ({ orderSessionId, shopId }) => {
  const orderSession = await OrderSession.findUnique({
    where: {
      id: orderSessionId,
    },
    include: {
      discounts: {
        include: {
          discountProducts: true,
        },
        where: {
          status: Status.enabled,
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

  const orderSessionDetail = _.cloneDeep(orderSession);
  const orderSessionLastAuditedTime = orderSession.auditedAt || 0;
  const shouldRecalculate =
    orderSession.updatedAt > orderSessionLastAuditedTime ||
    orderSessionDetail.orders.some((order) => order.updatedAt > orderSessionLastAuditedTime);
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
  orderSessionDetail.shop = shop;
  orderSessionDetail.tables = _.map(orderSessionDetail.tableIds, (tableId) => tableById[tableId]);
  return {
    orderSession,
    orderSessionDetail,
    shouldRecalculate,
  };
};

const getorderSessionDetailWithLimit = async ({ shopId, limit }) => {
  const orderSessions = await OrderSession.findMany({
    where: {
      shopId,
    },
    orderBy: {
      createdAt: 'desc',
    },
    take: 1 * limit,
    include: {
      discounts: {
        include: {
          discountProducts: true,
        },
        where: {
          status: Status.enabled,
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

  const shop = await getShopFromCache({ shopId });
  const tables = await getTablesFromCache({ shopId });
  const tableById = _.keyBy(tables, 'id');
  const dishes = await getDishesFromCache({ shopId });
  const dishById = _.keyBy(dishes, 'id');

  const orderSessionDetails = _.map(orderSessions, (orderSessionDetail) => {
    orderSessionDetail.orders.forEach((order) => {
      order.dishOrders.forEach((dishOrder) => {
        if (dishOrder.dish) {
          // eslint-disable-next-line no-param-reassign
          dishOrder.dish = dishById[dishOrder.dish];
        }
      });
    });
    // eslint-disable-next-line no-param-reassign
    orderSessionDetail.shop = shop;
    // eslint-disable-next-line no-param-reassign
    orderSessionDetail.tables = _.map(orderSessionDetail.tableIds, (tableId) => tableById[tableId]);
    return orderSessionDetail;
  });

  return orderSessionDetails;
};

const calculateTax = async ({ orderSessionDetail, dishOrders, calculateTaxDirectly = false }) => {
  const shopTaxRate = _.get(orderSessionDetail, 'taxRate', 0);
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

    if (orderSessionDetail.shouldRecalculateTax) {
      const { afterTaxPrice, beforeTaxTotalPrice, afterTaxTotalPrice } = _getPaymentDetailForDishOrder({
        isTaxIncludedPrice: dishOrder.isTaxIncludedPrice,
        price: dishOrder.price,
        quantity: dishOrder.quantity,
        taxRate: dishTaxRate,
        calculateTaxDirectly,
      });

      // eslint-disable-next-line no-param-reassign
      dishOrder.taxIncludedPrice = afterTaxPrice;
      // eslint-disable-next-line no-param-reassign
      dishOrder.afterTaxTotalPrice = afterTaxTotalPrice;
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
      dishOrderBeforeTaxTotalDiscountAmount =
        getRoundDiscountAmount((dishOrder.price * discountProduct.discountRate) / 100) * dishQuantity;
      dishOrderAfterTaxTotalDiscountAmount =
        getRoundDiscountAmount((dishOrder.taxIncludedPrice * discountProduct.discountRate) / 100) * dishQuantity;
      dishOrderTaxTotalDiscountAmount = dishOrderAfterTaxTotalDiscountAmount - dishOrderBeforeTaxTotalDiscountAmount;
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

const calculateDiscount = async ({
  orderSessionDetail,
  pretaxPaymentAmount,
  totalTaxAmount,
  calculateTaxDirectly,
  dishOrders,
}) => {
  const discounts = _.get(orderSessionDetail, 'discounts', []);

  if (_.isEmpty(discounts)) {
    return {
      beforeTaxTotalDiscountAmount: 0,
      afterTaxTotalDiscountAmount: 0,
      taxDetailsWithDiscountInfo: orderSessionDetail.taxDetails,
    };
  }

  const discountDetailByTax = {};
  const dishOrderById = _.keyBy(dishOrders, 'id');
  let beforeTaxTotalDiscountAmount = 0;
  let afterTaxTotalDiscountAmount = 0;
  _.forEach(discounts, (discount) => {
    const { afterTaxAmount, beforeTaxAmount } = _calculateDiscountByDiscountType[discount.discountType]({
      discount,
      pretaxPaymentAmount,
      totalTaxAmount,
      taxDetails: orderSessionDetail.taxDetails || [],
      orderSessionTaxRate: orderSessionDetail.taxRate || 0,
      calculateTaxDirectly,
      discountDetailByTax,
      dishOrderById,
    });
    beforeTaxTotalDiscountAmount += beforeTaxAmount;
    afterTaxTotalDiscountAmount += afterTaxAmount;
  });
  const taxDetailsWithDiscountInfo = orderSessionDetail.taxDetails || [];
  if (taxDetailsWithDiscountInfo.length === 0) {
    taxDetailsWithDiscountInfo.push({ taxRate: 0, taxAmount: 0 });
  }
  taxDetailsWithDiscountInfo.forEach((taxDetail) => {
    // eslint-disable-next-line no-param-reassign
    taxDetail.beforeTaxTotalDiscountAmount = discountDetailByTax[taxDetail.taxRate].beforeTaxTotalDiscountAmount || 0;
    // eslint-disable-next-line no-param-reassign
    taxDetail.afterTaxTotalDiscountAmount = discountDetailByTax[taxDetail.taxRate].afterTaxTotalDiscountAmount || 0;
  });
  return { beforeTaxTotalDiscountAmount, afterTaxTotalDiscountAmount, taxDetailsWithDiscountInfo };
};

/**
 * Normalize discount amount for taxDetailsWithDiscountInfo in case discount amount is larger than payment amount
 * @param {Object} params
 * @param {number} params.beforeTaxTotalDiscountAmount
 * @param {number} params.afterTaxTotalDiscountAmount
 * @param {Object} params.orderSessionDetail
 */
const normalizeDiscountAmount = ({ orderSessionDetail, beforeTaxTotalDiscountAmount, afterTaxTotalDiscountAmount }) => {
  const { pretaxPaymentAmount, totalTaxAmount } = orderSessionDetail;
  if (
    beforeTaxTotalDiscountAmount === 0 ||
    (beforeTaxTotalDiscountAmount <= pretaxPaymentAmount &&
      afterTaxTotalDiscountAmount <= pretaxPaymentAmount + totalTaxAmount)
  ) {
    return;
  }

  const taxDetailsWithDiscountInfo = orderSessionDetail.taxDetails;
  const normalizedBeforeTax = divideToNPart({
    initialSum: Math.min(pretaxPaymentAmount, _.sumBy(taxDetailsWithDiscountInfo, 'beforeTaxTotalDiscountAmount')),
    parts: taxDetailsWithDiscountInfo.map((taxDetail) => taxDetail.beforeTaxTotalDiscountAmount),
  });
  const normalizedAfterTax = divideToNPart({
    initialSum: Math.min(
      pretaxPaymentAmount + totalTaxAmount,
      _.sumBy(taxDetailsWithDiscountInfo, 'afterTaxTotalDiscountAmount')
    ),
    parts: taxDetailsWithDiscountInfo.map((taxDetail) => taxDetail.afterTaxTotalDiscountAmount),
  });
  taxDetailsWithDiscountInfo.forEach((taxDetail, index) => {
    // eslint-disable-next-line no-param-reassign
    taxDetail.beforeTaxTotalDiscountAmount = normalizedBeforeTax[index];
    // eslint-disable-next-line no-param-reassign
    taxDetail.afterTaxTotalDiscountAmount = normalizedAfterTax[index];
  });
};

// TODO: can be made into a job
const updateFullOrderSession = async ({ orderSessionId, orderSession, orderSessionDetail }) => {
  const key = `update_full_order_session_${orderSessionId}`;
  const canGetLock = await redisClient.getCloudLock({ key, periodInSecond: 10 });
  // TODO: can cause bug
  if (!canGetLock) return;

  try {
    // only try to update orders and dishorders in certain cases
    if (
      (orderSessionDetail.shouldRecalculateTax && orderSession.totalTaxAmount !== orderSessionDetail.totalTaxAmount) ||
      orderSession.beforeTaxTotalDiscountAmount !== orderSessionDetail.beforeTaxTotalDiscountAmounts
    ) {
      const discountPercent = Math.min(
        orderSessionDetail.beforeTaxTotalDiscountAmount / orderSessionDetail.pretaxPaymentAmount,
        1
      );

      /* eslint-disable no-param-reassign */
      orderSessionDetail.orders.forEach((order) => {
        order.dishOrders.forEach((dishOrder) => {
          dishOrder.beforeTaxTotalDiscountAmount = getRoundDiscountAmount(dishOrder.beforeTaxTotalPrice * discountPercent);
          dishOrder.afterTaxTotalDiscountAmount = getRoundDiscountAmount(dishOrder.afterTaxTotalPrice * discountPercent);
          dishOrder.revenueAmount = getRoundPaymentAmount(
            dishOrder.beforeTaxTotalPrice - dishOrder.beforeTaxTotalDiscountAmount
          );
          dishOrder.paymentAmount = getRoundPaymentAmount(
            dishOrder.afterTaxTotalPrice - dishOrder.afterTaxTotalDiscountAmount
          );
        });
      });
      /* eslint-enable no-param-reassign */

      // track what's changed and update only that
      const orderSessionLastAuditTime = orderSessionDetail.auditedAt;
      const isOrderSessionUpdate = orderSessionDetail.updatedAt > orderSessionDetail.auditedAt;
      const allOrders = orderSessionDetail.orders.filter(
        (order) => isOrderSessionUpdate || order.updatedAt > orderSessionLastAuditTime
      );
      const allDishOrders = allOrders.flatMap((order) => order.dishOrders);
      await Promise.all([
        bulkUpdate(
          PostgreSQLTable.DishOrder,
          allDishOrders.map((dishOrder) => ({
            id: dishOrder.id,
            beforeTaxTotalDiscountAmount: dishOrder.beforeTaxTotalDiscountAmount,
            afterTaxTotalDiscountAmount: dishOrder.afterTaxTotalDiscountAmount,
            taxIncludedPrice: dishOrder.taxIncludedPrice,
            afterTaxTotalPrice: dishOrder.afterTaxTotalPrice,
            revenueAmount: dishOrder.revenueAmount,
            paymentAmount: dishOrder.paymentAmount,
          })),
          bulkUpdate(
            PostgreSQLTable.Order,
            allOrders.map((order) => ({
              id: order.id,
              totalQuantity: _.sumBy(order.dishOrders, 'quantity') || 0,
              totalBeforeTaxAmount: getRoundPaymentAmount(_.sumBy(order.dishOrders, 'beforeTaxTotalPrice') || 0),
              totalAfterTaxAmount: getRoundPaymentAmount(_.sumBy(order.dishOrders, 'afterTaxTotalPrice') || 0),
              beforeTaxTotalDiscountAmount: getRoundDiscountAmount(
                _.sumBy(order.dishOrders, 'beforeTaxTotalDiscountAmount') || 0
              ),
              afterTaxTotalDiscountAmount: getRoundDiscountAmount(
                _.sumBy(order.dishOrders, 'afterTaxTotalDiscountAmount') || 0
              ),
              revenueAmount: getRoundPaymentAmount(_.sumBy(order.dishOrders, 'revenueAmount') || 0),
              paymentAmount: getRoundPaymentAmount(_.sumBy(order.dishOrders, 'paymentAmount') || 0),
            }))
          )
        ),
      ]);
    }

    const currentTime = new Date();
    await OrderSession.update({
      data: {
        shouldRecalculateTax: false,
        pretaxPaymentAmount: orderSessionDetail.pretaxPaymentAmount,
        revenueAmount: orderSessionDetail.revenueAmount,
        paymentAmount: orderSessionDetail.paymentAmount,
        beforeTaxTotalDiscountAmount: orderSessionDetail.beforeTaxTotalDiscountAmount,
        afterTaxTotalDiscountAmount: orderSessionDetail.afterTaxTotalDiscountAmount,
        totalTaxAmount: orderSessionDetail.totalTaxAmount,
        taxDetails: {
          deleteMany: {},
          createMany: {
            data: orderSessionDetail.taxDetails,
          },
        },
        updatedAt: currentTime,
        auditedAt: currentTime,
      },
      where: { id: orderSessionId },
      select: {
        id: true,
      },
    });
  } finally {
    redisClient.deleteKey(key);
  }
};

const calculateOrderSessionAndReturn = async (orderSessionId, shopId) => {
  const { orderSession, orderSessionDetail, shouldRecalculate } = await _getOrderSessionDetail({ orderSessionId, shopId });
  // only recalculate if order session is recently updated
  if (!shouldRecalculate) {
    return orderSessionDetail;
  }

  const { shop } = orderSessionDetail;
  const { calculateTaxDirectly } = shop;
  const dishOrders = _.flatMap(orderSessionDetail.orders, 'dishOrders');

  const pretaxPaymentAmount = _.sumBy(dishOrders, (dishOrder) => dishOrder.price * dishOrder.quantity) || 0;
  orderSessionDetail.pretaxPaymentAmount = pretaxPaymentAmount;
  const { totalTaxAmount, taxDetails } = await calculateTax({
    orderSessionDetail,
    dishOrders,
    calculateTaxDirectly,
  });
  orderSessionDetail.totalTaxAmount = totalTaxAmount;
  orderSessionDetail.taxDetails = taxDetails;

  const { beforeTaxTotalDiscountAmount, afterTaxTotalDiscountAmount, taxDetailsWithDiscountInfo } = await calculateDiscount({
    orderSessionDetail,
    pretaxPaymentAmount,
    totalTaxAmount,
    calculateTaxDirectly,
    dishOrders,
  });

  orderSessionDetail.taxDetails = taxDetailsWithDiscountInfo;
  orderSessionDetail.beforeTaxTotalDiscountAmount = Math.min(beforeTaxTotalDiscountAmount, pretaxPaymentAmount);
  orderSessionDetail.afterTaxTotalDiscountAmount = Math.min(
    afterTaxTotalDiscountAmount,
    pretaxPaymentAmount + totalTaxAmount
  );
  orderSessionDetail.revenueAmount = pretaxPaymentAmount - orderSessionDetail.beforeTaxTotalDiscountAmount;
  orderSessionDetail.paymentAmount = pretaxPaymentAmount + totalTaxAmount - orderSessionDetail.afterTaxTotalDiscountAmount;
  normalizeDiscountAmount({ orderSessionDetail, beforeTaxTotalDiscountAmount, pretaxPaymentAmount });

  // update order session detail
  if (
    orderSession.paymentAmount !== orderSessionDetail.paymentAmount ||
    orderSession.totalTaxAmount !== orderSessionDetail.totalTaxAmount ||
    orderSession.beforeTaxTotalDiscountAmount !== orderSessionDetail.beforeTaxTotalDiscountAmount ||
    orderSession.afterTaxTotalDiscountAmount !== orderSessionDetail.afterTaxTotalDiscountAmount
  ) {
    await updateFullOrderSession({
      orderSessionId,
      orderSession,
      orderSessionDetail,
    });
  }
  return orderSessionDetail;
};

const createNewOrder = async ({ tableId, shopId, orderSession, dishOrders, customerId, isNewOrderSession }) => {
  try {
    const shop = await getShopFromCache({ shopId });
    const table = await getTableFromCache({ shopId, tableId });
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
        tableName: table.name,
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
      select: {
        id: true,
        shopId: true,
        tableId: true,
        customerId: true,
        dishOrders: true,
      },
    });
    if (orderSession) {
      await calculateOrderSessionAndReturn(orderSession.id);
      await notifyNewOrder({ order, orderSession, action: EventActionType.CREATE });
    }

    return order;
  } catch (err) {
    // xoá order session rỗng được tạo ra
    if (isNewOrderSession) {
      await OrderSession.delete({
        where: {
          id: orderSession.id,
        },
        select: { id: 1 },
      });
    }

    throw err;
  }
};

const updateOrderSession = async ({ orderSessionId, shopId, updateBody }) => {
  await OrderSession.update({
    data: updateBody,
    where: {
      id: orderSessionId,
      shopId,
    },
    select: { id: 1 },
  });

  return calculateOrderSessionAndReturn(orderSessionId);
};

const mergeDishOrdersOfOrders = (orderSessionDetail) => {
  const orders = _.get(orderSessionDetail, 'orders');
  if (!_.isEmpty(orders)) {
    let dishOrders = _.flatMap(orders, (o) => o.dishOrders);
    dishOrders = _.filter(dishOrders, (dishOrder) => {
      return dishOrder.quantity > 0;
    });
    return _mergeDishOrders(dishOrders);
  }
  return [];
};

const mergeReturnedDishOrdersOfOrders = (orderSessionDetail) => {
  const orders = _.get(orderSessionDetail, 'orders');
  if (!_.isEmpty(orders)) {
    let returnedDishOrders = _.flatMap(orders, (o) => o.returnedDishOrders);
    returnedDishOrders = _.filter(returnedDishOrders, (returnedDishOrder) => {
      return returnedDishOrder.quantity > 0;
    });
    return _mergeDishOrders(returnedDishOrders, true);
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
      cartItems: {
        orderBy: [
          {
            createdAt: 'asc',
          },
          {
            id: 'asc',
          },
        ],
      },
    },
  });

  return cart;
};

module.exports = {
  createNewOrder,
  getOrCreateOrderSession,
  calculateOrderSessionAndReturn,
  updateOrderSession,
  updateFullOrderSession,
  mergeDishOrdersOfOrders,
  mergeReturnedDishOrdersOfOrders,
  mergeCartItems,
  getCart,
  getActiveOrderSessionStatus,
  getorderSessionDetailWithLimit,
};
