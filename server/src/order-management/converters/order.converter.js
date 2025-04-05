const _ = require('lodash');
const { formatDateHHMMDDMMYYYY } = require('../../utils/common');

/* eslint-disable no-param-reassign */
const convertDishOrderForResponse = (dishOrder) => {
  if (dishOrder.returnedAt) {
    dishOrder.returnedAt = formatDateHHMMDDMMYYYY(dishOrder.returnedAt);
  }
  // Neu la mon thuong
  if (_.get(dishOrder, 'dish.id')) {
    dishOrder.dishId = dishOrder.dish.id;
    dishOrder.name = dishOrder.dish.name;
    dishOrder.images = dishOrder.dish.images;
  } else {
    // Neu la mon khac
    dishOrder.name = _.get(dishOrder, 'name');
  }

  delete dishOrder.dish;
  delete dishOrder.createdAt;
  delete dishOrder.updatedAt;
  return dishOrder;
};
/* eslint-enable no-param-reassign */

/* eslint-disable no-param-reassign */
const convertOrderForResponse = (order) => {
  order.createdAt = formatDateHHMMDDMMYYYY(order.createdAt);
  order.updatedAt = formatDateHHMMDDMMYYYY(order.updatedAt);
  order.dishOrders = _.map(order.dishOrders, (dishOrder) => convertDishOrderForResponse(dishOrder));
  order.returnedDishOrders = _.map(order.returnedDishOrders, (dishOrder) => convertDishOrderForResponse(dishOrder));
  delete order.orderSessionId;
  delete order.shop;
  return order;
};
/* eslint-enable no-param-reassign */

module.exports = {
  convertOrderForResponse,
};
