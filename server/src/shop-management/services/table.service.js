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
const { getOperatorFromSession } = require('../../middlewares/clsHooked');

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

  const operator = getOperatorFromSession();
  await notifyUpdateTable({ table, action: EventActionType.CREATE, userId: _.get(operator, 'user.id') });
  return table;
};

const updateTable = async ({ shopId, tableId, updateBody }) => {
  const tables = await getTablesFromCache({
    shopId,
  });
  throwBadRequest(
    _.find(
      tables,
      (table) =>
        _.toLower(table.name) === _.toLower(updateBody.name) &&
        table.positionId === updateBody.position &&
        table.id !== tableId
    ),
    getMessageByLocale({ key: 'table.alreadyExist' })
  );

  if (updateBody.position) {
    // eslint-disable-next-line no-param-reassign
    updateBody.positionId = updateBody.position;
    // eslint-disable-next-line no-param-reassign
    delete updateBody.position;
  }
  const table = await Table.update({
    data: updateBody,
    where: {
      id: tableId,
      shopId,
    },
    include: { position: true },
  });
  throwBadRequest(!table, getMessageByLocale({ key: 'table.notFound' }));

  const operator = getOperatorFromSession();
  await notifyUpdateTable({ table, action: EventActionType.UPDATE, userId: _.get(operator, 'user.id') });
  return table;
};

const deleteTable = async ({ shopId, tableId }) => {
  const table = await Table.update({
    data: { status: Status.disabled },
    where: { id: tableId, shopId },
    include: { position: true },
  });
  throwBadRequest(!table, getMessageByLocale({ key: 'table.notFound' }));

  const operator = getOperatorFromSession();
  await notifyUpdateTable({
    table,
    action: EventActionType.DELETE,
    userId: _.get(operator, 'user.id'),
  });
  return table;
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

  const operator = getOperatorFromSession();
  await notifyUpdateTablePosition({ tablePosition, action: EventActionType.CREATE, userId: _.get(operator, 'user.id') });
  return tablePosition;
};

const updateTablePosition = async ({ shopId, tablePositionId, updateBody }) => {
  const tablePostions = await getTablePositionsFromCache({ shopId });
  throwBadRequest(
    _.find(
      tablePostions,
      (tablePosition) => _.toLower(tablePosition.name) === _.toLower(updateBody.name) && tablePosition.id !== tablePositionId
    ),
    getMessageByLocale({ key: 'tablePosition.alreadyExist' })
  );
  if (updateBody.dishCategories) {
    const dishCategoryIds = updateBody.dishCategories;
    // eslint-disable-next-line no-param-reassign
    delete updateBody.dishCategories;
    // eslint-disable-next-line no-param-reassign
    updateBody.dishCategoryIds = dishCategoryIds;
  }
  const tablePosition = await TablePosition.update({
    data: _.pickBy({
      ...updateBody,
      shopId,
    }),
    where: {
      id: tablePositionId,
      shopId,
    },
  });
  throwBadRequest(!tablePosition, getMessageByLocale({ key: 'tablePosition.notFound' }));

  const operator = getOperatorFromSession();
  await notifyUpdateTablePosition({ tablePosition, action: EventActionType.UPDATE, userId: _.get(operator, 'user.id') });
  return tablePosition;
};

const deleteTablePosition = async ({ shopId, tablePositionId }) => {
  const tablePosition = await TablePosition.update({
    data: { status: Status.disabled },
    where: { id: tablePositionId, shopId },
  });
  throwBadRequest(!tablePosition, getMessageByLocale({ key: 'tablePosition.notFound' }));

  const operator = getOperatorFromSession();
  await notifyUpdateTablePosition({
    tablePosition,
    userId: _.get(operator, 'user.id'),
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
