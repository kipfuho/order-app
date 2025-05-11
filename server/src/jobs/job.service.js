const logger = require('../config/logger');
const { KitchenLog } = require('../models');
const S3Log = require('../models/s3.model');
const {
  updateAfterPayOrderSession,
  updateAfterCancelOrderSession,
  updateAfterCancelPaidStatusOrderSession,
} = require('../order-management/services/orderUtils.service');
const { JobTypes } = require('./constant');

const processJob = async (jobPayload) => {
  const { type, data } = jobPayload;

  if (type === JobTypes.CONFIRM_S3_OBJECT_USAGE) {
    await S3Log.updateInUseKeys(data);
    return;
  }
  if (type === JobTypes.DISABLE_S3_OBJECT_USAGE) {
    await S3Log.disableInUseKeys(data);
    return;
  }
  if (type === JobTypes.LOG_KITCHEN) {
    await KitchenLog.insertMany(data);
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

  logger.info(`Job not found. ${type}`);
};

module.exports = {
  processJob,
};
