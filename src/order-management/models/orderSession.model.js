const mongoose = require('mongoose');
const { toJSON } = require('../../models/plugins');
const { getRestaurantFromCache } = require('../../metadata/restaraurantMetadata.service');
const { getStartTimeOfToday } = require('../../utils/common');
const { PaymentMethod, OrderSessionStatus } = require('../../utils/constant');

const StatusEnum = Object.values(OrderSessionStatus);
const PaymentMethodEnum = Object.values(PaymentMethod);

const discountProductSchema = mongoose.Schema(
  {
    dishOrderId: { type: String },
    dishName: { type: String },
    dishQuantity: { type: String },
    discountValue: { type: Number },
    discountValueType: { type: String }, // percentage, absolute amount
    beforeTaxTotalDiscountAmount: { type: Number },
    afterTaxTotalDiscountAmount: { type: Number },
    taxTotalDiscountAmount: { type: Number },
  },
  {
    timestamps: true,
  }
);

const discountSchema = mongoose.Schema(
  {
    name: { type: String },
    discountType: { type: String }, // discount invoice, discount product
    discountValue: { type: Number },
    discountValueType: { type: String }, // percentage, absolute amount
    beforeTaxTotalDiscountAmount: { type: Number },
    afterTaxTotalDiscountAmount: { type: Number },
    taxTotalDiscountAmount: { type: Number },
    discountProducts: [discountProductSchema],
  },
  {
    timestamps: true,
  }
);

const orderSessionSchema = mongoose.Schema(
  {
    restaurant: { type: mongoose.Types.ObjectId, ref: 'Restaurant' },
    tables: [{ type: mongoose.Types.ObjectId, ref: 'Table' }],
    orders: [{ type: mongoose.Types.ObjectId, ref: 'Order' }],
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

orderSessionSchema.statics.getLastActiveOrderSessionBeforeCreatedAt = async function (restaurantId, createdAt) {
  return this.findOne({
    restaurantId: mongoose.Types.ObjectId(restaurantId),
    createdAt: { $lt: createdAt },
    orderSessionNo: { $exists: true },
  }).sort({ createdAt: -1 });
};

orderSessionSchema.statics.getLastActiveOrderSessionSortByOrderSessionNo = async function (restaurantId) {
  const restaurant = await getRestaurantFromCache({ restaurantId });
  const startOfDay = getStartTimeOfToday({
    timezone: restaurant.timezone || 'Asia/Ho_Chi_Minh',
    reportTime: restaurant.reportTime || 0,
  });
  return this.findOne(
    {
      restaurantId: mongoose.Types.ObjectId(restaurantId),
      orderSessionNo: { $exists: true },
      createdAt: { $gte: startOfDay },
    },
    { createdAt: 1, orderSessionNo: 1 }
  ).sort({ createdAt: -1 });
};

// add plugin that converts mongoose to json
orderSessionSchema.plugin(toJSON);

const OrderSession = mongoose.model('OrderSession', orderSessionSchema);

module.exports = {
  discountSchema,
  orderSessionSchema,
  OrderSession,
};
