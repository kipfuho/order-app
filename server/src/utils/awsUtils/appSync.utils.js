const _ = require('lodash');
const { publishSingleAppSyncEvent } = require('../aws');
const { formatOrderSessionNo } = require('../common');

const namespace = 'default';

const getShopChannel = (shopId) => `${namespace}/shop/${shopId}`;
const getCustomerChannel = (shopId) => `${namespace}/shop/${shopId}/customer`;
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
  CANCEL_PAYMENT: 'CANCEL_PAYMENT',
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

const notifyOrderSessionPayment = async ({ orderSession }) => {
  if (_.isEmpty(orderSession)) {
    return;
  }

  const channel = getShopChannel(orderSession.shopId);
  const event = {
    type: AppSyncEvent.PAYMENT_COMPLETE,
    data: {
      orderSessionId: orderSession.id,
      tableId: _.get(orderSession, 'tableIds.0'),
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

const notifyUpdateShop = async ({ action, shop }) => {
  const channel = getShopChannel(shop.id);
  const event = {
    type: AppSyncEvent.SHOP_CHANGED,
    data: {
      action, // 'CREATE', 'UPDATE', 'DELETE'
      shop,
    },
  };
  await publishSingleAppSyncEvent({ channel, event });
  await _notifyUpdateShopForCustomer({ action, shop });
};

const _notifyUpdateTableForCustomer = async ({ action, shopId, table }) => {
  const channel = getCustomerChannel(shopId);
  const event = {
    type: AppSyncEvent.TABLE_CHANGED,
    data: {
      action, // 'CREATE', 'UPDATE', 'DELETE'
      table,
    },
  };
  return publishSingleAppSyncEvent({ channel, event });
};

const notifyUpdateTable = async ({ action, shopId, table }) => {
  const channel = getShopChannel(shopId);
  const event = {
    type: AppSyncEvent.TABLE_CHANGED,
    data: {
      action, // 'CREATE', 'UPDATE', 'DELETE'
      table,
    },
  };
  await publishSingleAppSyncEvent({ channel, event });
  await _notifyUpdateTableForCustomer({ action, shopId, table });
};

const _notifyUpdateTablePositionForCustomer = async ({ action, shopId, tablePosition }) => {
  const channel = getCustomerChannel(shopId);
  const event = {
    type: AppSyncEvent.TABLE_POSITION_CHANGED,
    data: {
      action, // 'CREATE', 'UPDATE', 'DELETE'
      tablePosition,
    },
  };
  return publishSingleAppSyncEvent({ channel, event });
};

const notifyUpdateTablePosition = async ({ action, shopId, tablePosition }) => {
  const channel = getShopChannel(shopId);
  const event = {
    type: AppSyncEvent.TABLE_POSITION_CHANGED,
    data: {
      action, // 'CREATE', 'UPDATE', 'DELETE'
      tablePosition,
    },
  };
  await publishSingleAppSyncEvent({ channel, event });
  await _notifyUpdateTablePositionForCustomer({ action, shopId, tablePosition });
};

const _notifyUpdateDishForCustomer = async ({ action, shopId, dish }) => {
  const channel = getCustomerChannel(shopId);
  const event = {
    type: AppSyncEvent.DISH_CHANGED,
    data: {
      action, // 'CREATE', 'UPDATE', 'DELETE'
      dish,
    },
  };
  return publishSingleAppSyncEvent({ channel, event });
};

const notifyUpdateDish = async ({ action, shopId, dish }) => {
  const channel = getShopChannel(shopId);
  const event = {
    type: AppSyncEvent.DISH_CHANGED,
    data: {
      action, // 'CREATE', 'UPDATE', 'DELETE'
      dish,
    },
  };
  await publishSingleAppSyncEvent({ channel, event });
  await _notifyUpdateDishForCustomer({ action, shopId, dish });
};

const _notifyUpdateDishCategoryForCustomer = async ({ action, shopId, dishCategory }) => {
  const channel = getCustomerChannel(shopId);
  const event = {
    type: AppSyncEvent.DISH_CATEGORY_CHANGED,
    data: {
      action, // 'CREATE', 'UPDATE', 'DELETE'
      dishCategory,
    },
  };
  return publishSingleAppSyncEvent({ channel, event });
};

const notifyUpdateDishCategory = async ({ action, shopId, dishCategory }) => {
  const channel = getShopChannel(shopId);
  const event = {
    type: AppSyncEvent.DISH_CATEGORY_CHANGED,
    data: {
      action, // 'CREATE', 'UPDATE', 'DELETE'
      dishCategory,
    },
  };
  await publishSingleAppSyncEvent({ channel, event });
  await _notifyUpdateDishCategoryForCustomer({ action, shopId, dishCategory });
};

const notifyUpdateEmployee = async ({ action, shopId, employee }) => {
  const channel = getShopChannel(shopId);
  const event = {
    type: AppSyncEvent.EMPLOYEE_CHANGED,
    data: {
      action, // 'CREATE', 'UPDATE', 'DELETE'
      employee,
    },
  };
  return publishSingleAppSyncEvent({ channel, event });
};

const notifyUpdateEmployeePosition = async ({ action, shopId, employeePosition }) => {
  const channel = getShopChannel(shopId);
  const event = {
    type: AppSyncEvent.EMPLOYEE_POSITION_CHANGED,
    data: {
      action, // 'CREATE', 'UPDATE', 'DELETE'
      employeePosition,
    },
  };
  return publishSingleAppSyncEvent({ channel, event });
};

const notifyUpdateDepartment = async ({ action, shopId, department }) => {
  const channel = getShopChannel(shopId);
  const event = {
    type: AppSyncEvent.DEPARTMENT_CHANGED,
    data: {
      action, // 'CREATE', 'UPDATE', 'DELETE'
      department,
    },
  };
  return publishSingleAppSyncEvent({ channel, event });
};

const notifyUpdateKitchen = async ({ action, shopId, kitchen }) => {
  const channel = getShopChannel(shopId);
  const event = {
    type: AppSyncEvent.DISH_CHANGED,
    data: {
      action, // 'CREATE', 'UPDATE', 'DELETE'
      kitchen,
    },
  };
  await publishSingleAppSyncEvent({ channel, event });
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

const notifyUpdateOrderSession = async ({ orderSession, action }) => {
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
    },
  };
  await publishSingleAppSyncEvent({ channel, event });
  await _notifyUpdateOrderSessionForCustomer({ orderSession, action });
};

const notifyCancelPaidStatusOrderSession = async ({ orderSession, action }) => {
  if (_.isEmpty(orderSession)) {
    return;
  }

  const channel = getShopChannel(orderSession.shopId);
  const event = {
    type: AppSyncEvent.CANCEL_PAYMENT,
    data: {
      action, // 'CANCEL'
      orderSessionId: orderSession.id,
      tableId: _.get(orderSession, 'tableIds.0'),
    },
  };
  await publishSingleAppSyncEvent({ channel, event });
  await _notifyUpdateOrderSessionForCustomer({ orderSession, action });
};

const notifyNewOrder = async ({ order, action }) => {
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
  notifyUpdateKitchen,
  notifyUpdateOrderSession,
  notifyNewOrder,
  notifyCancelPaidStatusOrderSession,
};
