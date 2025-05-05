const _ = require('lodash');
const {
  getTablePositionFromCache,
  getTablePositionsFromCache,
  getTableFromCache,
  getTablesFromCache,
} = require('../../metadata/tableMetadata.service');
const { TablePosition, Table } = require('../../models');
const { throwBadRequest } = require('../../utils/errorHandling');
const { notifyUpdateTable, EventActionType, notifyUpdateTablePosition } = require('../../utils/awsUtils/appSync.utils');
const { getMessageByLocale } = require('../../locale');
const { getStringId } = require('../../utils/common');

const getTable = async ({ shopId, tableId }) => {
  const table = await getTableFromCache({
    shopId,
    tableId,
  });
  throwBadRequest(!table, getMessageByLocale({ key: 'table.notFound' }));
  return table;
};

const getTables = async ({ shopId }) => {
  const tables = await getTablesFromCache({
    shopId,
  });
  throwBadRequest(!tables, getMessageByLocale({ key: 'table.notFound' }));
  return tables;
};

const createTable = async ({ shopId, createBody, userId }) => {
  const tables = await getTablesFromCache({
    shopId,
  });
  throwBadRequest(
    _.find(
      tables,
      (table) =>
        _.toLower(table.name) === _.toLower(createBody.name) &&
        getStringId({ object: table, key: 'position' }) === createBody.position
    ),
    getMessageByLocale({ key: 'table.alreadyExist' })
  );

  const table = await Table.create({ ...createBody, shop: shopId });
  await table.populate('position');
  const tableJson = table.toJSON();
  notifyUpdateTable({ table: tableJson, action: EventActionType.CREATE, userId });
  return tableJson;
};

const updateTable = async ({ shopId, tableId, updateBody, userId }) => {
  const tables = await getTablesFromCache({
    shopId,
  });
  throwBadRequest(
    _.find(
      tables,
      (table) =>
        _.toLower(table.name) === _.toLower(updateBody.name) &&
        getStringId({ object: table, key: 'position' }) === updateBody.position &&
        table.id !== tableId
    ),
    getMessageByLocale({ key: 'table.alreadyExist' })
  );

  const table = await Table.findOneAndUpdate({ _id: tableId, shop: shopId }, { $set: { ...updateBody } }, { new: true });
  throwBadRequest(!table, getMessageByLocale({ key: 'table.notFound' }));

  await table.populate('position');
  const tableJson = table.toJSON();
  notifyUpdateTable({ table: tableJson, action: EventActionType.UPDATE, userId });
  return tableJson;
};

const deleteTable = async ({ shopId, tableId, userId }) => {
  const table = await Table.findOneAndDelete({ _id: tableId, shop: shopId });
  throwBadRequest(!table, getMessageByLocale({ key: 'table.notFound' }));

  await table.populate('position');
  const tableJson = table.toJSON();
  notifyUpdateTable({
    table: tableJson,
    action: EventActionType.DELETE,
    userId,
  });
  return tableJson;
};

const getTablePosition = async ({ shopId, tablePositionId }) => {
  const tablePosition = await getTablePositionFromCache({ shopId, tablePositionId });
  throwBadRequest(!tablePosition, getMessageByLocale({ key: 'tablePosition.notFound' }));
  return tablePosition;
};

const getTablePositions = async ({ shopId }) => {
  const tablePositions = await getTablePositionsFromCache({ shopId });
  throwBadRequest(!tablePositions, getMessageByLocale({ key: 'tablePosition.notFound' }));
  return tablePositions;
};

const createTablePosition = async ({ shopId, createBody, userId }) => {
  const tablePostions = await getTablePositionsFromCache({ shopId });
  throwBadRequest(
    _.find(tablePostions, (tablePosition) => _.toLower(tablePosition.name) === _.toLower(createBody.name)),
    getMessageByLocale({ key: 'tablePosition.alreadyExist' })
  );
  const tablePosition = await TablePosition.create({
    ...createBody,
    shop: shopId,
  });

  const tablePositionJson = tablePosition.toJSON();
  notifyUpdateTablePosition({ tablePosition: tablePositionJson, action: EventActionType.CREATE, userId });
  return tablePositionJson;
};

const updateTablePosition = async ({ shopId, tablePositionId, updateBody, userId }) => {
  const tablePostions = await getTablePositionsFromCache({ shopId });
  throwBadRequest(
    _.find(
      tablePostions,
      (tablePosition) => _.toLower(tablePosition.name) === _.toLower(updateBody.name) && tablePosition.id !== tablePositionId
    ),
    getMessageByLocale({ key: 'tablePosition.alreadyExist' })
  );
  const tablePosition = await TablePosition.findOneAndUpdate(
    { _id: tablePositionId, shop: shopId },
    { $set: { ...updateBody } },
    { new: true }
  );
  throwBadRequest(!tablePosition, getMessageByLocale({ key: 'tablePosition.notFound' }));

  const tablePositionJson = tablePosition.toJSON();
  notifyUpdateTablePosition({ tablePosition: tablePositionJson, action: EventActionType.UPDATE, userId });
  return tablePositionJson;
};

const deleteTablePosition = async ({ shopId, tablePositionId, userId }) => {
  const tablePosition = await TablePosition.findOneAndDelete({ _id: tablePositionId, shop: shopId });
  throwBadRequest(!tablePosition, getMessageByLocale({ key: 'tablePosition.notFound' }));

  const tablePositionJson = tablePosition.toJSON();
  notifyUpdateTablePosition({
    tablePosition: tablePositionJson,
    action: EventActionType.UPDATE,
    userId,
  });
  return tablePositionJson;
};

module.exports = {
  getTable,
  getTables,
  createTable,
  updateTable,
  deleteTable,
  getTablePosition,
  getTablePositions,
  createTablePosition,
  updateTablePosition,
  deleteTablePosition,
};
