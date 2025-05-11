const _ = require('lodash');
const mongoose = require('mongoose');
const { toJSON } = require('../../utils/plugins');
const { Status } = require('../../utils/constant');
const { getStringId } = require('../../utils/common');
const { deleteKitchenCache } = require('../../metadata/common');
const logger = require('../../config/logger');

const kitchenSchema = new mongoose.Schema(
  {
    shop: { type: mongoose.Types.ObjectId, ref: 'Shop' },
    name: { type: String },
    dishCategories: [
      {
        type: mongoose.Types.ObjectId,
        ref: 'DishCategory',
      },
    ],
    tables: [
      {
        type: mongoose.Types.ObjectId,
        ref: 'Table',
      },
    ],
    status: { type: String, enum: [Status.activated, Status.deactivated, Status.disabled], default: Status.activated },
  },
  {
    timestamps: true,
  }
);

kitchenSchema.post('save', async function (doc) {
  try {
    const shopId = getStringId({ object: doc, key: 'shop' });
    await deleteKitchenCache({ shopId });
  } catch (err) {
    logger.error(`error running post hook save of kitchen model`);
  }
});

kitchenSchema.post(new RegExp('.*(update|delete).*', 'i'), async function () {
  try {
    const filter = this.getFilter();
    let shopId = _.get(filter, 'shop');
    const kitchenId = _.get(filter, '_id');
    if (!shopId) {
      const kitchen = await this.model.findById(kitchenId);
      shopId = _.get(kitchen, 'shop');
    }
    if (!shopId) {
      return;
    }
    await deleteKitchenCache({ shopId });
  } catch (err) {
    logger.error(`error running post hook update of kitchen model`);
  }
});

// add plugin that converts mongoose to json
kitchenSchema.plugin(toJSON);

const Kitchen = mongoose.model('Kitchen', kitchenSchema);

module.exports = Kitchen;
