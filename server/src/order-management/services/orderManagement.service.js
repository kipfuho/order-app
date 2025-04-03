const _ = require('lodash');
const { Order, OrderSession, Cart, OrderSessionReport } = require('../../models');
const orderUtilService = require('./orderUtils.service');
const { throwBadRequest } = require('../../utils/errorHandling');
const { getMessageByLocale } = require('../../locale');
const { OrderSessionStatus, OrderSessionDiscountType, DiscountValueType } = require('../../utils/constant');
const { getTablesFromCache } = require('../../metadata/tableMetadata.service');
const { getRoundDishPrice, getRoundDiscountAmount } = require('../../utils/common');

const createOrder = async ({ shopId, requestBody }) => {
  const { tableId, orderSessionId, dishOrders } = requestBody;
  const orderSession = await orderUtilService.getOrCreateOrderSession({ orderSessionId, tableId, shopId });
  const order = await orderUtilService.createNewOrder({ tableId, shopId, orderSessionId, dishOrders });
  orderSession.orders = [order];
  return orderSession;
};

const changeDishQuantity = async ({ shopId, requestBody }) => {
  const { orderId, dishId, newQuantity } = requestBody;
  const order = await Order.findOne({ shop: shopId, _id: orderId });
  throwBadRequest(!order, getMessageByLocale({ key: 'order.notFound' }));
  const targetDishOrder = _.find(order.dishOrders, { dishId });
  throwBadRequest(!targetDishOrder, getMessageByLocale({ key: 'dish.notFound' }));
  // decrease quantity
  if (newQuantity < targetDishOrder.quantity) {
    targetDishOrder.quantity -= newQuantity;
    order.returnedDishOrders.push(targetDishOrder);
  }
  targetDishOrder.quantity = newQuantity;
  order.dishOrders = _.filter(order.dishOrders, (dishOrder) => dishOrder.quantity > 0);
  await order.save();
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
    const newQuantity = orderUpdate.quantity;
    if (order) {
      const dishOrder = _.find(order.dishOrders, { dishId: orderUpdate.dishId });
      if (dishOrder) {
        if (newQuantity < dishOrder.quantity) {
          dishOrder.quantity -= newQuantity;
          order.returnedDishOrders.push(dishOrder);
        }
        dishOrder.quantity = newQuantity;
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
            dishOrders: _.filter(order.dishOrders, (dishOrder) => dishOrder.quantity > 0),
            returnedDishOrders: order.returnedDishOrders || [],
          },
        },
      },
    });
  });

  await Order.bulkWrite(bulkOps);
};

const _getOrderSessionPreview = (orderSessionJson) => {
  const numberOfCustomer = _.get(orderSessionJson, 'customerInfo.numberOfCustomer', 1);
  const orderSessionPreview = _.pick(orderSessionJson, ['paymentAmount', 'status', 'createdAt']);
  orderSessionPreview.numberOfCustomer = numberOfCustomer;
  orderSessionPreview.averagePaymentAmount = orderSessionPreview.paymentAmount / numberOfCustomer;

  return orderSessionPreview;
};

