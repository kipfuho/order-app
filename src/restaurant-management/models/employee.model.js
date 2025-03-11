const _ = require('lodash');
const mongoose = require('mongoose');
const { toJSON } = require('../../models/plugins');
const { Status } = require('../../utils/constant');
const { getStringId } = require('../../utils/common');
const { deleteEmployeeCache } = require('../../metadata/common');
const logger = require('../../config/logger');

const employeeSchema = mongoose.Schema(
  {
    restaurant: { type: mongoose.Types.ObjectId, ref: 'Restaurant' },
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
    const restaurantId = getStringId({ object: doc, key: 'restaurant' });
    await deleteEmployeeCache({ restaurantId });
  } catch (err) {
    logger.error(`error running post hook save of employee model`);
  }
});

employeeSchema.post(new RegExp('.*update.*', 'i'), async function () {
  try {
    const filter = this.getFilter();
    let restaurantId = _.get(filter, 'restaurant');
    const employeeId = _.get(filter, '_id');
    if (!restaurantId) {
      const employee = await this.model.findById(employeeId);
      restaurantId = _.get(employee, 'restaurant');
    }
    if (!restaurantId) {
      return;
    }
    await deleteEmployeeCache({ restaurantId });
  } catch (err) {
    logger.error(`error running post hook update of employee model`);
  }
});

// add plugin that converts mongoose to json
employeeSchema.plugin(toJSON);

const Employee = mongoose.model('Employee', employeeSchema);

module.exports = Employee;
