const _ = require('lodash');
const { Order, OrderSession, Cart } = require('../../models');
const orderUtilService = require('./orderUtils.service');
const { getTablesFromCache } = require('../../metadata/restaraurantMetadata.service');
const { throwBadRequest } = require('../../utils/errorHandling');

const createOrder = async ({ tableId, restaurantId, orderSessionId, dishOrders }) => {
  const orderSession = await orderUtilService.getOrCreateOrderSession({ orderSessionId, tableId, restaurantId });
  const order = await orderUtilService.createNewOrder({ tableId, restaurantId, orderSessionId, dishOrders });
  orderSession.orders = [order];
  return orderSession;
};

const increaseDishQuantity = async ({ orderId, dishId, newQuantity }) => {
  const order = await Order.findById(orderId);
  const dishOrder = _.find(order.dishOrders, { dishId });
  if (dishOrder) {
    dishOrder.quantity = newQuantity;
    await order.save();
  }
  return order.toJSON();
};

const decreaseDishQuantity = async ({ orderId, dishId, newQuantity }) => {
  const order = await Order.findById(orderId);
  const dishOrder = _.find(order.dishOrders, { dishId });
  if (dishOrder) {
    dishOrder.quantity = newQuantity;
    await order.save();
  }
  return order.toJSON();
};

const updateOrder = async ({ orderUpdates }) => {
  const orderIds = _.map(orderUpdates, 'orderId');
  const orders = await Order.find({ _id: { $in: orderIds } });
  const orderById = _.keyBy(
    _.map(orders, (order) => order.toJSON()),
    'id'
  );

  _.forEach(orderUpdates, (orderUpdate) => {
    const order = orderById[orderUpdate.orderId];
    if (order) {
      // more optimize may be?
      const dishOrder = _.find(order.dishOrders, { dishId: orderUpdate.dishId });
      if (dishOrder) {
        dishOrder.quantity = orderUpdate.quantity;
      }
    }
  });

  const bulkOps = [];
  _.forEach(orderById, (order) => {
    bulkOps.push({
      updateOne: {
        filter: { _id: order.id },
        update: {
          $set: {
            dishOrders: order.dishOrders,
          },
        },
      },
    });
  });

  await Order.bulkWrite(bulkOps);
};

const getOrderSessions = async ({ restaurantId }) => {
  const tables = await getTablesFromCache({ restaurantId });
  const orderSessions = await OrderSession.find({ restaurantId });
  const tableById = _.keyBy(tables, 'id');

  _.forEach(tables, (table) => {
    // eslint-disable-next-line no-param-reassign
    table.activeOrderSessions = [];
  });

  _.forEach(orderSessions, (orderSession) => {
    const orderSessionJson = orderSession.toJSON();
    _.forEach(orderSessionJson.tables, (tableId) => {
      if (tableById[tableId]) {
        tableById[tableId].activeOrderSessions.push(orderSessionJson);
      }
    });
  });

  return tables;
};

const getOrderSessionDetail = async ({ orderSessionId }) => {
  const orderSessionJson = await orderUtilService.getOrderSessionById({ orderSessionId });
  return orderSessionJson;
};

const payOrderSession = async ({ orderSessionId }) => {
  const orderSessionJson = await orderUtilService.confirmPaymentOrderSession({ orderSessionId });
  return orderSessionJson;
};

const cancelOrder = async ({ orderSessionId }) => {
  const orderSessionJson = await orderUtilService.updateOrderSession({ orderSessionId });
  return orderSessionJson;
};

const cancelPaidStatus = async ({ orderSessionId }) => {
  const orderSessionJson = await orderUtilService.updateOrderSession({ orderSessionId });
  return orderSessionJson;
};

const getOrderHistory = async ({ from, to }) => {
  // replace with order session report
  const orderSessions = await OrderSession.find({ createdAt: { $gte: from, $lt: to } });
  return _.map(orderSessions, (orderSession) => orderSession.toJSON());
};

const updateCart = async ({ updatedishRequests, cartId }) => {
  const cart = await Cart.findById(cartId);
  throwBadRequest(!cart, 'Không tìm thấy giỏ hàng');
  const cartItems = cart.cartItems || [];
  const cartItemByDishId = _.keyBy(cartItems, '_id');
  _.forEach(updatedishRequests, (updateRequest) => {
    if (cartItemByDishId[_.get(updateRequest, 'dishId')]) {
      cartItemByDishId[updateRequest.dishId].quantity = updateRequest.quantity || 0;
      return;
    }

    cartItems.push(updateRequest);
  });

  return Cart.findByIdAndUpdate(cartId, { $set: cartItems });
};

const checkoutCart = async ({ cartId, tableId, restaurantId }) => {
  const cart = await Cart.findById(cartId);
  throwBadRequest(!cart, 'Không tìm thấy giỏ hàng');
  throwBadRequest(_.isEmpty(cart.cartItems), 'Giỏ hàng rỗng');

  const orderSession = await orderUtilService.getOrCreateOrderSession({ tableId, restaurantId });
  const order = await orderUtilService.createNewOrder({
    tableId,
    restaurantId,
    orderSessionId: orderSession.id,
    dishOrders: cart.cartItems,
  });
  orderSession.orders = [order];
  return orderSession;
};

const discountDish = async ({ dishOrderId, orderId }) => {};

const discountOrderSession = async ({ orderSessionId }) => {};

module.exports = {
  createOrder,
  increaseDishQuantity,
  decreaseDishQuantity,
  updateOrder,
  getOrderSessions,
  getOrderSessionDetail,
  payOrderSession,
  cancelOrder,
  cancelPaidStatus,
  getOrderHistory,
  updateCart,
  checkoutCart,
  discountDish,
  discountOrderSession,
};
