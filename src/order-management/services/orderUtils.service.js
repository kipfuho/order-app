const _ = require('lodash');
const moment = require('moment-timezone');
const redisClient = require('../../utils/redis');
const { getRestaurantFromCache, getTablesFromCache } = require('../../metadata/restaraurantMetadata.service');
const { getRestaurantTimeZone } = require('../../middlewares/clsHooked');
const { Order, OrderSession } = require('../../models');
const { getDishesFromCache } = require('../../metadata/dishMetadata.service');
const { OrderSessionDiscountType, DiscountValueType, OrderSessionStatus } = require('../../utils/constant');
const { throwBadRequest } = require('../../utils/errorHandling');

const formatDateTimeToISOStringRegardingReportTime = ({ dateTime, reportTime }) => {
  try {
    const timeZone = getRestaurantTimeZone();
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

const getNextAvailableOrderNo = async ({ restaurantId, keyBase, lastOrderNo }) => {
  let currentOrderNo = lastOrderNo;
  const retryTime = 10;
  if (redisClient.isRedisConnected()) {
    for (let counter = 0; counter < retryTime; counter += 1) {
      currentOrderNo += 1;
      const key = `${restaurantId}_${keyBase}_${currentOrderNo}`;
      // eslint-disable-next-line no-await-in-loop
      const canUseOrderNo = await redisClient.getCloudLock({ key, periodInSecond: 60 * 5 });
      if (canUseOrderNo) {
        return currentOrderNo;
      }
    }
  }
  return currentOrderNo + 1;
};

const getOrderSessionNoForNewOrderSession = async (restaurantId, createdAt) => {
  let lastActiveOrderSession;
  if (createdAt) {
    lastActiveOrderSession = await OrderSession.getLastActiveOrderSessionBeforeCreatedAt(restaurantId, createdAt);
  } else {
    lastActiveOrderSession = await OrderSession.getLastActiveOrderSessionSortByOrderSessionNo(restaurantId);
  }
  // not existed last active order session in this restaurant => default = 1
  if (_.isEmpty(lastActiveOrderSession)) {
    return 1;
  }
  const restaurant = await getRestaurantFromCache({ restaurantId });
  const reportTime = restaurant.reportTime || 0;
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
      restaurantId,
      keyBase: 'orderSessionNo',
      lastOrderNo: lastActiveOrderSessionNo,
    });
  }
  return getNextAvailableOrderNo({
    restaurantId,
    keyBase: 'orderSessionNo',
    lastOrderNo: 0,
  });
};

const getOrCreateOrderSession = async ({ orderSessionId, tableId, restaurantId }) => {
  if (orderSessionId) {
    const orderSession = await OrderSession.findById(orderSessionId);
    return orderSession;
  }

  const restaurant = await getRestaurantFromCache({ restaurantId });
  const orderSessionNo = await getOrderSessionNoForNewOrderSession(restaurantId);
  const orderSession = await OrderSession.create({
    tables: [tableId],
    restaurantId,
    orderSessionNo,
    taxRate: _.get(restaurant, 'taxRate', 0),
  });

  return orderSession.toJSON();
};

const createNewOrder = async ({ tableId, restaurantId, orderSessionId, dishOrders, orderNo }) => {
  const dishes = await getDishesFromCache({ restaurantId });
  const dishById = _.keyBy(dishes, 'id');
  const orderDishOrders = _.map(dishOrders, (dishOrder) => {
    const { dishId, quantity, name, taxRate, price, isTaxIncludedPrice } = dishOrder;
    if (!dishId) {
      return {
        dishId,
        quantity,
        name,
        taxRate,
        price: isTaxIncludedPrice ? null : price,
        taxIncludedPrice: isTaxIncludedPrice ? price : null,
      };
    }
    const dish = dishById[dishId];
    return {
      dishId,
      quantity,
      name: _.get(dish, 'name', name),
      unit: _.get(dish, 'unit', ''),
      taxRate: _.get(dish, 'taxRate', ''),
      price: _.get(dish, 'isTaxIncludedPrice') ? null : price,
      taxIncludedPrice: _.get(dish, 'isTaxIncludedPrice') ? price : null,
    };
  });
  const order = await Order.create({ tableId, restaurantId, orderSessionId, orderNo, dishOrders: orderDishOrders });

  return order.toJSON();
};

/**
 * Get order session json with populated datas
 */
