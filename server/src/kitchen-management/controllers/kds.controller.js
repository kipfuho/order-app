const _ = require('lodash');
const httpStatus = require('http-status');
const catchAsync = require('../../utils/catchAsync');
const kdsService = require('../services/kds.service');
const { convertDishOrderForKitchenResponse, convertKitchenLogForResponse } = require('../converters/kds.converter');

const getUncookedDishOrders = catchAsync(async (req, res) => {
  const shopId = _.get(req, 'shop.id');
  const { cursor } = req.query;
  const limit = parseInt(req.query.limit, 10) || 20;
  const paginationResult = await kdsService.getUncookedDishOrders({ shopId, cursor, limit });
  res.status(httpStatus.OK).send({
    message: 'Thành công',
    uncookedDishOrders: (paginationResult.data || []).map(convertDishOrderForKitchenResponse),
    nextCursor: paginationResult.nextCursor,
  });
});

const getUncookedDishOrdersByDishId = catchAsync(async (req, res) => {
  const shopId = _.get(req, 'shop.id');
  const { cursor, dishId } = req.query;
  const limit = parseInt(req.query.limit, 10) || 10000;
  const paginationResult = await kdsService.getUncookedDishOrdersByDishId({ shopId, dishId, cursor, limit });
  res.status(httpStatus.OK).send({
    message: 'Thành công',
    uncookedDishOrders: (paginationResult.data || []).map(convertDishOrderForKitchenResponse),
    nextCursor: paginationResult.nextCursor,
  });
});

const updateUncookedDishOrders = catchAsync(async (req, res) => {
  const shopId = _.get(req, 'shop.id');
  await kdsService.updateUncookedDishOrders({ shopId, requestBody: req.body });
  res.status(httpStatus.OK).send({ message: 'Thành công' });
});

const undoCookedDishOrders = catchAsync(async (req, res) => {
  const shopId = _.get(req, 'shop.id');
  await kdsService.undoCookedDishOrders({ shopId, requestBody: req.body });
  res.status(httpStatus.OK).send({ message: 'Thành công' });
});

const getUnservedDishOrders = catchAsync(async (req, res) => {
  const shopId = _.get(req, 'shop.id');
  const { cursor } = req.query;
  const limit = parseInt(req.query.limit, 10) || 20;
  const paginationResult = await kdsService.getUnservedDishOrders({ shopId, cursor, limit });
  res.status(httpStatus.OK).send({
    message: 'Thành công',
    unservedDishOrders: (paginationResult.data || []).map(convertDishOrderForKitchenResponse),
    nextCursor: paginationResult.nextCursor,
  });
});

const updateUnservedDishOrders = catchAsync(async (req, res) => {
  const shopId = _.get(req, 'shop.id');
  await kdsService.updateUnservedDishOrders({ shopId, requestBody: req.body });
  res.status(httpStatus.OK).send({ message: 'Thành công' });
});

const undoServedDishOrders = catchAsync(async (req, res) => {
  const shopId = _.get(req, 'shop.id');
  await kdsService.undoServedDishOrders({ shopId, requestBody: req.body });
  res.status(httpStatus.OK).send({ message: 'Thành công' });
});

const getCookedHistories = catchAsync(async (req, res) => {
  const shopId = _.get(req, 'shop.id');
  const { cursor } = req.query;
  const limit = parseInt(req.query.limit, 10) || 20;
  const paginationResult = await kdsService.getCookedHistories({ shopId, requestBody: req.body, cursor, limit });
  res.status(httpStatus.OK).send({
    message: 'Thành công',
    cookedHistories: (paginationResult.data || []).map((item) => convertKitchenLogForResponse(item)),
    nextCursor: paginationResult.nextCursor,
  });
});

const getServedHistories = catchAsync(async (req, res) => {
  const shopId = _.get(req, 'shop.id');
  const { cursor } = req.query;
  const limit = parseInt(req.query.limit, 10) || 20;
  const paginationResult = await kdsService.getServedHistories({ shopId, requestBody: req.body, cursor, limit });
  res.status(httpStatus.OK).send({
    message: 'Thành công',
    servedHistories: (paginationResult.data || []).map((item) => convertKitchenLogForResponse(item)),
    nextCursor: paginationResult.nextCursor,
  });
});

module.exports = {
  getUncookedDishOrders,
  getUncookedDishOrdersByDishId,
  updateUncookedDishOrders,
  undoCookedDishOrders,
  getUnservedDishOrders,
  updateUnservedDishOrders,
  undoServedDishOrders,
  getCookedHistories,
  getServedHistories,
};
