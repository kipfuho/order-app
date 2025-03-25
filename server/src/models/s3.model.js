const { default: mongoose } = require('mongoose');
const toJSON = require('../utils/plugins/toJSON.plugin');

// log all objects uploaded to s3
const s3LogSchema = new mongoose.Schema(
  {
    key: { type: String },
  },
  {
    timestamps: true,
  }
);

s3LogSchema.plugin(toJSON);

const S3Log = mongoose.model('S3log', s3LogSchema);

module.exports = S3Log;
