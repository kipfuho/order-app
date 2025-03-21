const _ = require('lodash');
const httpStatus = require('http-status');
const catchAsync = require('../../utils/catchAsync');
const unitService = require('../services/unit.service');

const getUnit = catchAsync(async (req, res) => {
  const shopId = _.get(req, 'shop.id');
  const unitId = _.get(req, 'params.unitId');
  const unit = await unitService.getUnit({ shopId, unitId });
  res.status(httpStatus.OK).send({ unit });
});

const createDefaultUnits = catchAsync(async (req, res) => {
  const shopId = _.get(req, 'shop.id');
  const units = await unitService.createDefaultUnits({ shopId });
  res.status(httpStatus.OK).send({ units });
});

const getUnits = catchAsync(async (req, res) => {
  const shopId = _.get(req, 'shop.id');
  const units = await unitService.getUnits({ shopId });
  res.status(httpStatus.OK).send({ units });
});

const createUnit = catchAsync(async (req, res) => {
  const shopId = _.get(req, 'shop.id');
  const createBody = req.body;
  const unit = await unitService.createUnit({ shopId, createBody });
  res.status(httpStatus.CREATED).send({ unit });
});

const updateUnit = catchAsync(async (req, res) => {
  const shopId = _.get(req, 'shop.id');
  const unitId = _.get(req, 'params.unitId');
  const updateBody = req.body;
  await unitService.updateUnit({ shopId, unitId, updateBody });
  res.status(httpStatus.OK).send({ message: 'Cập nhật thành công' });
});

const deleteUnit = catchAsync(async (req, res) => {
  const shopId = _.get(req, 'shop.id');
  const unitId = _.get(req, 'params.unitId');
  await unitService.deleteUnit({ shopId, unitId });
  res.status(httpStatus.OK).send({ message: 'Xoá thành công' });
});

module.exports = {
  getUnit,
  getUnits,
  createDefaultUnits,
  createUnit,
  updateUnit,
  deleteUnit,
};
