const _ = require('lodash');
const mongoose = require('mongoose');
const { toJSON } = require('../../models/plugins');
const { Status } = require('../../utils/constant');
const { getStringId } = require('../../utils/common');
const logger = require('../../config/logger');
const { deleteTableCache } = require('../../metadata/common');

const tableSchema = mongoose.Schema(
  {
    restaurant: { type: mongoose.Types.ObjectId, ref: 'Restaurant' },
    name: { type: String },
    position: { type: mongoose.Types.ObjectId, ref: 'TablePosition' },
    status: { type: String, enum: [Status.enabled, Status.disabled], default: Status.enabled },
  },
  {
    timestamps: true,
  }
);

tableSchema.post('save', async function (doc) {
  try {
    const restaurantId = getStringId({ object: doc, key: 'restaurant' });
    if (!restaurantId) {
      return;
    }

    await deleteTableCache({ restaurantId });
  } catch (err) {
    logger.error(`error running post hook save of table model`);
  }
});

tableSchema.post(new RegExp('.*update.*', 'i'), async function () {
  try {
    const filter = this.getFilter();
    let restaurantId = _.get(filter, 'restaurant');
    const tableId = _.get(filter, '_id');
    if (!restaurantId) {
      const table = await this.model.findById(tableId);
      restaurantId = _.get(table, 'restaurant');
    }
    if (!restaurantId) {
      return;
    }
    await deleteTableCache({ restaurantId });
  } catch (err) {
    logger.error(`error running post hook update of table model`);
  }
});

// add plugin that converts mongoose to json
tableSchema.plugin(toJSON);

const Table = mongoose.model('Table', tableSchema);

module.exports = Table;
