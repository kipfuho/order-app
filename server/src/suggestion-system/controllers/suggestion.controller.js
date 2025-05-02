const _ = require('lodash');
const httpStatus = require('http-status');
const catchAsync = require('../../utils/catchAsync');
const { recommendDishes } = require('../services/suggestion.heuristic.service');

const getRecommendedDishes = catchAsync(async (req, res) => {
  const shopId = _.get(req, 'shop.id');
  const customerId = _.get(req, 'user.id');
  const dishes = await recommendDishes({ shopId, customerId });
  res.status(httpStatus.OK).send({ message: 'OK', dishes });
});

module.exports = {
  getRecommendedDishes,
};
