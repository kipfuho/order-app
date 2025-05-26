const redis = require('../utils/redis');
const logger = require('../config/logger');
const config = require('../config/config');
const { processJob } = require('./job.service');

const _sendJobMessage = async ({ messageBody }) => {
  if (config.env !== 'production') {
    return false;
  }

  try {
    logger.info(`send Job to redis queue ${config.jobKey}`);
    await redis.pushToQueue({ key: config.jobKey, val: messageBody });
    return true;
  } catch (err) {
    const message = `error when send job to redis queue. ${config.jobKey} = ${err.stack}`;
    logger.error(message);
    return false;
  }
};

const receiveJobMessage = async (jobKey) => {
  try {
    const result = await redis.popFromQueue({ key: jobKey });
    if (result) {
      logger.info(`Get job message from redis queue ${jobKey}: ${result}`);
      return { Messages: [{ Body: result }] };
    }
  } catch (err) {
    const message = `error when get job from redis queue. ${jobKey} = ${err.stack}`;
    logger.error(message);
  }
};

/**
 *
 * @param {*} jobData
 * @returns
 */
const registerJob = async (jobData) => {
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

module.exports = {
  receiveJobMessage,
  registerJob,
};
