const redisClient = require('../utils/redis');

const getShopKey = ({ shopId }) => `shop_${shopId}`;
const getTableKey = ({ shopId }) => `table_${shopId}`;
const getTablePositionKey = ({ shopId }) => `tablePosition_${shopId}`;
const getEmployeeKey = ({ shopId }) => `employee_${shopId}`;
const getEmployeeByUserIdKey = ({ shopId, userId }) => `employee_${userId}_${shopId}`;
const getEmployeePositionKey = ({ shopId }) => `employeePosition_${shopId}`;
const getDepartmentKey = ({ shopId }) => `department_${shopId}`;
const getMenuKey = ({ shopId }) => `menu_${shopId}`;
const getUnitKey = ({ shopId }) => `unit_${shopId}`;
const getUserKey = ({ userId }) => `user_${userId}`;

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

const deleteEmployeeByUserIdCache = async ({ userId, shopId }) => {
  if (redisClient.isRedisConnected()) {
    redisClient.deleteKey(getEmployeeByUserIdKey({ userId, shopId }));
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
};
