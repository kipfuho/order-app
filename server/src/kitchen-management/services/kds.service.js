const _ = require('lodash');
const { Order, KitchenLog, DishOrder } = require('../../models');
const { createSearchByDateOptionWithShopTimezone } = require('../../utils/common');
const { Status, DishOrderStatus, KitchenAction } = require('../../utils/constant');
const { getMessageByLocale } = require('../../locale');
const { registerJob } = require('../../jobs/jobUtils');
const { JobTypes } = require('../../jobs/constant');
const { getTablesFromCache } = require('../../metadata/tableMetadata.service');

const _getDishOrdersByStatus = async ({ shopId, status, cursor, limit }) => {
  // const timeOptions = createSearchByDateOptionWithShopTimezone({ filterKey: 'createdAt' });

  const tables = await getTablesFromCache({ shopId });
  const tableById = _.keyBy(tables, 'id');
  const dishOrders = await DishOrder.findMany({
    where: {
      status,
      order: {
        shopId,
        kitchenAllDone: false,
        orderSessionId: { not: null },
        status: Status.enabled,
        // createdAt: {
        //   ...timeOptions.createdAt,
        // },
      },
    },
    orderBy: [
      {
        order: {
          createdAt: 'asc',
        },
      },
      { dishOrderNo: 'asc' },
    ],
    take: limit + 1,
    ...(cursor && {
      cursor: {
        id: cursor,
      },
    }),
    select: {
      id: true,
      name: true,
      dishId: true,
      quantity: true,
      unit: true,
      status: true,
      orderId: true,
      dishOrderNo: true,
      createdAt: true,
      order: {
        select: {
          orderNo: true,
          tableId: true,
        },
      },
    },
  });

  const hasNextPage = dishOrders.length > limit;
  const items = hasNextPage ? dishOrders.slice(0, -1) : dishOrders;
  const formattedData = items.map((dishOrder) => {
    const table = tableById[_.get(dishOrder, 'order.tableId')] || {};
    const kitchenDishOrder = {
      ...dishOrder,
      orderNo: _.get(dishOrder, 'order.orderNo'),
      tableName: table.name || 'N/A',
      tablePositionName: table.position.name || 'N/A',
    };
    delete kitchenDishOrder.order;
    return kitchenDishOrder;
  });

  return {
    data: formattedData,
    nextCursor: hasNextPage ? dishOrders[dishOrders.length - 1].id : null,
  };
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

const getUncookedDishOrders = async ({ shopId, cursor, limit }) => {
  return _getDishOrdersByStatus({ shopId, status: DishOrderStatus.confirmed, cursor, limit });
};

const getUncookedDishOrdersByDishId = async ({ shopId, dishId, cursor, limit }) => {
  // const timeOptions = createSearchByDateOptionWithShopTimezone({ filterKey: 'createdAt' });

  const tables = await getTablesFromCache({ shopId });
  const tableById = _.keyBy(tables, 'id');
  const dishOrders = await DishOrder.findMany({
    where: {
      dishId,
      status: DishOrderStatus.confirmed,
      order: {
        shopId,
        kitchenAllDone: false,
        orderSessionId: { not: null },
        status: Status.enabled,
        // createdAt: {
        //   ...timeOptions.createdAt,
        // },
      },
    },
    orderBy: [
      {
        order: {
          createdAt: 'asc',
        },
      },
      { dishOrderNo: 'asc' },
    ],
    take: limit + 1,
    ...(cursor && {
      cursor: {
        id: cursor,
      },
    }),
    select: {
      id: true,
      name: true,
      dishId: true,
      quantity: true,
      unit: true,
      status: true,
      orderId: true,
      dishOrderNo: true,
      createdAt: true,
      order: {
        select: {
          orderNo: true,
          tableId: true,
        },
      },
    },
  });

  const hasNextPage = dishOrders.length > limit;
  const items = hasNextPage ? dishOrders.slice(0, -1) : dishOrders;
  const formattedData = items.map((dishOrder) => {
    const table = tableById[_.get(dishOrder, 'order.tableId')] || {};
    const kitchenDishOrder = {
      ...dishOrder,
      orderNo: _.get(dishOrder, 'order.orderNo'),
      tableName: table.name || 'N/A',
      tablePositionName: table.position.name || 'N/A',
    };
    delete kitchenDishOrder.order;
    return kitchenDishOrder;
  });

  return {
    data: formattedData,
    nextCursor: hasNextPage ? dishOrders[dishOrders.length - 1].id : null,
  };
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

const getUnservedDishOrders = async ({ shopId, cursor, limit }) => {
  return _getDishOrdersByStatus({ shopId, status: DishOrderStatus.cooked, cursor, limit });
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

const _getKitchenHistoriesByAction = async ({ shopId, from, to, actions, cursor, limit = 20 }) => {
  const timeOptions = createSearchByDateOptionWithShopTimezone({ from, to, filterKey: 'createdAt' });
  const histories = await KitchenLog.findMany({
    where: {
      shopId,
      action: { in: actions },
      ...timeOptions,
    },
    orderBy: [{ createdAt: 'desc' }],
    take: limit + 1,
    ...(cursor && {
      cursor: {
        id: cursor,
      },
    }),
  });

  const hasNextPage = histories.length > limit;
  const items = hasNextPage ? histories.slice(0, -1) : histories;

  return {
    data: items,
    nextCursor: hasNextPage ? histories[histories.length - 1].id : null,
  };
};

const getCookedHistories = async ({ shopId, requestBody, cursor, limit }) => {
  const { from, to } = requestBody;
  return _getKitchenHistoriesByAction({
    shopId,
    from,
    to,
    actions: [KitchenAction.UPDATE_COOKED, KitchenAction.UNDO_COOKED],
    cursor,
    limit,
  });
};

const getServedHistories = async ({ shopId, requestBody, cursor, limit }) => {
  const { from, to } = requestBody;
  return _getKitchenHistoriesByAction({
    shopId,
    from,
    to,
    actions: [KitchenAction.UPDATE_SERVED, KitchenAction.UNDO_SERVED],
    cursor,
    limit,
  });
};

module.exports = {
  getUncookedDishOrders,
  getUncookedDishOrdersByDishId,
  updateUncookedDishOrders,
  undoCookedDishOrders,
  getUnservedDishOrders,
  updateUnservedDishOrders,
  undoServedDishOrders,
  getCookedHistories,
  getServedHistories,
};
