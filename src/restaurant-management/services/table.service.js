const { TablePosition, Table } = require('../../models');
const { throwBadRequest } = require('../../utils/errorHandling');

const getTable = async (tableId) => {
  const table = await Table.findById(tableId);
  throwBadRequest(!table, 'Không tìm thấy bàn');
  return table;
};

const createTable = async (createBody) => {
  const table = await Table.create(createBody);
  return table;
};

const updateTable = async (tableId, updateBody) => {
  const table = await Table.findByIdAndUpdate(tableId, { $set: updateBody }, { new: true });
  throwBadRequest(!table, 'Không tìm thấy bàn');
  return table;
};

const deleteTable = async (tableId) => {
  await Table.deleteOne({ _id: tableId });
};

const getTablePosition = async (tablePositionId) => {
  const tablePosition = await TablePosition.findById(tablePositionId);
  throwBadRequest(!tablePosition, 'Không tìm thấy vị trí bàn');
  return tablePosition;
};

const createTablePosition = async (createBody) => {
  const tablePosition = await TablePosition.create(createBody);
  return tablePosition;
};

const updateTablePosition = async (tablePositionId, updateBody) => {
  const tablePosition = await TablePosition.findByIdAndUpdate(tablePositionId, { $set: updateBody }, { new: true });
  throwBadRequest(!tablePosition, 'Không tìm thấy vị trí bàn');
  return tablePosition;
};

const deleteTablePosition = async (tablePositionId) => {
  await TablePosition.deleteOne({ _id: tablePositionId });
};

const getTablesPosition = async () => {};

module.exports = {
  getTable,
  createTable,
  updateTable,
  deleteTable,
  getTablePosition,
  createTablePosition,
  updateTablePosition,
  deleteTablePosition,
  getTablesPosition,
};
