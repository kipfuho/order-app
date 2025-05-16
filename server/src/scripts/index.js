const _ = require('lodash');
const { Order, OrderSession } = require('../models');
const { DishOrderStatus } = require('../utils/constant');

const auditOrders = async () => {
  const allOrders = await Order.find();
  const allOrderSession = await OrderSession.find();
  const orderSessionById = _.keyBy(allOrderSession, 'id');
  allOrders.forEach((order) => {
    order.dishOrders.forEach((dishOrder, index) => {
      // eslint-disable-next-line no-param-reassign
      dishOrder.status = DishOrderStatus.confirmed;
      // eslint-disable-next-line no-param-reassign
      dishOrder.dishOrderNo = index + 1;
    });

    if (orderSessionById[order.orderSessionId]) {
      // eslint-disable-next-line no-param-reassign
      order.orderSessionStatus = orderSessionById[order.orderSessionId].status;
    }
  });

  await Order.bulkSave(allOrders);
};

module.exports = {
  auditOrders,
};
