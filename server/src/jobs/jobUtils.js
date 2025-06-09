const logger = require('../config/logger');
const config = require('../config/config');
const { processJob } = require('./job.service');
const jobQueue = require('./job.queue');

const _sendJobMessage = async ({ messageBody }) => {
  if (config.env !== 'production') return false;

  try {
    await jobQueue.add('process-job', messageBody);
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
  registerJob,
};
