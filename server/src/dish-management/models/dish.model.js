const _ = require('lodash');
const mongoose = require('mongoose');
const { toJSON } = require('../../utils/plugins');
const { Status } = require('../../utils/constant');
const { getStringId } = require('../../utils/common');
const { deleteMenuCache } = require('../../metadata/common');
const logger = require('../../config/logger');

const dishSchema = mongoose.Schema(
  {
    shop: { type: mongoose.Types.ObjectId, ref: 'Shop' },
    name: { type: String },
    unit: { type: mongoose.Types.ObjectId, ref: 'Unit' },
    price: {
      type: Number,
    },
    taxIncludedPrice: {
      type: Number,
    },
    isTaxIncludedPrice: {
      type: Boolean,
    },
    category: {
      type: mongoose.Types.ObjectId,
      ref: 'DishCategory',
    },
    type: { type: String },
    taxRate: { type: Number },
    status: { type: String, enum: [Status.activated, Status.deactivated, Status.disabled], default: Status.activated },
    imageUrls: [String],
  },
  {
    timestamps: true,
  }
);

dishSchema.post('save', async function (doc) {
  try {
    const shopId = getStringId({ object: doc, key: 'shop' });
    await deleteMenuCache({ shopId });
  } catch (err) {
    logger.error(`error running post hook save of dish model`);
  }
});

dishSchema.post(new RegExp('.*update.*', 'i'), async function () {
  try {
    const filter = this.getFilter();
    let shopId = _.get(filter, 'shop');
    const dishId = _.get(filter, '_id');
    if (!shopId) {
      const dish = await this.model.findById(dishId);
      shopId = _.get(dish, 'shop');
    }
    if (!shopId) {
      return;
    }
    await deleteMenuCache({ shopId });
  } catch (err) {
    logger.error(`error running post hook update of dish model`);
  }
});

// add plugin that converts mongoose to json
dishSchema.plugin(toJSON);

const Dish = mongoose.model('Dish', dishSchema);

module.exports = Dish;
