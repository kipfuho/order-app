const redisClient = require('../utils/redis');

const getRestaurantKey = ({ restaurantId }) => `restaurant_${restaurantId}`;
const getTableKey = ({ restaurantId }) => `table_${restaurantId}`;
const getTablePositionKey = ({ restaurantId }) => `tablePosition_${restaurantId}`;
const getEmployeeKey = ({ restaurantId }) => `employee_${restaurantId}`;
const getEmployeePositionKey = ({ restaurantId }) => `employeePosition_${restaurantId}`;
const getDepartmentKey = ({ restaurantId }) => `department_${restaurantId}`;
const getMenuKey = ({ restaurantId }) => `menu_${restaurantId}`;

const deleteRestaurantCache = async ({ restaurantId }) => {
  if (redisClient.isRedisConnected()) {
    redisClient.deleteKey(getRestaurantKey({ restaurantId }));
  }
};

const deleteTableCache = async ({ restaurantId }) => {
  if (redisClient.isRedisConnected()) {
    redisClient.deleteKey(getTableKey({ restaurantId }));
  }
};

const deleteTablePositionCache = async ({ restaurantId }) => {
  if (redisClient.isRedisConnected()) {
    redisClient.deleteKey(getTablePositionKey({ restaurantId }));
  }
};

const deleteEmployeeCache = async ({ restaurantId }) => {
  if (redisClient.isRedisConnected()) {
    redisClient.deleteKey(getEmployeeKey({ restaurantId }));
  }
};

const deleteEmployeePositionCache = async ({ restaurantId }) => {
  if (redisClient.isRedisConnected()) {
    redisClient.deleteKey(getEmployeePositionKey({ restaurantId }));
  }
};

const deleteDepartmentCache = async ({ restaurantId }) => {
  if (redisClient.isRedisConnected()) {
    redisClient.deleteKey(getDepartmentKey({ restaurantId }));
  }
};

const deleteMenuCache = async ({ restaurantId }) => {
  if (redisClient.isRedisConnected()) {
    redisClient.deleteKey(getMenuKey({ restaurantId }));
  }
};

module.exports = {
  getRestaurantKey,
  getDepartmentKey,
  getEmployeeKey,
  getEmployeePositionKey,
  getTableKey,
  getTablePositionKey,
  getMenuKey,
  deleteRestaurantCache,
  deleteDepartmentCache,
  deleteEmployeeCache,
  deleteEmployeePositionCache,
  deleteTableCache,
  deleteTablePositionCache,
  deleteMenuCache,
};
