const _ = require('lodash');
const { env } = require('../config/config');
const logger = require('../config/logger');
const { client, isRedisConnected } = require('./redisConnect');

const _setKey = async ({ key, value }) => {
  await client.set(key, value);
  await client.expire(key, 12 * 60 * 60); // expire after 12h
};

const putJson = async ({ key, jsonVal }) => {
  try {
    // eslint-disable-next-line
    jsonVal.timestamp = Date.now();
    await _setKey({ key, value: JSON.stringify(jsonVal) });
  } catch (err) {
    const message = `error putting data to redis. ${err.stack}`;
    logger.error(message);
  }
};

const getJson = async (key) => {
  try {
    const jsonStr = await client.get(key);
    if (!jsonStr) {
      return null;
    }
    const result = JSON.parse(jsonStr);
    return result;
  } catch (err) {
    logger.error(`error getting data from redis. ${err.stack}`);
    return null;
  }
};

const getSingleValue = async (key) => {
  const jsonObj = await getJson(key);
  return _.get(jsonObj, 'val');
};

const putSingleValue = async (key, val) => {
  await putJson({ key, jsonVal: { val } });
};

const initSettingValue = async (key, val) => {
  const currentVal = await getSingleValue(key);
  if (!currentVal) {
    await putSingleValue(key, val);
  }
};
const deleteKey = async (key) => client.del(key);

const expireKey = async (key, seconds) => {
  if (!isRedisConnected()) {
    return;
  }
  await client.expire(key, seconds || 5 * 60);
};

const getCloudLock = async ({ key, periodInSecond }) => {
  if (!isRedisConnected() || env === 'test') {
    return true;
  }

  try {
    const currentDate = new Date().getTime();
    const currenDateStr = _.toString(currentDate);
    // dung setNX xem có lấy được khoá ko
    const result = await client.setNX(key, currenDateStr);
    if (!result) {
      return false;
    }
    return true;
  } catch (err) {
    const message = `error when apply lock for ${key}. ${err.stack}`;
    logger.error(message);
    return true;
  } finally {
    await client.expire(key, periodInSecond);
  }
};

const pushToQueue = async ({ key, val }) => {
  await client.lPush(key, [val]);
  if (_.includes(key, '_printer')) {
    await client.expire(key, 12 * 60 * 60);
  }
};

const popFromQueue = async ({ key }) => {
  const result = await client.lPop(key);
  return result;
};

// khong bao gio chay 2 slow job trong vong 2 phut
const canExecuteSlowJob = async () => {
  const currentTime = new Date().getTime();
  const slowJobKey = `${env}_slow_job`;
  let lastExecuteTime = await getSingleValue(slowJobKey);
  lastExecuteTime = (lastExecuteTime || 0) * 1;
  const diffTime = currentTime - lastExecuteTime;
  if (diffTime < 60 * 1000) {
    return false;
  }
  await putSingleValue(slowJobKey, currentTime.toString());
  await expireKey(slowJobKey, 60);
  return true;
};

module.exports = {
  putJson,
  getJson,
  initSettingValue,
  getSingleValue,
  putSingleValue,
  isRedisConnected,
  deleteKey,
  expireKey,
  pushToQueue,
  popFromQueue,
  getCloudLock,
  canExecuteSlowJob,
};
