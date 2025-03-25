const _ = require('lodash');
const httpStatus = require('http-status');
const catchAsync = require('../../utils/catchAsync');
const orderManagementService = require('../services/orderManagement.service');

const createOrder = catchAsync(async (req, res) => {
  const shopId = _.get(req, 'shop.id');
  const requestBody = req.body;
  await orderManagementService.createOrder({ shopId, requestBody });
  res.status(httpStatus.OK).send({ message: 'OK' });
});

const increaseDishQuantity = catchAsync(async (req, res) => {
  const shopId = _.get(req, 'shop.id');
  const requestBody = req.body;
  await orderManagementService.increaseDishQuantity({ shopId, requestBody });
  res.status(httpStatus.OK).send({ message: 'OK' });
});

const decreaseDishQuantity = catchAsync(async (req, res) => {
  const shopId = _.get(req, 'shop.id');
  const requestBody = req.body;
  await orderManagementService.decreaseDishQuantity({ shopId, requestBody });
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
  const orderSessionId = _.get(req, 'params.orderSessionId');
  await orderManagementService.getOrderSessionDetail({ shopId, orderSessionId });
  res.status(httpStatus.OK).send({ message: 'OK' });
});

const payOrderSession = catchAsync(async (req, res) => {
  const shopId = _.get(req, 'shop.id');
  const orderSessionId = _.get(req, 'params.orderSessionId');
  const requestBody = req.body;
  await orderManagementService.payOrderSession({ shopId, orderSessionId, requestBody });
  res.status(httpStatus.OK).send({ message: 'OK' });
});

const cancelOrderSession = catchAsync(async (req, res) => {
  const shopId = _.get(req, 'shop.id');
  const orderSessionId = _.get(req, 'params.orderSessionId');
  const requestBody = req.body;
  await orderManagementService.cancelOrder({ shopId, orderSessionId, reason: _.get(requestBody, 'reason') });
  res.status(httpStatus.OK).send({ message: 'OK' });
});

const cancelOrderSessionPaidStatus = catchAsync(async (req, res) => {
  const shopId = _.get(req, 'shop.id');
  const orderSessionId = _.get(req, 'params.orderSessionId');
  await orderManagementService.cancelPaidStatus({ shopId, orderSessionId });
  res.status(httpStatus.OK).send({ message: 'OK' });
});

const getOrderSessionHistory = catchAsync(async (req, res) => {
  const shopId = _.get(req, 'shop.id');
  const { from, to } = _.get(req, 'params');
  await orderManagementService.getOrderHistory({ from, shopId, to });
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

const discountDish = catchAsync(async (req, res) => {
  const shopId = _.get(req, 'shop.id');
  const requestBody = req.body;
  await orderManagementService.discountDish();
  res.status(httpStatus.OK).send({ message: 'OK' });
});

const discountOrder = catchAsync(async (req, res) => {
  const shopId = _.get(req, 'shop.id');
  const requestBody = req.body;
  await orderManagementService.discountOrder();
  res.status(httpStatus.OK).send({ message: 'OK' });
});

module.exports = {
  createOrder,
  increaseDishQuantity,
  decreaseDishQuantity,
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
  discountOrder,
};
