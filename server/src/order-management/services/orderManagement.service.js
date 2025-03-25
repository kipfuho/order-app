const _ = require('lodash');
const { Order, OrderSession, Cart, OrderSessionReport } = require('../../models');
const orderUtilService = require('./orderUtils.service');
const { getTablesFromCache } = require('../../metadata/shopMetadata.service');
const { throwBadRequest } = require('../../utils/errorHandling');
const { getMessageByLocale } = require('../../locale');
const { OrderSessionStatus } = require('../../utils/constant');

const createOrder = async ({ shopId, requestBody }) => {
  const { tableId, orderSessionId, dishOrders } = requestBody;
  const orderSession = await orderUtilService.getOrCreateOrderSession({ orderSessionId, tableId, shopId });
  const order = await orderUtilService.createNewOrder({ tableId, shopId, orderSessionId, dishOrders });
  orderSession.orders = [order];
  return orderSession;
};

const increaseDishQuantity = async ({ shopId, requestBody }) => {
  const { orderId, dishId, newQuantity } = requestBody;
  const order = await Order.findOne({ shop: shopId, _id: orderId });
  throwBadRequest(!order, getMessageByLocale({ key: 'order.notFound' }));
  const dishOrder = _.find(order.dishOrders, { dishId });
  if (dishOrder) {
    dishOrder.quantity = newQuantity;
    await order.save();
  }
  return order.toJSON();
};

const decreaseDishQuantity = async ({ shopId, requestBody }) => {
  const { orderId, dishId, newQuantity } = requestBody;
  const order = await Order.findOne({ shop: shopId, _id: orderId });
  const dishOrder = _.find(order.dishOrders, { dishId });
  if (dishOrder) {
    dishOrder.quantity = newQuantity;
    await order.save();
  }
  return order.toJSON();
};

const updateOrder = async ({ shopId, requestBody }) => {
  const { orderUpdates } = requestBody;
  const orderIds = _.map(orderUpdates, 'orderId');
  const orders = await Order.find({ _id: { $in: orderIds }, shop: shopId });
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

const getTableForOrder = async ({ shopId }) => {
  const tables = await getTablesFromCache({ shopId });
  const orderSessions = await OrderSession.find({ shopId });
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

const getOrderSessionDetail = async ({ shopId, orderSessionId }) => {
  const orderSessionJson = await orderUtilService.getOrderSessionById(orderSessionId, shopId);
  return orderSessionJson;
};

const _validateBeforePayment = (orderSession, paymentDetails) => {
  throwBadRequest(
    orderSession.paymentAmount !== _.sumBy(paymentDetails, 'paymentAmount'),
    'Số tiền thanh toán không khớp số tiền đơn'
  );
};

const payOrderSession = async ({ shopId, orderSessionId, requestBody }) => {
  const { paymentDetails } = requestBody;
  const orderSessionJson = await orderUtilService.getOrderSessionById(orderSessionId, shopId);
  _validateBeforePayment(orderSessionJson, paymentDetails);

  const updatedOrderSession = await orderUtilService.updateOrderSession({
    orderSessionId,
    updateBody: {
      $set: {
        status: OrderSessionStatus.paid,
        paymentDetails,
      },
      $unset: {},
    },
  });

  return updatedOrderSession;
};

const cancelOrder = async ({ orderSessionId, shopId, user, reason }) => {
  throwBadRequest(!reason, getMessageByLocale({ key: 'reason.empty' }));
  const updatedOrderSession = await orderUtilService.updateOrderSession({
    orderSessionId,
    shopId,
    updateBody: {
      $set: {
        status: OrderSessionStatus.cancelled,
        cancelledByEmployee: { uid: user.id, name: user.name || user.email, reason },
      },
    },
  });
  return updatedOrderSession;
};

const cancelPaidStatus = async ({ orderSessionId, shopId }) => {
  const orderSessionJson = await orderUtilService.updateOrderSession({
    orderSessionId,
    shopId,
    updateBody: {
      $set: {
        status: OrderSessionStatus.unpaid,
      },
      $unset: {
        paymentDetails: 1,
      },
    },
  });
  return orderSessionJson;
};

const getOrderHistory = async ({ shopId, from, to }) => {
  // replace with order session report
  const orderSessions = await OrderSessionReport.find({ shop: shopId, createdAt: { $gte: from, $lt: to } });
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

const checkoutCart = async ({ cartId, tableId, shopId }) => {
  const cart = await Cart.findById(cartId);
  throwBadRequest(!cart, 'Không tìm thấy giỏ hàng');
  throwBadRequest(_.isEmpty(cart.cartItems), 'Giỏ hàng rỗng');

  const orderSession = await orderUtilService.getOrCreateOrderSession({ tableId, shopId });
  const order = await orderUtilService.createNewOrder({
    tableId,
    shopId,
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
  getTableForOrder,
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
