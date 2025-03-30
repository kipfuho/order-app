import _ from "lodash";
import { Table, TablePosition } from "../stores/state.interface";
import { apiRequest } from "./api.service";
import { getAccessToken } from "./utils.service";
import store from "../stores/store";
import { updateAllTablePositions, updateAllTables } from "../stores/userSlice";
import {
  CreateTablePositionRequest,
  CreateTableRequest,
  DeleteTablePositionRequest,
  DeleteTableRequest,
  GetTablePositionsRequest,
  GetTablesRequest,
  UpdateTablePositionRequest,
  UpdateTableRequest,
} from "./table.api.interface";

const getTablePositionsRequest = async ({
  shopId,
  rtk = false,
}: GetTablePositionsRequest) => {
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
}: CreateTablePositionRequest) => {
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
}: UpdateTablePositionRequest) => {
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
}: DeleteTablePositionRequest) => {
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

const getTablesRequest = async ({ shopId, rtk = false }: GetTablesRequest) => {
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
}: CreateTableRequest) => {
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
}: UpdateTableRequest) => {
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
}: DeleteTableRequest) => {
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
