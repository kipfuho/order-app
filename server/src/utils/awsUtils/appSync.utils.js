const _ = require('lodash');
const { publishSingleAppSyncEvent } = require('../aws');
const { formatOrderSessionNo } = require('../common');

const namespace = 'default';

const getShopChannel = (shopId) => `${namespace}/shop/${shopId}`;
const getCustomerChannel = (shopId) => `${namespace}/${shopId}/customer`;
const getOnlinePaymentChannel = (customerId) => `${namespace}/payment/${customerId}`;

const AppSyncEvent = {
  SHOP_CHANGED: 'SHOP_CHANGED',
  TABLE_CHANGED: 'TABLE_CHANGED',
  TABLE_POSITION_CHANGED: 'TABLE_POSITION_CHANGED',
  DISH_CHANGED: 'DISH_CHANGED',
  DISH_CATEGORY_CHANGED: 'DISH_CATEGORY_CHANGED',
  EMPLOYEE_CHANGED: 'EMPLOYEE_CHANGED',
  EMPLOYEE_POSITION_CHANGED: 'EMPLOYEE_POSITION_CHANGED',
  DEPARTMENT_CHANGED: 'EMPLOYEE_DEPARTMENT_CHANGED',
  PAYMENT_COMPLETE: 'PAYMENT_COMPLETE',
  ORDER_SESSION_UPDATE: 'ORDER_SESSION_UPDATE',
  NEW_ORDER: 'NEW_ORDER',
};

// general action action for events
const EventActionType = {
  CREATE: 'CREATE',
  UPDATE: 'UPDATE',
  DELETE: 'DELETE',
  CANCEL: 'CANCEL',
};

const notifyOrderSessionPaymentForCustomer = async ({ orderSession }) => {
  const { customerInfo } = orderSession;
  if (!customerInfo || !customerInfo.customerId) {
    return;
  }

  const { customerId } = customerInfo;
  const channel = getOnlinePaymentChannel(customerId);
  const event = {
    type: AppSyncEvent.PAYMENT_COMPLETE,
    data: {
      orderSessionId: orderSession.id,
      tableId: _.get(orderSession, 'tableIds.0'),
      billNo: formatOrderSessionNo(orderSession),
    },
  };
  return publishSingleAppSyncEvent({ channel, event });
};

const notifyOrderSessionPayment = async ({ orderSession, userId }) => {
  if (_.isEmpty(orderSession)) {
    return;
  }

  const channel = getShopChannel(orderSession.shopId);
  const event = {
    type: AppSyncEvent.PAYMENT_COMPLETE,
    data: {
      orderSessionId: orderSession.id,
      tableId: _.get(orderSession, 'tableIds.0'),
      userId,
      billNo: formatOrderSessionNo(orderSession),
    },
  };
  await publishSingleAppSyncEvent({ channel, event });
  await notifyOrderSessionPaymentForCustomer({ orderSession });
};

const _notifyUpdateShopForCustomer = async ({ action, shop }) => {
  if (_.isEmpty(shop)) {
    return;
  }

  const channel = getCustomerChannel(shop.id);
  const event = {
    type: AppSyncEvent.SHOP_CHANGED,
    data: {
      action, // 'CREATE', 'UPDATE', 'DELETE'
      shop,
    },
  };
  return publishSingleAppSyncEvent({ channel, event });
};

const notifyUpdateShop = async ({ action, shop, userId }) => {
  if (_.isEmpty(shop)) {
    return;
  }

  const channel = getShopChannel(shop.id);
  const event = {
    type: AppSyncEvent.SHOP_CHANGED,
    data: {
      action, // 'CREATE', 'UPDATE', 'DELETE'
      shop,
      userId,
    },
  };
  await publishSingleAppSyncEvent({ channel, event });
  await _notifyUpdateShopForCustomer({ action, shop });
};

const _notifyUpdateTableForCustomer = async ({ action, table }) => {
  if (_.isEmpty(table)) {
    return;
  }

  const channel = getCustomerChannel(table.shopId);
  const event = {
    type: AppSyncEvent.TABLE_CHANGED,
    data: {
      action, // 'CREATE', 'UPDATE', 'DELETE'
      table,
    },
  };
  return publishSingleAppSyncEvent({ channel, event });
};

const notifyUpdateTable = async ({ action, table, userId }) => {
  if (_.isEmpty(table)) {
    return;
  }

  const channel = getShopChannel(table.shopId);
  const event = {
    type: AppSyncEvent.TABLE_CHANGED,
    data: {
      action, // 'CREATE', 'UPDATE', 'DELETE'
      table,
      userId,
    },
  };
  await publishSingleAppSyncEvent({ channel, event });
  await _notifyUpdateTableForCustomer({ action, table });
};

const _notifyUpdateTablePositionForCustomer = async ({ action, tablePosition }) => {
  if (_.isEmpty(tablePosition)) {
    return;
  }

  const channel = getCustomerChannel(tablePosition.shopId);
  const event = {
    type: AppSyncEvent.TABLE_POSITION_CHANGED,
    data: {
      action, // 'CREATE', 'UPDATE', 'DELETE'
      tablePosition,
    },
  };
  return publishSingleAppSyncEvent({ channel, event });
};

const notifyUpdateTablePosition = async ({ action, tablePosition, userId }) => {
  if (_.isEmpty(tablePosition)) {
    return;
  }

  const channel = getShopChannel(tablePosition.shopId);
  const event = {
    type: AppSyncEvent.TABLE_POSITION_CHANGED,
    data: {
      action, // 'CREATE', 'UPDATE', 'DELETE'
      tablePosition,
      userId,
    },
  };
  await publishSingleAppSyncEvent({ channel, event });
  await _notifyUpdateTablePositionForCustomer({ action, tablePosition });
};

