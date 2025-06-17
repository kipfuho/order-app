const _ = require('lodash');
const { Order, OrderSession, Cart, ReturnedDishOrder, DishOrder, CartItem } = require('../../models');
const orderUtilService = require('./orderUtils.service');
const { throwBadRequest } = require('../../utils/errorHandling');
const { getMessageByLocale } = require('../../locale');
const { OrderSessionStatus, OrderSessionDiscountType, DiscountValueType, Status } = require('../../utils/constant');
const { getTablesFromCache, getTableFromCache } = require('../../metadata/tableMetadata.service');
const { createSearchByDateOptionWithShopTimezone, divideToNPart } = require('../../utils/common');
const { getShopFromCache } = require('../../metadata/shopMetadata.service');
const { getDishesFromCache } = require('../../metadata/dishMetadata.service');
const {
  notifyOrderSessionPayment,
  notifyUpdateOrderSession,
  EventActionType,
  notifyCancelPaidStatusOrderSession,
  notifyUpdateUnconfirmedOrder,
  notifyApproveUnconfirmedOrder,
} = require('../../utils/awsUtils/appSync.utils');
const { registerJob } = require('../../jobs/jobUtils');
const { JobTypes } = require('../../jobs/constant');
const { bulkUpdate, PostgreSQLTable } = require('../../utils/prisma');
const { getOperatorFromSession } = require('../../middlewares/clsHooked');

const _validateBeforeCreateOrder = (orderSession) => {
  throwBadRequest(orderSession.status === OrderSessionStatus.paid, getMessageByLocale({ key: 'orderSession.alreadyPaid' }));
};

