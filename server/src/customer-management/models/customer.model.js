const _ = require('lodash');
const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const { toJSON, paginate } = require('../../utils/plugins');
const { deleteCustomerCache } = require('../../metadata/common');

const customerSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
    },
    phone: {
      type: String,
      trim: true,
      validate(value) {
        if (value && !validator.isMobilePhone(value)) {
          throw new Error('Invalid phone number');
        }
      },
    },
    email: {
      type: String,
      trim: true,
      validate(value) {
        if (value && !validator.isEmail(value)) {
          throw new Error('Invalid email');
        }
      },
    },
    password: {
      type: String,
      trim: true,
      minlength: 8,
      validate(value) {
        if (!value.match(/\d/) || !value.match(/[a-zA-Z]/)) {
          throw new Error('Password must contain at least one letter and one number');
        }
      },
      private: true, // used by the toJSON plugin
    },
    anonymous: {
      type: Boolean,
    },
  },
  {
    timestamps: true,
  }
);

// add plugin that converts mongoose to json
customerSchema.plugin(toJSON);
customerSchema.plugin(paginate);

customerSchema.pre('save', async function (next) {
  const user = this;
  if (user.isModified('password')) {
    user.password = await bcrypt.hash(user.password, 8);
  }
  await deleteCustomerCache({ customerId: user.id });
  next();
});

customerSchema.pre(new RegExp('.*update.*', 'i'), async function (next) {
  const filter = this.getFilter();
  const update = this.getUpdate();

  // Check for password in the update object
  if (_.get(update, 'password') || _.get(update, '$set.password')) {
    try {
      const password = update.password || update.$set.password;
      const hashedPassword = await bcrypt.hash(password, 8);

      if (update.password) {
        update.password = hashedPassword;
      } else {
        update.$set.password = hashedPassword;
      }
    } catch (err) {
      return next(err);
    }
  }
  const customerId = _.get(filter, '_id');
  await deleteCustomerCache({ customerId });

  next();
});

const Customer = mongoose.model('Customer', customerSchema);

module.exports = Customer;
