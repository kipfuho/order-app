const _ = require('lodash');
const { Order, OrderSession, Cart } = require('../../models');
const orderUtilService = require('./orderUtils.service');
const { throwBadRequest } = require('../../utils/errorHandling');
const { getMessageByLocale } = require('../../locale');
const { OrderSessionStatus, OrderSessionDiscountType, DiscountValueType, Status } = require('../../utils/constant');
const { getTablesFromCache, getTableFromCache } = require('../../metadata/tableMetadata.service');
const {
  getRoundDishPrice,
  getRoundDiscountAmount,
  createSearchByDateOptionWithShopTimezone,
  getStringId,
} = require('../../utils/common');
const { getShopFromCache } = require('../../metadata/shopMetadata.service');
const { getDishesFromCache } = require('../../metadata/dishMetadata.service');
const {
  notifyOrderSessionPayment,
  notifyUpdateOrderSession,
  EventActionType,
} = require('../../utils/awsUtils/appSync.utils');
const { getCustomerFromCache } = require('../../metadata/customerMetadata.service');
const { registerJob } = require('../../jobs/jobUtils');
const { JobTypes } = require('../../jobs/constant');

const _validateBeforeCreateOrder = (orderSession) => {
  throwBadRequest(orderSession.status === OrderSessionStatus.paid, getMessageByLocale({ key: 'orderSession.alreadyPaid' }));
};

const createOrder = async ({ shopId, requestBody }) => {
  const { tableId, orderSessionId, dishOrders } = requestBody;
  const orderSession = await orderUtilService.getOrCreateOrderSession({ orderSessionId, tableId, shopId });
  _validateBeforeCreateOrder(orderSession);
  const newOrder = await orderUtilService.createNewOrder({ tableId, shopId, orderSession, dishOrders });
  const orderSessionJson = await orderUtilService.getOrderSessionById(orderSession.id);
  orderSessionJson.orders = _.filter(orderSessionJson.orders, (order) => order.id === newOrder.id);
  return orderSessionJson;
};

