const _ = require('lodash');
const mongoose = require('mongoose');
const { toJSON } = require('../../utils/plugins');
const { Status } = require('../../utils/constant');
const { getStringId } = require('../../utils/common');
const logger = require('../../config/logger');
const { deleteTableCache } = require('../../metadata/common');

const tableSchema = new mongoose.Schema(
  {
    shop: { type: mongoose.Types.ObjectId, ref: 'Shop' },
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
    const shopId = getStringId({ object: doc, key: 'shop' });
    if (!shopId) {
      return;
    }

    await deleteTableCache({ shopId });
  } catch (err) {
    logger.error(`error running post hook save of table model`);
  }
});

tableSchema.post(new RegExp('.*update.*', 'i'), async function () {
  try {
    const filter = this.getFilter();
    let shopId = _.get(filter, 'shop');
    const tableId = _.get(filter, '_id');
    if (!shopId) {
      const table = await this.model.findById(tableId);
      shopId = _.get(table, 'shop');
    }
    if (!shopId) {
      return;
    }
    await deleteTableCache({ shopId });
  } catch (err) {
    logger.error(`error running post hook update of table model`);
  }
});

// add plugin that converts mongoose to json
tableSchema.plugin(toJSON);

const Table = mongoose.model('Table', tableSchema);

module.exports = Table;
