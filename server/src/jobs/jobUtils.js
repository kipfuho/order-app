const logger = require('../config/logger');
const config = require('../config/config');
const { processJob } = require('./job.service');
const jobQueue = require('./job.queue');

const _sendJobToBullMQ = async (jobData) => {
  if (config.env !== 'production') return false;

  try {
    await jobQueue.add('process-job', jobData);
    logger.info(`Sent job to BullMQ queue: ${config.jobKey}`);
    return true;
  } catch (err) {
    logger.error(`Error sending job to BullMQ queue. ${err.stack}`);
    return false;
  }
};

/**
 *
 * @param {*} jobData
 * @returns
 */
const registerJob = async (jobData) => {
  try {
    logger.info(`registerJob: ${JSON.stringify(jobData)}`);
    const canSend = await _sendJobToBullMQ(jobData);
    if (!canSend) {
      processJob(jobData);
    }
  } catch (err) {
    logger.error(`error registerJob. ${err}`);
  }
};

module.exports = {
  registerJob,
};
