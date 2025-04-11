const _ = require('lodash');
const redisClient = require('../utils/redis');
const { getSession, setSession } = require('../middlewares/clsHooked');
const { Customer } = require('../models');
const { getCustomerKey } = require('./common');
const constant = require('../utils/constant');

const _getCustomerFromClsHook = ({ key }) => {
  const customer = getSession({ key });
  return customer;
};

const getCustomerFromDatabase = async ({ customerId, phone }) => {
  if (customerId) {
    const customer = await Customer.findOne({ _id: customerId, status: { $ne: constant.Status.disabled } });
    const customerJson = customer.toJSON();
    return customerJson;
  }

  const customer = await Customer.findOne({
    phone,
    status: { $ne: constant.Status.disabled },
  });
  if (!customer) {
    return null;
  }
  const customerJson = customer.toJSON();
  return customerJson;
};

const getCustomerFromCache = async ({ customerId }) => {
  const key = getCustomerKey({ customerId });
  const clsHookCustomer = _getCustomerFromClsHook({ key });
  if (!_.isEmpty(clsHookCustomer)) {
    return clsHookCustomer;
  }

  if (redisClient.isRedisConnected()) {
    const customer = await redisClient.getJson(key);
    if (!_.isEmpty(customer)) {
      setSession({ key, value: customer });
      return customer;
    }
  }

  const customerJson = await getCustomerFromDatabase({ customerId });
  return customerJson;
};

module.exports = {
  getCustomerFromDatabase,
  getCustomerFromCache,
};
