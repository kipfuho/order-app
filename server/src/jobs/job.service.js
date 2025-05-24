const _ = require('lodash');
const logger = require('../config/logger');
const { KitchenLog, S3Log, Order } = require('../models');
const { JobTypes } = require('./constant');
const redisClient = require('../utils/redis');
const { getOrderSessionById } = require('../order-management/services/orderUtils.service');
const config = require('../config/config');
const { bulkUpdate, PostgreSQLTable } = require('../utils/prisma');

const _sendJobToQueue = async (jobData, delay) => {
  if (delay) {
    setTimeout(() => _sendJobToQueue(jobData), delay);
    return;
  }

  try {
    const jobMessage = JSON.stringify(jobData);
    logger.info(`_sendJobToQueue: ${jobMessage}`);
    await redisClient.pushToQueue({ key: config.jobKey, val: jobMessage });
  } catch (err) {
    logger.error(`error _sendJobToQueue. ${err}`);
  }
};

const updateOrderSessionStatusForOrders = async ({ orderSessionId, status }) => {
  return Order.updateMany({
    data: { orderSessionStatus: status },
    where: {
      orderSessionId,
    },
  });
};

const updateFullOrderSession = async ({ orderSessionId }) => {
  const key = `update_full_order_session_${orderSessionId}`;
  const canGetLock = await redisClient.getCloudLock({ key, periodInSecond: 10 });
  if (!canGetLock) {
    return _sendJobToQueue(
      {
        type: JobTypes.UPDATE_FULL_ORDER_SESSION,
        data: {
          orderSessionId,
        },
      },
      10000
    );
  }
  try {
    const orderSession = await getOrderSessionById(orderSessionId);
    const discountPercent = Math.min(orderSession.beforeTaxTotalDiscountAmount / orderSession.pretaxPaymentAmount, 1);

    if (discountPercent < 0.001) {
      return;
    }

    /* eslint-disable no-param-reassign */
    orderSession.orders.forEach((order) => {
      order.dishOrders.forEach((dishOrder) => {
        dishOrder.beforeTaxTotalDiscountAmount = dishOrder.beforeTaxTotalPrice * discountPercent;
        dishOrder.afterTaxTotalDiscountAmount = dishOrder.afterTaxTotalPrice * discountPercent;
        dishOrder.revenueAmount = dishOrder.beforeTaxTotalPrice - dishOrder.beforeTaxTotalDiscountAmount;
        dishOrder.paymentAmount = dishOrder.afterTaxTotalPrice - dishOrder.afterTaxTotalDiscountAmount;
      });

      order.beforeTaxTotalDiscountAmount = _.sumBy(order.dishOrders, 'beforeTaxTotalDiscountAmount') || 0;
      order.afterTaxTotalDiscountAmount = _.sumBy(order.dishOrders, 'afterTaxTotalDiscountAmount') || 0;
      order.revenueAmount = _.sumBy(order.dishOrders, 'revenueAmount') || 0;
      order.paymentAmount = _.sumBy(order.dishOrders, 'paymentAmount') || 0;
    });
    /* eslint-enable no-param-reassign */

    const allOrders = orderSession.orders;
    const allDishOrders = orderSession.orders.flatMap((order) => order.dishOrders);

    await bulkUpdate(
      PostgreSQLTable.DishOrder,
      allDishOrders.map((dishOrder) => ({
        id: dishOrder.id,
        beforeTaxTotalDiscountAmount: dishOrder.beforeTaxTotalDiscountAmount,
        afterTaxTotalDiscountAmount: dishOrder.afterTaxTotalDiscountAmount,
        revenueAmount: dishOrder.revenueAmount,
        paymentAmount: dishOrder.paymentAmount,
      }))
    );
    await bulkUpdate(
      PostgreSQLTable.Order,
      allOrders.map((order) => ({
        id: order.id,
        beforeTaxTotalDiscountAmount: order.beforeTaxTotalDiscountAmount,
        afterTaxTotalDiscountAmount: order.afterTaxTotalDiscountAmount,
        revenueAmount: order.revenueAmount,
        paymentAmount: order.paymentAmount,
      }))
    );
  } finally {
    redisClient.deleteKey(key);
  }
};

const processJob = async (jobPayload) => {
  const { type, data } = jobPayload;

  if (type === JobTypes.CONFIRM_S3_OBJECT_USAGE) {
    await S3Log.updateInUseKeys(data);
    return;
  }
  if (type === JobTypes.REMOVE_S3_OBJECT_USAGE) {
    await S3Log.removeInUseKeys(data);
    return;
  }
  if (type === JobTypes.LOG_KITCHEN) {
    await KitchenLog.createMany(data);
    return;
  }

  if (type === JobTypes.PAY_ORDER) {
    const { orderSessionId } = data;
    await updateOrderSessionStatusForOrders({ orderSessionId });
    await updateFullOrderSession({ orderSessionId });
    return;
  }
  if (type === JobTypes.CANCEL_ORDER) {
    const { orderSessionId } = data;
    await updateOrderSessionStatusForOrders({ orderSessionId });
    return;
  }
  if (type === JobTypes.CANCEL_ORDER_PAID_STATUS) {
    const { orderSessionId } = data;
    await updateOrderSessionStatusForOrders({ orderSessionId });
    return;
  }
  if (type === JobTypes.UPDATE_FULL_ORDER_SESSION) {
    const { orderSessionId } = data;
    await updateFullOrderSession({ orderSessionId });
    return;
  }

  logger.info(`Job not found. ${type}`);
};

module.exports = {
  processJob,
};
