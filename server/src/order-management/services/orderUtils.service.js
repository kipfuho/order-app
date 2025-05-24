const _ = require('lodash');
const moment = require('moment-timezone');
const redisClient = require('../../utils/redis');
const { getShopFromCache } = require('../../metadata/shopMetadata.service');
const { getShopTimeZone } = require('../../middlewares/clsHooked');
const { Order, OrderSession, Cart } = require('../../models');
const { getDishesFromCache } = require('../../metadata/dishMetadata.service');
const { OrderSessionDiscountType, DiscountValueType, OrderSessionStatus } = require('../../utils/constant');
const { throwBadRequest } = require('../../utils/errorHandling');
const { getMessageByLocale } = require('../../locale');
const { getTableFromCache, getTablesFromCache } = require('../../metadata/tableMetadata.service');
const { getUnitsFromCache } = require('../../metadata/unitMetadata.service');
const { getRoundTaxAmount, getRoundDishPrice, getStartTimeOfToday } = require('../../utils/common');
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

const getLastActiveOrderSessionBeforeCreatedAt = async (shopId, createdAt) => {
  return OrderSession.findFirst({
    where: {
      shopId,
      createdAt: {
        lt: createdAt,
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  });
};

const getLastActiveOrderSessionSortByOrderSessionNo = async (shopId) => {
  const shop = await getShopFromCache({ shopId });

  const startOfDay = getStartTimeOfToday({
    timezone: shop.timezone || 'Asia/Ho_Chi_Minh',
    reportTime: shop.reportTime || 0,
  });

  const orderSession = await OrderSession.findFirst({
    where: {
      shopId,
      createdAt: {
        gte: startOfDay,
      },
    },
    select: {
      createdAt: true,
      orderSessionNo: true,
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  return orderSession;
};

const getOrderSessionNoForNewOrderSession = async (shopId, createdAt) => {
  let lastActiveOrderSession;
  if (createdAt) {
    lastActiveOrderSession = await getLastActiveOrderSessionBeforeCreatedAt(shopId, createdAt);
  } else {
    lastActiveOrderSession = await getLastActiveOrderSessionSortByOrderSessionNo(shopId);
  }
  // not existed last active order session in this shop => default = 1
  if (_.isEmpty(lastActiveOrderSession)) {
    return 1;
  }
  const shop = await getShopFromCache({ shopId });
  const reportTime = shop.reportTime || 0;
  // get orderSessionNo with default = 1
  const lastActiveOrderSessionNo = _.get(lastActiveOrderSession, 'orderSessionNo', 0);
  // check diffrent time between lastActiveOrderSession and current
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
  const orderSessionNo = await getOrderSessionNoForNewOrderSession(shopId);
  const customerInfo = await _getCustomerInfoForCreatingOrderSession({ customerId, numberOfCustomer });
  const orderSession = await OrderSession.create({
    data: {
      tableIds: [tableId],
      tableNames: [table.name],
      shopId,
      orderSessionNo,
      taxRate: _.get(shop, 'taxRate', 0),
      ...customerInfo,
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

const createNewOrder = async ({
  tableId,
  shopId,
  userId,
  orderSession,
  dishOrders,
  orderNo,
  customerId,
  isNewOrderSession,
}) => {
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
      notifyNewOrder({ order, userId, action: EventActionType.CREATE });
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

const calculateTax = async ({ orderSessionJson, dishOrders }) => {
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

const _calculateDiscountOnInvoice = ({ discount, pretaxPaymentAmount, totalTaxAmount }) => {
  const { discountValue, discountValueType } = discount;

  let beforeTaxTotalDiscountAmount;
  let afterTaxTotalDiscountAmount;
  let taxTotalDiscountAmount;

  if (discountValueType === DiscountValueType.PERCENTAGE) {
    beforeTaxTotalDiscountAmount = (pretaxPaymentAmount * discountValue) / 100;
    afterTaxTotalDiscountAmount = ((pretaxPaymentAmount + totalTaxAmount) * discountValue) / 100;
    taxTotalDiscountAmount = afterTaxTotalDiscountAmount - beforeTaxTotalDiscountAmount;
  } else {
    beforeTaxTotalDiscountAmount = (pretaxPaymentAmount * discountValue) / 100;
    afterTaxTotalDiscountAmount = ((pretaxPaymentAmount + totalTaxAmount) * discountValue) / 100;
    taxTotalDiscountAmount = afterTaxTotalDiscountAmount - beforeTaxTotalDiscountAmount;
  }

  // eslint-disable-next-line no-param-reassign
  discount.beforeTaxTotalDiscountAmount = beforeTaxTotalDiscountAmount;
  // eslint-disable-next-line no-param-reassign
  discount.afterTaxTotalDiscountAmount = afterTaxTotalDiscountAmount;
  // eslint-disable-next-line no-param-reassign
  discount.taxTotalDiscountAmount = taxTotalDiscountAmount;

  return { beforeTaxAmount: beforeTaxTotalDiscountAmount, afterTaxAmount: afterTaxTotalDiscountAmount };
};

const _calculateDiscountOnProduct = ({ discount, dishOrderById }) => {
  let beforeTaxTotalDiscountAmount = 0;
  let afterTaxTotalDiscountAmount = 0;
  let taxTotalDiscountAmount = 0;

  _.forEach(discount.discountProducts, (discountProduct) => {
    const dishOrder = dishOrderById[discountProduct.dishOrderId];
    if (!dishOrder) return;

    const dishQuantity = dishOrder.quantity;
    beforeTaxTotalDiscountAmount += discountProduct.beforeTaxDiscountPrice * dishQuantity;
    afterTaxTotalDiscountAmount += discountProduct.afterTaxDiscountPrice * dishQuantity;
    taxTotalDiscountAmount += discountProduct.taxDiscountPrice * dishQuantity;
  });

  // eslint-disable-next-line no-param-reassign
  discount.beforeTaxTotalDiscountAmount = beforeTaxTotalDiscountAmount;
  // eslint-disable-next-line no-param-reassign
  discount.afterTaxTotalDiscountAmount = afterTaxTotalDiscountAmount;
  // eslint-disable-next-line no-param-reassign
  discount.taxTotalDiscountAmount = taxTotalDiscountAmount;

  return { beforeTaxAmount: beforeTaxTotalDiscountAmount, afterTaxAmount: afterTaxTotalDiscountAmount };
};

const _calculateDiscountByDiscountType = {
  [OrderSessionDiscountType.INVOICE]: _calculateDiscountOnInvoice,
  [OrderSessionDiscountType.PRODUCT]: _calculateDiscountOnProduct,
};

const calculateDiscount = async ({ orderSessionJson, pretaxPaymentAmount, totalTaxAmount }) => {
  const discounts = _.get(orderSessionJson, 'discounts', []);

  if (_.isEmpty(discounts)) {
    return { beforeTaxTotalDiscountAmount: 0, afterTaxTotalDiscountAmount: 0 };
  }

  let beforeTaxTotalDiscountAmount = 0;
  let afterTaxTotalDiscountAmount = 0;
  _.forEach(discounts, (discount) => {
    const { afterTaxAmount, beforeTaxAmount } = _calculateDiscountByDiscountType[discount.discountType]({
      discount,
      pretaxPaymentAmount,
      totalTaxAmount,
    });
    beforeTaxTotalDiscountAmount += beforeTaxAmount;
    afterTaxTotalDiscountAmount += afterTaxAmount;
  });
  return { beforeTaxTotalDiscountAmount, afterTaxTotalDiscountAmount };
};

const getOrderSessionById = async (orderSessionId, shopId) => {
  const { orderSession, orderSessionJson } = await _getOrderSessionJson({ orderSessionId, shopId });
  const { shop } = orderSessionJson;
  const dishOrders = _.flatMap(orderSessionJson.orders, 'dishOrders');

  const pretaxPaymentAmount = _.sumBy(dishOrders, (dishOrder) => dishOrder.price * dishOrder.quantity) || 0;
  orderSessionJson.pretaxPaymentAmount = pretaxPaymentAmount;
  const { totalTaxAmount, taxDetails } = await calculateTax({
    orderSessionJson,
    dishOrders,
    calculateTaxDirectly: shop.calculateTaxDirectly,
  });
  orderSessionJson.totalTaxAmount = totalTaxAmount;
  orderSessionJson.taxDetails = taxDetails;

  const { beforeTaxTotalDiscountAmount, afterTaxTotalDiscountAmount } = await calculateDiscount({
    orderSessionJson,
    pretaxPaymentAmount,
    totalTaxAmount,
  });

  orderSessionJson.beforeTaxTotalDiscountAmount = Math.min(beforeTaxTotalDiscountAmount, pretaxPaymentAmount);
  orderSessionJson.afterTaxTotalDiscountAmount = Math.min(afterTaxTotalDiscountAmount, pretaxPaymentAmount + totalTaxAmount);
  orderSessionJson.revenueAmount = pretaxPaymentAmount - orderSessionJson.beforeTaxTotalDiscountAmount;
  orderSessionJson.paymentAmount = pretaxPaymentAmount + totalTaxAmount - orderSessionJson.afterTaxTotalDiscountAmount;

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
