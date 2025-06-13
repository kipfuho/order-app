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
const { Status } = require('../../utils/constant');

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

const createTable = async ({ shopId, createBody }) => {
  const tables = await getTablesFromCache({
    shopId,
  });
  throwBadRequest(
    _.find(
      tables,
      (table) => _.toLower(table.name) === _.toLower(createBody.name) && table.positionId === createBody.position
    ),
    getMessageByLocale({ key: 'table.alreadyExist' })
  );
  throwBadRequest(
    _.find(tables, (table) => _.toLower(table.code) === _.toLower(createBody.code)),
    getMessageByLocale({ key: 'code.duplicated' })
  );

  // eslint-disable-next-line no-param-reassign
  createBody.positionId = createBody.position;
  // eslint-disable-next-line no-param-reassign
  delete createBody.position;
  const table = await Table.create({
    data: {
      ...createBody,
      shopId,
    },
    include: {
      position: true,
    },
  });

  await notifyUpdateTable({ action: EventActionType.CREATE, shopId, table });
  return table;
};

const updateTable = async ({ shopId, tableId, updateBody }) => {
  const table = await getTableFromCache({ shopId, tableId });
  throwBadRequest(!table, getMessageByLocale({ key: 'table.notFound' }));
  const tables = await getTablesFromCache({
    shopId,
  });
  throwBadRequest(
    _.find(
      tables,
      (t) => _.toLower(t.name) === _.toLower(updateBody.name) && t.positionId === updateBody.position && t.id !== tableId
    ),
    getMessageByLocale({ key: 'table.alreadyExist' })
  );
  throwBadRequest(
    _.find(tables, (t) => _.toLower(t.code) === _.toLower(updateBody.code) && t.id !== tableId),
    getMessageByLocale({ key: 'code.duplicated' })
  );

  const compactUpdateBody = _.pickBy({ ...updateBody, position: null, positionId: updateBody.position });
  await Table.update({
    data: compactUpdateBody,
    where: {
      id: tableId,
      shopId,
    },
    select: { id: true },
  });

  const modifiedFields = { id: tableId };
  Object.entries(compactUpdateBody).forEach(([key, value]) => {
    if (!_.isEqual(value, table[key])) {
      modifiedFields[key] = value;
    }
  });

  if (!_.isEmpty(modifiedFields.positionId)) {
    const newPosition = await getTablePositionFromCache({ shopId, tablePositionId: modifiedFields.positionId });
    modifiedFields.position = newPosition;
    delete modifiedFields.positionId;
  }

  await notifyUpdateTable({
    action: EventActionType.UPDATE,
    shopId,
    table: modifiedFields,
  });
};

const deleteTable = async ({ shopId, tableId }) => {
  const table = await getTableFromCache({ shopId, tableId });
  throwBadRequest(!table, getMessageByLocale({ key: 'table.notFound' }));

  await Table.update({
    data: { status: Status.disabled },
    where: { id: tableId, shopId },
    select: { id: true },
  });

  await notifyUpdateTable({
    action: EventActionType.DELETE,
    shopId,
    table: { id: tableId },
  });
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

const createTablePosition = async ({ shopId, createBody }) => {
  const tablePostions = await getTablePositionsFromCache({ shopId });
  throwBadRequest(
    _.find(tablePostions, (tablePosition) => _.toLower(tablePosition.name) === _.toLower(createBody.name)),
    getMessageByLocale({ key: 'tablePosition.alreadyExist' })
  );
  throwBadRequest(
    _.find(tablePostions, (tablePosition) => _.toLower(tablePosition.code) === _.toLower(createBody.code)),
    getMessageByLocale({ key: 'code.duplicated' })
  );
  const dishCategoryIds = createBody.dishCategories;
  // eslint-disable-next-line no-param-reassign
  delete createBody.dishCategories;
  // eslint-disable-next-line no-param-reassign
  createBody.dishCategoryIds = dishCategoryIds;
  const tablePosition = await TablePosition.create({
    data: _.pickBy({
      ...createBody,
      shopId,
    }),
  });

  await notifyUpdateTablePosition({
    action: EventActionType.CREATE,
    shopId,
    tablePosition,
  });
  return tablePosition;
};

const updateTablePosition = async ({ shopId, tablePositionId, updateBody }) => {
  const tablePosition = await getTablePositionFromCache({ shopId, tablePositionId });
  throwBadRequest(!tablePosition, getMessageByLocale({ key: 'tablePosition.notFound' }));
  const tablePostions = await getTablePositionsFromCache({ shopId });
  throwBadRequest(
    _.find(tablePostions, (tp) => _.toLower(tp.name) === _.toLower(updateBody.name) && tp.id !== tablePositionId),
    getMessageByLocale({ key: 'tablePosition.alreadyExist' })
  );
  throwBadRequest(
    _.find(tablePostions, (tp) => _.toLower(tp.code) === _.toLower(updateBody.code) && tp.id !== tablePositionId),
    getMessageByLocale({ key: 'code.duplicated' })
  );

  const compactUpdateBody = _.pickBy({
    ...updateBody,
    shopId,
    dishCategories: null,
    dishCategoryIds: updateBody.dishCategories,
  });
  await TablePosition.update({
    data: compactUpdateBody,
    where: {
      id: tablePositionId,
      shopId,
    },
    select: { id: true },
  });

  const modifiedFields = { id: tablePositionId };
  Object.entries(compactUpdateBody).forEach(([key, value]) => {
    if (!_.isEqual(value, tablePosition[key])) {
      modifiedFields[key] = value;
    }
  });

  await notifyUpdateTablePosition({
    action: EventActionType.UPDATE,
    shopId,
    tablePosition: modifiedFields,
  });
};

const deleteTablePosition = async ({ shopId, tablePositionId }) => {
  const tablePosition = await getTablePositionFromCache({ shopId, tablePositionId });
  throwBadRequest(!tablePosition, getMessageByLocale({ key: 'tablePosition.notFound' }));

  await TablePosition.update({
    data: { status: Status.disabled },
    where: { id: tablePositionId, shopId },
    select: { id: true },
  });

  await notifyUpdateTablePosition({
    action: EventActionType.DELETE,
    shopId,
    tablePosition: { id: tablePositionId },
  });
  return tablePosition;
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
