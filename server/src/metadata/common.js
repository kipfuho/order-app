const redisClient = require('../utils/redis');

const getShopKey = ({ shopId }) => `shop_${shopId}`;
const getTableKey = ({ shopId }) => `table_${shopId}`;
const getTablePositionKey = ({ shopId }) => `tablePosition_${shopId}`;
const getEmployeeKey = ({ shopId }) => `employee_${shopId}`;
const getEmployeePositionKey = ({ shopId }) => `employeePosition_${shopId}`;
const getDepartmentKey = ({ shopId }) => `department_${shopId}`;
const getMenuKey = ({ shopId }) => `menu_${shopId}`;

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

module.exports = {
  getShopKey,
  getDepartmentKey,
  getEmployeeKey,
  getEmployeePositionKey,
  getTableKey,
  getTablePositionKey,
  getMenuKey,
  deleteShopCache,
  deleteDepartmentCache,
  deleteEmployeeCache,
  deleteEmployeePositionCache,
  deleteTableCache,
  deleteTablePositionCache,
  deleteMenuCache,
};
