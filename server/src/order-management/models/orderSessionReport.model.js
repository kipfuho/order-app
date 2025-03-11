const mongoose = require('mongoose');
const { toJSON } = require('../../models/plugins');
const { orderSchema } = require('./order.model');
const { discountSchema } = require('./orderSession.model');
const { OrderSessionStatus, PaymentMethod } = require('../../utils/constant');

const StatusEnum = Object.values(OrderSessionStatus);
const PaymentMethodEnum = Object.values(PaymentMethod);

const orderSessionReportSchema = mongoose.Schema(
  {
    restaurant: { type: mongoose.Types.ObjectId, ref: 'Restaurant' },
    table: [{ type: mongoose.Types.ObjectId, ref: 'Table' }],
    orders: [orderSchema],
    discounts: [discountSchema],
    orderSessionNo: { type: Number },
    taxRate: { type: Number },
    totalTaxAmount: { type: Number },
    taxDetails: [
      {
        taxAmount: { type: Number },
        taxRate: { type: Number },
      },
    ],
    endedAt: { type: Date },
    auditedAt: { type: Date },
    status: { type: String, enum: StatusEnum, default: OrderSessionStatus.unpaid },
    paymentDetails: [
      {
        paymentMethod: { type: String, enum: PaymentMethodEnum },
        paymentAmount: { type: Number },
      },
    ],
    paymentAmount: { type: Number },
  },
  {
    timestamps: true,
  }
);

// add plugin that converts mongoose to json
orderSessionReportSchema.plugin(toJSON);

const OrderSessionReport = mongoose.model('OrderSessionReport', orderSessionReportSchema);

module.exports = {
  orderSessionReportSchema,
  OrderSessionReport,
};
