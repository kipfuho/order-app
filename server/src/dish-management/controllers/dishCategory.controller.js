const _ = require('lodash');
const httpStatus = require('http-status');
const catchAsync = require('../../utils/catchAsync');
const dishCategoryService = require('../services/dishCategory.service');

const getDishCategory = catchAsync(async (req, res) => {
  const dishCategoryId = _.get(req, 'params.dishCategoryId');
  const dishCategory = await dishCategoryService.getDishCategory(dishCategoryId);
  res.status(httpStatus.OK).send({ dishCategory });
});

const createDishCategory = catchAsync(async (req, res) => {
  const createBody = req.body;
  const dishCategory = await dishCategoryService.createDishCategory(createBody);
  res.status(httpStatus.CREATED).send({ dishCategory });
});

const updateDishCategory = catchAsync(async (req, res) => {
  const dishCategoryId = _.get(req, 'params.dishCategoryId');
  const updateBody = req.body;
  await dishCategoryService.updateDishCategory(dishCategoryId, updateBody);
  res.status(httpStatus.OK).send({ message: 'Cập nhật thành công' });
});

const deleteDishCategory = catchAsync(async (req, res) => {
  const dishCategoryId = _.get(req, 'params.dishCategoryId');
  await dishCategoryService.deleteDishCategory(dishCategoryId);
  res.status(httpStatus.OK).send({ message: 'Xoá thành công' });
});

module.exports = {
  getDishCategory,
  createDishCategory,
  updateDishCategory,
  deleteDishCategory,
};
