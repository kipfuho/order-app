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
const { getStringId, getRoundTaxAmount } = require('../../utils/common');

// Merge các dish order có trùng tên và giá
const _mergeDishOrders = (dishOrders) => {
  if (_.isEmpty(dishOrders)) {
    return [];
  }

  const dishOrderMap = {};
  // eslint-disable-next-line no-restricted-syntax
  for (const dishOrder of dishOrders) {
    const item = dishOrder;
    const dishId = getStringId({ object: dishOrder, key: 'dish' });
    let key = `${dishId}-${dishOrder.dishName}-${dishOrder.price}`;
    key = key.replace(/\./g, '');
    const existingItem = dishOrderMap[key];
    const existingDishOrderQuantity = (_.get(existingItem, 'quantity') || 0) * 1;
    const currentOrderQuantity = (dishOrder.quantity || 0) * 1;
    item.quantity = currentOrderQuantity + existingDishOrderQuantity;
    item.taxAmount = (_.get(existingItem, 'taxAmount') || 0) + (dishOrder.taxAmount || 0);
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

const getOrderSessionNoForNewOrderSession = async (shopId, createdAt) => {
  let lastActiveOrderSession;
  if (createdAt) {
    lastActiveOrderSession = await OrderSession.getLastActiveOrderSessionBeforeCreatedAt(shopId, createdAt);
  } else {
    lastActiveOrderSession = await OrderSession.getLastActiveOrderSessionSortByOrderSessionNo(shopId);
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

const getActiveOrderSessionByTable = async ({ tableId, shopId }) => {
  const orderSession = await OrderSession.findOne({
    shop: shopId,
    tables: tableId,
    status: { $in: [getActiveOrderSessionStatus()] },
  });

  return orderSession;
};

const getOrCreateOrderSession = async ({ orderSessionId, tableId, shopId, customerId, numberOfCustomer }) => {
  const table = await getTableFromCache({ shopId, tableId });
  throwBadRequest(!table, getMessageByLocale({ key: 'table.notFound' }));

  if (orderSessionId) {
    const orderSession = await OrderSession.findById(orderSessionId);
    if (orderSession) {
      return orderSession;
    }
  }

  if (table.allowMultipleOrderSession) {
    const orderSession = await getActiveOrderSessionByTable({ tableId, shopId });
    if (orderSession) {
      return orderSession;
    }
  }

  const shop = await getShopFromCache({ shopId });
  const orderSessionNo = await getOrderSessionNoForNewOrderSession(shopId);
  const orderSession = await OrderSession.create({
    tables: [tableId],
    tableNames: [table.name],
    shop: shopId,
    orderSessionNo,
    taxRate: _.get(shop, 'taxRate', 0),
    customerInfo: {
      customerIds: customerId ? [customerId] : undefined,
      numberOfCustomer: numberOfCustomer || 1,
    },
  });

  return orderSession.toJSON();
};

const createNewOrder = async ({ tableId, shopId, orderSession, dishOrders, orderNo, customerId }) => {
  const dishes = await getDishesFromCache({ shopId });
  const units = await getUnitsFromCache({ shopId });
  const unitById = _.keyBy(units, 'id');
  const dishById = _.keyBy(dishes, 'id');
  const orderDishOrders = _.map(dishOrders, (dishOrder) => {
    const { dishId, quantity, name, taxRate, price, isTaxIncludedPrice } = dishOrder;
    if (!dishId) {
      return {
        dishId,
        quantity,
        name,
        taxRate,
        price: isTaxIncludedPrice ? undefined : price,
        taxIncludedPrice: isTaxIncludedPrice ? price : undefined,
        isTaxIncludedPrice,
      };
    }
    const dish = dishById[dishId];
    throwBadRequest(!dish, getMessageByLocale({ key: 'dish.notFound' }));
    return {
      dish: dishId,
      quantity,
      name: dish.name,
      unit: _.get(unitById[dish.unit], 'name'),
      taxRate: dish.taxRate,
      price: dish.isTaxIncludedPrice ? undefined : dish.price,
      taxIncludedPrice: dish.isTaxIncludedPrice ? dish.price : undefined,
      isTaxIncludedPrice: dish.isTaxIncludedPrice,
    };
  });
  const order = await Order.create({
    table: tableId,
    shop: shopId,
    orderSessionId: _.get(orderSession, 'id'),
    orderNo,
    dishOrders: orderDishOrders,
    customerId,
  });
  if (orderSession) {
    await OrderSession.updateOne(
      { _id: orderSession.id },
      {
        $push: {
          orders: order._id,
        },
      }
    );
  }

  return order.toJSON();
};

/**
 * Get order session json with populated datas
 */
const _getOrderSessionJson = async ({ orderSessionId, shopId }) => {
  const orderSession = await OrderSession.findById(orderSessionId);
  throwBadRequest(!orderSession, 'orderSession.notFound');
  throwBadRequest(shopId && orderSession.shop.toString() !== shopId, 'orderSession.notFound');
  const orderSessionJson = orderSession.toJSON();
  const orders = await Order.find({ orderSessionId });

  // eslint-disable-next-line no-param-reassign
  shopId = orderSession.shop;
  const shop = await getShopFromCache({ shopId });
  const tables = await getTablesFromCache({ shopId });
  const tableById = _.keyBy(tables, 'id');
  const dishes = await getDishesFromCache({ shopId });
  const dishById = _.keyBy(dishes, 'id');

  const orderJsons = _.map(orders, (order) => {
    const orderJson = order.toJSON();
    _.map(orderJson.dishOrders, (dishOrder) => {
      if (dishOrder.dish) {
        // eslint-disable-next-line no-param-reassign
        dishOrder.dish = dishById[dishOrder.dish];
      }
    });
    return orderJson;
  });
  orderSessionJson.shop = shop;
  orderSessionJson.orders = orderJsons;
  orderSessionJson.tables = _.map(orderSessionJson.tables, (tableId) => tableById[tableId]);
  return {
    orderSession,
    orderSessionJson,
  };
};

const calculateTax = async ({ orderSessionJson, dishOrders, calculateTaxDirectly = false }) => {
  let totalTaxAmount = 0;
  const taxAmountByTaxRate = {};
  const shopTaxRate = _.get(orderSessionJson, 'taxRate');
  _.forEach(dishOrders, (dishOrder) => {
    let dishTaxRate = dishOrder.taxRate;
    const beforeTaxPrice = dishOrder.price;

    if (shopTaxRate < 0.001) {
      dishTaxRate = 0;
      // eslint-disable-next-line no-param-reassign
      dishOrder.taxIncludedPrice = dishOrder.price;
    }

    const afterTaxPrice = dishOrder.taxIncludedPrice || getRoundTaxAmount((beforeTaxPrice * (100 + dishTaxRate)) / 100);
    let beforeTaxTotalPrice;
    let afterTaxTotalPrice;
    let taxAmount;
    if (calculateTaxDirectly) {
      beforeTaxTotalPrice = beforeTaxPrice * (dishOrder.quantity || 1);
      afterTaxTotalPrice = getRoundTaxAmount((beforeTaxTotalPrice * (100 + dishTaxRate)) / 100);
      taxAmount = getRoundTaxAmount(afterTaxTotalPrice - beforeTaxTotalPrice);
    } else {
      beforeTaxTotalPrice = beforeTaxPrice * (dishOrder.quantity || 1);
      afterTaxTotalPrice = getRoundTaxAmount((afterTaxPrice * (100 + dishTaxRate)) / 100) * (dishOrder.quantity || 1);
      taxAmount = afterTaxTotalPrice - beforeTaxTotalPrice;
    }

    // eslint-disable-next-line no-param-reassign
    dishOrder.beforeTaxTotalPrice = beforeTaxTotalPrice;
    // eslint-disable-next-line no-param-reassign
    dishOrder.afterTaxTotalPrice = afterTaxTotalPrice;
    // eslint-disable-next-line no-param-reassign
    dishOrder.taxAmount = taxAmount;

    if (taxAmount) {
      totalTaxAmount += taxAmount;
      taxAmountByTaxRate[dishTaxRate] = (taxAmountByTaxRate[dishTaxRate] || 0) + taxAmount;
    }
  });

  const taxDetails = _.map(taxAmountByTaxRate, (taxAmount, taxRate) => ({ taxRate, taxAmount }));
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
    return { totalDiscountAmountBeforeTax: 0, totalDiscountAmountAfterTax: 0 };
  }

  let totalDiscountAmountBeforeTax = 0;
  let totalDiscountAmountAfterTax = 0;
  _.forEach(discounts, (discount) => {
    const { afterTaxAmount, beforeTaxAmount } = _calculateDiscountByDiscountType[discount.discountType]({
      discount,
      pretaxPaymentAmount,
      totalTaxAmount,
    });
    totalDiscountAmountBeforeTax += beforeTaxAmount;
    totalDiscountAmountAfterTax += afterTaxAmount;
  });
  return { totalDiscountAmountBeforeTax, totalDiscountAmountAfterTax };
};

const getOrderSessionById = async (orderSessionId, shopId) => {
  const { orderSession, orderSessionJson } = await _getOrderSessionJson({ orderSessionId, shopId });
  const dishOrders = _.flatMap(orderSessionJson.orders, 'dishOrders');

  const pretaxPaymentAmount = _.sumBy(dishOrders, (dishOrder) => dishOrder.price * dishOrder.quantity);
  orderSessionJson.pretaxPaymentAmount = pretaxPaymentAmount;
  const { totalTaxAmount, taxDetails } = await calculateTax({ orderSessionJson, dishOrders });
  orderSessionJson.totalTaxAmount = totalTaxAmount;
  orderSessionJson.taxDetails = taxDetails;

  const { totalDiscountAmountBeforeTax, totalDiscountAmountAfterTax } = await calculateDiscount({
    orderSessionJson,
    pretaxPaymentAmount,
    totalTaxAmount,
  });

  orderSessionJson.totalDiscountAmountBeforeTax = totalDiscountAmountBeforeTax;
  orderSessionJson.totalDiscountAmountAfterTax = totalDiscountAmountAfterTax;
  orderSessionJson.paymentAmount = Math.max(0, pretaxPaymentAmount + totalTaxAmount - totalDiscountAmountAfterTax);

  // update order if not audited
  if (
    !orderSession.auditedAt &&
    (orderSession.paymentAmount !== orderSessionJson.paymentAmount ||
      orderSession.totalDiscountAmountAfterTax !== orderSessionJson.totalDiscountAmountAfterTax)
  ) {
    await OrderSession.updateOne(
      { _id: orderSessionId },
      {
        $set: {
          pretaxPaymentAmount: orderSessionJson.pretaxPaymentAmount,
          paymentAmount: orderSessionJson.paymentAmount,
          taxDetails: orderSessionJson.taxDetails,
          totalDiscountAmountBeforeTax,
          totalDiscountAmountAfterTax,
        },
      }
    );
  }
  return orderSessionJson;
};

const updateOrderSession = async ({ orderSessionId, shopId, updateBody }) => {
  await OrderSession.updateOne({ _id: orderSessionId, shop: shopId }, updateBody);

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
  const cart = await Cart.findOneAndUpdate(
    { customer: customerId, shop: shopId },
    { $setOnInsert: { customer: customerId, shop: shopId, cartItems: [] } },
    { upsert: true, new: true }
  );
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
};
