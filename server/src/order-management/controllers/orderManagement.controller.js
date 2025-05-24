const _ = require('lodash');
const httpStatus = require('http-status');
const catchAsync = require('../../utils/catchAsync');
const orderManagementService = require('../services/orderManagement.service');
const {
  convertOrderSessionForResponse,
  convertOrderSessionHistoryForResponse,
} = require('../converters/orderSession.converter');
const { convertOrderForResponse } = require('../converters/order.converter');
const { convertCartForResponse } = require('../converters/cart.converter');

const createOrder = catchAsync(async (req, res) => {
  const shopId = _.get(req, 'shop.id');
  const userId = _.get(req, 'user.id');
  const requestBody = req.body;
  const orderSessionJson = await orderManagementService.createOrder({ shopId, userId, requestBody });
  const orderSessionResponse = convertOrderSessionForResponse(orderSessionJson);
  res.status(httpStatus.OK).send({ message: 'OK', orderSession: orderSessionResponse });
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

const getTableActiveOrderSessions = catchAsync(async (req, res) => {
  const shopId = _.get(req, 'shop.id');
  const { tableId } = req.body;
  const orderSessionJsons = await orderManagementService.getTableActiveOrderSessions({ shopId, tableId });
  const orderSessionResponses = _.map(orderSessionJsons, (orderSessionJson) =>
    convertOrderSessionForResponse(orderSessionJson, false)
  );
  res.status(httpStatus.OK).send({ message: 'OK', orderSessions: orderSessionResponses });
});

const getOrderSessionDetail = catchAsync(async (req, res) => {
  const shopId = _.get(req, 'shop.id');
  const { orderSessionId } = req.body;
  const orderSessionJson = await orderManagementService.getOrderSessionDetail({ shopId, orderSessionId });
  const orderSessionResponse = convertOrderSessionForResponse(orderSessionJson);
  res.status(httpStatus.OK).send({ message: 'OK', orderSession: orderSessionResponse });
});

const payOrderSession = catchAsync(async (req, res) => {
  const shopId = _.get(req, 'shop.id');
  const requestBody = req.body;
  await orderManagementService.payOrderSession({ shopId, requestBody, user: req.user });
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
  const user = _.get(req, 'user');
  const { orderSessionId } = req.body;
  await orderManagementService.cancelPaidStatus({ shopId, orderSessionId, user });
  res.status(httpStatus.OK).send({ message: 'OK' });
});

const getOrderSessionHistory = catchAsync(async (req, res) => {
  const shopId = _.get(req, 'shop.id');
  const { from, to } = req.body;
  const orderSessions = await orderManagementService.getOrderHistory({ from, shopId, to });
  const orderSessionResponse = _.map(orderSessions, (orderSession) => convertOrderSessionHistoryForResponse(orderSession));
  res.status(httpStatus.OK).send({ message: 'OK', orderSessions: orderSessionResponse });
});

const discountDishOrder = catchAsync(async (req, res) => {
  const shopId = _.get(req, 'shop.id');
  const requestBody = req.body;
  await orderManagementService.discountDishOrder({ shopId, requestBody });
  res.status(httpStatus.OK).send({ message: 'OK' });
});

const discountOrderSession = catchAsync(async (req, res) => {
  const shopId = _.get(req, 'shop.id');
  const requestBody = req.body;
  await orderManagementService.discountOrderSession({ shopId, requestBody });
  res.status(httpStatus.OK).send({ message: 'OK' });
});

const removeDiscountFromOrderSession = catchAsync(async (req, res) => {
  const shopId = _.get(req, 'shop.id');
  const requestBody = req.body;
  await orderManagementService.removeDiscountFromOrderSession({ shopId, requestBody });
  res.status(httpStatus.OK).send({ message: 'OK' });
});

const getCart = catchAsync(async (req, res) => {
  const shopId = _.get(req, 'shop.id');
  const customerId = _.get(req, 'user.id');
  const cart = await orderManagementService.getCart({ customerId, shopId });
  res.status(httpStatus.OK).send({ message: 'OK', cart: convertCartForResponse(cart) });
});

const updateCart = catchAsync(async (req, res) => {
  const shopId = _.get(req, 'shop.id');
  const customerId = _.get(req, 'user.id');
  const requestBody = req.body;
  await orderManagementService.updateCart({ customerId, shopId, requestBody });
  res.status(httpStatus.OK).send({ message: 'OK' });
});

const clearCart = catchAsync(async (req, res) => {
  const shopId = _.get(req, 'shop.id');
  const customerId = _.get(req, 'user.id');
  await orderManagementService.clearCart({ customerId, shopId });
  res.status(httpStatus.OK).send({ message: 'OK' });
});

const checkoutCart = catchAsync(async (req, res) => {
  const shopId = _.get(req, 'shop.id');
  const customerId = _.get(req, 'user.id');
  const requestBody = req.body;
  await orderManagementService.checkoutCart({ customerId, shopId, requestBody });
  res.status(httpStatus.OK).send({ message: 'OK' });
});

const getCheckoutCartHistory = catchAsync(async (req, res) => {
  const shopId = _.get(req, 'shop.id');
  const customerId = _.get(req, 'user.id');
  const histories = await orderManagementService.getCheckoutCartHistory({
    customerId,
    shopId,
  });
  res.status(httpStatus.OK).send({ message: 'OK', histories });
});

const getUnconfirmedOrder = catchAsync(async (req, res) => {
  const shopId = _.get(req, 'shop.id');
  const unconfirmedOrders = await orderManagementService.getOrderNeedApproval({
    shopId,
  });
  res.status(httpStatus.OK).send({ message: 'OK', unconfirmedOrders: _.map(unconfirmedOrders, convertOrderForResponse) });
});

const updateUnconfirmedOrder = catchAsync(async (req, res) => {
  const shopId = _.get(req, 'shop.id');
  await orderManagementService.updateUnconfirmedOrder({
    ...req.body,
    shopId,
  });
  res.status(httpStatus.OK).send({ message: 'OK' });
});

const cancelUnconfirmedOrder = catchAsync(async (req, res) => {
  const shopId = _.get(req, 'shop.id');
  const userId = _.get(req, 'user.id');
  await orderManagementService.cancelUnconfirmedOrder({
    ...req.body,
    shopId,
    userId,
  });
  res.status(httpStatus.OK).send({ message: 'OK' });
});

const approveUnconfirmedOrder = catchAsync(async (req, res) => {
  const shopId = _.get(req, 'shop.id');
  const userId = _.get(req, 'user.id');
  await orderManagementService.approveUnconfirmedOrder({
    ...req.body,
    userId,
    shopId,
  });
  res.status(httpStatus.OK).send({ message: 'OK' });
});

module.exports = {
  createOrder,
  changeDishQuantity,
  updateOrder,
  getTableForOrder,
  getTableActiveOrderSessions,
  getOrderSessionDetail,
  payOrderSession,
  cancelOrderSession,
  cancelOrderSessionPaidStatus,
  discountDishOrder,
  discountOrderSession,
  removeDiscountFromOrderSession,
  getOrderSessionHistory,
  getCart,
  updateCart,
  clearCart,
  checkoutCart,
  getCheckoutCartHistory,
  getUnconfirmedOrder,
  updateUnconfirmedOrder,
  cancelUnconfirmedOrder,
  approveUnconfirmedOrder,
};
