const _ = require('lodash');
const httpStatus = require('http-status');
const catchAsync = require('../../utils/catchAsync');
const orderManagementService = require('../services/orderManagement.service');

const createOrder = catchAsync(async (req, res) => {
  const shopId = _.get(req, 'shop.id');
  const requestBody = req.body;
  const orderSession = await orderManagementService.createOrder({ shopId, requestBody });
  res.status(httpStatus.OK).send({ message: 'OK', orderSession });
});

const changeDishQuantity = catchAsync(async (req, res) => {
  const shopId = _.get(req, 'shop.id');
  const requestBody = req.body;
  await orderManagementService.changeDishQuantity({ shopId, requestBody });
  res.status(httpStatus.OK).send({ message: 'OK' });
});

const updateOrder = catchAsync(async (req, res) => {
  const shopId = _.get(req, 'shop.id');
  const requestBody = req.body;
  await orderManagementService.updateOrder({ shopId, requestBody });
  res.status(httpStatus.OK).send({ message: 'OK' });
});

const getTableForOrder = catchAsync(async (req, res) => {
  const shopId = _.get(req, 'shop.id');
  const tables = await orderManagementService.getTableForOrder({ shopId });
  res.status(httpStatus.OK).send({ message: 'OK', tables });
});

const getOrderSessionDetail = catchAsync(async (req, res) => {
  const shopId = _.get(req, 'shop.id');
  const { orderSessionId } = req.body;
  const orderSession = await orderManagementService.getOrderSessionDetail({ shopId, orderSessionId });
  res.status(httpStatus.OK).send({ message: 'OK', orderSession });
});

const payOrderSession = catchAsync(async (req, res) => {
  const shopId = _.get(req, 'shop.id');
  const requestBody = req.body;
  await orderManagementService.payOrderSession({ shopId, requestBody });
  res.status(httpStatus.OK).send({ message: 'OK' });
});

const cancelOrderSession = catchAsync(async (req, res) => {
  const shopId = _.get(req, 'shop.id');
  const requestBody = req.body;
  await orderManagementService.cancelOrder({ shopId, user: req.user, requestBody });
  res.status(httpStatus.OK).send({ message: 'OK' });
});

const cancelOrderSessionPaidStatus = catchAsync(async (req, res) => {
  const shopId = _.get(req, 'shop.id');
  const { orderSessionId } = req.body;
  await orderManagementService.cancelPaidStatus({ shopId, orderSessionId });
  res.status(httpStatus.OK).send({ message: 'OK' });
});

const getOrderSessionHistory = catchAsync(async (req, res) => {
  const shopId = _.get(req, 'shop.id');
  const { from, to } = req.body;
  const orderSessions = await orderManagementService.getOrderHistory({ from, shopId, to });
  res.status(httpStatus.OK).send({ message: 'OK', orderSessions });
});

const discountDish = catchAsync(async (req, res) => {
  const shopId = _.get(req, 'shop.id');
  const requestBody = req.body;
  await orderManagementService.discountDish({ shopId, requestBody });
  res.status(httpStatus.OK).send({ message: 'OK' });
});

const discountOrderSession = catchAsync(async (req, res) => {
  const shopId = _.get(req, 'shop.id');
  const requestBody = req.body;
  await orderManagementService.discountOrderSession({ shopId, requestBody });
  res.status(httpStatus.OK).send({ message: 'OK' });
});

const updateCart = catchAsync(async (req, res) => {
  const shopId = _.get(req, 'shop.id');
  const requestBody = req.body;
  await orderManagementService.updateCart();
  res.status(httpStatus.OK).send({ message: 'OK' });
});

const checkoutCart = catchAsync(async (req, res) => {
  const shopId = _.get(req, 'shop.id');
  const requestBody = req.body;
  await orderManagementService.checkoutCart();
  res.status(httpStatus.OK).send({ message: 'OK' });
});

module.exports = {
  createOrder,
  changeDishQuantity,
  updateOrder,
  getTableForOrder,
  getOrderSessionDetail,
  payOrderSession,
  cancelOrderSession,
  cancelOrderSessionPaidStatus,
  getOrderSessionHistory,
  updateCart,
  checkoutCart,
  discountDish,
  discountOrderSession,
};
