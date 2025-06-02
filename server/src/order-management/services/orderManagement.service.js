const _ = require('lodash');
const { Order, OrderSession, Cart, ReturnedDishOrder, DishOrder } = require('../../models');
const orderUtilService = require('./orderUtils.service');
const { throwBadRequest } = require('../../utils/errorHandling');
const { getMessageByLocale } = require('../../locale');
const { OrderSessionStatus, OrderSessionDiscountType, DiscountValueType, Status } = require('../../utils/constant');
const { getTablesFromCache, getTableFromCache } = require('../../metadata/tableMetadata.service');
const {
  getRoundDishPrice,
  getRoundDiscountAmount,
  createSearchByDateOptionWithShopTimezone,
  divideToNPart,
} = require('../../utils/common');
const { getShopFromCache } = require('../../metadata/shopMetadata.service');
const { getDishesFromCache } = require('../../metadata/dishMetadata.service');
const {
  notifyOrderSessionPayment,
  notifyUpdateOrderSession,
  EventActionType,
  notifyCancelPaidStatusOrderSession,
} = require('../../utils/awsUtils/appSync.utils');
const { registerJob } = require('../../jobs/jobUtils');
const { JobTypes } = require('../../jobs/constant');
const { prisma, bulkUpdate, PostgreSQLTable } = require('../../utils/prisma');

const _validateBeforeCreateOrder = (orderSession) => {
  throwBadRequest(orderSession.status === OrderSessionStatus.paid, getMessageByLocale({ key: 'orderSession.alreadyPaid' }));
};

const createOrder = async ({ shopId, userId, requestBody }) => {
  const { tableId, orderSessionId, dishOrders } = requestBody;
  const { orderSession, isNewOrderSession } = await orderUtilService.getOrCreateOrderSession({
    orderSessionId,
    tableId,
    shopId,
  });
  _validateBeforeCreateOrder(orderSession);
  const newOrder = await orderUtilService.createNewOrder({
    tableId,
    shopId,
    userId,
    orderSession,
    dishOrders,
    isNewOrderSession,
  });
  const orderSessionJson = await orderUtilService.getOrderSessionById(orderSession.id);
  orderSessionJson.orders = _.filter(orderSessionJson.orders, (order) => order.id === newOrder.id);
  return orderSessionJson;
};

const changeDishQuantity = async ({ shopId, requestBody }) => {
  const { orderId, dishOrderId, newQuantity } = requestBody;
  throwBadRequest(typeof newQuantity !== 'number' || newQuantity < 0, getMessageByLocale({ key: 'dish.invalidQuantity' }));

  const order = await Order.findFirst({
    where: {
      id: orderId,
      shopId,
    },
    include: {
      dishOrders: true,
      returnedDishOrders: true,
    },
  });
  throwBadRequest(!order, getMessageByLocale({ key: 'order.notFound' }));
  const targetDishOrder = _.find(order.dishOrders, (dishOrder) => dishOrder.id === dishOrderId);
  throwBadRequest(!targetDishOrder, getMessageByLocale({ key: 'dish.notFound' }));
  // decrease quantity
  if (newQuantity < targetDishOrder.quantity) {
    await ReturnedDishOrder.create({
      data: {
        dishOrderNo: targetDishOrder.dishOrderNo,
        dishId: targetDishOrder.dishId,
        name: targetDishOrder.name,
        note: targetDishOrder.note,
        orderId: targetDishOrder.orderId,
        quantity: targetDishOrder.quantity - newQuantity,
      },
    });
  }
  if (newQuantity === 0) {
    await DishOrder.delete({
      where: {
        id: targetDishOrder.id,
      },
    });
    return;
  }
  await DishOrder.update({
    where: {
      id: targetDishOrder.id,
    },
    data: {
      quantity: newQuantity,
    },
  });
};

