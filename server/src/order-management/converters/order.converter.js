const _ = require('lodash');
const { formatDateHHMMDDMMYYYY } = require('../../utils/common');

/* eslint-disable no-param-reassign */
const convertDishOrderForResponse = (dishOrder) => {
  dishOrder.createdAt = formatDateHHMMDDMMYYYY(dishOrder.createdAt);
  dishOrder.updatedAt = formatDateHHMMDDMMYYYY(dishOrder.updatedAt);

  delete dishOrder.orderId;
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
  delete order.shopId;
  delete order.tableId;
  delete order.customerId;
  delete order.approvedById;
  delete order.cancelledById;
  delete order.orderSessionStatus;
  delete order.kitchenAllDone;
  return order;
};
/* eslint-enable no-param-reassign */

module.exports = {
  convertOrderForResponse,
};
