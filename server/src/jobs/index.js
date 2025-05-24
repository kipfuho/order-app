const mongoose = require('mongoose');
const _ = require('lodash');
const { getNamespace, createNamespace } = require('cls-hooked');
const logger = require('../config/logger');
const config = require('../config/config');
const { receiveJobMessage } = require('./jobUtils');
const { SESSION_NAME_SPACE } = require('../utils/constant');
const common = require('../utils/common');
const { processJob } = require('./job.service');
const { bindMongooseToCLS } = require('../middlewares/clsHooked');

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
  let jobPayload;
  try {
    runningJob = true;

    const jobDataString = await receiveJobMessage(config.jobKey);
    if (_.isEmpty(jobDataString)) {
      return;
    }
    jobPayload = JSON.parse(jobDataString);
    logger.debug(`fetched job...${jobPayload}`);
    await processJob(jobPayload);
  } catch (err) {
    logger.error(`error process job. ${jobPayload}. ${err.stack}`);
  } finally {
    runningJob = false;
  }
};

let clsSession = getNamespace(SESSION_NAME_SPACE);
if (!clsSession) {
  clsSession = createNamespace(SESSION_NAME_SPACE);
}
bindMongooseToCLS(clsSession);

const runningTask = async () => {
  try {
    if (runningJob) {
      return;
    }

    clsSession.run(() => {
      fetchJobAndExecute();
    });
  } catch (err) {
    const errorMessage = `error running job. ${err.stack}`;
    logger.error(errorMessage);
  } finally {
    if (isAllowReceiveJob) {
      setImmediate(runningTask);
    }
  }
};

mongoose.connect(config.mongoose.url, config.mongoose.options).then(() => {
  logger.info('Connected to MongoDB');
  runningTask();
});

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
    logger.info(`runingJob = ${runningJob}`);
  }
  logger.info(`process exit. isAllowReceiveJob = ${isAllowReceiveJob}, runningJob = ${runningJob}`);
  process.exit(0);
};

process.on('SIGTERM', () => beforeExit('SIGTERM'));
process.on('SIGINT', () => beforeExit('SIGINT'));
