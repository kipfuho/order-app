const redis = require('redis');
const { redisHost, redisPort, env } = require('../config/config');
const logger = require('../config/logger');

let client = null;

let connected = false;
const _setupRedis = async () => {
  if (env === 'test') {
    logger.info('Mock redis');
    // eslint-disable-next-line
    const MockRedis = require('redis-mock');
    client = MockRedis.createClient();
    connected = true;
    return;
  }
  if (redisHost && redisPort) {
    logger.info(`connect to redis://${redisHost}:${redisPort}...`);
    // use production configuration: https://redis.io/docs/latest/develop/clients/nodejs/produsage/
    client = redis.createClient({
      url: `redis://${redisHost}:${redisPort}`,
      socket: {
        reconnectStrategy: (retries) => {
          if (retries > 20) {
            return new Error('Too many retries for redis connection');
          }
          return retries * 500;
        },
        connectTimeout: 10000, // timeout after 10s
      },
    });
    client.on('error', function (err) {
      const message = `error connectting redis. ${err.stack}`;
      logger.error(message);
      connected = false;
    });
    client.on('ready', () => {
      logger.info('connected to redis and ready');
      connected = true;
    });
    client.connect().then(() => logger.info('start connect to redis'));
  } else {
    logger.info('Not connect to redis...');
  }
};

_setupRedis();

const isRedisConnected = () => {
  return connected;
};

module.exports = {
  client,
  isRedisConnected,
};
