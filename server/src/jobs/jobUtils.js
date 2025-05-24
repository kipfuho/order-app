const redis = require('../utils/redis');
const logger = require('../config/logger');
const config = require('../config/config');
const { processJob } = require('./job.service');

const _sendJobMessage = async ({ messageBody }) => {
  if (config.env !== 'production') {
    logger.debug(messageBody);
    return;
  }

  try {
    logger.info(`send Job to redis queue ${config.jobKey}`);
    await redis.pushToQueue({ key: config.jobKey, val: messageBody });
  } catch (err) {
    const message = `error when send job to redis queue. ${config.jobKey} = ${err.stack}`;
    logger.error(message);
  }
};

const receiveJobMessage = async (jobKey) => {
  try {
    const result = await redis.popFromQueue({ key: jobKey });
    if (result) {
      logger.info(`Get message Job from redis queue ${jobKey}`);
      return { Messages: [{ Body: result }] };
    }
  } catch (err) {
    const message = `error when get job from redis queeu. ${jobKey} = ${err.stack}`;
    logger.error(message);
  }
};

const _registerJob = async (jobData) => {
  try {
    const jobMessage = JSON.stringify(jobData);
    logger.info(`registerJob: ${jobMessage}`);
    const canSend = await _sendJobMessage({ messageBody: jobMessage });
    if (!canSend) {
      processJob(jobData);
    }
  } catch (err) {
    logger.error(`error registerJob. ${err}`);
  }
};

/**
 *
 * @param {*} jobData
 * @returns
 */
const registerJob = async (jobData, delay = 1000) => {
  if (config.env === 'test') {
    await _registerJob(jobData);
    return;
  }
  setTimeout(() => _registerJob(jobData), delay);
};

module.exports = {
  receiveJobMessage,
  registerJob,
};
