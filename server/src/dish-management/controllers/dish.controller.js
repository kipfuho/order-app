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
  const dishes = await dishService.getDishes({ shopId });
  res.status(httpStatus.OK).send({ dishes });
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

const uploadImage = catchAsync(async (req, res) => {
  if (!req.file) {
    return res.status(400).send('No file uploaded');
  }

  const shopId = _.get(req, 'shop.id');
  const url = await dishService.uploadImage({ shopId, image: req.file });
  res.status(httpStatus.OK).send({ url });
});

module.exports = {
  getDish,
  getDishes,
  createDish,
  updateDish,
  deleteDish,
  getDishTypes,
  uploadImage,
};