const updateOrder = async ({ shopId, requestBody }) => {
  const { orderUpdates } = requestBody;
  const orderIds = _.map(orderUpdates, 'orderId');
  const orders = await Order.findMany({
    where: {
      id: { in: orderIds },
      shopId,
    },
    include: {
      dishOrders: true,
    },
  });
  const orderById = _.keyBy(orders, 'id');

  const updatedDishOrders = [];
  const returnedDishOrders = [];
  _.forEach(orderUpdates, (orderUpdate) => {
    const order = orderById[orderUpdate.orderId];
    const newQuantity = orderUpdate.quantity;
    if (order) {
      const dishOrder = _.find(order.dishOrders, { dishId: orderUpdate.dishId });
      if (dishOrder) {
        if (newQuantity < dishOrder.quantity) {
          returnedDishOrders.push({
            dishOrderNo: dishOrder.dishOrderNo,
            dishId: dishOrder.dishId,
            name: dishOrder.name,
            note: dishOrder.note,
            orderId: dishOrder.orderId,
            quantity: dishOrder.quantity - newQuantity,
          });
        }
        dishOrder.quantity = newQuantity;
        updatedDishOrders.push(dishOrder);
      }
    }
  });

  if (returnedDishOrders.length > 0) {
    await ReturnedDishOrder.createMany({
      data: returnedDishOrders,
    });
  }
  await prisma.$transaction(
    updatedDishOrders.map((dishOrder) => {
      if (dishOrder.quantity === 0) {
        return DishOrder.delete({
          where: {
            id: dishOrder.id,
          },
        });
      }
      return DishOrder.update({
        data: {
          quantity: dishOrder.quantity,
        },
        where: { id: dishOrder.id },
      });
    })
  );
};

/**
 * Get color based on order session created time
 * @param {*} createdAt
 * @returns
 */
const _getTableForOrderColorCode = (createdAt) => {
  const diffTimeInMinutes = (Date.now() - createdAt.getTime()) / 60000;

  // green
  if (diffTimeInMinutes <= 10) {
    return 1;
  }
  // yellow
  if (diffTimeInMinutes <= 20) {
    return 2;
  }
  // red
  return 3;
};

