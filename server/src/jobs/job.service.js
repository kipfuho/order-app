const logger = require('../config/logger');
const { KitchenLog, S3Log, Order } = require('../models');
const { JobTypes } = require('./constant');
const { OrderSessionStatus } = require('../utils/constant');
const { updateFullOrderSession } = require('../order-management/services/orderAudit.service');

const processJob = async (jobPayload) => {
  const { type, data } = jobPayload;

  if (type === JobTypes.UPDATE_FULL_ORDER_SESSION) {
    await updateFullOrderSession(data);
    return;
  }
  if (type === JobTypes.CONFIRM_S3_OBJECT_USAGE) {
    await S3Log.updateInUseKeys(data);
    return;
  }
  if (type === JobTypes.REMOVE_S3_OBJECT_USAGE) {
    await S3Log.removeInUseKeys(data);
    return;
  }
  if (type === JobTypes.LOG_KITCHEN) {
    await KitchenLog.createMany({ data });
    return;
  }

  if (type === JobTypes.PAY_ORDER) {
    const { orderSessionId } = data;
    // order made by customers
    await Order.updateMany({
      data: { orderSessionStatus: OrderSessionStatus.paid },
      where: {
        orderSessionId,
        customerId: {
          not: null,
        },
      },
    });
    // order made by shop
    await Order.updateMany({
      data: { orderSessionStatus: OrderSessionStatus.paid, kitchenAllDone: true },
      where: {
        orderSessionId,
        customerId: null,
      },
    });
    return;
  }
  if (type === JobTypes.CANCEL_ORDER) {
    const { orderSessionId } = data;
    await Order.updateMany({
      data: { orderSessionStatus: OrderSessionStatus.cancelled },
      where: {
        orderSessionId,
      },
    });
    return;
  }
  if (type === JobTypes.CANCEL_ORDER_PAID_STATUS) {
    const { orderSessionId } = data;
    await Order.updateMany({
      data: { orderSessionStatus: OrderSessionStatus.unpaid },
      where: {
        orderSessionId,
      },
    });
    return;
  }

  logger.info(`Job not found. ${type}`);
};

module.exports = {
  processJob,
};
