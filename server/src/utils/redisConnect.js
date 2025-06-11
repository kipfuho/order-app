const IORedis = require('ioredis');
const { redisHost, redisPort, env } = require('../config/config');
const logger = require('../config/logger');

let client = null;

let connected = false;
const _setupRedis = async () => {
  if (env === 'test') {
    logger.info('Mock redis');
    // eslint-disable-next-line global-require
    const MockIORedis = require('ioredis-mock');
    client = new MockIORedis();
    connected = true;
    return;
  }

  if (redisHost && redisPort) {
    client = new IORedis(`redis://${redisHost}:${redisPort}`, {
      maxRetriesPerRequest: null,
      reconnectOnError: (err) => {
        logger.warn(`Redis reconnect due to error: ${err.message}`);
        return true;
      },
    });

    client.on('error', (err) => {
      logger.error(`Error connecting to Redis: ${err.stack}`);
      connected = false;
    });

    client.on('ready', () => {
      logger.info('Connected to Redis and ready.');
      connected = true;
    });
  } else {
    logger.info('Redis host/port not provided. Skipping Redis connection.');
  }
};

_setupRedis();

const isRedisConnected = () => {
  return connected;
};

module.exports = {
  get client() {
    return client;
  },
  isRedisConnected,
};
