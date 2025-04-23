const { publishSingleAppSyncEvent } = require('../aws');
const { getStringId } = require('../common');

const namespace = 'default';

const getShopChannel = (shopId) => {
  if (shopId) {
    return `${namespace}/shop/${shopId}`;
  }
  return `${namespace}/shop`;
};
const getTableChannel = (tableId) => `${namespace}/table/${tableId}`;
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

// general action type for events
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
    event: AppSyncEvent.PAYMENT_COMPLETE,
    data: {
      orderSessionId: orderSession.id,
    },
  };
  return publishSingleAppSyncEvent({ channel, event });
};

const notifyOrderSessionPayment = async ({ orderSession }) => {
  const { shopId } = orderSession;
  const channel = getTableChannel(shopId);
  const event = {
    event: AppSyncEvent.PAYMENT_COMPLETE,
    data: {
      orderSessionId: orderSession.id,
    },
  };
  await publishSingleAppSyncEvent({ channel, event });
  await notifyOrderSessionPaymentForCustomer({ orderSession });
};

const notifyUpdateShop = async ({ type, shop }) => {
  const channel = getShopChannel();
  const event = {
    event: AppSyncEvent.SHOP_CHANGED,
    data: {
      type, // 'CREATE', 'UPDATE', 'DELETE'
      shop,
    },
  };
  return publishSingleAppSyncEvent({ channel, event });
};

const notifyUpdateTable = async ({ type, table }) => {
  const channel = getShopChannel(getStringId({ object: table, key: 'shop' }));
  const event = {
    event: AppSyncEvent.TABLE_CHANGED,
    data: {
      type, // 'CREATE', 'UPDATE', 'DELETE'
      table,
    },
  };
  return publishSingleAppSyncEvent({ channel, event });
};

const notifyUpdateTablePosition = async ({ type, tablePosition }) => {
  const channel = getShopChannel(getStringId({ object: tablePosition, key: 'shop' }));
  const event = {
    event: AppSyncEvent.TABLE_POSITION_CHANGED,
    data: {
      type, // 'CREATE', 'UPDATE', 'DELETE'
      tablePosition,
    },
  };
  return publishSingleAppSyncEvent({ channel, event });
};

const notifyUpdateDish = async ({ type, dish }) => {
  const channel = getShopChannel(getStringId({ object: dish, key: 'shop' }));
  const event = {
    event: AppSyncEvent.DISH_CHANGED,
    data: {
      type, // 'CREATE', 'UPDATE', 'DELETE'
      dish,
    },
  };
  return publishSingleAppSyncEvent({ channel, event });
};

const notifyUpdateDishCategory = async ({ type, dishCategory }) => {
  const channel = getShopChannel(getStringId({ object: dishCategory, key: 'shop' }));
  const event = {
    event: AppSyncEvent.DISH_CATEGORY_CHANGED,
    data: {
      type, // 'CREATE', 'UPDATE', 'DELETE'
      dishCategory,
    },
  };
  return publishSingleAppSyncEvent({ channel, event });
};

const notifyUpdateEmployee = async ({ type, employee }) => {
  const channel = getShopChannel(getStringId({ object: employee, key: 'shop' }));
  const event = {
    event: AppSyncEvent.EMPLOYEE_CHANGED,
    data: {
      type, // 'CREATE', 'UPDATE', 'DELETE'
      employee,
    },
  };
  return publishSingleAppSyncEvent({ channel, event });
};

const notifyUpdateEmployeePosition = async ({ type, employeePosition }) => {
  const channel = getShopChannel(getStringId({ object: employeePosition, key: 'shop' }));
  const event = {
    event: AppSyncEvent.EMPLOYEE_POSITION_CHANGED,
    data: {
      type, // 'CREATE', 'UPDATE', 'DELETE'
      employeePosition,
    },
  };
  return publishSingleAppSyncEvent({ channel, event });
};

const notifyUpdateDepartment = async ({ type, department }) => {
  const channel = getShopChannel(getStringId({ object: department, key: 'shop' }));
  const event = {
    event: AppSyncEvent.DEPARTMENT_CHANGED,
    data: {
      type, // 'CREATE', 'UPDATE', 'DELETE'
      department,
    },
  };
  return publishSingleAppSyncEvent({ channel, event });
};

const notifyUpdateOrderSession = async ({ type, table, orderSession }) => {
  const channel = getTableChannel(getStringId({ object: table, key: 'shop' }));
  const event = {
    event: AppSyncEvent.ORDER_SESSION_UPDATE,
    data: {
      type, // 'CREATE', 'UPDATE', 'DELETE'
      orderSession,
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
