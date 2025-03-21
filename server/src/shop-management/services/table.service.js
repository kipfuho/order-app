const _ = require('lodash');
const {
  getTablePositionFromCache,
  getTablePositionsFromCache,
  getTableFromCache,
  getTablesFromCache,
} = require('../../metadata/tableMetadata.service');
const { TablePosition, Table } = require('../../models');
const { throwBadRequest } = require('../../utils/errorHandling');

const getTable = async ({ shopId, tableId }) => {
  const table = await getTableFromCache({
    shopId,
    tableId,
  });
  throwBadRequest(!table, 'Không tìm thấy bàn');
  return table;
};

const getTables = async ({ shopId }) => {
  const tables = await getTablesFromCache({
    shopId,
  });
  throwBadRequest(!tables, 'Không tìm thấy bàn');
  return tables;
};

const createTable = async ({ shopId, createBody }) => {
  const tables = await getTablesFromCache({
    shopId,
  });
  throwBadRequest(
    _.find(tables, (table) => table.name === createBody.name && table.position === createBody.position),
    'Bàn đã tồn tại'
  );
  const table = await Table.create({ ...createBody, shop: shopId });
  return table;
};

const updateTable = async ({ shopId, tableId, updateBody }) => {
  const table = await Table.findOneAndUpdate({ _id: tableId, shop: shopId }, { $set: updateBody }, { new: true });
  throwBadRequest(!table, 'Không tìm thấy bàn');
  return table;
};

const deleteTable = async ({ shopId, tableId }) => {
  await Table.deleteOne({ _id: tableId, shop: shopId });
};

const getTablePosition = async ({ shopId, tablePositionId }) => {
  const tablePosition = await getTablePositionFromCache({ shopId, tablePositionId });
  throwBadRequest(!tablePosition, 'Không tìm thấy vị trí bàn');
  return tablePosition;
};

const getTablePositions = async ({ shopId }) => {
  const tablePositions = await getTablePositionsFromCache({ shopId });
  throwBadRequest(!tablePositions, 'Không tìm thấy vị trí bàn');
  return tablePositions;
};

const createTablePosition = async ({ shopId, createBody }) => {
  const tablePostions = await getTablePositionsFromCache({ shopId });
  throwBadRequest(
    _.find(tablePostions, (tablePosition) => tablePosition.name === createBody.name),
    'Khu vực đã tồn tại'
  );
  const tablePosition = await TablePosition.create({
    ...createBody,
    shop: shopId,
  });
  return tablePosition;
};

const updateTablePosition = async ({ shopId, tablePositionId, updateBody }) => {
  const tablePostions = await getTablePositionsFromCache({ shopId });
  throwBadRequest(
    _.find(tablePostions, (tablePosition) => tablePosition.name === updateBody.name && tablePosition.id !== tablePositionId),
    'Khu vực đã tồn tại'
  );
  const tablePosition = await TablePosition.findOneAndUpdate(
    { _id: tablePositionId, shop: shopId },
    { $set: updateBody },
    { new: true }
  );
  throwBadRequest(!tablePosition, 'Không tìm thấy vị trí bàn');
  return tablePosition;
};

const deleteTablePosition = async ({ shopId, tablePositionId }) => {
  await TablePosition.deleteOne({ _id: tablePositionId, shop: shopId });
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
