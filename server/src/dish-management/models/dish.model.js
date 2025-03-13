const mongoose = require('mongoose');
const { toJSON } = require('../../utils/plugins');
const { Status } = require('../../utils/constant');

const dishSchema = mongoose.Schema(
  {
    shop: { type: mongoose.Types.ObjectId, ref: 'Shop' },
    name: { type: String },
    unit: { type: String },
    price: {
      type: Number,
    },
    taxIncludedPrice: {
      type: Number,
    },
    category: {
      type: mongoose.Types.ObjectId,
      ref: 'DishCategory',
    },
    type: { type: String },
    taxRate: { type: Number },
    status: { type: String, enum: [Status.activated, Status.deactivated, Status.disabled], default: Status.activated },
  },
  {
    timestamps: true,
  }
);

// add plugin that converts mongoose to json
dishSchema.plugin(toJSON);

const Dish = mongoose.model('Dish', dishSchema);

module.exports = Dish;
