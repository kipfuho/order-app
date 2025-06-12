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

const retryFailedJobs = async (batchSize = 10) => {
  const failedJobs = await jobQueue.getFailed();

  for (let i = 0; i < failedJobs.length; i += batchSize) {
    const batch = failedJobs.slice(i, i + batchSize);

    // eslint-disable-next-line no-await-in-loop
    const results = await Promise.allSettled(batch.map((job) => job.retry()));

    results.forEach((result, idx) => {
      if (result.status === 'rejected') {
        logger.error(`Retry failed for job ${batch[idx].id}:`, result.reason);
      }
    });
  }

  logger.info(`Retried ${failedJobs.length} failed jobs in batches.`);
};

module.exports = {
  registerJob,
  retryFailedJobs,
};
