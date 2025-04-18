const mongoose = require('mongoose');
const { toJSON } = require('../../utils/plugins');
const { Status } = require('../../utils/constant');

const dishOrderSchema = new mongoose.Schema({
  dish: { type: mongoose.Types.ObjectId, ref: 'Dish' },
  name: { type: String },
  unit: { type: String },
  price: { type: Number },
  isTaxIncludedPrice: { type: Boolean },
  taxIncludedPrice: { type: Number },
  quantity: { type: Number },
  beforeTaxTotalPrice: { type: Number },
  afterTaxTotalPrice: { type: Number },
  taxRate: { type: Number },
  taxAmount: { type: Number },
  beforeTaxTotalDiscountAmount: { type: Number },
  afterTaxTotalDiscountAmount: { type: Number },
  taxTotalDiscountAmount: { type: Number },
  paymentAmount: { type: Number }, // after discount, after tax
  status: { type: String, enum: [Status.enabled, Status.disabled], default: Status.enabled },
  returnedAt: { type: Date },
});

const orderSchema = new mongoose.Schema(
  {
    shop: { type: mongoose.Types.ObjectId, ref: 'Shop' },
    table: { type: mongoose.Types.ObjectId, ref: 'Table' },
    orderSessionId: { type: mongoose.Types.ObjectId, ref: 'OrderSession' },
    orderNo: { type: Number },
    dishOrders: [dishOrderSchema],
    returnedDishOrders: [dishOrderSchema],
    customerId: { type: mongoose.Types.ObjectId, ref: 'Customer' },
    totalQuantity: { type: Number },
    totalBeforeTaxAmount: { type: Number },
    totalAfterTaxAmount: { type: Number },
  },
  {
    timestamps: true,
  }
);

// add plugin that converts mongoose to json
orderSchema.plugin(toJSON);

const Order = mongoose.model('Order', orderSchema);

module.exports = {
  dishOrderSchema,
  orderSchema,
  Order,
};
