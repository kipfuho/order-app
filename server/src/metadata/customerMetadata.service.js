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
    const customer = await Customer.findUnique({
      where: {
        id: customerId,
        status: constant.Status.enabled,
      },
    });
    return customer;
  }

  const customer = await Customer.findUnique({
    where: {
      phone,
      status: constant.Status.enabled,
    },
  });
  return customer;
};

const getCustomerFromCache = async ({ customerId }) => {
  const key = getCustomerKey({ customerId });
  const clsHookCustomer = _getCustomerFromClsHook({ key });
  if (!_.isEmpty(clsHookCustomer)) {
    return clsHookCustomer;
  }

  if (redisClient.isRedisConnected()) {
    const customerCache = await redisClient.getJson(key);
    if (!_.isEmpty(customerCache)) {
      setSession({ key, value: customerCache });
      return customerCache;
    }
  }

  const customer = await getCustomerFromDatabase({ customerId });
  return customer;
};

module.exports = {
  getCustomerFromDatabase,
  getCustomerFromCache,
};
