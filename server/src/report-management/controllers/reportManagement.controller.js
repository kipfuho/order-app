const _ = require('lodash');
const httpStatus = require('http-status');
const catchAsync = require('../../utils/catchAsync');
const reportManagementService = require('../services/reportManagement.service');

const getDailySalesReport = catchAsync(async (req, res) => {
  const shopId = _.get(req, 'shop.id');
  const { from, to, period } = req.body;
  const dailySalesReport = await reportManagementService.getDailySalesReport({ shopId, from, to, period });
  res.status(httpStatus.OK).send({ message: 'OK', dailySalesReport });
});

const getPopularDishesReport = catchAsync(async (req, res) => {
  const shopId = _.get(req, 'shop.id');
  const { from, to, period } = req.body;
  const popularDishesReport = await reportManagementService.getPopularDishesReport({ shopId, from, to, period });
  res.status(httpStatus.OK).send({ message: 'OK', popularDishesReport });
});

const getPaymentMethodDistributionReport = catchAsync(async (req, res) => {
  const shopId = _.get(req, 'shop.id');
  const { from, to, period } = req.body;
  const paymentMethodDistributionReport = await reportManagementService.getPaymentMethodDistributionReport({
    shopId,
    from,
    to,
    period,
  });
  res.status(httpStatus.OK).send({ message: 'OK', paymentMethodDistributionReport });
});

const getHourlySalesReport = catchAsync(async (req, res) => {
  const shopId = _.get(req, 'shop.id');
  const { from, to, period } = req.body;
  const hourlySalesReport = await reportManagementService.getHourlySalesReport({ shopId, from, to, period });
  res.status(httpStatus.OK).send({ message: 'OK', hourlySalesReport });
});

const getDashboard = catchAsync(async (req, res) => {
  const shopId = _.get(req, 'shop.id');
  const { from, to, period } = req.body;
  const dashboard = await reportManagementService.getDashboard({ shopId, from, to, period });
  res.status(httpStatus.OK).send({ message: 'OK', dashboard });
});

module.exports = {
  getDailySalesReport,
  getPopularDishesReport,
  getPaymentMethodDistributionReport,
  getHourlySalesReport,
  getDashboard,
};
