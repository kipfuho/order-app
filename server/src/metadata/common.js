const redisClient = require('../utils/redis');

const getShopKey = ({ shopId }) => `shop_${shopId}`;
const getTableKey = ({ shopId }) => `table_${shopId}`;
const getTablePositionKey = ({ shopId }) => `tablePosition_${shopId}`;
const getEmployeeKey = ({ shopId }) => `employee_${shopId}`;
const getEmployeeByUserIdKey = ({ shopId, userId }) => `employee_${shopId}_${userId}`;
const getEmployeePositionKey = ({ shopId }) => `employeePosition_${shopId}`;
const getDepartmentKey = ({ shopId }) => `department_${shopId}`;
const getMenuKey = ({ shopId }) => `menu_${shopId}`;
const getUnitKey = ({ shopId }) => `unit_${shopId}`;
const getUserKey = ({ userId }) => `user_${userId}`;
const getCustomerKey = ({ customerId }) => `customer_${customerId}`;
const getKitchenKey = ({ shopId }) => `kitchen_${shopId}`;
const getTFIDFKey = ({ allDishes, shopId }) => `tfidf_${shopId}_${allDishes.map((d) => d.id).join('_')}`;
const getUpdateFullOrderSessionKey = ({ orderSessionId }) => `update_full_order_session_${orderSessionId}`;

const deleteShopCache = async ({ shopId }) => {
  if (redisClient.isRedisConnected()) {
    redisClient.deleteKey(getShopKey({ shopId }));
  }
};

const deleteTableCache = async ({ shopId }) => {
  if (redisClient.isRedisConnected()) {
    redisClient.deleteKey(getTableKey({ shopId }));
  }
};

const deleteTablePositionCache = async ({ shopId }) => {
  if (redisClient.isRedisConnected()) {
    redisClient.deleteKey(getTablePositionKey({ shopId }));
  }
};

const deleteEmployeeCache = async ({ shopId }) => {
  if (redisClient.isRedisConnected()) {
    redisClient.deleteKey(getEmployeeKey({ shopId }));
  }
};

const deleteEmployeeByUserIdCache = async ({ shopId }) => {
  if (redisClient.isRedisConnected()) {
    return redisClient.deleteKeysByPrefix(getEmployeeByUserIdKey({ userId: '', shopId }));
  }
};

const deleteEmployeePositionCache = async ({ shopId }) => {
  if (redisClient.isRedisConnected()) {
    redisClient.deleteKey(getEmployeePositionKey({ shopId }));
  }
};

const deleteDepartmentCache = async ({ shopId }) => {
  if (redisClient.isRedisConnected()) {
    redisClient.deleteKey(getDepartmentKey({ shopId }));
  }
};

const deleteMenuCache = async ({ shopId }) => {
  if (redisClient.isRedisConnected()) {
    redisClient.deleteKey(getMenuKey({ shopId }));
  }
};

const deleteUnitCache = async ({ shopId }) => {
  if (redisClient.isRedisConnected()) {
    redisClient.deleteKey(getUnitKey({ shopId }));
  }
};

const deleteUserCache = async ({ userId }) => {
  if (redisClient.isRedisConnected()) {
    redisClient.deleteKey(getUserKey({ userId }));
  }
};

const deleteCustomerCache = async ({ customerId }) => {
  if (redisClient.isRedisConnected()) {
    redisClient.deleteKey(getCustomerKey({ customerId }));
  }
};

const deleteKitchenCache = async ({ shopId }) => {
  if (redisClient.isRedisConnected()) {
    redisClient.deleteKey(getKitchenKey({ shopId }));
  }
};

const deleteTFIDFCache = async ({ shopId }) => {
  if (redisClient.isRedisConnected()) {
    return redisClient.deleteKeysByPrefix(getTFIDFKey({ allDishes: [], shopId }));
  }
};

module.exports = {
  getShopKey,
  getDepartmentKey,
  getEmployeeKey,
  getEmployeeByUserIdKey,
  getEmployeePositionKey,
  getTableKey,
  getTablePositionKey,
  getMenuKey,
  getUnitKey,
  getUserKey,
  getCustomerKey,
  getKitchenKey,
  getTFIDFKey,
  getUpdateFullOrderSessionKey,
  deleteShopCache,
  deleteDepartmentCache,
  deleteEmployeeCache,
  deleteEmployeeByUserIdCache,
  deleteEmployeePositionCache,
  deleteTableCache,
  deleteTablePositionCache,
  deleteMenuCache,
  deleteUnitCache,
  deleteUserCache,
  deleteCustomerCache,
  deleteKitchenCache,
  deleteTFIDFCache,
};