const createOrder = async ({ shopId, requestBody }) => {
  const { tableId, orderSessionId, dishOrders } = requestBody;
  const { orderSession, isNewOrderSession } = await orderUtilService.getOrCreateOrderSession({
    orderSessionId,
    tableId,
    shopId,
  });
  _validateBeforeCreateOrder(orderSession);
  await orderUtilService.createNewOrder({
    tableId,
    shopId,
    orderSession,
    dishOrders,
    isNewOrderSession,
  });
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
        unit: targetDishOrder.unit,
        note: targetDishOrder.note,
        orderId: targetDishOrder.orderId,
        quantity: targetDishOrder.quantity - newQuantity,
      },
    });
  }
  if (newQuantity === 0) {
    // update order to change updatedAt
    await Order.update({
      where: {
        id: orderId,
      },
      data: {
        dishOrders: {
          delete: {
            id: targetDishOrder.id,
          },
        },
      },
      select: { id: true },
    });
    return;
  }
  // update order to change updatedAt
  await Order.update({
    where: {
      id: orderId,
    },
    data: {
      dishOrders: {
        update: {
          where: {
            id: targetDishOrder.id,
          },
          data: { quantity: newQuantity },
        },
      },
    },
    select: { id: true },
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
    select: {
      id: true,
      dishOrders: {
        select: {
          id: true,
          dishOrderNo: true,
          dishId: true,
          name: true,
          unit: true,
          note: true,
          orderId: true,
          quantity: true,
        },
      },
    },
  });
  const orderById = _.keyBy(orders, 'id');

  const updatedDishOrders = [];
  const returnedDishOrders = [];
  _.forEach(orderUpdates, (orderUpdate) => {
    const order = orderById[orderUpdate.orderId];
    const newQuantity = orderUpdate.quantity;
    if (order) {
      const dishOrder = _.find(order.dishOrders, (_dishOrder) => _dishOrder.dishId === orderUpdate.dishId);
      if (dishOrder) {
        if (newQuantity < dishOrder.quantity) {
          returnedDishOrders.push({
            dishOrderNo: dishOrder.dishOrderNo,
            dishId: dishOrder.dishId,
            name: dishOrder.name,
            unit: dishOrder.unit,
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
  const deleteData = [];
  const updateData = [];
  updatedDishOrders.forEach((dishOrder) => {
    if (dishOrder.quantity === 0) {
      deleteData.push(dishOrder.id);
      return;
    }
    updateData.push({
      id: dishOrder.id,
      quantity: dishOrder.quantity,
    });
  });

  await DishOrder.deleteMany({
    where: {
      id: {
        in: deleteData,
      },
    },
  });
  await bulkUpdate(PostgreSQLTable.DishOrder, updateData);
  await Order.updateMany({
    where: {
      id: {
        in: orderIds,
      },
    },
    data: {},
  });
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
  const orderSessionDetail = await orderUtilService.calculateOrderSessionAndReturn(orderSessionId, shopId);
  return orderSessionDetail;
};

// currently only for update tax rate
const updateOrderSession = async ({ shopId, orderSessionId, requestBody }) => {
  const { taxRate } = requestBody;

  const updateData = _.pickBy({
    taxRate,
    shouldRecalculateTax: !!taxRate || taxRate === 0,
  });
  await OrderSession.update({
    where: {
      id: orderSessionId,
      shopId,
    },
    data: updateData,
    select: {
      id: true,
    },
  });
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

const payOrderSession = async ({ shopId, requestBody }) => {
  const { orderSessionId, paymentDetails, customerPaidAmount } = requestBody;
  const operator = getOperatorFromSession();
  const orderSessionDetail = await orderUtilService.calculateOrderSessionAndReturn(orderSessionId, shopId);
  _validateBeforePayment(orderSessionDetail, paymentDetails);

  const normalizedPaymentAmount = divideToNPart({
    initialSum: orderSessionDetail.paymentAmount,
    parts: paymentDetails.map((paymentDetail) => paymentDetail.paymentAmount),
  });

  const updatedOrderSession = await orderUtilService.updateOrderSession({
    orderSessionId,
    shopId: orderSessionDetail.shopId,
    updateBody: _.pickBy({
      status: OrderSessionStatus.paid,
      paidByUserId: _.get(operator, 'user.id'),
      paidByUserName: _.get(operator, 'employee.name') || _.get(operator, 'user.name'),
      customerPaidAmount,
      customerReturnAmount: Math.max(0, customerPaidAmount - orderSessionDetail.paymentAmount),
      endedAt: new Date(),
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

  await notifyOrderSessionPayment({ orderSession: updatedOrderSession });
  await registerJob({
    type: JobTypes.PAY_ORDER,
    data: {
      orderSessionId,
    },
  });

  return updatedOrderSession;
};

const cancelOrder = async ({ shopId, requestBody }) => {
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

  const operator = await getOperatorFromSession();
  const updatedOrderSession = await orderUtilService.updateOrderSession({
    orderSessionId,
    shopId,
    updateBody: {
      status: OrderSessionStatus.cancelled,
      cancelledByUserId: _.get(operator, 'user.id'),
      cancelledByUserName: _.get(operator, 'employee.name') || _.get(operator, 'user.name'),
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
      unit: dishOrder.unit,
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

  await notifyUpdateOrderSession({
    orderSession: updatedOrderSession,
    action: EventActionType.CANCEL,
  });
  await registerJob({
    type: JobTypes.CANCEL_ORDER,
    data: {
      orderSessionId,
    },
  });
  return updatedOrderSession;
};

const cancelPaidStatus = async ({ orderSessionId, shopId }) => {
  const updatedOrderSession = await orderUtilService.updateOrderSession({
    orderSessionId,
    shopId,
    updateBody: {
      status: OrderSessionStatus.unpaid,
      paidByUserId: null,
      paidByUserName: null,
      paymentDetails: {
        deleteMany: {},
      },
    },
  });

  await notifyCancelPaidStatusOrderSession({
    orderSession: updatedOrderSession,
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
  const existingItemsById = _.keyBy(cart.cartItems, 'id');

  const updatedItems = [];
  const createdItems = [];
  incomingItems.forEach((item) => {
    const existingItem = existingItemsById[item.id];
    if (existingItem) {
      existingItem.shouldUpdate = true;
      if (existingItem.quantity !== item.quantity || existingItem.note !== item.note) {
        if (item.quantity === 0) {
          existingItem.shouldDelete = true;
          return;
        }
        updatedItems.push(
          _.pickBy({
            id: existingItem.id,
            cartId: cart.id,
            dishId: item.dishId,
            quantity: item.quantity,
            note: item.note,
            price: dishById[item.dishId].price,
          })
        );
      }
      return;
    }

    createdItems.push(
      _.pickBy({
        ...item,
        price: dishById[item.dishId].price,
        cartId: cart.id,
      })
    );
  });
  const deletedCartItemIds = cart.cartItems
    .filter((cartItem) => !cartItem.shouldUpdate || cartItem.shouldDelete)
    .map((cartItem) => cartItem.id);
  const totalAmount =
    (_.sumBy(createdItems, (item) => item.quantity * item.price) || 0) +
    (_.sumBy(updatedItems, (item) => item.quantity * item.price) || 0);

  if (createdItems.length > 0) {
    await CartItem.createMany({
      data: createdItems,
    });
  }

  if (updatedItems.length > 0) {
    await bulkUpdate(PostgreSQLTable.CartItem, updatedItems);
  }

  if (deletedCartItemIds.length > 0) {
    await CartItem.deleteMany({
      where: {
        id: {
          in: deletedCartItemIds,
        },
      },
    });
  }

  await Cart.update({
    data: {
      totalAmount,
    },
    where: { id: cart.id },
    select: {
      id: true,
    },
  });
};

const clearCart = async ({ shopId, customerId, remainingItems, deletedItems }) => {
  if (_.isEmpty(remainingItems)) {
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
      select: {
        id: true,
      },
    });
  }

  const cartItemIdsForDeletion = (deletedItems || []).map((item) => item.id);
  await Cart.update({
    where: {
      customer_shop_unique: {
        customerId,
        shopId,
      },
    },
    data: {
      cartItems: {
        deleteMany: {
          id: {
            in: cartItemIdsForDeletion,
          },
        },
      },
      totalAmount: _.sumBy(remainingItems, (item) => item.quantity * item.price) || 0,
    },
    select: {
      id: true,
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

  const dishes = await getDishesFromCache({ shopId });
  const dishById = _.keyBy(dishes, 'id');
  const availableCartItems = [];
  const unavailableCartItems = [];
  cart.cartItems.forEach((cartItem) => {
    if ((dishById[cartItem.dishId] || {}).status === Status.activated) {
      availableCartItems.push(cartItem);
    } else {
      unavailableCartItems.push(cartItem);
    }
  });

  // Nếu bàn cần xác nhận của nhân viên thì không gắn order session
  if (table.needApprovalWhenCustomerOrder) {
    const order = await orderUtilService.createNewOrder({
      tableId,
      shopId,
      dishOrders: availableCartItems,
      customerId,
    });
    await clearCart({ customerId, shopId, remainingItems: unavailableCartItems, deletedItems: availableCartItems });
    await notifyUpdateUnconfirmedOrder({ order, action: EventActionType.CREATE });
    return;
  }

  const { orderSession, isNewOrderSession } = await orderUtilService.getOrCreateOrderSession({
    tableId,
    shopId,
    customerId,
    isCustomerApp: true,
  });
  await orderUtilService.createNewOrder({
    tableId,
    shopId,
    orderSession,
    dishOrders: availableCartItems,
    customerId,
    isNewOrderSession,
  });
  await clearCart({ customerId, shopId, remainingItems: unavailableCartItems, deletedItems: availableCartItems });
};

const discountDishOrder = async ({ shopId, requestBody }) => {
  const { orderSessionId, dishOrderId, orderId, discountReason, discountValue, discountType } = requestBody;
  let { discountAfterTax } = requestBody;

  throwBadRequest(discountValue <= 0, getMessageByLocale({ key: 'discount.invalidDiscountValue' }));
  throwBadRequest(
    discountType === DiscountValueType.PERCENTAGE && discountValue > 100,
    getMessageByLocale({ key: 'discount.invalidDiscountValue' })
  );
  const orderSessionDetail = await orderUtilService.calculateOrderSessionAndReturn(orderSessionId, shopId);
  throwBadRequest(!orderSessionDetail, getMessageByLocale({ key: 'orderSession.notFound' }));
  const order = _.find(orderSessionDetail.orders, (_order) => _order.id === orderId);
  throwBadRequest(!order, getMessageByLocale({ key: 'order.notFound' }));
  const dishOrder = _.find(order.dishOrders, (_dishOrder) => _dishOrder.id === dishOrderId);
  throwBadRequest(!dishOrder, getMessageByLocale({ key: 'dish.notFound' }));

  const previousDiscount = _.find(
    orderSessionDetail.discounts,
    (discount) =>
      discount.discountType === OrderSessionDiscountType.PRODUCT && discount.discountProducts[0].dishOrderId === dishOrderId
  );
  if (
    (discountValue && _.get(previousDiscount, 'discountValueType') !== discountType) ||
    _.get(previousDiscount, 'discountValue') !== discountValue ||
    _.get(previousDiscount, 'discountAfterTax') !== discountAfterTax
  ) {
    // eslint-disable-next-line no-param-reassign
    if (dishOrder.isTaxIncludedPrice) discountAfterTax = true;
    const afterTaxDishPrice = dishOrder.taxIncludedPrice;

    await OrderSession.update({
      data: {
        discounts: _.pickBy({
          update: previousDiscount
            ? {
                where: {
                  id: previousDiscount.id,
                },
                data: {
                  status: Status.disabled,
                  discountProducts: {
                    updateMany: {
                      where: {},
                      data: {
                        status: Status.disabled,
                      },
                    },
                  },
                },
              }
            : null,
          create: _.pickBy({
            name: `${getMessageByLocale({ key: 'discount.dish' })} - ${dishOrder.name}`,
            discountReason,
            discountType: OrderSessionDiscountType.PRODUCT,
            discountValue,
            discountValueType: discountType,
            discountAfterTax,
            discountProducts: {
              create: {
                dishOrderId,
                dishId: dishOrder.dishId,
                dishName: dishOrder.name,
                discountValue,
                discountValueType: discountType,
                discountRate:
                  discountType === DiscountValueType.PERCENTAGE
                    ? discountValue
                    : _.min(100, (100 * discountValue) / (discountAfterTax ? afterTaxDishPrice : dishOrder.price)),
              },
            },
          }),
        }),
      },
      where: { id: orderSessionId },
      select: { id: true },
    });

    return orderUtilService.calculateOrderSessionAndReturn(orderSessionId);
  }
};

const discountOrderSession = async ({ shopId, requestBody }) => {
  const { orderSessionId, discountReason, discountValue, discountType, discountAfterTax } = requestBody;

  const orderSessionDetail = await orderUtilService.calculateOrderSessionAndReturn(orderSessionId, shopId);
  throwBadRequest(!orderSessionDetail, getMessageByLocale({ key: 'orderSession.notFound' }));

  const previousDiscount = _.find(
    orderSessionDetail.discounts,
    (discount) => discount.discountType === OrderSessionDiscountType.INVOICE
  );
  if (
    (discountValue && _.get(previousDiscount, 'discountValueType') !== discountType) ||
    _.get(previousDiscount, 'discountValue') !== discountValue ||
    _.get(previousDiscount, 'discountAfterTax') !== discountAfterTax
  ) {
    await OrderSession.update({
      data: _.pickBy({
        discounts: {
          update: previousDiscount
            ? {
                where: {
                  id: previousDiscount.id,
                },
                data: {
                  status: Status.disabled,
                },
              }
            : null,
          create: _.pickBy({
            name: getMessageByLocale({ key: 'discount.order' }),
            discountType: OrderSessionDiscountType.INVOICE,
            discountValueType: discountType,
            discountValue,
            discountAfterTax,
            discountReason,
          }),
        },
      }),
      where: { id: orderSessionId },
      select: { id: true },
    });
  }

  return orderUtilService.calculateOrderSessionAndReturn(orderSessionId);
};

const removeDiscountFromOrderSession = async ({ shopId, requestBody }) => {
  const { orderSessionId, discountId } = requestBody;

  const orderSessionDetail = await orderUtilService.calculateOrderSessionAndReturn(orderSessionId, shopId);
  throwBadRequest(!orderSessionDetail, getMessageByLocale({ key: 'orderSession.notFound' }));

  await OrderSession.update({
    data: { discounts: { delete: { id: discountId } } },
    where: { id: orderSessionId },
    select: { id: true },
  });
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
      returnedDishOrders: true,
    },
  });
  const shop = await getShopFromCache({ shopId });
  const tables = await getTablesFromCache({ shopId });
  const tableById = _.keyBy(tables, 'id');
  const dishes = await getDishesFromCache({ shopId });
  const dishById = _.keyBy(dishes, 'id');
  const ordersByOrderSessionId = _.groupBy(allOrders, 'orderSessionId');
  const activeorderSessionDetails = _.map(activeOrderSessions, (orderSession) => {
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
  return activeorderSessionDetails;
};

const getCheckoutCartHistory = async ({ customerId, shopId, cursor, limit = 20 }) => {
  const orderSessions = await OrderSession.findMany({
    where: {
      customerId,
      shopId,
    },
    orderBy: [{ createdAt: 'desc' }, { id: 'asc' }],
    take: limit + 1,
    ...(cursor && {
      cursor: {
        id: cursor,
      },
    }),
    select: {
      id: true,
      orderSessionNo: true,
      createdAt: true,
      status: true,
      tableNames: true,
      orders: {
        select: {
          id: true,
          customerId: true,
          dishOrders: {
            select: {
              dishId: true,
              name: true,
              price: true,
              quantity: true,
              note: true,
            },
          },
        },
      },
      paymentAmount: true,
    },
  });

  const hasNextPage = orderSessions.length > limit;
  const items = hasNextPage ? orderSessions.slice(0, -1) : orderSessions;
  return {
    data: items,
    nextCursor: hasNextPage ? orderSessions[orderSessions.length - 1].id : null,
  };
};

const getUnconfirmedCheckoutCartHistory = async ({ customerId, shopId, cursor, limit = 20 }) => {
  const orders = await Order.findMany({
    where: {
      customerId,
      shopId,
      orderSessionId: null,
    },
    orderBy: [{ createdAt: 'desc' }, { id: 'asc' }],
    take: limit + 1,
    ...(cursor && {
      cursor: {
        id: cursor,
      },
    }),
    select: {
      id: true,
      createdAt: true,
      tableName: true,
      dishOrders: {
        select: {
          dishId: true,
          name: true,
          price: true,
          quantity: true,
          note: true,
        },
      },
      paymentAmount: true,
    },
  });

  const hasNextPage = orders.length > limit;
  const items = hasNextPage ? orders.slice(0, -1) : orders;
  return {
    data: items,
    nextCursor: hasNextPage ? orders[orders.length - 1].id : null,
  };
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

  await notifyUpdateUnconfirmedOrder({ order, action: EventActionType.UPDATE });
  return order;
};

const cancelUnconfirmedOrder = async ({ shopId, orderId }) => {
  const operator = getOperatorFromSession();
  const order = await Order.update({
    data: {
      status: Status.disabled,
      cancelledById: _.get(operator, 'user.id'),
      cancelledByName: _.get(operator, 'employee.name') || _.get(operator, 'user.name'),
    },
    where: {
      id: orderId,
      shopId,
    },
    select: { id: true },
  });
  throwBadRequest(!order, getMessageByLocale({ key: 'order.notFound' }));
  await notifyUpdateUnconfirmedOrder({ order, action: EventActionType.CANCEL });
};

const approveUnconfirmedOrder = async ({ shopId, orderId, orderSessionId }) => {
  const order = await Order.findFirst({
    where: {
      id: orderId,
      shopId,
    },
  });
  throwBadRequest(!order, getMessageByLocale({ key: 'order.notFound' }));
  throwBadRequest(order.status === Status.disabled, getMessageByLocale({ key: 'order.disabled' }));

  const operator = getOperatorFromSession();
  const { orderSession } = await orderUtilService.getOrCreateOrderSession({
    customerId: order.customerId,
    tableId: order.tableId,
    shopId,
    orderSessionId,
    isApproveOrder: true,
  });
  const currentTime = new Date();
  await Order.update({
    data: {
      approvedById: _.get(operator, 'user.id'),
      approvedByName: _.get(operator, 'employee.name') || _.get(operator, 'user.name'),
      orderSessionId: orderSession.id,
      createdAt: currentTime,
      dishOrders: {
        updateMany: {
          where: {},
          data: {
            createdAt: currentTime,
          },
        },
      },
    },
    where: { id: orderId },
    select: { id: true },
  });

  await orderUtilService.calculateOrderSessionAndReturn(orderSession.id);
  await notifyApproveUnconfirmedOrder({ order, orderSession });
};

module.exports = {
  createOrder,
  changeDishQuantity,
  updateOrder,
  getTableForOrder,
  getTableActiveOrderSessions,
  getOrderSessionDetail,
  updateOrderSession,
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
  getUnconfirmedCheckoutCartHistory,
  getOrderNeedApproval,
  updateUnconfirmedOrder,
  cancelUnconfirmedOrder,
  approveUnconfirmedOrder,
};
