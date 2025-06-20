const _ = require('lodash');
const httpStatus = require('http-status');
const catchAsync = require('../../utils/catchAsync');
const dishCategoryService = require('../services/dishCategory.service');

const getDishCategory = catchAsync(async (req, res) => {
  const shopId = _.get(req, 'shop.id');
  const dishCategoryId = _.get(req, 'params.dishCategoryId');
  const dishCategory = await dishCategoryService.getDishCategory({ shopId, dishCategoryId });
  res.status(httpStatus.OK).send({ dishCategory });
});

const getDishCategories = catchAsync(async (req, res) => {
  const shopId = _.get(req, 'shop.id');
  const dishCategories = await dishCategoryService.getDishCategories({ shopId });
  res.status(httpStatus.OK).send({ dishCategories });
});

const createDishCategory = catchAsync(async (req, res) => {
  const shopId = _.get(req, 'shop.id');
  const createBody = req.body;
  const dishCategory = await dishCategoryService.createDishCategory({ shopId, createBody });
  res.status(httpStatus.CREATED).send({ dishCategory });
});

const updateDishCategory = catchAsync(async (req, res) => {
  const shopId = _.get(req, 'shop.id');
  const dishCategoryId = _.get(req, 'params.dishCategoryId');
  const updateBody = req.body;
  const dishCategory = await dishCategoryService.updateDishCategory({ shopId, dishCategoryId, updateBody });
  res.status(httpStatus.OK).send({ message: 'Cập nhật thành công', dishCategory });
});

const deleteDishCategory = catchAsync(async (req, res) => {
  const shopId = _.get(req, 'shop.id');
  const dishCategoryId = _.get(req, 'params.dishCategoryId');
  await dishCategoryService.deleteDishCategory({ shopId, dishCategoryId });
  res.status(httpStatus.OK).send({ message: 'Xoá thành công' });
});

const importDishCategories = catchAsync(async (req, res) => {
  const shopId = _.get(req, 'shop.id');
  const { dishCategories } = req.body;
  const errorDishCategories = await dishCategoryService.importDishCategories({ shopId, dishCategories });
  res.status(httpStatus.OK).send({ message: 'Thành công', errorDishCategories });
});

module.exports = {
  getDishCategory,
  getDishCategories,
  createDishCategory,
  updateDishCategory,
  deleteDishCategory,
  importDishCategories,
};
