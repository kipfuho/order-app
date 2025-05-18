const _ = require('lodash');
const redisClient = require('../utils/redis');
const { getSession, setSession } = require('../middlewares/clsHooked');
const { Shop } = require('../models');
const { getShopKey } = require('./common');
const constant = require('../utils/constant');

const _getShopFromClsHook = ({ key }) => {
  const shop = getSession({ key });
  return shop;
};

const getShopFromCache = async ({ shopId }) => {
  const key = getShopKey({ shopId });
  const clsHookShop = _getShopFromClsHook({ key });
  if (!_.isEmpty(clsHookShop)) {
    return clsHookShop;
  }

  if (redisClient.isRedisConnected()) {
    const shopCache = await redisClient.getJson(key);
    if (!_.isEmpty(shopCache)) {
      setSession({ key, value: shopCache });
      return shopCache;
    }

    const shop = await Shop.findFirst({
      where: {
        id: shopId,
        status: constant.Status.enabled,
      },
    });
    redisClient.putJson({ key, jsonVal: shop });
    setSession({ key, value: shop });
    return shop;
  }

  const shop = await Shop.findFirst({
    where: {
      id: shopId,
      status: constant.Status.enabled,
    },
  });
  setSession({ key, value: shop });
  return shop;
};

module.exports = {
  getShopFromCache,
};
