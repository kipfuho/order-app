const mongoose = require('mongoose');
const { toJSON } = require('../../utils/plugins');

const dailyReportSchema = new mongoose.Schema(
  {
    name: { type: String },
    phone: { type: String },
    email: { type: String },
  },
  {
    timestamps: true,
  }
);

// add plugin that converts mongoose to json
dailyReportSchema.plugin(toJSON);

const DailyReport = mongoose.model('DailyReport', dailyReportSchema);

module.exports = DailyReport;
