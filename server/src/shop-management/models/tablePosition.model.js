const _ = require('lodash');
const mongoose = require('mongoose');
const { toJSON } = require('../../utils/plugins');
const { Status } = require('../../utils/constant');
const { getStringId } = require('../../utils/common');
const logger = require('../../config/logger');
const { deleteTableCache, deleteTablePositionCache } = require('../../metadata/common');

const tablePositionSchema = new mongoose.Schema(
  {
    shop: { type: mongoose.Types.ObjectId, ref: 'Shop' },
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
    const shopId = getStringId({ object: doc, key: 'shop' });
    if (!shopId) {
      return;
    }

    await deleteTableCache({ shopId });
    await deleteTablePositionCache({ shopId });
  } catch (err) {
    logger.error(`error running post hook save of tablePosition model`);
  }
});

tablePositionSchema.post(new RegExp('.*(update|delete).*', 'i'), async function () {
  try {
    const filter = this.getFilter();
    let shopId = _.get(filter, 'shop');
    const tablePositionId = _.get(filter, '_id');
    if (!shopId) {
      const tablePosition = await this.model.findById(tablePositionId);
      shopId = _.get(tablePosition, 'shop');
    }
    if (!shopId) {
      return;
    }
    await deleteTableCache({ shopId });
    await deleteTablePositionCache({ shopId });
  } catch (err) {
    logger.error(`error running post hook update of tablePosition model`);
  }
});

// add plugin that converts mongoose to json
tablePositionSchema.plugin(toJSON);

const TablePosition = mongoose.model('TablePosition', tablePositionSchema);

module.exports = TablePosition;
