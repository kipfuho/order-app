const _ = require('lodash');
const mongoose = require('mongoose');
const { toJSON } = require('../../utils/plugins');
const { Status } = require('../../utils/constant');
const { getStringId } = require('../../utils/common');
const { deleteEmployeeCache, deleteEmployeeByUserIdCache } = require('../../metadata/common');
const logger = require('../../config/logger');

const employeeSchema = new mongoose.Schema(
  {
    shop: { type: mongoose.Types.ObjectId, ref: 'Shop' },
    user: { type: mongoose.Types.ObjectId, ref: 'User' },
    name: { type: String },
    position: { type: mongoose.Types.ObjectId, ref: 'EmployeePosition' },
    department: { type: mongoose.Types.ObjectId, ref: 'Department' },
    status: { type: String, enum: [Status.enabled, Status.disabled], default: Status.enabled },
    permissions: [String],
  },
  {
    timestamps: true,
  }
);

employeeSchema.post('save', async function (doc) {
  try {
    const shopId = getStringId({ object: doc, key: 'shop' });
    const userId = getStringId({ object: doc, key: 'user' });
    await deleteEmployeeCache({ shopId });
    await deleteEmployeeByUserIdCache({ shopId, userId });
  } catch (err) {
    logger.error(`error running post hook save of employee model`);
  }
});

employeeSchema.post(new RegExp('.*update.*', 'i'), async function () {
  try {
    const filter = this.getFilter();
    let shopId = _.get(filter, 'shop');
    let userId = _.get(filter, 'user');
    const employeeId = _.get(filter, '_id');
    if (!shopId || !userId) {
      const employee = await this.model.findById(employeeId);
      shopId = _.get(employee, 'shop');
      userId = _.get(employee, 'user');
    }
    if (!shopId || !userId) {
      return;
    }
    await deleteEmployeeCache({ shopId });
    await deleteEmployeeByUserIdCache({ shopId, userId });
  } catch (err) {
    logger.error(`error running post hook update of employee model`);
  }
});

// add plugin that converts mongoose to json
employeeSchema.plugin(toJSON);

const Employee = mongoose.model('Employee', employeeSchema);

module.exports = Employee;
