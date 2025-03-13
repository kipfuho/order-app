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
  if (!tableId) {
    return;
  }

  const key = getTableKey({ shopId });
  const clsHookTables = _getTablesFromClsHook({ key });
  if (!_.isEmpty(clsHookTables)) {
    return _.find(clsHookTables, (table) => table.id === tableId);
  }

  if (redisClient.isRedisConnected()) {
    const tables = await redisClient.getJson(key);
    if (!_.isEmpty(tables)) {
      setSession({ key, value: tables });
      return _.find(tables, (table) => table.id === tableId);
    }
  }

  const table = await Table.findById(tableId).populate('position');
  return table.toJSON();
};

const getTablesFromCache = async ({ shopId }) => {
  const key = getTableKey({ shopId });
  const clsHookTables = _getTablesFromClsHook({ key });
  if (!_.isEmpty(clsHookTables)) {
    return clsHookTables;
  }

  if (redisClient.isRedisConnected()) {
    const tables = await redisClient.getJson(key);
    if (!_.isEmpty(tables)) {
      setSession({ key, value: tables });
      return tables;
    }

    const tableModels = await Table.find({ shopId, status: constant.Status.enabled }).populate('position');
    const tableJsons = _.map(tableModels, (table) => table.toJSON());
    redisClient.putJson({ key, jsonVal: tableJsons });
    setSession({ key, value: tableJsons });
    return tableJsons;
  }

  const tables = await Table.find({ shopId, status: constant.Status.enabled }).populate('position');
  const tableJsons = _.map(tables, (table) => table.toJSON());
  setSession({ key, value: tableJsons });
  return tableJsons;
};

const getTablePositionFromCache = async ({ shopId, tablePostionId }) => {
  if (!tablePostionId) {
    return;
  }

  const key = getTablePositionKey({ shopId });
  const clsHookTablePositions = _getTablePositionsFromClsHook({ key });
  if (!_.isEmpty(clsHookTablePositions)) {
    return _.find(clsHookTablePositions, (tablePostion) => tablePostion.id === tablePostionId);
  }

  if (redisClient.isRedisConnected()) {
    const tablePostions = await redisClient.getJson(key);
    if (!_.isEmpty(tablePostions)) {
      setSession({ key, value: tablePostions });
      return _.find(tablePostions, (tablePostion) => tablePostion.id === tablePostionId);
    }
  }

  const tablePostion = await TablePosition.findById(tablePostionId).populate('category');
  return tablePostion.toJSON();
};

const getTablePositionsFromCache = async ({ shopId }) => {
  const key = getTablePositionKey({ shopId });
  const clsHookTablePositions = _getTablePositionsFromClsHook({ key });
  if (!_.isEmpty(clsHookTablePositions)) {
    return clsHookTablePositions;
  }

  if (redisClient.isRedisConnected()) {
    const tablePostions = await redisClient.getJson(key);
    if (!_.isEmpty(tablePostions)) {
      setSession({ key, value: tablePostions });
      return tablePostions;
    }

    const tablePostionModels = await TablePosition.find({ shopId, status: constant.Status.enabled })
      .populate('dishCategories')
      .populate('tables');
    const tablePostionJsons = _.map(tablePostionModels, (tablePostion) => tablePostion.toJSON());
    redisClient.putJson({ key, jsonVal: tablePostionJsons });
    setSession({ key, value: tablePostionJsons });
    return tablePostionJsons;
  }

  const tablePostions = await TablePosition.find({ shopId, status: constant.Status.enabled })
    .populate('dishCategories')
    .populate('tables');
  const tablePostionJsons = _.map(tablePostions, (tablePostion) => tablePostion.toJSON());
  setSession({ key, value: tablePostionJsons });
  return tablePostionJsons;
};

module.exports = {
  getTableFromCache,
  getTablesFromCache,
  getTablePositionFromCache,
  getTablePositionsFromCache,
};
