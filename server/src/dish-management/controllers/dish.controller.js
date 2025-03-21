const _ = require('lodash');
const httpStatus = require('http-status');
const catchAsync = require('../../utils/catchAsync');
const dishService = require('../services/dish.service');

const getDish = catchAsync(async (req, res) => {
  const shopId = _.get(req, 'shop.id');
  const dishId = _.get(req, 'params.dishId');
  const dish = await dishService.getDish({ shopId, dishId });
  res.status(httpStatus.OK).send({ dish });
});

const getDishes = catchAsync(async (req, res) => {
  const shopId = _.get(req, 'shop.id');
  const dish = await dishService.getDishes({ shopId });
  res.status(httpStatus.OK).send({ dish });
});

const createDish = catchAsync(async (req, res) => {
  const shopId = _.get(req, 'shop.id');
  const createBody = req.body;
  const dish = await dishService.createDish({ shopId, createBody });
  res.status(httpStatus.CREATED).send({ dish });
});

const updateDish = catchAsync(async (req, res) => {
  const shopId = _.get(req, 'shop.id');
  const dishId = _.get(req, 'params.dishId');
  const updateBody = req.body;
  await dishService.updateDish({ shopId, dishId, updateBody });
  res.status(httpStatus.OK).send({ message: 'Cập nhật thành công' });
});

const deleteDish = catchAsync(async (req, res) => {
  const shopId = _.get(req, 'shop.id');
  const dishId = _.get(req, 'params.dishId');
  await dishService.deleteDish({ shopId, dishId });
  res.status(httpStatus.OK).send({ message: 'Xoá thành công' });
});

const getDishTypes = catchAsync(async (req, res) => {
  const shopId = _.get(req, 'shop.id');
  const dishTypes = await dishService.getDishTypes(shopId);
  res.status(httpStatus.OK).send({ dishTypes });
});

module.exports = {
  getDish,
  getDishes,
  createDish,
  updateDish,
  deleteDish,
  getDishTypes,
};
