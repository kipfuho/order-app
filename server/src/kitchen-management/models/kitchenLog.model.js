const mongoose = require('mongoose');
const { toJSON } = require('../../utils/plugins');
const { Status, KitchenAction } = require('../../utils/constant');

const KitchenActionEnum = Object.values(KitchenAction);

const kitchenLogSchema = new mongoose.Schema(
  {
    shop: { type: mongoose.Types.ObjectId, ref: 'Shop' },
    userId: { type: mongoose.Types.ObjectId, ref: 'User' },
    orderId: { type: mongoose.Types.ObjectId, ref: 'Order' },
    dishOrderId: { type: mongoose.Types.ObjectId },
    dishName: { type: String },
    dishQuantity: { type: Number },
    status: { type: String, enum: [Status.enabled, Status.disabled], default: Status.enabled },
    action: {
      type: String,
      enum: KitchenActionEnum,
    },
  },
  {
    timestamps: true,
  }
);

// add plugin that converts mongoose to json
kitchenLogSchema.plugin(toJSON);

const KitchenLog = mongoose.model('KitchenLog', kitchenLogSchema);

module.exports = KitchenLog;
