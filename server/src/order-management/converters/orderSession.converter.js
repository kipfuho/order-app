const _ = require('lodash');
const { convertOrderForResponse } = require('./order.converter');
const { formatDateDDMMYYYY } = require('../../utils/common');

/* eslint-disable no-param-reassign */
const convertOrderSessionForResponse = (orderSession) => {
  orderSession.restaurantId = orderSession.restaurant.id;
  orderSession.tableIds = orderSession.tables;
  orderSession.endedAt = formatDateDDMMYYYY(orderSession.endedAt);
  orderSession.createdAt = formatDateDDMMYYYY(orderSession.createdAt);
  delete orderSession.restaurant;
  delete orderSession.table;
  return {
    orderSessionId: orderSession.id,
    orders: _.map(orderSession.orders, convertOrderForResponse),
  };
};
/* eslint-enable no-param-reassign */

module.exports = {
  convertOrderSessionForResponse,
};
