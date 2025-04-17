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
    const user = await User.findOne({ _id: userId, status: { $ne: constant.Status.disabled } });
    return user;
  }
  const filter = {
    $or: _.compact([email && { email }, phone && { phone }]),
    status: { $ne: constant.Status.disabled },
  };
  if (_.isEmpty(filter.$or)) return null;

  const user = await User.findOne(filter);
  return user;
};

const getUserFromDatabase = async ({ userId, email, phone }) => {
  const user = await getUserModelFromDatabase({ userId, email, phone });
  if (!user) {
    return null;
  }
  const userJson = user.toJSON();
  return userJson;
};

const getUserFromCache = async ({ userId }) => {
  const key = getUserKey({ userId });
  const clsHookUser = _getUserFromClsHook({ key });
  if (!_.isEmpty(clsHookUser)) {
    return clsHookUser;
  }

  if (redisClient.isRedisConnected()) {
    const user = await redisClient.getJson(key);
    if (!_.isEmpty(user)) {
      setSession({ key, value: user });
      return user;
    }
  }

  const userJson = await getUserFromDatabase({ userId });
  return userJson;
};

module.exports = {
  getUserModelFromDatabase,
  getUserFromDatabase,
  getUserFromCache,
};
