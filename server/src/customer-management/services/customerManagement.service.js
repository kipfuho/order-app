const { Customer } = require('../../models');
const { throwBadRequest } = require('../../utils/errorHandling');

const getCustomer = async (customerId) => {
  const customer = await Customer.findById(customerId);
  throwBadRequest(!customer, 'Không tìm thấy khách hàng');
  return customer;
};

const createCustomer = async (createBody) => {
  const customer = await Customer.create(createBody);
  return customer;
};

const updateCustomer = async (customerId, updateBody) => {
  const customer = await Customer.findByIdAndUpdate(
    customerId,
    {
      $set: updateBody,
    },
    { new: true }
  );
  throwBadRequest(!customer, 'Không tìm thấy khách hàng');
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
};
