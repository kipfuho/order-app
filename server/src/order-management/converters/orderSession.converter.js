const _ = require('lodash');
const { convertOrderForResponse } = require('./order.converter');
const { formatDateHHMMDDMMYYYY } = require('../../utils/common');
const { mergeDishOrdersOfOrders } = require('../services/orderUtils.service');

/* eslint-disable no-param-reassign */
const convertOrderSessionForResponse = (orderSessionJson, shouldMergeDishOrders = true) => {
  orderSessionJson.tableIds = _.map(orderSessionJson.tables, 'id');
  orderSessionJson.tableName = _.join(orderSessionJson.tableNames, ',');
  orderSessionJson.endedAt = formatDateHHMMDDMMYYYY(orderSessionJson.endedAt);
  orderSessionJson.updatedAt = formatDateHHMMDDMMYYYY(orderSessionJson.updatedAt);
  orderSessionJson.createdAt = formatDateHHMMDDMMYYYY(orderSessionJson.createdAt);
  if (!_.isEmpty(orderSessionJson.orders)) {
    if (shouldMergeDishOrders) {
      orderSessionJson.orders[0].dishOrders = mergeDishOrdersOfOrders(orderSessionJson);
    }
    orderSessionJson.orders = [convertOrderForResponse(orderSessionJson.orders[0])];
  }

  delete orderSessionJson.shop;
  delete orderSessionJson.tables;
  delete orderSessionJson.tableNames;
  return orderSessionJson;
};
/* eslint-enable no-param-reassign */

module.exports = {
  convertOrderSessionForResponse,
};
