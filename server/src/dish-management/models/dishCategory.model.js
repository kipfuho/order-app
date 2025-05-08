const _ = require('lodash');
const mongoose = require('mongoose');
const { toJSON } = require('../../utils/plugins');
const { Status } = require('../../utils/constant');
const { getStringId } = require('../../utils/common');
const { deleteMenuCache } = require('../../metadata/common');
const logger = require('../../config/logger');

const dishCategorySchema = new mongoose.Schema(
  {
    shop: { type: mongoose.Types.ObjectId, ref: 'Shop' },
    name: { type: String },
    code: { type: String },
    status: { type: String, enum: [Status.enabled, Status.disabled], default: Status.enabled },
  },
  {
    timestamps: true,
  }
);

dishCategorySchema.post('save', async function (doc) {
  try {
    const shopId = getStringId({ object: doc, key: 'shop' });
    await deleteMenuCache({ shopId });
  } catch (err) {
    logger.error(`error running post hook save of dish category model`);
  }
});

dishCategorySchema.post(new RegExp('.*(update|delete).*', 'i'), async function () {
  try {
    const filter = this.getFilter();
    let shopId = _.get(filter, 'shop');
    const dishCategoryId = _.get(filter, '_id');
    if (!shopId) {
      const dishCategory = await this.model.findById(dishCategoryId);
      shopId = _.get(dishCategory, 'shop');
    }
    if (!shopId) {
      return;
    }
    await deleteMenuCache({ shopId });
  } catch (err) {
    logger.error(`error running post hook update of dish category model`);
  }
});

// add plugin that converts mongoose to json
dishCategorySchema.plugin(toJSON);

const DishCategory = mongoose.model('DishCategory', dishCategorySchema);

module.exports = DishCategory;
