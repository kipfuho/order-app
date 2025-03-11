const _ = require('lodash');
const mongoose = require('mongoose');
const { toJSON } = require('../../models/plugins');
const { Status } = require('../../utils/constant');
const { getStringId } = require('../../utils/common');
const { deleteEmployeeCache, deleteDepartmentCache } = require('../../metadata/common');
const logger = require('../../config/logger');

const employeeDepartmentSchema = mongoose.Schema(
  {
    restaurant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Restaurant',
    },
    name: {
      type: String,
      trim: true,
    },
    permissions: {
      type: [String],
    },
    status: {
      type: String,
      enum: [Status.enabled, Status.disabled],
      default: Status.enabled,
    },
  },
  {
    timestamps: true,
  }
);

employeeDepartmentSchema.post('save', async function (doc) {
  try {
    const restaurantId = getStringId({ object: doc, key: 'restaurant' });
    if (!restaurantId) {
      return;
    }

    await deleteEmployeeCache({ restaurantId });
    await deleteDepartmentCache({ restaurantId });
  } catch (err) {
    logger.error(`error running post hook save of department model`);
  }
});

employeeDepartmentSchema.post(new RegExp('.*update.*', 'i'), async function () {
  try {
    const filter = this.getFilter();
    let restaurantId = _.get(filter, 'restaurant');
    const departmentId = _.get(filter, '_id');
    if (!restaurantId) {
      const department = await this.model.findById(departmentId);
      restaurantId = _.get(department, 'restaurant');
    }
    if (!restaurantId) {
      return;
    }
    await deleteEmployeeCache({ restaurantId });
    await deleteDepartmentCache({ restaurantId });
  } catch (err) {
    logger.error(`error running post hook update of department model`);
  }
});

// add plugin that converts mongoose to json
employeeDepartmentSchema.plugin(toJSON);

const EmployeeDepartment = mongoose.model('Department', employeeDepartmentSchema);

module.exports = EmployeeDepartment;
