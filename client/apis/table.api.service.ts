import _ from "lodash";
import { Table, TablePosition } from "../stores/state.interface";
import { apiRequest } from "./api.service";
import { getAccessToken } from "./utils.service";
import store from "../stores/store";
import { updateAllTablePositions, updateAllTables } from "../stores/userSlice";

const getTablePositionsRequest = async ({
  shopId,
  rtk = false,
}: {
  shopId: string;
  rtk?: boolean;
}) => {
  const accessToken = await getAccessToken();

  const result: {
    tablePositions: TablePosition[];
  } = await apiRequest({
    method: "GET",
    endpoint: `/v1/shops/${shopId}/tablePositions`,
    token: accessToken,
  });

  if (!rtk) {
    store.dispatch(updateAllTablePositions(result.tablePositions));
  }

  return result.tablePositions;
};

const createTablePositionRequest = async ({
  shopId,
  name,
  categories,
  rtk = false,
}: {
  shopId: string;
  name: string;
  categories: string[];
  rtk?: boolean;
}) => {
  const accessToken = await getAccessToken();
  const body: {
    name: string;
    dishCategories?: string[];
  } = { name };

  if (categories) {
    body.dishCategories = _.map(categories, "id");
  }

  const result: { tablePosition: TablePosition } = await apiRequest({
    method: "POST",
    endpoint: `/v1/shops/${shopId}/tablePositions`,
    token: accessToken,
    data: body,
  });

  if (!rtk) {
    const state = store.getState();
    store.dispatch(
      updateAllTablePositions([
        ...state.shop.tablePositions,
        result.tablePosition,
      ])
    );
  }

  return result.tablePosition;
};

const updateTablePositionRequest = async ({
  tablePositionId,
  shopId,
  name,
  categories,
  rtk = false,
}: {
  tablePositionId: string;
  shopId: string;
  name: string;
  categories: string[];
  rtk?: boolean;
}) => {
  const accessToken = await getAccessToken();
  const body: {
    name: string;
    dishCategories?: string[];
  } = { name };

  if (categories) {
    body.dishCategories = categories;
  }

  const result: { tablePosition: TablePosition } = await apiRequest({
    method: "PATCH",
    endpoint: `/v1/shops/${shopId}/tablePositions/${tablePositionId}`,
    token: accessToken,
    data: body,
  });

  if (!rtk) {
    const state = store.getState();
    store.dispatch(
      updateAllTablePositions([
        ..._.filter(
          state.shop.tablePositions,
          (tablePosition) => tablePosition.id !== tablePositionId
        ),
        result.tablePosition,
      ])
    );
  }

  return result.tablePosition;
};

const deleteTablePositionRequest = async ({
  tablePositionId,
  shopId,
  rtk = false,
}: {
  tablePositionId: string;
  shopId: string;
  rtk?: boolean;
}) => {
  const accessToken = await getAccessToken();

  const result: { tablePosition: TablePosition } = await apiRequest({
    method: "DELETE",
    endpoint: `/v1/shops/${shopId}/tablePositions/${tablePositionId}`,
    token: accessToken,
  });

  if (!rtk) {
    const state = store.getState();
    store.dispatch(
      updateAllTablePositions(
        _.filter(
          state.shop.tablePositions,
          (tablePosition) => tablePosition.id !== tablePositionId
        )
      )
    );
  }

  return result.tablePosition;
};

const getTablesRequest = async ({
  shopId,
  rtk = false,
}: {
  shopId: string;
  rtk?: boolean;
}) => {
  const accessToken = await getAccessToken();

  const result: {
    tables: Table[];
  } = await apiRequest({
    method: "GET",
    endpoint: `/v1/shops/${shopId}/tables`,
    token: accessToken,
  });

  if (!rtk) {
    store.dispatch(updateAllTables(result.tables));
  }

  return result.tables;
};

const createTableRequest = async ({
  shopId,
  name,
  tablePosition,
  rtk = false,
}: {
  shopId: string;
  name: string;
  tablePosition: TablePosition;
  rtk?: boolean;
}) => {
  const accessToken = await getAccessToken();
  const body: {
    name: string;
    position: string;
  } = { name, position: tablePosition.id };

  const result: { table: Table } = await apiRequest({
    method: "POST",
    endpoint: `/v1/shops/${shopId}/tables`,
    token: accessToken,
    data: body,
  });

  if (!rtk) {
    const state = store.getState();
    store.dispatch(updateAllTables([...state.shop.tables, result.table]));
  }

  return result.table;
};

const updateTableRequest = async ({
  tableId,
  shopId,
  name,
  tablePosition,
  rtk = false,
}: {
  tableId: string;
  shopId: string;
  name: string;
  tablePosition: TablePosition;
  rtk?: boolean;
}) => {
  const accessToken = await getAccessToken();
  const body: {
    name: string;
    position: string;
  } = { name, position: tablePosition.id };

  const result: { table: Table } = await apiRequest({
    method: "PATCH",
    endpoint: `/v1/shops/${shopId}/tables/${tableId}`,
    token: accessToken,
    data: body,
  });

  if (!rtk) {
    const state = store.getState();
    store.dispatch(
      updateAllTables([
        ..._.filter(state.shop.tables, (table) => table.id !== tableId),
        result.table,
      ])
    );
  }

  return result.table;
};

const deleteTableRequest = async ({
  tableId,
  shopId,
  rtk = false,
}: {
  tableId: string;
  shopId: string;
  rtk?: boolean;
}) => {
  const accessToken = await getAccessToken();

  const result: { table: Table } = await apiRequest({
    method: "DELETE",
    endpoint: `/v1/shops/${shopId}/tables/${tableId}`,
    token: accessToken,
  });

  if (!rtk) {
    const state = store.getState();
    store.dispatch(
      updateAllTables(
        _.filter(state.shop.tables, (table) => table.id !== tableId)
      )
    );
  }

  return result.table;
};

export {
  getTablePositionsRequest,
  createTablePositionRequest,
  updateTablePositionRequest,
  deleteTablePositionRequest,
  getTablesRequest,
  createTableRequest,
  updateTableRequest,
  deleteTableRequest,
};