const _notifyUpdateDishForCustomer = async ({ action, dish }) => {
  if (_.isEmpty(dish)) {
    return;
  }

  const channel = getCustomerChannel(dish.shopId);
  const event = {
    type: AppSyncEvent.DISH_CHANGED,
    data: {
      action, // 'CREATE', 'UPDATE', 'DELETE'
      dish,
    },
  };
  return publishSingleAppSyncEvent({ channel, event });
};

const notifyUpdateDish = async ({ action, dish, userId }) => {
  if (_.isEmpty(dish)) {
    return;
  }

  const channel = getShopChannel(dish.shopId);
  const event = {
    type: AppSyncEvent.DISH_CHANGED,
    data: {
      action, // 'CREATE', 'UPDATE', 'DELETE'
      dish,
      userId,
    },
  };
  await publishSingleAppSyncEvent({ channel, event });
  await _notifyUpdateDishForCustomer({ action, dish });
};

const _notifyUpdateDishCategoryForCustomer = async ({ action, dishCategory }) => {
  if (_.isEmpty(dishCategory)) {
    return;
  }

  const channel = getCustomerChannel(dishCategory.shopId);
  const event = {
    type: AppSyncEvent.DISH_CATEGORY_CHANGED,
    data: {
      action, // 'CREATE', 'UPDATE', 'DELETE'
      dishCategory,
    },
  };
  return publishSingleAppSyncEvent({ channel, event });
};

const notifyUpdateDishCategory = async ({ action, dishCategory, userId }) => {
  if (_.isEmpty(dishCategory)) {
    return;
  }

  const channel = getShopChannel(dishCategory.shopId);
  const event = {
    type: AppSyncEvent.DISH_CATEGORY_CHANGED,
    data: {
      action, // 'CREATE', 'UPDATE', 'DELETE'
      dishCategory,
      userId,
    },
  };
  await publishSingleAppSyncEvent({ channel, event });
  await _notifyUpdateDishCategoryForCustomer({ action, dishCategory });
};

const notifyUpdateEmployee = async ({ action, employee, userId }) => {
  if (_.isEmpty(employee)) {
    return;
  }

  const channel = getShopChannel(employee.shopId);
  const event = {
    type: AppSyncEvent.EMPLOYEE_CHANGED,
    data: {
      action, // 'CREATE', 'UPDATE', 'DELETE'
      employee,
      userId,
    },
  };
  return publishSingleAppSyncEvent({ channel, event });
};

const notifyUpdateEmployeePosition = async ({ action, employeePosition, userId }) => {
  if (_.isEmpty(employeePosition)) {
    return;
  }

  const channel = getShopChannel(employeePosition.shopId);
  const event = {
    type: AppSyncEvent.EMPLOYEE_POSITION_CHANGED,
    data: {
      action, // 'CREATE', 'UPDATE', 'DELETE'
      employeePosition,
      userId,
    },
  };
  return publishSingleAppSyncEvent({ channel, event });
};

const notifyUpdateDepartment = async ({ action, department, userId }) => {
  if (_.isEmpty(department)) {
    return;
  }

  const channel = getShopChannel(department.shopId);
  const event = {
    type: AppSyncEvent.DEPARTMENT_CHANGED,
    data: {
      action, // 'CREATE', 'UPDATE', 'DELETE'
      department,
      userId,
    },
  };
  return publishSingleAppSyncEvent({ channel, event });
};

const _notifyUpdateOrderSessionForCustomer = async ({ orderSession, action }) => {
  const { customerInfo } = orderSession;
  if (!customerInfo || !customerInfo.customerId) {
    return;
  }

  const channel = getCustomerChannel(orderSession.shopId);
  const event = {
    type: AppSyncEvent.ORDER_SESSION_UPDATE,
    data: {
      action, // 'CANCEL'
      orderSessionId: orderSession.id,
      tableId: _.get(orderSession, 'tableIds.0'),
    },
  };
  return publishSingleAppSyncEvent({ channel, event });
};

const notifyUpdateOrderSession = async ({ orderSession, userId, action }) => {
  if (_.isEmpty(orderSession)) {
    return;
  }

  const channel = getShopChannel(orderSession.shopId);
  const event = {
    type: AppSyncEvent.ORDER_SESSION_UPDATE,
    data: {
      action, // 'CANCEL'
      orderSessionId: orderSession.id,
      tableId: _.get(orderSession, 'tableIds.0'),
      userId,
    },
  };
  await publishSingleAppSyncEvent({ channel, event });
  await _notifyUpdateOrderSessionForCustomer({ orderSession, action });
};

const notifyNewOrder = async ({ order, userId, action }) => {
  if (_.isEmpty(order)) {
    return;
  }

  const channel = getShopChannel(order.shopId);
  const event = {
    type: AppSyncEvent.NEW_ORDER,
    data: {
      action, // 'CREATE'
      orderId: order.id,
      tableId: order.tableId,
      userId,
    },
  };

  await publishSingleAppSyncEvent({ channel, event });
};

module.exports = {
  AppSyncEvent,
  EventActionType,
  notifyOrderSessionPayment,
  notifyOrderSessionPaymentForCustomer,
  notifyUpdateTable,
  notifyUpdateTablePosition,
  notifyUpdateShop,
  notifyUpdateDish,
  notifyUpdateDishCategory,
  notifyUpdateEmployee,
  notifyUpdateEmployeePosition,
  notifyUpdateDepartment,
  notifyUpdateOrderSession,
  notifyNewOrder,
};
