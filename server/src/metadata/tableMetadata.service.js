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

  const table = await Table.findOne({ _id: tableId, shop: shopId }).populate('position');
  if (!table) {
    return null;
  }
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

    const tableModels = await Table.find({ shop: shopId, status: constant.Status.enabled }).populate('position');
    const tableJsons = _.map(tableModels, (table) => table.toJSON());
    redisClient.putJson({ key, jsonVal: tableJsons });
    setSession({ key, value: tableJsons });
    return tableJsons;
  }

  const tables = await Table.find({ shop: shopId, status: constant.Status.enabled }).populate('position');
  const tableJsons = _.map(tables, (table) => table.toJSON());
  setSession({ key, value: tableJsons });
  return tableJsons;
};

const getTablePositionFromCache = async ({ shopId, tablePositionId }) => {
  if (!tablePositionId) {
    return;
  }

  const key = getTablePositionKey({ shopId });
  const clsHookTablePositions = _getTablePositionsFromClsHook({ key });
  if (!_.isEmpty(clsHookTablePositions)) {
    return _.find(clsHookTablePositions, (tablePosition) => tablePosition.id === tablePositionId);
  }

  if (redisClient.isRedisConnected()) {
    const tablePositions = await redisClient.getJson(key);
    if (!_.isEmpty(tablePositions)) {
      setSession({ key, value: tablePositions });
      return _.find(tablePositions, (tablePosition) => tablePosition.id === tablePositionId);
    }
  }

  const tablePosition = await TablePosition.findOne({ _id: tablePositionId, shop: shopId });
  if (!tablePosition) {
    return null;
  }
  return tablePosition.toJSON();
};

const getTablePositionsFromCache = async ({ shopId }) => {
  const key = getTablePositionKey({ shopId });
  const clsHookTablePositions = _getTablePositionsFromClsHook({ key });
  if (!_.isEmpty(clsHookTablePositions)) {
    return clsHookTablePositions;
  }

  if (redisClient.isRedisConnected()) {
    const tablePositions = await redisClient.getJson(key);
    if (!_.isEmpty(tablePositions)) {
      setSession({ key, value: tablePositions });
      return tablePositions;
    }

    const tablePositionModels = await TablePosition.find({ shop: shopId, status: constant.Status.enabled });
    const tablePositionJsons = _.map(tablePositionModels, (tablePosition) => tablePosition.toJSON());
    redisClient.putJson({ key, jsonVal: tablePositionJsons });
    setSession({ key, value: tablePositionJsons });
    return tablePositionJsons;
  }

  const tablePositions = await TablePosition.find({ shop: shopId, status: constant.Status.enabled });
  const tablePositionJsons = _.map(tablePositions, (tablePosition) => tablePosition.toJSON());
  setSession({ key, value: tablePositionJsons });
  return tablePositionJsons;
};

module.exports = {
  getTableFromCache,
  getTablesFromCache,
  getTablePositionFromCache,
  getTablePositionsFromCache,
};