const getTableForOrder = async ({ shopId }) => {
  const tables = await getTablesFromCache({ shopId });
  const orderSessions = await OrderSession.find({ shop: shopId });
  const tableById = _.keyBy(tables, 'id');

  _.forEach(tables, (table) => {
    // eslint-disable-next-line no-param-reassign
    table.activeOrderSessions = [];
  });

  _.forEach(orderSessions, (orderSession) => {
    const orderSessionJson = orderSession.toJSON();
    _.forEach(orderSessionJson.tables, (tableId) => {
      if (tableById[tableId]) {
        const orderSessionPreview = _getOrderSessionPreview(orderSessionJson);
        tableById[tableId].activeOrderSessions.push(orderSessionPreview);
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

const payOrderSession = async ({ shopId, requestBody }) => {
  const { orderSessionId, paymentDetails } = requestBody;
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

const cancelOrder = async ({ shopId, user, requestBody }) => {
  const { orderSessionId, reason } = requestBody;
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

const updateCart = async ({ userId, shopId, requestBody }) => {
  const { updatedishRequests } = requestBody;
  const cart = await orderUtilService.getCart({ shopId, userId });
  const cartItems = cart.cartItems || [];
  const cartItemByDishId = _.keyBy(cartItems, '_id');
  _.forEach(updatedishRequests, (updateRequest) => {
    if (cartItemByDishId[_.get(updateRequest, 'dishId')]) {
      cartItemByDishId[updateRequest.dishId].quantity = updateRequest.quantity || 0;
      return;
    }

    cartItems.push(updateRequest);
  });

  const updatedCartItems = orderUtilService.mergeCartItems(cartItems);
  return Cart.findByIdAndUpdate(cart._id, { $set: { cartItems: updatedCartItems } });
};

const clearCart = async ({ shopId, userId }) => {
  const cart = await orderUtilService.getCart({ shopId, userId });
  if (!_.isEmpty(cart.cartItems)) {
    return Cart.findByIdAndUpdate(cart._id, { $set: { cartItems: [] } }, { new: true });
  }
  return cart;
};

const checkoutCart = async ({ userId, shopId, requestBody }) => {
  const { tableId } = requestBody;
  const cart = await orderUtilService.getCart({ shopId, userId });
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

const discountDish = async ({ shopId, requestBody }) => {
  const { orderSessionId, dishOrderId, orderId, discountReason, discountValue, discountType } = requestBody;
  let { discountAfterTax } = requestBody;
  const orderSessionJson = await orderUtilService.getOrderSessionById(orderSessionId, shopId);
  throwBadRequest(!orderSessionJson, getMessageByLocale({ key: 'orderSession.notFound' }));
  const order = _.find(orderSessionJson.orders, (_order) => _order.id === orderId);
  throwBadRequest(!order, getMessageByLocale({ key: 'order.notFound' }));
  const dishOrder = _.find(order.dishOrders, (_dishOrder) => _dishOrder.id === dishOrderId);
  throwBadRequest(!dishOrder, getMessageByLocale({ key: 'dish.notFound' }));

  const discounts = _.filter(
    orderSessionJson.discounts,
    (discount) =>
      discount.discountType !== OrderSessionDiscountType.PRODUCT || discount.discountProducts[0].dishOrderId !== dishOrderId
  );
  if (discountValue > 0) {
    // eslint-disable-next-line no-param-reassign
    if (dishOrder.isTaxIncludedPrice) discountAfterTax = true;
    let dishTaxRate = dishOrder.dishVAT || orderSessionJson.taxRate || 0;
    if (orderSessionJson.taxRate <= 0.001) {
      dishTaxRate = 0;
    }

    const afterTaxDishPrice = dishOrder.taxIncludedPrice || getRoundDishPrice(dishOrder.price * (1 + dishTaxRate / 100));
    let beforeTaxDiscountPrice = 0;
    let afterTaxDiscountPrice = 0;
    if (discountType === DiscountValueType.PERCENTAGE) {
      beforeTaxDiscountPrice = getRoundDiscountAmount(dishOrder.price * (discountValue / 100));
      afterTaxDiscountPrice = getRoundDiscountAmount(afterTaxDishPrice * (discountValue / 100));
    } else if (discountAfterTax) {
      afterTaxDiscountPrice = Math.min(discountValue, afterTaxDishPrice);
      beforeTaxDiscountPrice = getRoundDiscountAmount(afterTaxDiscountPrice / (1 + dishTaxRate / 100));
    } else {
      beforeTaxDiscountPrice = Math.min(discountValue, dishOrder.price);
      afterTaxDiscountPrice = getRoundDiscountAmount(beforeTaxDiscountPrice * (1 + dishTaxRate / 100));
    }
    const taxDiscountPrice = getRoundDiscountAmount(afterTaxDiscountPrice - beforeTaxDiscountPrice);

    discounts.push({
      discountType: OrderSessionDiscountType.PRODUCT,
      discountAfterTax,
      discountReason,
      taxDiscountPrice,
      productAppliedPromotions: [
        {
          dishOrderId,
          dishId: _.get(dishOrder, 'dishId.id') || _.get(dishOrder, 'dishId', '').toString(),
          dishName: _.get(dishOrder, 'dishName'),
          discountValue,
          discountValueType: discountType,
          discountRate:
            discountType === DiscountValueType.PERCENTAGE
              ? discountValue
              : _.min(100, (100 * discountValue) / (discountAfterTax ? afterTaxDishPrice : dishOrder.price)),
          beforeTaxDiscountPrice,
          afterTaxDiscountPrice,
          taxDiscountPrice,
        },
      ],
    });
  }

  await OrderSession.findByIdAndUpdate(orderSessionId, { $set: { discounts, totalDiscountAmount: 0 } });
};

const discountOrderSession = async ({ shopId, requestBody }) => {
  const { orderSessionId, discountReason, discountValue, discountType, discountAfterTax } = requestBody;
  const orderSessionJson = await orderUtilService.getOrderSessionById(orderSessionId, shopId);
  throwBadRequest(!orderSessionJson, getMessageByLocale({ key: 'orderSession.notFound' }));

  const discounts = _.filter(
    orderSessionJson.discounts,
    (discount) => discount.discountType !== OrderSessionDiscountType.INVOICE
  );
  const previousDiscount = _.find(
    orderSessionJson.discounts,
    (discount) => discount.discountType === OrderSessionDiscountType.INVOICE
  );
  if (
    discountValue &&
    _.get(previousDiscount, 'discountValueType') !== discountType &&
    _.get(previousDiscount, 'discountValue') !== discountValue
  ) {
    discounts.push({
      discountType: OrderSessionDiscountType.INVOICE,
      discountValueType: discountType,
      discountValue,
      discountAfterTax,
      discountReason,
    });

    await OrderSession.findByIdAndUpdate(orderSessionId, { $set: { discounts, totalDiscountAmount: 0 } });
  }
};

module.exports = {
  createOrder,
  changeDishQuantity,
  updateOrder,
  getTableForOrder,
  getOrderSessionDetail,
  payOrderSession,
  cancelOrder,
  cancelPaidStatus,
  getOrderHistory,
  updateCart,
  clearCart,
  checkoutCart,
  discountDish,
  discountOrderSession,
};
