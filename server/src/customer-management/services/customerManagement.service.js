const { getMessageByLocale } = require('../../locale');
const { getCustomerFromCache } = require('../../metadata/customerMetadata.service');
const { Customer } = require('../../models');
const { throwBadRequest } = require('../../utils/errorHandling');

const getCustomer = async (customerId) => {
  const customer = await getCustomerFromCache({ customerId });
  return customer;
};

const createCustomer = async (createBody) => {
  const customer = await Customer.create(createBody);
  return customer.toJSON();
};

const updateCustomer = async (customerId, updateBody) => {
  const customer = await Customer.findByIdAndUpdate(
    customerId,
    {
      $set: updateBody,
    },
    { new: true }
  );
  throwBadRequest(!customer, getMessageByLocale({ key: 'customer.notFound' }));
  return customer;
};

const registerCustomer = async ({ phone, password, name, id }) => {
  if (id) {
    const customer = await Customer.findByIdAndUpdate(
      { _id: id, anonymous: true },
      {
        $set: { name, phone, password },
        $unset: {
          anonymous: 1,
        },
      },
      {
        new: true,
      }
    );

    throwBadRequest(!customer, getMessageByLocale({ key: 'customer.notFound' }));
    return customer.toJSON();
  }

  const customer = await createCustomer({ name, phone, password });
  return customer;
};

const deleteCustomer = async (customerId) => {
  await Customer.deleteOne({ _id: customerId });
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
