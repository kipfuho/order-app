const mongoose = require('mongoose');
const { toJSON } = require('../../models/plugins');
const { Status } = require('../../utils/constant');

const dishOrderSchema = mongoose.Schema(
  {
    dish: { type: mongoose.Types.ObjectId, ref: 'Dish' },
    name: { type: String },
    unit: { type: String },
    price: { type: Number },
    taxIncludedPrice: { type: Number },
    quantity: { type: String },
    beforeTaxTotalPrice: { type: Number },
    afterTaxTotalPrice: { type: Number },
    taxRate: { type: Number },
    taxAmount: { type: Number },
    beforeTaxTotalDiscountAmount: { type: Number },
    afterTaxTotalDiscountAmount: { type: Number },
    taxTotalDiscountAmount: { type: Number },
    paymentAmount: { type: Number }, // after discount, after tax
    status: { type: String, enum: [Status.enabled, Status.disabled], default: Status.enabled },
  },
  {
    timestamps: true,
  }
);

const orderSchema = mongoose.Schema(
  {
    restaurant: { type: mongoose.Types.ObjectId, ref: 'Restaurant' },
    table: { type: mongoose.Types.ObjectId, ref: 'Table' },
    orderSession: { type: mongoose.Types.ObjectId, ref: 'OrderSession' },
    orderNo: { type: Number },
    dishOrders: [dishOrderSchema],
    returnedDishOrders: [dishOrderSchema],
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
