const _ = require('lodash');
const { Order, KitchenLog, OrderSession } = require('../../models');
const { createSearchByDateOptionWithShopTimezone } = require('../../utils/common');
const { OrderSessionStatus, Status, DishOrderStatus, KitchenAction } = require('../../utils/constant');
const { getMessageByLocale } = require('../../locale');
const { registerJob } = require('../../jobs/jobUtils');
const { JobTypes } = require('../../jobs/constant');

const _getDishOrdersByStatus = async ({ shopId, status }) => {
  // currently disable filter time filter to dev
  // const timeOptions = createSearchByDateOptionWithShopTimezone({ filterKey: 'createdAt' });
  const orders = await Order.find(
    {
      shop: shopId,
      orderSessionId: { $ne: null },
      orderSessionStatus: OrderSessionStatus.unpaid,
      status: Status.enabled,
      // ...timeOptions,
    },
    {
      dishOrders: 1,
      orderSessionId: 1,
      createdAt: 1,
    }
  );

  const orderSessionIds = _(orders).map('orderSessionId').uniq().value();
  const orderSessions = await OrderSession.find(
    { _id: { $in: orderSessionIds } },
    {
      orderSessionNo: 1,
      tableNames: 1,
    }
  );
  const orderSessionById = _.keyBy(orderSessions, 'id');

  const orderJsons = _.map(orders, (order) => order.toJSON());
  const dishOrders = _(orderJsons)
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
  const orders = await Order.find({ shop: shopId, _id: { $in: orderIds } });
  const orderById = _.keyBy(orders, (order) => order.id);
  _.forEach(updateRequestGroupByOrderId, async (updateGroup, orderId) => {
    try {
      const order = orderById[orderId];
      if (!order) {
        errors.push({ message: getMessageByLocale({ key: 'order.notFound' }), orderId });
        return;
      }

      const dishOrderSet = new Set(_.map(updateGroup, 'dishOrderId'));
      order.dishOrders.map((dishOrder) => {
        if (dishOrderSet.has(dishOrder.id) && dishOrder.status === beforeStatus) {
          // eslint-disable-next-line no-param-reassign
          dishOrder.status = afterStatus;
          logs.push({
            shop: shopId,
            userId,
            orderId,
            dishOrderId: dishOrder.id,
            action: actionType,
            dishName: dishOrder.name,
            dishQuantity: dishOrder.quantity,
          });
        }
        return dishOrder;
      });
    } catch (err) {
      errors.push({ message: err.message, orderId });
    }
  });

  await Order.bulkSave(orders);
  registerJob({
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
  const histories = await KitchenLog.find({
    shop: shopId,
    action: { $in: actions },
    ...timeOptions,
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
