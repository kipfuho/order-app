const mongoose = require('mongoose');
const _ = require('lodash');
const { getNamespace, createNamespace } = require('cls-hooked');
const logger = require('../config/logger');
const config = require('../config/config');
const { receiveJobMessage } = require('./jobUtils');
const { SESSION_NAME_SPACE } = require('../utils/constant');
const common = require('../utils/common');

// initial setup
let retry = 0;
let runningJob = false;
let isAllowReceiveJob = true;

let mongodbConnected = false;
mongoose.connect(config.mongoose.url, config.mongoose.options).then(() => {
  mongodbConnected = true;
  logger.info('Connected to MongoDB');
});

// end initial setup

const _processJob = async (jobPayload) => {};

const fetchJobAndExecute = async () => {
  // neu co mot job nao do dang chay thi ko chay job nay
  if (runningJob) {
    return;
  }
  let jobPayload;
  try {
    runningJob = true;
    if (!mongodbConnected) {
      logger.info('Waiting for mongodb connection. return');
      return;
    }

    const jobDataString = await receiveJobMessage(config.jobKey);
    if (_.isEmpty(jobDataString)) {
      return;
    }
    jobPayload = JSON.stringify(jobDataString);
    logger.debug(`fetched job...${jobPayload}`);
    await _processJob(jobPayload);
  } catch (err) {
    logger.error(`error process job. ${jobPayload}. ${err.stack}`);
  } finally {
    runningJob = false;
  }
};

const runningTask = async () => {
  try {
    if (runningJob) {
      return;
    }
    let clsSession;
    if (!getNamespace(SESSION_NAME_SPACE)) {
      clsSession = createNamespace(SESSION_NAME_SPACE);
    } else {
      clsSession = getNamespace(SESSION_NAME_SPACE);
    }
    clsSession.run(() => {
      fetchJobAndExecute();
    });
  } catch (err) {
    const errorMessage = `error running job. ${err.stack}`;
    logger.error(errorMessage);
  } finally {
    if (isAllowReceiveJob) {
      setTimeout(() => runningTask(), 1);
    }
  }
};

runningTask();

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
