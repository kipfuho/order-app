const mongoose = require('mongoose');
const { toJSON } = require('../../models/plugins');

const customerSchema = mongoose.Schema(
  {
    name: { type: String },
    phone: { type: String },
    email: { type: String },
  },
  {
    timestamps: true,
  }
);

// add plugin that converts mongoose to json
customerSchema.plugin(toJSON);

const Customer = mongoose.model('Customer', customerSchema);

module.exports = Customer;
