const _ = require('lodash');
const redisClient = require('../utils/redis');
const { getSession, setSession } = require('../middlewares/clsHooked');
const { Kitchen } = require('../models');
const { getKitchenKey } = require('./common');
const constant = require('../utils/constant');

const _getKitchensFromClsHook = ({ key }) => {
  const kitchens = getSession({ key });
  return kitchens;
};

const getKitchenFromCache = async ({ shopId, kitchenId }) => {
  // eslint-disable-next-line no-param-reassign
  kitchenId = _.toString(kitchenId);
  if (!kitchenId) {
    return;
  }

  const key = getKitchenKey({ shopId });
  const clsHookKitchens = _getKitchensFromClsHook({ key });
  if (!_.isEmpty(clsHookKitchens)) {
    return _.find(clsHookKitchens, (kitchen) => kitchen.id === kitchenId);
  }

  if (redisClient.isRedisConnected()) {
    const kitchensCache = await redisClient.getJson(key);
    if (!_.isEmpty(kitchensCache)) {
      setSession({ key, value: kitchensCache });
      return _.find(kitchensCache, (kitchen) => kitchen.id === kitchenId);
    }
  }

  const kitchen = await Kitchen.findFirst({
    where: {
      id: kitchenId,
      shopId,
    },
  });
  return kitchen;
};

const getKitchensFromCache = async ({ shopId }) => {
  const key = getKitchenKey({ shopId });
  const clsHookKitchens = _getKitchensFromClsHook({ key });
  if (!_.isEmpty(clsHookKitchens)) {
    return clsHookKitchens;
  }

  if (redisClient.isRedisConnected()) {
    const kitchensCache = await redisClient.getJson(key);
    if (!_.isEmpty(kitchensCache)) {
      setSession({ key, value: kitchensCache });
      return kitchensCache;
    }

    const kitchens = await Kitchen.findMany({
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
    redisClient.putJson({ key, jsonVal: kitchens });
    setSession({ key, value: kitchens });
    return kitchens;
  }

  const kitchens = await Kitchen.findMany({
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
  setSession({ key, value: kitchens });
  return kitchens;
};

module.exports = {
  getKitchenFromCache,
  getKitchensFromCache,
};
