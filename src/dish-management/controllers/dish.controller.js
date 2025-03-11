const _ = require('lodash');
const httpStatus = require('http-status');
const catchAsync = require('../../utils/catchAsync');
const dishService = require('../services/dish.service');

const getDish = catchAsync(async (req, res) => {
  const dishId = _.get(req, 'params.dishId');
  const dish = await dishService.getDish(dishId);
  res.status(httpStatus.OK).send({ dish });
});

const createDish = catchAsync(async (req, res) => {
  const createBody = req.body;
  const dish = await dishService.createDish(createBody);
  res.status(httpStatus.CREATED).send({ dish });
});

const updateDish = catchAsync(async (req, res) => {
  const dishId = _.get(req, 'params.dishId');
  const updateBody = req.body;
  await dishService.updateDish(dishId, updateBody);
  res.status(httpStatus.OK).send({ message: 'Cập nhật thành công' });
});

const deleteDish = catchAsync(async (req, res) => {
  const dishId = _.get(req, 'params.dishId');
  await dishService.deleteDish(dishId);
  res.status(httpStatus.OK).send({ message: 'Xoá thành công' });
});

module.exports = {
  getDish,
  createDish,
  updateDish,
  deleteDish,
};
