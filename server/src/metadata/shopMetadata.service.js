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
    const shop = await redisClient.getJson(key);
    if (!_.isEmpty(shop)) {
      setSession({ key, value: shop });
      return shop;
    }

    const shopModel = await Shop.findOne({ _id: shopId, status: constant.Status.enabled });
    const shopJson = shopModel.toJSON();
    redisClient.putJson({ key, jsonVal: shopJson });
    setSession({ key, value: shopJson });
    return shopJson;
  }

  const shop = await Shop.findOne({ _id: shopId, status: constant.Status.enabled });
  if (!shop) {
    return null;
  }
  const shopJson = shop.toJSON();
  setSession({ key, value: shopJson });
  return shopJson;
};

module.exports = {
  getShopFromCache,
};
