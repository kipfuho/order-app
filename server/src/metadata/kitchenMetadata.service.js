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
    const kitchens = await redisClient.getJson(key);
    if (!_.isEmpty(kitchens)) {
      setSession({ key, value: kitchens });
      return _.find(kitchens, (kitchen) => kitchen.id === kitchenId);
    }
  }

  const kitchen = await Kitchen.findOne({ _id: kitchenId, shop: shopId });
  if (!kitchen) {
    return null;
  }
  return kitchen.toJSON();
};

const getKitchensFromCache = async ({ shopId }) => {
  const key = getKitchenKey({ shopId });
  const clsHookKitchens = _getKitchensFromClsHook({ key });
  if (!_.isEmpty(clsHookKitchens)) {
    return clsHookKitchens;
  }

  if (redisClient.isRedisConnected()) {
    const kitchens = await redisClient.getJson(key);
    if (!_.isEmpty(kitchens)) {
      setSession({ key, value: kitchens });
      return kitchens;
    }

    const kitchenModels = await Kitchen.find({ shop: shopId, status: constant.Status.enabled });
    const kitchenJsons = _.map(kitchenModels, (kitchen) => kitchen.toJSON());
    redisClient.putJson({ key, jsonVal: kitchenJsons });
    setSession({ key, value: kitchenJsons });
    return kitchenJsons;
  }

  const kitchens = await Kitchen.find({ shop: shopId, status: constant.Status.enabled });
  const kitchenJsons = _.map(kitchens, (kitchen) => kitchen.toJSON());
  setSession({ key, value: kitchenJsons });
  return kitchenJsons;
};

module.exports = {
  getKitchenFromCache,
  getKitchensFromCache,
};
