const _ = require('lodash');
const httpStatus = require('http-status');
const catchAsync = require('../../utils/catchAsync');
const kdsService = require('../services/kds.service');

const getUncookedDishOrders = catchAsync(async (req, res) => {
  const shopId = _.get(req, 'shop.id');
  const uncookedDishOrders = await kdsService.getUncookedDishOrders({ shopId });
  res.status(httpStatus.OK).send({ message: 'Thành công', uncookedDishOrders });
});

const updateUncookedDishOrders = catchAsync(async (req, res) => {
  const shopId = _.get(req, 'shop.id');
  const userId = _.get(req, 'user.id');
  await kdsService.updateUncookedDishOrders({ shopId, requestBody: req.body, userId });
  res.status(httpStatus.OK).send({ message: 'Thành công' });
});

const undoCookedDishOrders = catchAsync(async (req, res) => {
  const shopId = _.get(req, 'shop.id');
  const userId = _.get(req, 'user.id');
  await kdsService.undoCookedDishOrders({ shopId, requestBody: req.body, userId });
  res.status(httpStatus.OK).send({ message: 'Thành công' });
});

const getUnservedDishOrders = catchAsync(async (req, res) => {
  const shopId = _.get(req, 'shop.id');
  const unservedDishOrders = await kdsService.getUnservedDishOrders({ shopId });
  res.status(httpStatus.OK).send({ message: 'Thành công', unservedDishOrders });
});

const updateUnservedDishOrders = catchAsync(async (req, res) => {
  const shopId = _.get(req, 'shop.id');
  const userId = _.get(req, 'user.id');
  await kdsService.deleteKitchen({ shopId, requestBody: req.body, userId });
  res.status(httpStatus.OK).send({ message: 'Thành công' });
});

const undoServedDishOrders = catchAsync(async (req, res) => {
  const shopId = _.get(req, 'shop.id');
  const userId = _.get(req, 'user.id');
  await kdsService.deleteKitchen({ shopId, requestBody: req.body, userId });
  res.status(httpStatus.OK).send({ message: 'Thành công' });
});

const getCookedHistories = catchAsync(async (req, res) => {
  const shopId = _.get(req, 'shop.id');
  const cookedHistories = await kdsService.deleteKitchen({ shopId, requestBody: req.body });
  res.status(httpStatus.OK).send({ message: 'Thành công', cookedHistories });
});

const getServedHistories = catchAsync(async (req, res) => {
  const shopId = _.get(req, 'shop.id');
  const servedHistories = await kdsService.deleteKitchen({ shopId, requestBody: req.body });
  res.status(httpStatus.OK).send({ message: 'Thành công', servedHistories });
});

module.exports = {
  getUncookedDishOrders,
  updateUncookedDishOrders,
  undoCookedDishOrders,
  getUnservedDishOrders,
  updateUnservedDishOrders,
  undoServedDishOrders,
  getCookedHistories,
  getServedHistories,
};
