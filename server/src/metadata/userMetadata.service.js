const _ = require('lodash');
const redisClient = require('../utils/redis');
const { getSession, setSession } = require('../middlewares/clsHooked');
const { User } = require('../models');
const { getUserKey } = require('./common');
const constant = require('../utils/constant');

const _getUserFromClsHook = ({ key }) => {
  const user = getSession({ key });
  return user;
};

const getUserModelFromDatabase = async ({ userId, email, phone }) => {
  if (userId) {
    const user = await User.findFirst({
      where: {
        id: userId,
        status: constant.Status.enabled,
      },
    });
    return user;
  }
  if (!email && !phone) return null;

  const user = await User.findFirst({
    where: {
      OR: _.compact([email ? { email } : null, phone ? { phone } : null]),
      status: constant.Status.enabled,
    },
  });
  return user;
};

const getUserFromDatabase = async ({ userId, email, phone }) => {
  const user = await getUserModelFromDatabase({ userId, email, phone });
  return user;
};

const getUserFromCache = async ({ userId }) => {
  const key = getUserKey({ userId });
  const clsHookUser = _getUserFromClsHook({ key });
  if (!_.isEmpty(clsHookUser)) {
    return clsHookUser;
  }

  if (redisClient.isRedisConnected()) {
    const userCache = await redisClient.getJson(key);
    if (!_.isEmpty(userCache)) {
      setSession({ key, value: userCache });
      return userCache;
    }
  }

  const user = await getUserFromDatabase({ userId });
  return user;
};

module.exports = {
  getUserModelFromDatabase,
  getUserFromDatabase,
  getUserFromCache,
};
