const _ = require('lodash');
const httpStatus = require('http-status');
const catchAsync = require('../../utils/catchAsync');
const orderManagementService = require('../services/orderManagement.service');

const createOrder = catchAsync(async (req, res) => {
  await orderManagementService.createOrder();
  res.status(httpStatus.OK).send({ message: 'OK' });
});

const increaseDishQuantity = catchAsync(async (req, res) => {
  await orderManagementService.increaseDishQuantity();
  res.status(httpStatus.OK).send({ message: 'OK' });
});

const decreaseDishQuantity = catchAsync(async (req, res) => {
  await orderManagementService.decreaseDishQuantity();
  res.status(httpStatus.OK).send({ message: 'OK' });
});

const updateOrder = catchAsync(async (req, res) => {
  await orderManagementService.updateOrder();
  res.status(httpStatus.OK).send({ message: 'OK' });
});

const getOrders = catchAsync(async (req, res) => {
  await orderManagementService.getOrders();
  res.status(httpStatus.OK).send({ message: 'OK' });
});

const getOrderDetail = catchAsync(async (req, res) => {
  await orderManagementService.getOrderDetail();
  res.status(httpStatus.OK).send({ message: 'OK' });
});

const payOrder = catchAsync(async (req, res) => {
  await orderManagementService.payOrder();
  res.status(httpStatus.OK).send({ message: 'OK' });
});

const cancelOrder = catchAsync(async (req, res) => {
  await orderManagementService.cancelOrder();
  res.status(httpStatus.OK).send({ message: 'OK' });
});

const cancelPaidStatus = catchAsync(async (req, res) => {
  await orderManagementService.cancelPaidStatus();
  res.status(httpStatus.OK).send({ message: 'OK' });
});

const getOrderHistory = catchAsync(async (req, res) => {
  await orderManagementService.getOrderHistory();
  res.status(httpStatus.OK).send({ message: 'OK' });
});

const updateCart = catchAsync(async (req, res) => {
  await orderManagementService.updateCart();
  res.status(httpStatus.OK).send({ message: 'OK' });
});

const checkoutCart = catchAsync(async (req, res) => {
  await orderManagementService.checkoutCart();
  res.status(httpStatus.OK).send({ message: 'OK' });
});

const discountDish = catchAsync(async (req, res) => {
  await orderManagementService.discountDish();
  res.status(httpStatus.OK).send({ message: 'OK' });
});

const discountOrder = catchAsync(async (req, res) => {
  await orderManagementService.discountOrder();
  res.status(httpStatus.OK).send({ message: 'OK' });
});

module.exports = {
  createOrder,
  increaseDishQuantity,
  decreaseDishQuantity,
  updateOrder,
  getOrders,
  getOrderDetail,
  payOrder,
  cancelOrder,
  cancelPaidStatus,
  getOrderHistory,
  updateCart,
  checkoutCart,
  discountDish,
  discountOrder,
};
