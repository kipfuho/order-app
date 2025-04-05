const _ = require('lodash');
const { convertOrderForResponse } = require('./order.converter');
const { formatDateHHMMDDMMYYYY } = require('../../utils/common');

/* eslint-disable no-param-reassign */
const convertOrderSessionForResponse = (orderSessionJson) => {
  orderSessionJson.tableIds = _.map(orderSessionJson.tables, 'id');
  orderSessionJson.tableName = _.join(orderSessionJson.tableNames, ',');
  orderSessionJson.endedAt = formatDateHHMMDDMMYYYY(orderSessionJson.endedAt);
  orderSessionJson.updatedAt = formatDateHHMMDDMMYYYY(orderSessionJson.updatedAt);
  orderSessionJson.createdAt = formatDateHHMMDDMMYYYY(orderSessionJson.createdAt);
  orderSessionJson.orders = _.map(orderSessionJson.orders, (order) => convertOrderForResponse(order));

  delete orderSessionJson.shop;
  delete orderSessionJson.tables;
  delete orderSessionJson.tableNames;
  return orderSessionJson;
};
/* eslint-enable no-param-reassign */

module.exports = {
  convertOrderSessionForResponse,
};
