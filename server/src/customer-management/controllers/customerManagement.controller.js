const _ = require('lodash');
const httpStatus = require('http-status');
const catchAsync = require('../../utils/catchAsync');
const customerManagementService = require('../services/customerManagement.service');

const getCustomer = catchAsync(async (req, res) => {
  const customerId = _.get(req, 'params.customerId');
  const customer = await customerManagementService.getCustomer(customerId);
  res.status(httpStatus.OK).send({ customer });
});

const createCustomer = catchAsync(async (req, res) => {
  const createBody = req.body;
  const customer = await customerManagementService.createCustomer(createBody);
  res.status(httpStatus.CREATED).send({ customer });
});

const updateCustomer = catchAsync(async (req, res) => {
  const customerId = _.get(req, 'params.customerId');
  const updateBody = req.body;
  await customerManagementService.updateCustomer(customerId, updateBody);
  res.status(httpStatus.OK).send({ message: 'Cập nhật thành công' });
});

const deleteCustomer = catchAsync(async (req, res) => {
  const customerId = _.get(req, 'params.customerId');
  await customerManagementService.deleteCustomer(customerId);
  res.status(httpStatus.OK).send({ message: 'Xoá thành công' });
});

module.exports = {
  getCustomer,
  createCustomer,
  updateCustomer,
  deleteCustomer,
};
