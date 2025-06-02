const _ = require('lodash');
const httpStatus = require('http-status');
const catchAsync = require('../../utils/catchAsync');
const kitchenService = require('../services/kitchen.service');

const getKitchen = catchAsync(async (req, res) => {
  const shopId = _.get(req, 'shop.id');
  const kitchenId = _.get(req, 'params.kitchenId');
  const kitchen = await kitchenService.getKitchen({ shopId, kitchenId });
  res.status(httpStatus.OK).send({ kitchen });
});

const getKitchens = catchAsync(async (req, res) => {
  const shopId = _.get(req, 'shop.id');
  const kitchens = await kitchenService.getKitchens({ shopId });
  res.status(httpStatus.OK).send({ kitchens });
});

const createKitchen = catchAsync(async (req, res) => {
  const shopId = _.get(req, 'shop.id');
  const createBody = req.body;
  const kitchen = await kitchenService.createKitchen({ shopId, createBody });
  res.status(httpStatus.CREATED).send({ kitchen });
});

const updateKitchen = catchAsync(async (req, res) => {
  const shopId = _.get(req, 'shop.id');
  const kitchenId = _.get(req, 'params.kitchenId');
  const updateBody = req.body;
  await kitchenService.updateKitchen({ shopId, kitchenId, updateBody });
  res.status(httpStatus.OK).send({ message: 'Cập nhật thành công' });
});

const deleteKitchen = catchAsync(async (req, res) => {
  const shopId = _.get(req, 'shop.id');
  const kitchenId = _.get(req, 'params.kitchenId');
  await kitchenService.deleteKitchen({ shopId, kitchenId });
  res.status(httpStatus.OK).send({ message: 'Thành công' });
});

module.exports = {
  getKitchen,
  getKitchens,
  createKitchen,
  updateKitchen,
  deleteKitchen,
};
