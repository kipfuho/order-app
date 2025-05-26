const _ = require('lodash');
const logger = require('../config/logger');
const config = require('../config/config');
const { receiveJobMessage } = require('./jobUtils');
const common = require('../utils/common');
const { processJob } = require('./job.service');
const { runInAsyncContext, hasActiveContext, getCurrentStore } = require('../middlewares/clsHooked');
const { prisma } = require('../utils/prisma');

// initial setup
let retry = 0;
let runningJob = false;
let isAllowReceiveJob = true;
// end initial setup

const fetchJobAndExecute = async () => {
  // neu co mot job nao do dang chay thi ko chay job nay
  if (runningJob) {
    return;
  }
  let jobDataString;
  try {
    runningJob = true;

    const sqsData = await receiveJobMessage(config.jobKey);
    if (!_.get(sqsData, 'Messages.0.Body')) {
      await common.sleep(500); // add backoff delay if no job
      return;
    }
    jobDataString = _.get(sqsData, 'Messages.0.Body');
    const jobPayload = JSON.parse(jobDataString);
    logger.debug(`fetched job...${jobDataString}`);

    await runInAsyncContext(
      async () => {
        await processJob(jobPayload);
      },
      {
        jobId: jobPayload.id || 'unknown',
        jobType: jobPayload.type || 'unknown',
        startTime: Date.now(),
      }
    );
  } catch (err) {
    logger.error(`error process job. ${jobDataString}. ${err.stack}`);
  } finally {
    runningJob = false;
  }
};

const runningTask = async () => {
  try {
    if (runningJob) {
      return;
    }

    await fetchJobAndExecute();
  } catch (err) {
    const errorMessage = `error running job. ${err.stack}`;
    logger.error(errorMessage);
  } finally {
    if (isAllowReceiveJob) {
      setImmediate(runningTask);
    }
  }
};

prisma.$connect().then(() => {
  logger.info('Connected to PostgreSQL');
  runningTask();
});

setInterval(() => {
  const mem = process.memoryUsage();

  logger.info(
    `Heap status - Used: ${(mem.heapUsed / 1024 / 1024).toFixed(2)} MB / Total: ${(mem.heapTotal / 1024 / 1024).toFixed(
      2
    )} MB | RSS: ${(mem.rss / 1024 / 1024).toFixed(2)} MB | External: ${(mem.external / 1024 / 1024).toFixed(
      2
    )} MB | AsyncLocalStorage: ${JSON.stringify({
      hasActiveContext: hasActiveContext(),
      currentStore: getCurrentStore() ? Object.keys(getCurrentStore()).length : 0,
    })}`
  );
}, 10000);

const beforeExit = async (signal) => {
  logger.info('before exit');
  isAllowReceiveJob = false;
  logger.info(`${signal} received`);
  // doi toi da 1 tieng
  while (retry < 12 * 60) {
    if (!runningJob) {
      break;
    }
    logger.info(`retry = ${retry}`);
    retry += 1;
    // eslint-disable-next-line no-await-in-loop
    await common.sleep(5000);
    logger.info(`runningJob = ${runningJob}`);
  }
  logger.info(`process exit. isAllowReceiveJob = ${isAllowReceiveJob}, runningJob = ${runningJob}`);
  process.exit(0);
};

process.on('SIGTERM', () => beforeExit('SIGTERM'));
process.on('SIGINT', () => beforeExit('SIGINT'));
