const S3Log = require('../models/s3.model');
const { JobTypes } = require('./constant');

const processJob = async (jobPayload) => {
  const { type, data } = jobPayload;

  if (type === JobTypes.CONFIRM_S3_OBJECT_USAGE) {
    await S3Log.updateInUseKeys(data);
  }
  if (type === JobTypes.DISABLE_S3_OBJECT_USAGE) {
    await S3Log.disableInUseKeys(data);
  }
};

module.exports = {
  processJob,
};