const changeDishQuantity = async ({ shopId, requestBody }) => {
  const { orderId, dishOrderId, newQuantity } = requestBody;
  const order = await Order.findOne({ shop: shopId, _id: orderId });
  throwBadRequest(!order, getMessageByLocale({ key: 'order.notFound' }));
  const orderJson = order.toJSON();
  const targetDishOrder = _.find(orderJson.dishOrders, (dishOrder) => dishOrder.id === dishOrderId);
  throwBadRequest(!targetDishOrder, getMessageByLocale({ key: 'dish.notFound' }));
  // decrease quantity
  if (newQuantity < targetDishOrder.quantity) {
    targetDishOrder.quantity -= newQuantity;
    orderJson.returnedDishOrders.push({ ...targetDishOrder, quantity: targetDishOrder.quantity - newQuantity });
  }
  targetDishOrder.quantity = newQuantity;
  orderJson.dishOrders = _.filter(orderJson.dishOrders, (dishOrder) => dishOrder.quantity > 0);
  await Order.updateOne(
    { _id: orderId },
    { $set: { dishOrders: orderJson.dishOrders, returnedDishOrders: orderJson.returnedDishOrders } }
  );
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

/**
 * Get color based on order session created time
 * @param {*} createdAt
 * @returns
 */
const _getTableForOrderColorCode = (createdAt) => {
  const diffTimeInMinutes = (Date.now() - createdAt.getTime()) / 60000;

  // green
  if (diffTimeInMinutes < 5) {
    return 1;
  }
  // yellow
  if (diffTimeInMinutes < 15) {
    return 2;
  }
  // red
  return 3;
};

const getTableForOrder = async ({ shopId }) => {
  const tables = await getTablesFromCache({ shopId });
  const orderSessions = await OrderSession.find({
    shop: shopId,
    status: { $in: orderUtilService.getActiveOrderSessionStatus() },
  });
  const tableById = _.keyBy(tables, 'id');

  /* eslint-disable no-param-reassign */
  _.forEach(tables, (table) => {
    table.position = table.position.id;
    delete table.shop;
    delete table.status;
    delete table.createdAt;
    delete table.updatedAt;
  });
  /* eslint-enable no-param-reassign */

  _.forEach(orderSessions, (orderSession) => {
    const orderSessionJson = orderSession.toJSON();
    _.forEach(orderSessionJson.tables, (tableId) => {
      const table = tableById[tableId];
      if (!table) return;

      table.numberOfOrderSession = (table.numberOfOrderSession || 0) + 1;
      table.numberOfCustomer = (table.numberOfCustomer || 0) + _.get(orderSessionJson, 'customerInfo.numberOfCustomer', 1);
      table.totalPaymentAmount = (table.totalPaymentAmount || 0) + orderSessionJson.paymentAmount;
      table.averagePaymentAmount = table.totalPaymentAmount / table.numberOfCustomer;
      if (!table.orderStatus) {
        table.orderStatus = orderSessionJson.status;
      }
      if (!table.orderCreatedAt) {
        table.orderCreatedAtEpoch = (orderSessionJson.createdAt || new Date()).getTime();
        table.orderColorCode = _getTableForOrderColorCode(orderSessionJson.createdAt);
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
  throwBadRequest(orderSession.status === OrderSessionStatus.paid, getMessageByLocale({ key: 'orderSession.alreadyPaid' }));
  throwBadRequest(
    orderSession.paymentAmount > _.sumBy(paymentDetails, 'paymentAmount'),
    getMessageByLocale({ key: 'orderSession.paymentAmountNotMatch' })
  );
};

const payOrderSession = async ({ shopId, requestBody, userId }) => {
  const { orderSessionId, paymentDetails } = requestBody;
  const orderSessionJson = await orderUtilService.getOrderSessionById(orderSessionId, shopId);
  _validateBeforePayment(orderSessionJson, paymentDetails);

  const updatedOrderSession = await orderUtilService.updateOrderSession({
    orderSessionId,
    shopId: getStringId({ object: orderSessionJson, key: 'shop' }),
    updateBody: {
      $set: {
        status: OrderSessionStatus.paid,
        paymentDetails,
      },
      $unset: {},
    },
  });

  notifyOrderSessionPayment({ orderSession: updatedOrderSession, userId });
  registerJob({
    type: JobTypes.PAY_ORDER,
    data: updatedOrderSession,
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

  notifyUpdateOrderSession({ orderSession: updatedOrderSession, userId: user.id, action: EventActionType.CANCEL });
  registerJob({
    type: JobTypes.CANCEL_ORDER,
    data: updatedOrderSession,
  });
  return updatedOrderSession;
};

const cancelPaidStatus = async ({ orderSessionId, shopId, user }) => {
  const updatedOrderSession = await orderUtilService.updateOrderSession({
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

  notifyUpdateOrderSession({ orderSession: updatedOrderSession, userId: user.id, action: EventActionType.CANCEL });
  registerJob({
    type: JobTypes.CANCEL_ORDER_PAID_STATUS,
    data: updatedOrderSession,
  });
  return updatedOrderSession;
};

const getOrderHistory = async ({ shopId, from, to }) => {
  const timeFilter = createSearchByDateOptionWithShopTimezone({ from, to });
  const filterOptions = { shop: shopId, ...timeFilter };

  // TODO: replace with order session report
  const orderSessions = await OrderSession.find(filterOptions);
  return _.map(orderSessions, (orderSession) => orderSession.toJSON());
};

const updateCart = async ({ customerId, shopId, requestBody }) => {
  const { cartItems: incomingItems } = requestBody;
  const cart = await orderUtilService.getCart({ shopId, customerId });

  const dishes = await getDishesFromCache({ shopId });
  const dishById = _.keyBy(dishes, 'id');

  // Map existing items by dish ID for quick lookup
  const existingItemsByDish = _.keyBy(cart.cartItems, 'dish');

  const updatedItems = incomingItems.map((item) => {
    const existingItem = existingItemsByDish[item.dishId];
    return {
      ...(existingItem ? { _id: existingItem._id } : {}),
      ...item,
      price: dishById[item.dishId].price,
    };
  });

  const totalAmount = _.sumBy(updatedItems, (item) => item.quantity * item.price);

  return Cart.findByIdAndUpdate(cart._id, { $set: { cartItems: updatedItems, totalAmount } }, { new: true });
};

const clearCart = async ({ shopId, customerId }) => {
  return Cart.findOneAndUpdate({ customer: customerId, shop: shopId }, { $set: { cartItems: [] } }, { upsert: true });
};

const getCart = async ({ customerId, shopId }) => {
  const cart = await orderUtilService.getCart({ shopId, customerId });
  return cart.toJSON();
};

const checkoutCart = async ({ customerId, shopId, requestBody }) => {
  const { tableId } = requestBody;
  const table = await getTableFromCache({ shopId, tableId });
  throwBadRequest(!table, getMessageByLocale({ key: 'table.notFound' }));
  const cart = await orderUtilService.getCart({ shopId, customerId });
  throwBadRequest(_.isEmpty(cart.cartItems), getMessageByLocale({ key: 'cart.empty' }));

  // Nếu bàn cần xác nhận của nhân viên thì không gắn order session
  if (table.needApprovalWhenCustomerOrder) {
    await orderUtilService.createNewOrder({
      tableId,
      shopId,
      dishOrders: cart.cartItems,
      customerId,
    });
    await clearCart({ customerId, shopId });
    return;
  }

  const orderSession = await orderUtilService.getOrCreateOrderSession({
    tableId,
    shopId,
    customerId,
    isCustomerApp: true,
  });
  const newOrder = await orderUtilService.createNewOrder({
    tableId,
    shopId,
    orderSession,
    dishOrders: cart.cartItems,
    customerId,
  });
  await clearCart({ customerId, shopId });
  const orderSessionJson = await orderUtilService.getOrderSessionById(orderSession.id);
  orderSessionJson.orders = _.filter(orderSessionJson.orders, (order) => order.id === newOrder.id);
  return orderSessionJson;
};

const discountDishOrder = async ({ shopId, requestBody }) => {
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
    (discountValue && _.get(previousDiscount, 'discountValueType') !== discountType) ||
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

const removeDiscountFromOrderSession = async ({ shopId, requestBody }) => {
  const { orderSessionId, discountId } = requestBody;

  const orderSessionJson = await orderUtilService.getOrderSessionById(orderSessionId, shopId);
  throwBadRequest(!orderSessionJson, getMessageByLocale({ key: 'orderSession.notFound' }));

  const discounts = _.filter(orderSessionJson.discounts, (discount) => discount.id !== discountId);
  if (_.size(discounts) !== _.size(orderSessionJson.discounts)) {
    await OrderSession.findByIdAndUpdate(orderSessionId, { $set: { discounts, totalDiscountAmount: 0 } });
  }
};

const getTableActiveOrderSessions = async ({ shopId, tableId }) => {
  const activeOrderSessions = await OrderSession.find({
    shop: shopId,
    tables: tableId,
    status: { $in: orderUtilService.getActiveOrderSessionStatus() },
  });
  const allOrders = await Order.find({ orderSessionId: { $in: _.map(activeOrderSessions, '_id') }, status: Status.enabled });
  const shop = await getShopFromCache({ shopId });
  const tables = await getTablesFromCache({ shopId });
  const tableById = _.keyBy(tables, 'id');
  const dishes = await getDishesFromCache({ shopId });
  const dishById = _.keyBy(dishes, 'id');
  const ordersByOrderSessionId = _.groupBy(allOrders, 'orderSessionId');
  const activeOrderSessionJsons = _.map(activeOrderSessions, (orderSession) => {
    const orderSessionJson = orderSession.toJSON();
    const orders = ordersByOrderSessionId[orderSessionJson.id];

    const orderJsons = _.map(orders, (order) => {
      const orderJson = order.toJSON();
      _.map(orderJson.dishOrders, (dishOrder) => {
        if (dishOrder.dish) {
          // eslint-disable-next-line no-param-reassign
          dishOrder.dish = dishById[dishOrder.dish];
        }
      });
      return orderJson;
    });
    orderSessionJson.shop = shop;
    orderSessionJson.orders = orderJsons;
    orderSessionJson.tables = _.map(orderSessionJson.tables, (_tableId) => tableById[_tableId]);
    return orderSessionJson;
  });
  return activeOrderSessionJsons;
};

const getCheckoutCartHistory = async ({ customerId, shopId }) => {
  // need optimization
  const orderHistories = await Order.find({ customerId, shop: shopId }).sort({ _id: -1 });

  return orderHistories;
};

const getOrderNeedApproval = async ({ shopId }) => {
  const orders = await Order.find({
    shop: shopId,
    orderSessionId: null,
  });

  const orderNeedApprovalDetails = Promise.all(
    _.map(orders, async (order) => {
      const orderJson = order.toJSON();
      const customer = await getCustomerFromCache({ customerId: orderJson.customerId });
      delete orderJson.customerId;
      orderJson.customer = customer;
      return orderJson;
    })
  );
  return orderNeedApprovalDetails;
};

// cập nhật đơn hàng chưa xác nhận
const updateUnconfirmedOrder = async ({ shopId, orderId, updateDishOrders }) => {
  const order = await Order.findOne({ _id: orderId, shop: shopId });
  throwBadRequest(!order, getMessageByLocale({ key: 'order.notFound' }));
  throwBadRequest(order.status === Status.disabled, getMessageByLocale({ key: 'order.disabled' }));

  const updateDishOrderById = _.keyBy(updateDishOrders, 'dishOrderId');
  // eslint-disable-next-line no-restricted-syntax
  for (const dishOrder of order.dishOrders) {
    const updateDishOrder = updateDishOrderById[dishOrder.id];
    dishOrder.quantity = updateDishOrder.quantity;
    dishOrder.beforeTaxTotalPrice = dishOrder.price * dishOrder.quantity;
    dishOrder.afterTaxTotalPrice = dishOrder.taxIncludedPrice * dishOrder.quantity;
    dishOrder.note = updateDishOrder.note;
  }

  await order.save();
  return order.toJSON();
};

const cancelUnconfirmedOrder = async ({ userId, shopId, orderId }) => {
  const order = await Order.findOneAndUpdate(
    {
      _id: orderId,
      shop: shopId,
    },
    { status: Status.disabled, cancelledBy: userId },
    { new: true }
  );
  throwBadRequest(!order, getMessageByLocale({ key: 'order.notFound' }));
  return order.toJSON();
};

const approveUnconfirmedOrder = async ({ userId, shopId, orderId, orderSessionId }) => {
  const order = await Order.findOne({ _id: orderId, shop: shopId });
  throwBadRequest(!order, getMessageByLocale({ key: 'order.notFound' }));
  throwBadRequest(order.status === Status.disabled, getMessageByLocale({ key: 'order.disabled' }));

  const orderSession = await orderUtilService.getOrCreateOrderSession({
    customerId: order.customerId,
    tableId: order.table,
    shopId,
    orderSessionId,
    isApproveOrder: true,
  });
  order.approvedBy = userId;
  order.orderSessionId = orderSession.id;
  await order.save();
  return orderUtilService.getOrderSessionById(orderSession.id);
};

module.exports = {
  createOrder,
  changeDishQuantity,
  updateOrder,
  getTableForOrder,
  getTableActiveOrderSessions,
  getOrderSessionDetail,
  payOrderSession,
  cancelOrder,
  cancelPaidStatus,
  getOrderHistory,
  getCart,
  updateCart,
  clearCart,
  checkoutCart,
  discountDishOrder,
  discountOrderSession,
  removeDiscountFromOrderSession,
  getCheckoutCartHistory,
  getOrderNeedApproval,
  updateUnconfirmedOrder,
  cancelUnconfirmedOrder,
  approveUnconfirmedOrder,
};