const _getOrderSessionJson = async (orderSessionId) => {
  const orderSession = await OrderSession.findById(orderSessionId);
  const orderSessionJson = orderSession.toJSON();
  const orders = await Order.find({ orderSessionId });

  const restaurantId = orderSession.restaurant;
  const restaurant = await getRestaurantFromCache({ restaurantId });
  const tables = await getTablesFromCache({ restaurantId });
  const tableById = _.keyBy(tables, 'id');
  const dishes = await getDishesFromCache({ restaurantId });
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
  orderSessionJson.restaurant = restaurant;
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
  const restaurantTaxRate = _.get(orderSessionJson, 'taxRate');
  _.forEach(dishOrders, (dishOrder) => {
    let dishTaxRate = dishOrder.taxRate;
    const beforeTaxPrice = dishOrder.price;

    if (restaurantTaxRate < 0.001) {
      dishTaxRate = 0;
      // eslint-disable-next-line no-param-reassign
      dishOrder.taxIncludedPrice = dishOrder.price;
    }

    const afterTaxPrice = dishOrder.taxIncludedPrice || (beforeTaxPrice * (100 + dishTaxRate)) / 100;
    let beforeTaxTotalPrice;
    let afterTaxTotalPrice;
    let taxAmount;
    if (calculateTaxDirectly) {
      beforeTaxTotalPrice = beforeTaxPrice * (dishOrder.quantity || 1);
      afterTaxTotalPrice = beforeTaxTotalPrice;
      taxAmount = afterTaxTotalPrice - beforeTaxTotalPrice;
    } else {
      beforeTaxTotalPrice = beforeTaxPrice * (dishOrder.quantity || 1);
      afterTaxTotalPrice = (afterTaxPrice * (100 + dishTaxRate)) / 100;
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

  return afterTaxTotalDiscountAmount;
};

const _calculateDiscountOnProduct = ({ discount, pretaxPaymentAmount, totalTaxAmount }) => {};

const _calculateDiscountByDiscountType = {
  [OrderSessionDiscountType.INVOICE]: _calculateDiscountOnInvoice,
  [OrderSessionDiscountType.PRODUCT]: _calculateDiscountOnProduct,
};

const calculateDiscount = async ({ orderSessionJson, pretaxPaymentAmount, totalTaxAmount }) => {
  const discounts = _.get(orderSessionJson, 'discounts', []);

  if (_.isEmpty(discounts)) {
    return 0;
  }

  let totalDiscountAmountAfterTax = 0;
  _.forEach(discounts, (discount) => {
    totalDiscountAmountAfterTax += _calculateDiscountByDiscountType[discount.discountType]({
      discount,
      pretaxPaymentAmount,
      totalTaxAmount,
    });
  });
  return totalDiscountAmountAfterTax;
};

const getOrderSessionById = async (orderSessionId) => {
  const { orderSession, orderSessionJson } = await _getOrderSessionJson({ orderSessionId });
  const dishOrders = _.flatMap(orderSessionJson.orders, 'dishOrders');

  const pretaxPaymentAmount = _.sumBy(dishOrders, (dishOrder) => dishOrder.price * dishOrder.quantity);
  const { totalTaxAmount, taxDetails } = await calculateTax({ orderSessionJson, dishOrders });
  orderSessionJson.totalTaxAmount = totalTaxAmount;
  orderSessionJson.taxDetails = taxDetails;

  const totalDiscountAmountAfterTax = calculateDiscount({ orderSessionJson, pretaxPaymentAmount, totalTaxAmount });

  orderSessionJson.paymentAmount = Math.max(0, pretaxPaymentAmount + totalTaxAmount - totalDiscountAmountAfterTax);

  // update order if not audited
  if (!orderSession.auditedAt && orderSession.paymentAmount !== orderSessionJson.paymentAmount) {
    await OrderSession.updateOne(
      { _id: orderSessionId },
      {
        $set: {
          paymentAmount: orderSessionJson.paymentAmount,
          taxDetails: orderSessionJson.taxDetails,
        },
      }
    );
  }
  return orderSessionJson;
};

const _validateBeforePayment = (orderSession, paymentDetails) => {
  throwBadRequest(
    orderSession.paymentAmount !== _.sumBy(paymentDetails, 'paymentAmount'),
    'Số tiền thanh toán không khớp số tiền đơn'
  );
};

const confirmPaymentOrderSession = async ({ orderSessionId, paymentDetails }) => {
  const orderSession = await getOrderSessionById(orderSessionId);

  _validateBeforePayment(orderSession);

  await OrderSession.updateOne(
    { _id: orderSessionId },
    {
      $set: {
        paymentDetails,
        status: OrderSessionStatus.paid,
      },
    }
  );

  return getOrderSessionById(orderSessionId);
};

module.exports = {
  createNewOrder,
  getOrCreateOrderSession,
  getOrderSessionById,
  confirmPaymentOrderSession,
};
