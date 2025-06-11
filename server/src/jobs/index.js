const { Worker } = require('bullmq');
const { processJob } = require('./job.service');
const { runInAsyncContext } = require('../middlewares/clsHooked');
const logger = require('../config/logger');
const config = require('../config/config');
const { hasActiveContext, getCurrentStore } = require('../middlewares/clsHooked');
const { client } = require('../utils/redisConnect');
const { prisma } = require('../utils/prisma');

let worker = null;

prisma.$connect().then(() => {
  logger.info('Connected to PostgreSQL');
  worker = new Worker(
    config.jobKey,
    async (job) => {
      logger.log(`Received job: ${JSON.stringify(job.data)}`);

      await runInAsyncContext(
        async () => {
          await processJob(job.data);
        },
        {
          jobId: job.id || 'unknown',
          jobType: job.data.type || 'unknown',
          startTime: Date.now(),
        }
      );
    },
    {
      connection: client,
      concurrency: 1,
    }
  );

  worker.on('completed', (job) => {
    logger.debug(`Job ${job.id} completed`);
  });

  worker.on('failed', (job, err) => {
    logger.error(`Job ${job.id} failed. Error: ${err.stack}`);
  });

  worker.on('error', (err) => {
    logger.error(`Worker error: ${err.stack}`);
  });
});

// Graceful shutdown
const beforeExit = async (signal) => {
  logger.info(`Signal ${signal} received. Cleaning up...`);
  if (worker) {
    await worker.close(); // Stop processing new jobs
  }
  logger.info('Worker closed. Exiting process.');
  process.exit(0);
};

setInterval(() => {
  const mem = process.memoryUsage();
  logger.info(
    `Heap Used: ${(mem.heapUsed / 1024 / 1024).toFixed(2)} MB | Store Keys: ${
      getCurrentStore() ? Object.keys(getCurrentStore()).length : 0
    } | Context Active: ${hasActiveContext()}`
  );
}, 10000);

process.on('SIGINT', () => beforeExit('SIGINT'));
process.on('SIGTERM', () => beforeExit('SIGTERM'));
