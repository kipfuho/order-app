const _ = require('lodash');
const { Order, S3Log, Table } = require('../models');
const { deleteObjectFromS3 } = require('../utils/aws');
const logger = require('../config/logger');
const { bulkUpdate, PostgreSQLTable } = require('../utils/prisma');

const auditOrders = async () => {
  const allOrders = await Order.findMany();
  const tables = await Table.findMany();
  const tableById = _.keyBy(tables, 'id');

  const updateData = _.map(allOrders, (order) => ({
    id: order.id,
    tableName: _.get(tableById[order.tableId], 'name') || '',
  }));

  await bulkUpdate(PostgreSQLTable.Order, updateData);
};

const deleteUnusedS3 = async () => {
  const allS3Logs = await S3Log.findMany({
    where: {
      inUse: false,
      createdAt: {
        lte: new Date(Date.now() - 86400000), // 1 day before
      },
    },
    select: {
      key: true,
    },
  });

  const allKeys = allS3Logs.map((log) => log.key);
  let currentIdx = 0;
  const batchSize = 1000;
  while (currentIdx < allKeys.length) {
    const batchKeys = allKeys.slice(currentIdx, Math.min(currentIdx + batchSize, allKeys.length));
    // eslint-disable-next-line no-await-in-loop
    await Promise.all(batchKeys.map((key) => deleteObjectFromS3(key, true)));
    currentIdx += batchSize;
    logger.info(`delete items: ${batchKeys}`);
  }
  await S3Log.deleteMany({
    where: {
      key: {
        in: allKeys,
      },
    },
  });

  logger.info(`delete ${allKeys.length} items`);
};

module.exports = {
  auditOrders,
  deleteUnusedS3,
};
