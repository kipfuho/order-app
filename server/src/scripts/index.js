const _ = require('lodash');
const { Order, OrderSession, S3Log } = require('../models');
const { DishOrderStatus } = require('../utils/constant');
const { deleteObjectFromS3 } = require('../utils/aws');
const logger = require('../config/logger');

const auditOrders = async () => {
  const allOrders = await Order.find();
  const allOrderSession = await OrderSession.find();
  const orderSessionById = _.keyBy(allOrderSession, 'id');
  allOrders.forEach((order) => {
    order.dishOrders.forEach((dishOrder, index) => {
      // eslint-disable-next-line no-param-reassign
      dishOrder.status = DishOrderStatus.confirmed;
      // eslint-disable-next-line no-param-reassign
      dishOrder.dishOrderNo = index + 1;
    });

    if (orderSessionById[order.orderSessionId]) {
      // eslint-disable-next-line no-param-reassign
      order.orderSessionStatus = orderSessionById[order.orderSessionId].status;
    }
  });

  await Order.bulkSave(allOrders);
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
