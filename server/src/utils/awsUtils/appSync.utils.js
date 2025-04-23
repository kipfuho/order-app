const _ = require('lodash');
const { publishSingleAppSyncEvent } = require('../aws');
const { getStringId, formatOrderSessionNo } = require('../common');

const namespace = 'default';

const getShopChannel = (shopId) => `${namespace}/shop/${shopId}`;
const getCustomerChannel = (customerId) => `${namespace}/customer/${customerId}`;

const AppSyncEvent = {
  SHOP_CHANGED: 'SHOP_CHANGED',
  TABLE_CHANGED: 'TABLE_CHANGED',
  TABLE_POSITION_CHANGED: 'TABLE_POSITION_CHANGED',
  DISH_CHANGED: 'DISH_CHANGED',
  DISH_CATEGORY_CHANGED: 'DISH_CATEGORY_CHANGED',
  EMPLOYEE_CHANGED: 'DISH_CATEGORY_CHANGED',
  EMPLOYEE_POSITION_CHANGED: 'DISH_CATEGORY_CHANGED',
  DEPARTMENT_CHANGED: 'DISH_CATEGORY_CHANGED',
  PAYMENT_COMPLETE: 'PAYMENT_COMPLETE',
  ORDER_SESSION_UPDATE: 'ORDER_SESSION_UPDATE',
};

// general action action for events
const EventActionType = {
  CREATE: 'CREATE',
  UPDATE: 'UPDATE',
  DELETE: 'DELETE',
};

const notifyOrderSessionPaymentForCustomer = async ({ orderSession }) => {
  const { customerInfo } = orderSession;
  if (!customerInfo || !customerInfo.customerId) {
    return;
  }

  const { customerId } = customerInfo;
  const channel = getCustomerChannel(customerId);
  const event = {
    type: AppSyncEvent.PAYMENT_COMPLETE,
    data: {
      orderSessionId: orderSession.id,
      tableId: orderSession.tableIds[0],
      billNo: formatOrderSessionNo(orderSession),
    },
  };
  return publishSingleAppSyncEvent({ channel, event });
};

const notifyOrderSessionPayment = async ({ orderSession }) => {
  if (_.isEmpty(orderSession)) {
    return;
  }

  const channel = getShopChannel(getStringId({ object: orderSession, key: 'shop' }));
  const event = {
    type: AppSyncEvent.PAYMENT_COMPLETE,
    data: {
      orderSessionId: orderSession.id,
      tableId: orderSession.tableIds[0],
    },
  };
  await publishSingleAppSyncEvent({ channel, event });
  await notifyOrderSessionPaymentForCustomer({ orderSession });
};

const notifyUpdateShop = async ({ action, shop }) => {
  if (_.isEmpty(shop)) {
    return;
  }

  const channel = getShopChannel(shop.id);
  const event = {
    type: AppSyncEvent.SHOP_CHANGED,
    data: {
      action, // 'CREATE', 'UPDATE', 'DELETE'
      shop,
    },
  };
  return publishSingleAppSyncEvent({ channel, event });
};

const notifyUpdateTable = async ({ action, table }) => {
  if (_.isEmpty(table)) {
    return;
  }

  const channel = getShopChannel(getStringId({ object: table, key: 'shop' }));
  const event = {
    type: AppSyncEvent.TABLE_CHANGED,
    data: {
      action, // 'CREATE', 'UPDATE', 'DELETE'
      table,
    },
  };
  return publishSingleAppSyncEvent({ channel, event });
};

const notifyUpdateTablePosition = async ({ action, tablePosition }) => {
  if (_.isEmpty(tablePosition)) {
    return;
  }

  const channel = getShopChannel(getStringId({ object: tablePosition, key: 'shop' }));
  const event = {
    type: AppSyncEvent.TABLE_POSITION_CHANGED,
    data: {
      action, // 'CREATE', 'UPDATE', 'DELETE'
      tablePosition,
    },
  };
  return publishSingleAppSyncEvent({ channel, event });
};

const notifyUpdateDish = async ({ action, dish }) => {
  if (_.isEmpty(dish)) {
    return;
  }

  const channel = getShopChannel(getStringId({ object: dish, key: 'shop' }));
  const event = {
    type: AppSyncEvent.DISH_CHANGED,
    data: {
      action, // 'CREATE', 'UPDATE', 'DELETE'
      dish,
    },
  };
  return publishSingleAppSyncEvent({ channel, event });
};

const notifyUpdateDishCategory = async ({ action, dishCategory }) => {
  if (_.isEmpty(dishCategory)) {
    return;
  }

  const channel = getShopChannel(getStringId({ object: dishCategory, key: 'shop' }));
  const event = {
    type: AppSyncEvent.DISH_CATEGORY_CHANGED,
    data: {
      action, // 'CREATE', 'UPDATE', 'DELETE'
      dishCategory,
    },
  };
  return publishSingleAppSyncEvent({ channel, event });
};

const notifyUpdateEmployee = async ({ action, employee }) => {
  if (_.isEmpty(employee)) {
    return;
  }

  const channel = getShopChannel(getStringId({ object: employee, key: 'shop' }));
  const event = {
    type: AppSyncEvent.EMPLOYEE_CHANGED,
    data: {
      action, // 'CREATE', 'UPDATE', 'DELETE'
      employee,
    },
  };
  return publishSingleAppSyncEvent({ channel, event });
};

const notifyUpdateEmployeePosition = async ({ action, employeePosition }) => {
  if (_.isEmpty(employeePosition)) {
    return;
  }

  const channel = getShopChannel(getStringId({ object: employeePosition, key: 'shop' }));
  const event = {
    type: AppSyncEvent.EMPLOYEE_POSITION_CHANGED,
    data: {
      action, // 'CREATE', 'UPDATE', 'DELETE'
      employeePosition,
    },
  };
  return publishSingleAppSyncEvent({ channel, event });
};

const notifyUpdateDepartment = async ({ action, department }) => {
  if (_.isEmpty(department)) {
    return;
  }

  const channel = getShopChannel(getStringId({ object: department, key: 'shop' }));
  const event = {
    type: AppSyncEvent.DEPARTMENT_CHANGED,
    data: {
      action, // 'CREATE', 'UPDATE', 'DELETE'
      department,
    },
  };
  return publishSingleAppSyncEvent({ channel, event });
};

const notifyUpdateOrderSession = async ({ orderSession }) => {
  if (_.isEmpty(orderSession)) {
    return;
  }

  const channel = getShopChannel(getStringId({ object: orderSession, key: 'shop' }));
  const event = {
    type: AppSyncEvent.ORDER_SESSION_UPDATE,
    data: {
      orderSessionId: orderSession.id,
      tableId: orderSession.tableIds[0],
    },
  };
  return publishSingleAppSyncEvent({ channel, event });
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
};
