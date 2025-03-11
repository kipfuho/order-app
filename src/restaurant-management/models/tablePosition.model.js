const _ = require('lodash');
const mongoose = require('mongoose');
const { toJSON } = require('../../models/plugins');
const { Status } = require('../../utils/constant');
const { getStringId } = require('../../utils/common');
const logger = require('../../config/logger');
const { deleteTableCache, deleteTablePositionCache } = require('../../metadata/common');

const tablePositionSchema = mongoose.Schema(
  {
    restaurant: { type: mongoose.Types.ObjectId, ref: 'Restaurant' },
    name: { type: String },
    dishCategories: [
      {
        type: mongoose.Types.ObjectId,
        ref: 'DishCategory',
      },
    ],
    tables: [{ type: mongoose.Types.ObjectId, ref: 'Table' }],
    status: { type: String, enum: [Status.enabled, Status.disabled], default: Status.enabled },
  },
  {
    timestamps: true,
  }
);

tablePositionSchema.post('save', async function (doc) {
  try {
    const restaurantId = getStringId({ object: doc, key: 'restaurant' });
    if (!restaurantId) {
      return;
    }

    await deleteTableCache({ restaurantId });
    await deleteTablePositionCache({ restaurantId });
  } catch (err) {
    logger.error(`error running post hook save of tablePosition model`);
  }
});

tablePositionSchema.post(new RegExp('.*update.*', 'i'), async function () {
  try {
    const filter = this.getFilter();
    let restaurantId = _.get(filter, 'restaurant');
    const tablePositionId = _.get(filter, '_id');
    if (!restaurantId) {
      const tablePosition = await this.model.findById(tablePositionId);
      restaurantId = _.get(tablePosition, 'restaurant');
    }
    if (!restaurantId) {
      return;
    }
    await deleteTableCache({ restaurantId });
    await deleteTablePositionCache({ restaurantId });
  } catch (err) {
    logger.error(`error running post hook update of tablePosition model`);
  }
});

// add plugin that converts mongoose to json
tablePositionSchema.plugin(toJSON);

const TablePosition = mongoose.model('TablePosition', tablePositionSchema);

module.exports = TablePosition;
