const _ = require('lodash');
const mongoose = require('mongoose');
const { toJSON } = require('../../utils/plugins');
const { Status } = require('../../utils/constant');
const { getStringId } = require('../../utils/common');
const { deleteEmployeeCache, deleteDepartmentCache } = require('../../metadata/common');
const logger = require('../../config/logger');

const employeeDepartmentSchema = new mongoose.Schema(
  {
    shop: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Shop',
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
    const shopId = getStringId({ object: doc, key: 'shop' });
    if (!shopId) {
      return;
    }

    await deleteEmployeeCache({ shopId });
    await deleteDepartmentCache({ shopId });
  } catch (err) {
    logger.error(`error running post hook save of department model`);
  }
});

employeeDepartmentSchema.post(new RegExp('.*update.*', 'i'), async function () {
  try {
    const filter = this.getFilter();
    let shopId = _.get(filter, 'shop');
    const departmentId = _.get(filter, '_id');
    if (!shopId) {
      const department = await this.model.findById(departmentId);
      shopId = _.get(department, 'shop');
    }
    if (!shopId) {
      return;
    }
    await deleteEmployeeCache({ shopId });
    await deleteDepartmentCache({ shopId });
  } catch (err) {
    logger.error(`error running post hook update of department model`);
  }
});

// add plugin that converts mongoose to json
employeeDepartmentSchema.plugin(toJSON);

const EmployeeDepartment = mongoose.model('Department', employeeDepartmentSchema);

module.exports = EmployeeDepartment;
