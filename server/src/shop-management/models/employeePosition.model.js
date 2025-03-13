const _ = require('lodash');
const mongoose = require('mongoose');
const { toJSON } = require('../../utils/plugins');
const { Status } = require('../../utils/constant');
const logger = require('../../config/logger');
const { getStringId } = require('../../utils/common');
const { deleteEmployeePositionCache, deleteEmployeeCache } = require('../../metadata/common');

const employeePositionSchema = mongoose.Schema(
  {
    shop: { type: mongoose.Types.ObjectId, ref: 'Shop' },
    name: { type: String },
    status: { type: String, enum: [Status.enabled, Status.disabled], default: Status.enabled },
  },
  {
    timestamps: true,
  }
);

employeePositionSchema.post('save', async function (doc) {
  try {
    const shopId = getStringId({ object: doc, key: 'shop' });
    if (!shopId) {
      return;
    }

    await deleteEmployeeCache({ shopId });
    await deleteEmployeePositionCache({ shopId });
  } catch (err) {
    logger.error(`error running post hook save of employeePosition model`);
  }
});

employeePositionSchema.post(new RegExp('.*update.*', 'i'), async function () {
  try {
    const filter = this.getFilter();
    let shopId = _.get(filter, 'shop');
    const employeePositionId = _.get(filter, '_id');
    if (!shopId) {
      const employeePosition = await this.model.findById(employeePositionId);
      shopId = _.get(employeePosition, 'shop');
    }
    if (!shopId) {
      return;
    }
    await deleteEmployeeCache({ shopId });
    await deleteEmployeePositionCache({ shopId });
  } catch (err) {
    logger.error(`error running post hook update of employeePosition model`);
  }
});

// add plugin that converts mongoose to json
employeePositionSchema.plugin(toJSON);

const EmployeePosition = mongoose.model('EmployeePosition', employeePositionSchema);

module.exports = EmployeePosition;
