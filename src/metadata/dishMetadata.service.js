const _ = require('lodash');
const redisClient = require('../utils/redis');
const { getSession, setSession } = require('../middlewares/clsHooked');
const { Dish, DishCategory } = require('../models');
const { getMenuKey } = require('./common');
const constant = require('../utils/constant');

const _getDishesFromClsHook = ({ key }) => {
  const menuVal = getSession({ key });
  const dishes = _.get(menuVal, 'dishes');
  return dishes;
};

const _getDishCategoriesFromClsHook = ({ key }) => {
  const menuVal = getSession({ key });
  const categories = _.get(menuVal, 'categories');
  return categories;
};

const getDishFromCache = async ({ restaurantId, dishId }) => {
  if (!dishId) {
    return;
  }

  const key = getMenuKey({ restaurantId });
  const clsHookDishes = _getDishesFromClsHook({ key });
  if (!_.isEmpty(clsHookDishes)) {
    return _.find(clsHookDishes, (dish) => dish.id === dishId);
  }

  if (redisClient.isRedisConnected()) {
    const menuVal = await redisClient.getJson(key);
    const dishes = _.get(menuVal, 'dishes');
    if (!_.isEmpty(dishes)) {
      setSession({ key, value: menuVal });
      return _.find(dishes, (dish) => dish.id === dishId);
    }
  }

  const dish = await Dish.findById(dishId).populate('category');
  return dish.toJSON();
};

const getDishesFromCache = async ({ restaurantId }) => {
  const key = getMenuKey({ restaurantId });
  const clsHookDishes = _getDishesFromClsHook({ key });
  if (!_.isEmpty(clsHookDishes)) {
    return clsHookDishes;
  }

  if (redisClient.isRedisConnected()) {
    const menuVal = await redisClient.getJson(key);
    const dishes = _.get(menuVal, 'dishes');
    if (!_.isEmpty(dishes)) {
      setSession({ key, value: menuVal });
      return dishes;
    }

    const dishModels = await Dish.find({ restaurantId, status: constant.Status.enabled }).populate('category');
    const disheJsons = _.map(dishModels, (dish) => dish.toJSON());
    const newMenuVal = { ...menuVal, dishes: disheJsons };
    redisClient.putJson({ key, jsonVal: newMenuVal });
    setSession({ key, value: newMenuVal });
    return disheJsons;
  }

  const currentClsHookedValue = getSession({ key });
  const dishes = await Dish.find({ restaurantId, status: constant.Status.enabled }).populate('category');
  const disheJsons = _.map(dishes, (dish) => dish.toJSON());
  setSession({ key, value: { ...currentClsHookedValue, dishes: disheJsons } });
  return disheJsons;
};

const getDishCategoryFromCache = async ({ restaurantId, dishCategoryId }) => {
  if (!dishCategoryId) {
    return;
  }

  const key = getMenuKey({ restaurantId });
  const clsHookDishCategories = _getDishCategoriesFromClsHook({ key });
  if (!_.isEmpty(clsHookDishCategories)) {
    return _.find(clsHookDishCategories, (dishCategory) => dishCategory.id === dishCategoryId);
  }

  if (redisClient.isRedisConnected()) {
    const menuVal = await redisClient.getJson(key);
    const categories = _.get(menuVal, 'categories');
    if (!_.isEmpty(categories)) {
      setSession({ key, value: menuVal });
      return _.find(categories, (dishCategory) => dishCategory.id === dishCategoryId);
    }
  }

  const dishCategory = await DishCategory.findById(dishCategoryId);
  return dishCategory.toJSON();
};

const getDishCategoriesFromCache = async ({ restaurantId }) => {
  const key = getMenuKey({ restaurantId });
  const clsHookDishCategories = _getDishCategoriesFromClsHook({ key });
  if (!_.isEmpty(clsHookDishCategories)) {
    return clsHookDishCategories;
  }

  if (redisClient.isRedisConnected()) {
    const menuVal = await redisClient.getJson(key);
    const categories = _.get(menuVal, 'categories');
    if (!_.isEmpty(categories)) {
      setSession({ key, value: menuVal });
      return categories;
    }

    const dishCategoryModels = await DishCategory.find({ restaurantId, status: constant.Status.enabled });
    const dishCategoryJsons = _.map(dishCategoryModels, (dishCategory) => dishCategory.toJSON());
    const newMenuVal = { ...menuVal, categories: dishCategoryJsons };
    redisClient.putJson({ key, jsonVal: newMenuVal });
    setSession({ key, value: newMenuVal });
    return dishCategoryJsons;
  }

  const currentClsHookedValue = getSession({ key });
  const dishCategories = await DishCategory.find({ restaurantId, status: constant.Status.enabled });
  const dishCategoryJsons = _.map(dishCategories, (dish) => dish.toJSON());
  setSession({ key, value: { ...currentClsHookedValue, categories: dishCategoryJsons } });
  return dishCategoryJsons;
};

module.exports = {
  getDishFromCache,
  getDishesFromCache,
  getDishCategoryFromCache,
  getDishCategoriesFromCache,
};
