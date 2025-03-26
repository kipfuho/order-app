const _ = require('lodash');
const mongoose = require('mongoose');
const toJSON = require('../utils/plugins/toJSON.plugin');

// log all objects uploaded to s3
const s3LogSchema = new mongoose.Schema(
  {
    key: { type: String },
    inUse: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  }
);

s3LogSchema.statics.updateInUseKeys = async function ({ keys }) {
  const bulkOps = _.map(keys, (key) => ({
    updateOne: {
      filter: { key },
      update: { $set: { inUse: true } },
    },
  }));
  return this.bulkWrite(bulkOps);
};

s3LogSchema.plugin(toJSON);

const S3Log = mongoose.model('S3log', s3LogSchema);

module.exports = S3Log;
