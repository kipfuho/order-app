const _ = require('lodash');
const redisClient = require('../utils/redis');
const { getSession, setSession } = require('../middlewares/clsHooked');
const { Table, TablePosition } = require('../models');
const { getTableKey, getTablePositionKey } = require('./common');
const constant = require('../utils/constant');

const _getTablesFromClsHook = ({ key }) => {
  const tables = getSession({ key });
  return tables;
};

const _getTablePositionsFromClsHook = ({ key }) => {
  const tablePositions = getSession({ key });
  return tablePositions;
};

const getTableFromCache = async ({ shopId, tableId }) => {
  // eslint-disable-next-line no-param-reassign
  tableId = _.toString(tableId);
  if (!tableId) {
    return;
  }

  const key = getTableKey({ shopId });
  const clsHookTables = _getTablesFromClsHook({ key });
  if (!_.isEmpty(clsHookTables)) {
    return _.find(clsHookTables, (table) => table.id === tableId);
  }

  if (redisClient.isRedisConnected()) {
    const tablesCache = await redisClient.getJson(key);
    if (!_.isEmpty(tablesCache)) {
      setSession({ key, value: tablesCache });
      return _.find(tablesCache, (table) => table.id === tableId);
    }
  }

  const table = await Table.findFirst({
    where: {
      id: tableId,
      shopId,
    },
    include: {
      position: true,
    },
  });
  return table;
};

const getTablesFromCache = async ({ shopId }) => {
  const key = getTableKey({ shopId });
  const clsHookTables = _getTablesFromClsHook({ key });
  if (!_.isEmpty(clsHookTables)) {
    return clsHookTables;
  }

  if (redisClient.isRedisConnected()) {
    const tablesCache = await redisClient.getJson(key);
    if (!_.isEmpty(tablesCache)) {
      setSession({ key, value: tablesCache });
      return tablesCache;
    }

    const tables = await Table.findMany({
      where: {
        shopId,
        status: constant.Status.enabled,
      },
      include: {
        position: true,
      },
      orderBy: [
        {
          createdAt: 'asc',
        },
        { id: 'asc' },
      ],
    });
    redisClient.putJson({ key, jsonVal: tables });
    setSession({ key, value: tables });
    return tables;
  }

  const tables = await Table.findMany({
    where: {
      shopId,
      status: constant.Status.enabled,
    },
    include: {
      position: true,
    },
    orderBy: [
      {
        createdAt: 'asc',
      },
      { id: 'asc' },
    ],
  });
  setSession({ key, value: tables });
  return tables;
};

const getTablePositionFromCache = async ({ shopId, tablePositionId }) => {
  // eslint-disable-next-line no-param-reassign
  tablePositionId = _.toString(tablePositionId);
  if (!tablePositionId) {
    return;
  }

  const key = getTablePositionKey({ shopId });
  const clsHookTablePositions = _getTablePositionsFromClsHook({ key });
  if (!_.isEmpty(clsHookTablePositions)) {
    return _.find(clsHookTablePositions, (tablePosition) => tablePosition.id === tablePositionId);
  }

  if (redisClient.isRedisConnected()) {
    const tablePositionsCache = await redisClient.getJson(key);
    if (!_.isEmpty(tablePositionsCache)) {
      setSession({ key, value: tablePositionsCache });
      return _.find(tablePositionsCache, (tablePosition) => tablePosition.id === tablePositionId);
    }
  }

  const tablePosition = await TablePosition.findFirst({
    where: {
      id: tablePositionId,
      shopId,
    },
  });
  return tablePosition;
};

const getTablePositionsFromCache = async ({ shopId }) => {
  const key = getTablePositionKey({ shopId });
  const clsHookTablePositions = _getTablePositionsFromClsHook({ key });
  if (!_.isEmpty(clsHookTablePositions)) {
    return clsHookTablePositions;
  }

  if (redisClient.isRedisConnected()) {
    const tablePositionsCache = await redisClient.getJson(key);
    if (!_.isEmpty(tablePositionsCache)) {
      setSession({ key, value: tablePositionsCache });
      return tablePositionsCache;
    }

    const tablePositions = await TablePosition.findMany({
      where: {
        shopId,
        status: constant.Status.enabled,
      },
      orderBy: [
        {
          createdAt: 'asc',
        },
        { id: 'asc' },
      ],
    });
    redisClient.putJson({ key, jsonVal: tablePositions });
    setSession({ key, value: tablePositions });
    return tablePositions;
  }

  const tablePositions = await TablePosition.findMany({
    where: {
      shopId,
      status: constant.Status.enabled,
    },
    orderBy: [
      {
        createdAt: 'asc',
      },
      { id: 'asc' },
    ],
  });
  setSession({ key, value: tablePositions });
  return tablePositions;
};

module.exports = {
  getTableFromCache,
  getTablesFromCache,
  getTablePositionFromCache,
  getTablePositionsFromCache,
};
