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

const getDishFromCache = async ({ shopId, dishId }) => {
  // eslint-disable-next-line no-param-reassign
  dishId = _.toString(dishId);
  if (!dishId) {
    return;
  }

  const key = getMenuKey({ shopId });
  const clsHookDishes = _getDishesFromClsHook({ key });
  if (!_.isEmpty(clsHookDishes)) {
    return _.find(clsHookDishes, (dish) => dish.id === dishId);
  }

  if (redisClient.isRedisConnected()) {
    const menuVal = await redisClient.getJson(key);
    const dishesCache = _.get(menuVal, 'dishes');
    if (!_.isEmpty(dishesCache)) {
      setSession({ key, value: menuVal });
      return _.find(dishesCache, (dish) => dish.id === dishId);
    }
  }

  const dish = await Dish.findFirst({
    where: {
      id: dishId,
      shopId,
      status: {
        not: constant.Status.disabled,
      },
    },
    include: {
      category: true,
      unit: true,
    },
  });
  return dish;
};

const getDishesFromCache = async ({ shopId }) => {
  const key = getMenuKey({ shopId });
  const clsHookDishes = _getDishesFromClsHook({ key });
  if (!_.isEmpty(clsHookDishes)) {
    return clsHookDishes;
  }

  if (redisClient.isRedisConnected()) {
    const menuVal = await redisClient.getJson(key);
    const dishesCache = _.get(menuVal, 'dishes');
    if (!_.isEmpty(dishesCache)) {
      setSession({ key, value: menuVal });
      return dishesCache;
    }

    const dishes = await Dish.findMany({
      where: { shopId, status: { not: constant.Status.disabled } },
      include: {
        category: true,
        unit: true,
      },
      orderBy: [
        {
          createdAt: 'asc',
        },
        { id: 'asc' },
      ],
    });
    const newMenuVal = { ...menuVal, dishes };
    redisClient.putJson({ key, jsonVal: newMenuVal });
    setSession({ key, value: newMenuVal });
    return dishes;
  }

  const currentClsHookedValue = getSession({ key });
  const dishes = await Dish.findMany({
    where: {
      shopId,
      status: { not: constant.Status.disabled },
    },
    include: {
      category: true,
      unit: true,
    },
    orderBy: [
      {
        createdAt: 'asc',
      },
      { id: 'asc' },
    ],
  });
  setSession({ key, value: { ...currentClsHookedValue, dishes } });
  return dishes;
};

const getDishCategoryFromCache = async ({ shopId, dishCategoryId }) => {
  // eslint-disable-next-line no-param-reassign
  dishCategoryId = _.toString(dishCategoryId);
  if (!dishCategoryId) {
    return;
  }

  const key = getMenuKey({ shopId });
  const clsHookDishCategories = _getDishCategoriesFromClsHook({ key });
  if (!_.isEmpty(clsHookDishCategories)) {
    return _.find(clsHookDishCategories, (dishCategory) => dishCategory.id === dishCategoryId);
  }

  if (redisClient.isRedisConnected()) {
    const menuVal = await redisClient.getJson(key);
    const categoriesCache = _.get(menuVal, 'categories');
    if (!_.isEmpty(categoriesCache)) {
      setSession({ key, value: menuVal });
      return _.find(categoriesCache, (dishCategory) => dishCategory.id === dishCategoryId);
    }
  }

  const dishCategory = await DishCategory.findFirst({
    where: {
      id: dishCategoryId,
      shopId,
      status: constant.Status.enabled,
    },
  });
  return dishCategory;
};

const getDishCategoriesFromCache = async ({ shopId }) => {
  const key = getMenuKey({ shopId });
  const clsHookDishCategories = _getDishCategoriesFromClsHook({ key });
  if (!_.isEmpty(clsHookDishCategories)) {
    return clsHookDishCategories;
  }

  if (redisClient.isRedisConnected()) {
    const menuVal = await redisClient.getJson(key);
    const categoriesCache = _.get(menuVal, 'categories');
    if (!_.isEmpty(categoriesCache)) {
      setSession({ key, value: menuVal });
      return categoriesCache;
    }

    const dishCategories = await DishCategory.findMany({
      where: {
        shopId,
        status: constant.Status.enabled,
      },
      orderBy: [
        {
          createdAt: 'asc',
        },
        { id: 'asc' },
      ],
    });
    const newMenuVal = { ...menuVal, categories: dishCategories };
    redisClient.putJson({ key, jsonVal: newMenuVal });
    setSession({ key, value: newMenuVal });
    return dishCategories;
  }

  const currentClsHookedValue = getSession({ key });
  const dishCategories = await DishCategory.findMany({
    where: {
      shopId,
      status: constant.Status.enabled,
    },
    orderBy: [
      {
        createdAt: 'asc',
      },
      { id: 'asc' },
    ],
  });
  setSession({ key, value: { ...currentClsHookedValue, categories: dishCategories } });
  return dishCategories;
};

module.exports = {
  getDishFromCache,
  getDishesFromCache,
  getDishCategoryFromCache,
  getDishCategoriesFromCache,
};
