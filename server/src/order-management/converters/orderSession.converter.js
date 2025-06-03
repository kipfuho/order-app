const _ = require('lodash');
const { convertOrderForResponse } = require('./order.converter');
const { formatDateHHMMDDMMYYYY, formatOrderSessionNo } = require('../../utils/common');
const { mergeDishOrdersOfOrders } = require('../services/orderUtils.service');

/* eslint-disable no-param-reassign */
const convertOrderSessionForResponse = (orderSessionJson, shouldMergeDishOrders = true) => {
  orderSessionJson.tableIds = _.map(orderSessionJson.tables, 'id');
  orderSessionJson.tableName = _.join(orderSessionJson.tableNames, ',');
  orderSessionJson.billNo = formatOrderSessionNo(orderSessionJson);
  orderSessionJson.endedAt = orderSessionJson.endedAt ? formatDateHHMMDDMMYYYY(orderSessionJson.endedAt) : 'N/A';
  orderSessionJson.updatedAt = formatDateHHMMDDMMYYYY(orderSessionJson.updatedAt);
  orderSessionJson.createdAt = formatDateHHMMDDMMYYYY(orderSessionJson.createdAt);
  if (!_.isEmpty(orderSessionJson.orders)) {
    if (shouldMergeDishOrders) {
      orderSessionJson.orders[0].dishOrders = mergeDishOrdersOfOrders(orderSessionJson);
      orderSessionJson.orders = [convertOrderForResponse(orderSessionJson.orders[0])];
    } else {
      orderSessionJson.orders = _.map(orderSessionJson.orders, (order) => convertOrderForResponse(order));
    }
  }

  delete orderSessionJson.shop;
  delete orderSessionJson.tables;
  delete orderSessionJson.tableNames;
  delete orderSessionJson.orderSessionNo;
  return orderSessionJson;
};
/* eslint-enable no-param-reassign */

/* eslint-disable no-param-reassign */
const convertOrderSessionHistoryForResponse = (orderSession) => {
  const orderSessionJson = _.pick(orderSession, [
    'id',
    'tableNames',
    'endedAt',
    'updatedAt',
    'createdAt',
    'orderSessionNo',
    'paymentAmount',
    'paymentDetails',
    'status',
  ]);
  orderSessionJson.tableName = _.join(orderSessionJson.tableNames, ',');
  orderSessionJson.billNo = formatOrderSessionNo(orderSessionJson);
  orderSessionJson.endedAt = orderSessionJson.endedAt ? formatDateHHMMDDMMYYYY(orderSessionJson.endedAt) : 'N/A';
  orderSessionJson.updatedAt = formatDateHHMMDDMMYYYY(orderSessionJson.updatedAt);
  orderSessionJson.createdAt = formatDateHHMMDDMMYYYY(orderSessionJson.createdAt);
  orderSessionJson.totalTaxAmount -=
    orderSessionJson.afterTaxTotalDiscountAmount - orderSessionJson.beforeTaxTotalDiscountAmount;
  orderSessionJson.paymentDetails = (orderSessionJson.paymentDetails || []).map((paymentDetail) => ({
    paymentMethod: paymentDetail.paymentMethod,
    paymentAmount: paymentDetail.paymentAmount,
  }));
  orderSessionJson.taxDetails = (orderSessionJson.taxDetails || []).map((taxDetail) => ({
    taxAmount: taxDetail.taxAmount - (taxDetail.afterTaxTotalDiscountAmount - taxDetail.beforeTaxTotalDiscountAmount),
    taxRate: taxDetail.taxRate,
  }));

  delete orderSessionJson.orderSessionNo;
  delete orderSessionJson.tableNames;
  delete orderSessionJson.startedByUserId;
  delete orderSessionJson.paidByUserId;
  delete orderSessionJson.cancelledByUserId;
  delete orderSessionJson.customerId;
  delete orderSessionJson.auditedAt;
  delete orderSessionJson.totalTaxAmount;
  return orderSessionJson;
};
/* eslint-enable no-param-reassign */

module.exports = {
  convertOrderSessionForResponse,
  convertOrderSessionHistoryForResponse,
};
