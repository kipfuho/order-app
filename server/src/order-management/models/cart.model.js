const mongoose = require('mongoose');
const { toJSON } = require('../../utils/plugins');
const { Status } = require('../../utils/constant');

const cartItemSchema = new mongoose.Schema(
  {
    dishId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Dish',
    },
    quantity: { type: Number },
    price: { type: Number },
    note: { type: String },
  },
  {
    timestamps: true,
  }
);

const cartSchema = new mongoose.Schema(
  {
    shop: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Shop',
    },
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Customer',
    },
    cartItems: [cartItemSchema],
    totalAmount: { type: Number },
    status: {
      type: String,
      enum: [Status.enabled, Status.disabled],
      default: Status.enabled,
    },
  },
  {
    timestamps: true,
  }
);

// add plugin that converts mongoose to json
cartSchema.plugin(toJSON);

const Cart = mongoose.model('Cart', cartSchema);

module.exports = Cart;
