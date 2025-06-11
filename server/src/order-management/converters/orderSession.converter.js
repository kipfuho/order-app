const _ = require('lodash');
const { convertOrderForResponse } = require('./order.converter');
const { formatDateHHMMDDMMYYYY, formatOrderSessionNo } = require('../../utils/common');
const { mergeDishOrdersOfOrders, mergeReturnedDishOrdersOfOrders } = require('../services/orderUtils.service');

/* eslint-disable no-param-reassign */
const convertOrderSessionForResponse = (orderSessionDetail, shouldMergeDishOrders = true) => {
  orderSessionDetail.tableIds = _.map(orderSessionDetail.tables, 'id');
  orderSessionDetail.tableName = _.join(orderSessionDetail.tableNames, ',');
  orderSessionDetail.billNo = formatOrderSessionNo(orderSessionDetail);
  orderSessionDetail.endedAt = orderSessionDetail.endedAt ? formatDateHHMMDDMMYYYY(orderSessionDetail.endedAt) : 'N/A';
  orderSessionDetail.updatedAt = formatDateHHMMDDMMYYYY(orderSessionDetail.updatedAt);
  orderSessionDetail.createdAt = formatDateHHMMDDMMYYYY(orderSessionDetail.createdAt);
  if (!_.isEmpty(orderSessionDetail.orders)) {
    if (shouldMergeDishOrders) {
      orderSessionDetail.orders[0].dishOrders = mergeDishOrdersOfOrders(orderSessionDetail);
      orderSessionDetail.orders[0].returnedDishOrders = mergeReturnedDishOrdersOfOrders(orderSessionDetail);
      orderSessionDetail.orders = [convertOrderForResponse(orderSessionDetail.orders[0])];
    } else {
      orderSessionDetail.orders = _.map(orderSessionDetail.orders, (order) => convertOrderForResponse(order));
    }
  }

  delete orderSessionDetail.shop;
  delete orderSessionDetail.tables;
  delete orderSessionDetail.tableNames;
  delete orderSessionDetail.orderSessionNo;
  return orderSessionDetail;
};
/* eslint-enable no-param-reassign */

/* eslint-disable no-param-reassign */
const convertOrderSessionHistoryForResponse = (orderSession) => {
  const orderSessionDetail = _.pick(orderSession, [
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
  orderSessionDetail.tableName = _.join(orderSessionDetail.tableNames, ',');
  orderSessionDetail.billNo = formatOrderSessionNo(orderSessionDetail);
  orderSessionDetail.endedAt = orderSessionDetail.endedAt ? formatDateHHMMDDMMYYYY(orderSessionDetail.endedAt) : 'N/A';
  orderSessionDetail.updatedAt = formatDateHHMMDDMMYYYY(orderSessionDetail.updatedAt);
  orderSessionDetail.createdAt = formatDateHHMMDDMMYYYY(orderSessionDetail.createdAt);
  orderSessionDetail.totalTaxAmount -=
    orderSessionDetail.afterTaxTotalDiscountAmount - orderSessionDetail.beforeTaxTotalDiscountAmount;
  orderSessionDetail.paymentDetails = (orderSessionDetail.paymentDetails || []).map((paymentDetail) => ({
    paymentMethod: paymentDetail.paymentMethod,
    paymentAmount: paymentDetail.paymentAmount,
  }));
  orderSessionDetail.taxDetails = (orderSessionDetail.taxDetails || []).map((taxDetail) => ({
    taxAmount: taxDetail.taxAmount - (taxDetail.afterTaxTotalDiscountAmount - taxDetail.beforeTaxTotalDiscountAmount),
    taxRate: taxDetail.taxRate,
  }));

  delete orderSessionDetail.orderSessionNo;
  delete orderSessionDetail.tableNames;
  delete orderSessionDetail.startedByUserId;
  delete orderSessionDetail.paidByUserId;
  delete orderSessionDetail.cancelledByUserId;
  delete orderSessionDetail.customerId;
  delete orderSessionDetail.auditedAt;
  delete orderSessionDetail.totalTaxAmount;
  return orderSessionDetail;
};
/* eslint-enable no-param-reassign */

/* eslint-disable no-param-reassign */
const convertOrderSessionForCartCheckoutHistoryResponse = (orderSession) => {
  const orderSessionDetail = _.pick(orderSession, [
    'id',
    'tableNames',
    'createdAt',
    'orderSessionNo',
    'paymentAmount',
    'status',
    'orders',
  ]);
  orderSessionDetail.tableName = _.join(orderSessionDetail.tableNames, ',');
  orderSessionDetail.billNo = formatOrderSessionNo(orderSessionDetail);
  orderSessionDetail.createdAt = formatDateHHMMDDMMYYYY(orderSessionDetail.createdAt);

  delete orderSessionDetail.orderSessionNo;
  delete orderSessionDetail.tableNames;
  return orderSessionDetail;
};
/* eslint-enable no-param-reassign */

module.exports = {
  convertOrderSessionForResponse,
  convertOrderSessionHistoryForResponse,
  convertOrderSessionForCartCheckoutHistoryResponse,
};
