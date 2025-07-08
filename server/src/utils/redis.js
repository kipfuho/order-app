const { env } = require('../config/config');
const logger = require('../config/logger');
const { client, isRedisConnected } = require('./redisConnect');

const _setKey = async ({ key, value }) => {
  if (!isRedisConnected()) return;
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
    if (!isRedisConnected()) return null;

    const jsonStr = await client.get(key);
    if (!jsonStr) return null;

    return JSON.parse(jsonStr);
  } catch (err) {
    logger.error(`Error getting data from Redis: ${err.stack}`);
    return null;
  }
};

const putValue = async ({ key, value }) => {
  try {
    await _setKey({ key, value: JSON.stringify({ value, timestamp: Date.now() }) });
  } catch (err) {
    const message = `error putting data to redis. ${err.stack}`;
    logger.error(message);
  }
};

const getValue = async (key) => {
  try {
    if (!isRedisConnected()) return null;

    const jsonStr = await client.get(key);
    if (!jsonStr) return null;

    const data = JSON.parse(jsonStr);
    return data.value;
  } catch (err) {
    logger.error(`Error getting data from Redis: ${err.stack}`);
    return null;
  }
};

const deleteKey = async (key) => {
  if (!isRedisConnected()) return;
  await client.del(key);
};

const expireKey = async (key, seconds = 5 * 60) => {
  if (!isRedisConnected()) return;
  await client.expire(key, seconds);
};

const getCloudLock = async ({ key, periodInSecond }) => {
  if (!isRedisConnected() || env === 'test') return true;

  try {
    const timestamp = `${Date.now()}`;
    const result = await client.setnx(key, timestamp);
    return !!result;
  } catch (err) {
    logger.error(`Error applying lock for ${key}: ${err.stack}`);
    return true; // Fail-open
  } finally {
    await expireKey(key, periodInSecond);
  }
};

const deleteKeysByPrefix = async (prefix) => {
  if (!isRedisConnected()) return 0;

  const pattern = `${prefix}*`;
  let cursor = '0';
  let totalDeleted = 0;

  do {
    // eslint-disable-next-line no-await-in-loop
    const reply = await client.scan(cursor, 'MATCH', pattern, 'COUNT', 100);
    const [newCursor, keys] = reply;
    cursor = newCursor;

    if (keys.length > 0) {
      // eslint-disable-next-line no-await-in-loop
      const deleted = await client.del(...keys);
      totalDeleted += deleted;
    }
  } while (cursor !== '0');

  logger.info(`Deleted ${totalDeleted} keys with prefix "${prefix}"`);
  return totalDeleted;
};

module.exports = {
  putJson,
  getJson,
  putValue,
  getValue,
  isRedisConnected,
  deleteKey,
  expireKey,
  getCloudLock,
  deleteKeysByPrefix,
};
