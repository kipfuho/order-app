const { Queue } = require('bullmq');
const config = require('../config/config');
const { ioRedisConnection } = require('../utils/redisConnect');

const jobQueue = new Queue(config.jobKey, {
  connection: ioRedisConnection,
  defaultJobOptions: {
    attempts: 5,
    backoff: {
      type: 'exponential',
      delay: 5000,
    },
    removeOnComplete: true,
    removeOnFail: false,
  },
});

module.exports = jobQueue;
