const _ = require('lodash');
const mongoose = require('mongoose');
const { toJSON } = require('../../models/plugins');
const { Status } = require('../../utils/constant');
const logger = require('../../config/logger');
const { getStringId } = require('../../utils/common');
const { deleteEmployeePositionCache, deleteEmployeeCache } = require('../../metadata/common');

const employeePositionSchema = mongoose.Schema(
  {
    restaurant: { type: mongoose.Types.ObjectId, ref: 'Restaurant' },
    name: { type: String },
    status: { type: String, enum: [Status.enabled, Status.disabled], default: Status.enabled },
  },
  {
    timestamps: true,
  }
);

employeePositionSchema.post('save', async function (doc) {
  try {
    const restaurantId = getStringId({ object: doc, key: 'restaurant' });
    if (!restaurantId) {
      return;
    }

    await deleteEmployeeCache({ restaurantId });
    await deleteEmployeePositionCache({ restaurantId });
  } catch (err) {
    logger.error(`error running post hook save of employeePosition model`);
  }
});

employeePositionSchema.post(new RegExp('.*update.*', 'i'), async function () {
  try {
    const filter = this.getFilter();
    let restaurantId = _.get(filter, 'restaurant');
    const employeePositionId = _.get(filter, '_id');
    if (!restaurantId) {
      const employeePosition = await this.model.findById(employeePositionId);
      restaurantId = _.get(employeePosition, 'restaurant');
    }
    if (!restaurantId) {
      return;
    }
    await deleteEmployeeCache({ restaurantId });
    await deleteEmployeePositionCache({ restaurantId });
  } catch (err) {
    logger.error(`error running post hook update of employeePosition model`);
  }
});

// add plugin that converts mongoose to json
employeePositionSchema.plugin(toJSON);

const EmployeePosition = mongoose.model('EmployeePosition', employeePositionSchema);

module.exports = EmployeePosition;
