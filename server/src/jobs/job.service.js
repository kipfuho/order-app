const logger = require('../config/logger');
const { KitchenLog, S3Log } = require('../models');
const {
  updateAfterPayOrderSession,
  updateAfterCancelOrderSession,
  updateAfterCancelPaidStatusOrderSession,
  updateFullOrderSession,
} = require('../order-management/services/orderUtils.service');
const { JobTypes } = require('./constant');

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
    await updateAfterPayOrderSession({ orderSession: data });
    return;
  }
  if (type === JobTypes.CANCEL_ORDER) {
    await updateAfterCancelOrderSession({ orderSession: data });
    return;
  }
  if (type === JobTypes.CANCEL_ORDER_PAID_STATUS) {
    await updateAfterCancelPaidStatusOrderSession({ orderSession: data });
    return;
  }
  if (type === JobTypes.UPDATE_FULL_ORDER_SESSION) {
    await updateFullOrderSession(data);
    return;
  }

  logger.info(`Job not found. ${type}`);
};

module.exports = {
  processJob,
};
