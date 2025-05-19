const validator = require('validator');
const { getMessageByLocale } = require('../../locale');
const { getCustomerFromCache } = require('../../metadata/customerMetadata.service');
const { Customer } = require('../../models');
const { throwBadRequest } = require('../../utils/errorHandling');
const { Status } = require('../../utils/constant');

const getCustomer = async (customerId) => {
  const customer = await getCustomerFromCache({ customerId });
  return customer;
};

const validateCustomer = (customerBody) => {
  const errors = [];
  if (!customerBody.name || typeof customerBody.name !== 'string') {
    errors.push('Name is required and must be a string');
  }

  if (!customerBody.email || !validator.isEmail(customerBody.email)) {
    errors.push('A valid email is required');
  }

  if (customerBody.phone && !validator.isMobilePhone(customerBody.phone)) {
    errors.push('Invalid phone number');
  }

  if (!customerBody.password || typeof customerBody.password !== 'string') {
    errors.push('Password is required');
  } else {
    if (customerBody.password.length < 8) {
      errors.push('Password must be at least 8 characters');
    }
    if (!customerBody.password.match(/\d/) || !customerBody.password.match(/[a-zA-Z]/)) {
      errors.push('Password must contain at least one letter and one number');
    }
  }

  if (errors.length > 0) {
    throwBadRequest(true, errors.join(', '));
  }
};

const createCustomer = async (createBody) => {
  validateCustomer(createBody);
  const customer = await Customer.create({
    data: createBody,
  });
  return customer;
};

const updateCustomer = async (customerId, updateBody) => {
  validateCustomer(updateBody);
  const customer = await Customer.update({
    data: updateBody,
    where: {
      id: customerId,
    },
  });
  throwBadRequest(!customer, getMessageByLocale({ key: 'customer.notFound' }));
  return customer;
};

const registerCustomer = async ({ phone, password, name, id }) => {
  if (id) {
    const customer = await Customer.update({
      data: {
        name,
        phone,
        password,
        anonymous: false,
      },
      where: {
        id,
        anonymous: true,
      },
    });

    throwBadRequest(!customer, getMessageByLocale({ key: 'customer.notFound' }));
    return customer;
  }

  const customer = await createCustomer({ name, phone, password });
  return customer;
};

const deleteCustomer = async (customerId) => {
  await Customer.update({
    data: { status: Status.disabled },
    where: {
      id: customerId,
    },
  });
};

const getCustomers = async () => {};

module.exports = {
  getCustomer,
  createCustomer,
  updateCustomer,
  deleteCustomer,
  getCustomers,
  registerCustomer,
};
