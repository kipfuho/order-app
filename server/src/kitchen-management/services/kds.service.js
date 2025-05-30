const _ = require('lodash');
const { Order, KitchenLog, OrderSession, DishOrder } = require('../../models');
const { createSearchByDateOptionWithShopTimezone } = require('../../utils/common');
const { OrderSessionStatus, Status, DishOrderStatus, KitchenAction } = require('../../utils/constant');
const { getMessageByLocale } = require('../../locale');
const { registerJob } = require('../../jobs/jobUtils');
const { JobTypes } = require('../../jobs/constant');

const _getDishOrdersByStatus = async ({ shopId, status }) => {
  // currently disable filter time filter to dev
  // const timeOptions = createSearchByDateOptionWithShopTimezone({ filterKey: 'createdAt' });
  const orders = await Order.findMany({
    where: {
      orderSessionId: { not: null },
      shopId,
      orderSessionStatus: OrderSessionStatus.unpaid,
      status: Status.enabled,
      // ...timeOptions,
    },
    select: {
      id: true,
      orderSessionId: true,
      createdAt: true,
      dishOrders: true,
    },
  });

  const orderSessionIds = _(orders).map('orderSessionId').uniq().value();
  const orderSessions = await OrderSession.findMany({
    where: {
      id: { in: orderSessionIds },
    },
    select: {
      id: true,
      orderSessionNo: true,
      tableNames: true,
    },
  });
  const orderSessionById = _.keyBy(orderSessions, 'id');

  const dishOrders = _(orders)
    .flatMap((order) => {
      order.dishOrders.forEach((dishOrder) => {
        const orderSession = orderSessionById[order.orderSessionId];
        if (!orderSession) {
          return;
        }

        Object.assign(dishOrder, {
          orderId: order.id,
          orderSessionId: order.orderSessionId,
          orderSessionNo: orderSession.orderSessionNo,
          tableName: orderSession.tableNames.join(', '),
          createdAt: order.createdAt,
        });
      });
      return order.dishOrders;
    })
    .filter((dishOrder) => dishOrder.status === status)
    .value();
  return dishOrders;
};

const _updateDishOrdersByStatus = async ({ shopId, updateRequests, userId, beforeStatus, afterStatus, actionType }) => {
  const errors = [];
  const logs = [];
  const updateRequestGroupByOrderId = _.groupBy(updateRequests, 'orderId');
  const orderIds = Object.keys(updateRequestGroupByOrderId);
  const orders = await Order.findMany({
    where: {
      id: { in: orderIds },
      shopId,
    },
    include: {
      dishOrders: true,
    },
  });
  const orderById = _.keyBy(orders, (order) => order.id);
  const updatedDishOrderIds = [];
  _.forEach(updateRequestGroupByOrderId, async (updateGroup, orderId) => {
    try {
      const order = orderById[orderId];
      if (!order) {
        errors.push({ message: getMessageByLocale({ key: 'order.notFound' }), orderId });
        return;
      }

      const dishOrderSet = new Set(_.map(updateGroup, 'dishOrderId'));
      order.dishOrders.forEach((dishOrder) => {
        if (dishOrderSet.has(dishOrder.id) && dishOrder.status === beforeStatus) {
          logs.push({
            shopId,
            userId,
            orderId,
            dishOrderId: dishOrder.id,
            action: actionType,
            dishName: dishOrder.name,
            dishQuantity: dishOrder.quantity,
          });
          updatedDishOrderIds.push(dishOrder.id);
        }
      });
    } catch (err) {
      errors.push({ message: err.message, orderId });
    }
  });

  await DishOrder.updateMany({
    data: {
      status: afterStatus,
    },
    where: {
      id: { in: updatedDishOrderIds },
    },
  });
  await registerJob({
    type: JobTypes.LOG_KITCHEN,
    data: logs,
  });

  return errors;
};

const getUncookedDishOrders = async ({ shopId }) => {
  return _getDishOrdersByStatus({ shopId, status: DishOrderStatus.confirmed });
};

const updateUncookedDishOrders = async ({ shopId, requestBody, userId }) => {
  const { updateRequests } = requestBody;
  return _updateDishOrdersByStatus({
    shopId,
    updateRequests,
    actionType: KitchenAction.UPDATE_COOKED,
    userId,
    beforeStatus: DishOrderStatus.confirmed,
    afterStatus: DishOrderStatus.cooked,
  });
};

const undoCookedDishOrders = async ({ shopId, requestBody, userId }) => {
  const { updateRequests } = requestBody;
  return _updateDishOrdersByStatus({
    shopId,
    updateRequests,
    actionType: KitchenAction.UNDO_COOKED,
    userId,
    beforeStatus: DishOrderStatus.cooked,
    afterStatus: DishOrderStatus.confirmed,
  });
};

const getUnservedDishOrders = async ({ shopId }) => {
  return _getDishOrdersByStatus({ shopId, status: DishOrderStatus.cooked });
};

const updateUnservedDishOrders = async ({ shopId, requestBody, userId }) => {
  const { updateRequests } = requestBody;
  return _updateDishOrdersByStatus({
    shopId,
    updateRequests,
    actionType: KitchenAction.UPDATE_SERVED,
    userId,
    beforeStatus: DishOrderStatus.cooked,
    afterStatus: DishOrderStatus.served,
  });
};

const undoServedDishOrders = async ({ shopId, requestBody, userId }) => {
  const { updateRequests } = requestBody;
  return _updateDishOrdersByStatus({
    shopId,
    updateRequests,
    actionType: KitchenAction.UNDO_SERVED,
    userId,
    beforeStatus: DishOrderStatus.served,
    afterStatus: DishOrderStatus.cooked,
  });
};

const _getKitchenHistoriesByAction = async ({ shopId, from, to, actions }) => {
  const timeOptions = createSearchByDateOptionWithShopTimezone({ from, to, filterKey: 'createdAt' });
  const histories = await KitchenLog.findMany({
    where: {
      shopId,
      action: { in: actions },
      ...timeOptions,
    },
    orderBy: {
      createdAt: 'desc',
    },
  });
  return histories;
};

const getCookedHistories = async ({ shopId, requestBody }) => {
  const { from, to } = requestBody;
  return _getKitchenHistoriesByAction({
    shopId,
    from,
    to,
    actions: [KitchenAction.UPDATE_COOKED, KitchenAction.UNDO_COOKED],
  });
};

const getServedHistories = async ({ shopId, requestBody }) => {
  const { from, to } = requestBody;
  return _getKitchenHistoriesByAction({
    shopId,
    from,
    to,
    actions: [KitchenAction.UPDATE_SERVED, KitchenAction.UNDO_SERVED],
  });
};

module.exports = {
  getUncookedDishOrders,
  updateUncookedDishOrders,
  undoCookedDishOrders,
  getUnservedDishOrders,
  updateUnservedDishOrders,
  undoServedDishOrders,
  getCookedHistories,
  getServedHistories,
};
