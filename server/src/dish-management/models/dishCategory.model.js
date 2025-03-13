const mongoose = require('mongoose');
const { toJSON } = require('../../utils/plugins');
const { Status } = require('../../utils/constant');

const dishCategorySchema = mongoose.Schema(
  {
    shop: { type: mongoose.Types.ObjectId, ref: 'Shop' },
    name: { type: String },
    status: { type: String, enum: [Status.enabled, Status.disabled], default: Status.enabled },
  },
  {
    timestamps: true,
  }
);

// add plugin that converts mongoose to json
dishCategorySchema.plugin(toJSON);

const DishCategory = mongoose.model('DishCategory', dishCategorySchema);

module.exports = DishCategory;
