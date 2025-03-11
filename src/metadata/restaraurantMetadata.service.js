const _ = require('lodash');
const redisClient = require('../utils/redis');
const { getSession, setSession } = require('../middlewares/clsHooked');
const { Restaurant } = require('../models');
const { getRestaurantKey } = require('./common');
const constant = require('../utils/constant');

const _getRestaurantFromClsHook = ({ key }) => {
  const restaurant = getSession({ key });
  return restaurant;
};

const getRestaurantFromCache = async ({ restaurantId }) => {
  const key = getRestaurantKey({ restaurantId });
  const clsHookRestaurant = _getRestaurantFromClsHook({ key });
  if (!_.isEmpty(clsHookRestaurant)) {
    return clsHookRestaurant;
  }

  if (redisClient.isRedisConnected()) {
    const restaurant = await redisClient.getJson(key);
    if (!_.isEmpty(restaurant)) {
      setSession({ key, value: restaurant });
      return restaurant;
    }

    const restaurantModel = await Restaurant.find({ _id: restaurantId, status: constant.Status.enabled });
    const restaurantJson = restaurantModel.toJSON();
    redisClient.putJson({ key, jsonVal: restaurantJson });
    setSession({ key, value: restaurantJson });
    return restaurantJson;
  }

  const restaurant = await Restaurant.find({ _id: restaurantId, status: constant.Status.enabled });
  const restaurantJson = restaurant.toJSON();
  setSession({ key, value: restaurantJson });
  return restaurantJson;
};

module.exports = {
  getRestaurantFromCache,
};