const getTableForOrder = async ({ shopId }) => {
  const tables = await getTablesFromCache({ shopId });
  const orderSessions = await OrderSession.findMany({
    where: {
      shopId,
      status: { in: orderUtilService.getActiveOrderSessionStatus() },
    },
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
    _.forEach(orderSession.tableIds, (tableId) => {
      const table = tableById[tableId];
      if (!table) return;

      table.numberOfOrderSession = (table.numberOfOrderSession || 0) + 1;
      table.numberOfCustomer = (table.numberOfCustomer || 0) + (orderSession.numberOfCustomer || 1);
      table.totalPaymentAmount = (table.totalPaymentAmount || 0) + orderSession.paymentAmount;
      table.averagePaymentAmount = table.totalPaymentAmount / table.numberOfCustomer;
      if (!table.orderStatus) {
        table.orderStatus = orderSession.status;
      }
      if (!table.orderCreatedAt) {
        table.orderCreatedAtEpoch = (orderSession.createdAt || new Date()).getTime();
        table.orderColorCode = _getTableForOrderColorCode(orderSession.createdAt);
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
    orderSession.status !== OrderSessionStatus.unpaid,
    getMessageByLocale({ key: 'orderSession.canOnlyPayUnpaid' })
  );
  throwBadRequest(orderSession.status === OrderSessionStatus.paid, getMessageByLocale({ key: 'orderSession.alreadyPaid' }));
  throwBadRequest(
    orderSession.status === OrderSessionStatus.cancelled,
    getMessageByLocale({ key: 'orderSession.alreadyCancelled' })
  );
  throwBadRequest(
    orderSession.paymentAmount > _.sumBy(paymentDetails, 'paymentAmount') || 0,
    getMessageByLocale({ key: 'orderSession.paymentAmountNotMatch' })
  );
};

const payOrderSession = async ({ shopId, requestBody, user }) => {
  const { orderSessionId, paymentDetails, customerPaidAmount } = requestBody;
  const orderSessionJson = await orderUtilService.getOrderSessionById(orderSessionId, shopId);
  _validateBeforePayment(orderSessionJson, paymentDetails);

  const normalizedPaymentAmount = divideToNPart({
    initialSum: orderSessionJson.paymentAmount,
    parts: paymentDetails.map((paymentDetail) => paymentDetail.paymentAmount),
  });

  const updatedOrderSession = await orderUtilService.updateOrderSession({
    orderSessionId,
    shopId: orderSessionJson.shopId,
    updateBody: _.pickBy({
      status: OrderSessionStatus.paid,
      paidByEmployeeId: _.get(user, 'id'),
      paidByEmployeeName: _.get(user, 'name') || _.get(user, 'email'),
      customerPaidAmount,
      customerReturnAmount: Math.max(0, customerPaidAmount - orderSessionJson.paymentAmount),
      endedAt: Date.now(),
      paymentDetails: {
        deleteMany: {},
        createMany: {
          data: paymentDetails.map((paymentDetail, index) => ({
            paymentAmount: normalizedPaymentAmount[index],
            paymentMethod: paymentDetail.paymentMethod,
          })),
        },
      },
    }),
  });

  await notifyOrderSessionPayment({ orderSession: updatedOrderSession, userId: _.get(user, 'id') });
  await registerJob({
    type: JobTypes.PAY_ORDER,
    data: {
      orderSessionId,
    },
  });

  return updatedOrderSession;
};

const cancelOrder = async ({ shopId, user, requestBody }) => {
  const { orderSessionId, reason } = requestBody;
  throwBadRequest(!reason, getMessageByLocale({ key: 'reason.empty' }));
  const orderSession = await OrderSession.findFirst({
    where: {
      id: orderSessionId,
      shopId,
    },
  });
  throwBadRequest(!orderSession, getMessageByLocale({ key: 'order.notFound' }));
  throwBadRequest(
    orderSession.status !== OrderSessionStatus.unpaid,
    getMessageByLocale({ key: 'orderSession.canOnlyCancelUnpaid' })
  );

  const updatedOrderSession = await orderUtilService.updateOrderSession({
    orderSessionId,
    shopId,
    updateBody: {
      status: OrderSessionStatus.cancelled,
      cancelledByEmployeeId: user.id,
      cancelledByEmployeeName: user.name || user.email,
      cancellationReason: reason,
    },
  });

  // return dishorders
  const orders = await Order.findMany({
    where: { orderSessionId },
    select: {
      dishOrders: true,
    },
  });
  const dishOrders = orders.flatMap((order) => order.dishOrders);
  await ReturnedDishOrder.createMany({
    data: dishOrders.map((dishOrder) => ({
      dishOrderNo: dishOrder.dishOrderNo,
      dishId: dishOrder.dishId,
      name: dishOrder.name,
      note: dishOrder.note,
      orderId: dishOrder.orderId,
      quantity: dishOrder.quantity,
    })),
  });
  await DishOrder.deleteMany({
    where: {
      id: {
        in: dishOrders.map((dishOrder) => dishOrder.id),
      },
    },
  });

  await notifyUpdateOrderSession({ orderSession: updatedOrderSession, userId: user.id, action: EventActionType.CANCEL });
  await registerJob({
    type: JobTypes.CANCEL_ORDER,
    data: {
      orderSessionId,
    },
  });
  return updatedOrderSession;
};

const cancelPaidStatus = async ({ orderSessionId, shopId, user }) => {
  const updatedOrderSession = await orderUtilService.updateOrderSession({
    orderSessionId,
    shopId,
    updateBody: {
      status: OrderSessionStatus.unpaid,
      paidByEmployeeId: null,
      paidByEmployeeName: null,
      paymentDetails: {
        deleteMany: {},
      },
    },
  });

  await notifyCancelPaidStatusOrderSession({
    orderSession: updatedOrderSession,
    userId: user.id,
    action: EventActionType.CANCEL,
  });
  await registerJob({
    type: JobTypes.CANCEL_ORDER_PAID_STATUS,
    data: {
      orderSessionId,
    },
  });
  return updatedOrderSession;
};

const getOrderHistory = async ({ shopId, from, to }) => {
  const timeFilter = createSearchByDateOptionWithShopTimezone({ from, to });

  // TODO: replace with order session report
  const orderSessions = await OrderSession.findMany({
    where: {
      shopId,
      ...timeFilter,
    },
  });
  return orderSessions;
};

const updateCart = async ({ customerId, shopId, requestBody }) => {
  const { cartItems: incomingItems } = requestBody;
  const cart = await orderUtilService.getCart({ shopId, customerId });

  const dishes = await getDishesFromCache({ shopId });
  const dishById = _.keyBy(dishes, 'id');

  // Map existing items by dish ID for quick lookup
  const existingItemsByDish = _.keyBy(cart.cartItems, 'dish');

  const updatedItems = [];
  const createdItems = [];
  incomingItems.forEach((item) => {
    const existingItem = existingItemsByDish[item.dishId];
    if (existingItem) {
      existingItem.update = true;
      updatedItems.push({
        ...item,
        id: existingItem.id,
        price: dishById[item.dishId].price,
      });
      return;
    }

    createdItems.push({
      ...item,
      price: dishById[item.dishId].price,
    });
  });
  const deletedCartItemIds = cart.cartItems.filter((cartItem) => !cartItem.update).map((cartItem) => cartItem.id);
  const totalAmount = _.sumBy(updatedItems, (item) => item.quantity * item.price) || 0;

  return Cart.update({
    data: {
      totalAmount,
      cartItems: {
        deleteMany: { id: { in: deletedCartItemIds } },
        update: updatedItems.map((item) => ({
          data: item,
          where: { id: item.id },
        })),
        createMany: {
          data: createdItems,
        },
      },
    },
    where: { id: cart.id },
  });
};

const clearCart = async ({ shopId, customerId }) => {
  return Cart.update({
    where: {
      customer_shop_unique: {
        customerId,
        shopId,
      },
    },
    data: {
      cartItems: {
        deleteMany: {},
      },
    },
    include: {
      cartItems: true,
    },
  });
};

const getCart = async ({ customerId, shopId }) => {
  const cart = await orderUtilService.getCart({ shopId, customerId });
  return cart;
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

  const { orderSession, isNewOrderSession } = await orderUtilService.getOrCreateOrderSession({
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
    isNewOrderSession,
  });
  await clearCart({ customerId, shopId });
  const orderSessionJson = await orderUtilService.getOrderSessionById(orderSession.id);
  orderSessionJson.orders = _.filter(orderSessionJson.orders, (order) => order.id === newOrder.id);
  return orderSessionJson;
};

const discountDishOrder = async ({ shopId, requestBody }) => {
  const { orderSessionId, dishOrderId, orderId, discountReason, discountValue, discountType } = requestBody;
  let { discountAfterTax } = requestBody;

  throwBadRequest(discountValue <= 0, getMessageByLocale({ key: 'discount.invalidDiscountValue' }));
  throwBadRequest(
    discountType === DiscountValueType.PERCENTAGE && discountValue > 100,
    getMessageByLocale({ key: 'discount.invalidDiscountValue' })
  );
  const orderSessionJson = await orderUtilService.getOrderSessionById(orderSessionId, shopId);
  throwBadRequest(!orderSessionJson, getMessageByLocale({ key: 'orderSession.notFound' }));
  const order = _.find(orderSessionJson.orders, (_order) => _order.id === orderId);
  throwBadRequest(!order, getMessageByLocale({ key: 'order.notFound' }));
  const dishOrder = _.find(order.dishOrders, (_dishOrder) => _dishOrder.id === dishOrderId);
  throwBadRequest(!dishOrder, getMessageByLocale({ key: 'dish.notFound' }));

  const deletedDiscount = _.find(
    orderSessionJson.discounts,
    (discount) =>
      discount.discountType === OrderSessionDiscountType.PRODUCT && discount.discountProducts[0].dishOrderId === dishOrderId
  );
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

  await OrderSession.update({
    data: {
      beforeTaxTotalDiscountAmount: 0,
      afterTaxTotalDiscountAmount: 0,
      discounts: _.pickBy({
        create: {
          name: `${getMessageByLocale({ key: 'discount.dish' })} - ${dishOrder.name}`,
          discountReason,
          discountType: OrderSessionDiscountType.PRODUCT,
          discountValue,
          discountValueType: discountType,
          discountAfterTax,
          discountProducts: {
            delete: deletedDiscount
              ? {
                  id: deletedDiscount.id,
                }
              : null,
            createMany: [
              {
                dishOrderId,
                dishId: dishOrder.dishId,
                dishName: dishOrder.name,
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
          },
        },
      }),
    },
    where: { id: orderSessionId },
  });
};

const discountOrderSession = async ({ shopId, requestBody }) => {
  const { orderSessionId, discountReason, discountValue, discountType, discountAfterTax } = requestBody;

  const orderSessionJson = await orderUtilService.getOrderSessionById(orderSessionId, shopId);
  throwBadRequest(!orderSessionJson, getMessageByLocale({ key: 'orderSession.notFound' }));

  const previousDiscount = _.find(
    orderSessionJson.discounts,
    (discount) => discount.discountType === OrderSessionDiscountType.INVOICE
  );
  if (
    (discountValue && _.get(previousDiscount, 'discountValueType') !== discountType) ||
    _.get(previousDiscount, 'discountValue') !== discountValue
  ) {
    await OrderSession.update({
      data: {
        beforeTaxTotalDiscountAmount: 0,
        afterTaxTotalDiscountAmount: 0,
        discounts: _.pickBy({
          delete: previousDiscount
            ? {
                id: previousDiscount.id,
              }
            : null,
          create: {
            name: getMessageByLocale({ key: 'discount.order' }),
            discountType: OrderSessionDiscountType.INVOICE,
            discountValueType: discountType,
            discountValue,
            discountAfterTax,
            discountReason,
          },
        }),
      },
      where: { id: orderSessionId },
    });
  }
};

const removeDiscountFromOrderSession = async ({ shopId, requestBody }) => {
  const { orderSessionId, discountId } = requestBody;

  const orderSessionJson = await orderUtilService.getOrderSessionById(orderSessionId, shopId);
  throwBadRequest(!orderSessionJson, getMessageByLocale({ key: 'orderSession.notFound' }));

  await OrderSession.update({ data: { discounts: { delete: { id: discountId } } }, where: { id: orderSessionId } });
};

const getTableActiveOrderSessions = async ({ shopId, tableId }) => {
  const activeOrderSessions = await OrderSession.findMany({
    where: {
      shopId,
      tableIds: { has: tableId },
      status: { in: orderUtilService.getActiveOrderSessionStatus() },
    },
  });
  const allOrders = await Order.findMany({
    where: {
      orderSessionId: { in: _.map(activeOrderSessions, 'id') },
      status: Status.enabled,
    },
    include: {
      dishOrders: true,
    },
  });
  const shop = await getShopFromCache({ shopId });
  const tables = await getTablesFromCache({ shopId });
  const tableById = _.keyBy(tables, 'id');
  const dishes = await getDishesFromCache({ shopId });
  const dishById = _.keyBy(dishes, 'id');
  const ordersByOrderSessionId = _.groupBy(allOrders, 'orderSessionId');
  const activeOrderSessionJsons = _.map(activeOrderSessions, (orderSession) => {
    const orders = ordersByOrderSessionId[orderSession.id];

    const orderJsons = _.map(orders, (order) => {
      _.map(order.dishOrders, (dishOrder) => {
        if (dishOrder.dish) {
          // eslint-disable-next-line no-param-reassign
          dishOrder.dish = dishById[dishOrder.dish];
        }
      });
      return order;
    });
    // eslint-disable-next-line no-param-reassign
    orderSession.shop = shop;
    // eslint-disable-next-line no-param-reassign
    orderSession.orders = orderJsons;
    // eslint-disable-next-line no-param-reassign
    orderSession.tables = _.map(orderSession.tableIds, (_tableId) => tableById[_tableId]);
    return orderSession;
  });
  return activeOrderSessionJsons;
};

const getCheckoutCartHistory = async ({ customerId, shopId }) => {
  // need optimization
  const orderHistories = await Order.findMany({
    where: {
      customerId,
      shopId,
    },
    include: {
      dishOrders: 1,
    },
  });

  return orderHistories;
};

const getOrderNeedApproval = async ({ shopId }) => {
  const orders = await Order.findMany({
    where: {
      shopId,
      orderSessionId: null,
    },
    include: {
      dishOrders: true,
      customer: true,
    },
  });

  return orders;
};

// cập nhật đơn hàng chưa xác nhận
const updateUnconfirmedOrder = async ({ shopId, orderId, updateDishOrders }) => {
  const order = await Order.findFirst({
    where: {
      id: orderId,
      shopId,
    },
    include: {
      dishOrders: true,
    },
  });
  throwBadRequest(!order, getMessageByLocale({ key: 'order.notFound' }));
  throwBadRequest(order.status === Status.disabled, getMessageByLocale({ key: 'order.disabled' }));

  const updatedDishOrders = [];
  const updateDishOrderById = _.keyBy(updateDishOrders, 'dishOrderId');
  // eslint-disable-next-line no-restricted-syntax
  for (const dishOrder of order.dishOrders) {
    const updateDishOrder = updateDishOrderById[dishOrder.id];
    dishOrder.quantity = updateDishOrder.quantity;
    dishOrder.beforeTaxTotalPrice = dishOrder.price * dishOrder.quantity;
    dishOrder.afterTaxTotalPrice = dishOrder.taxIncludedPrice * dishOrder.quantity;
    dishOrder.note = updateDishOrder.note || '';
    updatedDishOrders.push(dishOrder);
  }

  await bulkUpdate(
    PostgreSQLTable.DishOrder,
    updatedDishOrders.map((dishOrder) => ({
      id: dishOrder.id,
      quantity: dishOrder.quantity,
      beforeTaxTotalPrice: dishOrder.beforeTaxTotalPrice,
      afterTaxTotalPrice: dishOrder.afterTaxTotalPrice,
      note: dishOrder.note,
    }))
  );
  return order;
};

const cancelUnconfirmedOrder = async ({ userId, shopId, orderId }) => {
  const order = await Order.update({
    data: { status: Status.disabled, cancelledById: userId },
    where: {
      id: orderId,
      shopId,
    },
  });
  throwBadRequest(!order, getMessageByLocale({ key: 'order.notFound' }));
  return order;
};

const approveUnconfirmedOrder = async ({ userId, shopId, orderId, orderSessionId }) => {
  const order = await Order.findFirst({
    where: {
      id: orderId,
      shopId,
    },
  });
  throwBadRequest(!order, getMessageByLocale({ key: 'order.notFound' }));
  throwBadRequest(order.status === Status.disabled, getMessageByLocale({ key: 'order.disabled' }));

  const { orderSession } = await orderUtilService.getOrCreateOrderSession({
    customerId: order.customerId,
    tableId: order.tableId,
    shopId,
    orderSessionId,
    isApproveOrder: true,
  });
  await Order.update({
    data: {
      approvedById: userId,
      orderSessionId: orderSession.id,
    },
    where: { id: orderId },
  });
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
