import _ from "lodash";
import { Table, TablePosition } from "../stores/state.interface";
import { apiRequest } from "./api.service";
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
import { getAccessTokenLazily } from "./auth.api.service";

const getTablePositionsRequest = async ({
  shopId,
}: GetTablePositionsRequest) => {
  const accessToken = await getAccessTokenLazily();

  const result: {
    tablePositions: TablePosition[];
  } = await apiRequest({
    method: "GET",
    endpoint: `/v1/shops/${shopId}/tablePositions`,
    token: accessToken,
  });

  return result.tablePositions;
};

const createTablePositionRequest = async ({
  shopId,
  name,
  categories,
}: CreateTablePositionRequest) => {
  const accessToken = await getAccessTokenLazily();
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

  return result.tablePosition;
};

const updateTablePositionRequest = async ({
  tablePositionId,
  shopId,
  name,
  categories,
}: UpdateTablePositionRequest) => {
  const accessToken = await getAccessTokenLazily();
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

  return result.tablePosition;
};

const deleteTablePositionRequest = async ({
  tablePositionId,
  shopId,
}: DeleteTablePositionRequest) => {
  const accessToken = await getAccessTokenLazily();

  const result: { tablePosition: TablePosition } = await apiRequest({
    method: "DELETE",
    endpoint: `/v1/shops/${shopId}/tablePositions/${tablePositionId}`,
    token: accessToken,
  });

  return result.tablePosition;
};

const getTableRequest = async ({
  shopId,
  tableId,
}: {
  tableId: string;
  shopId: string;
}) => {
  const accessToken = await getAccessTokenLazily();

  const result: {
    table: Table;
  } = await apiRequest({
    method: "GET",
    endpoint: `/v1/shops/${shopId}/tables/${tableId}`,
    token: accessToken,
  });

  return result.table;
};

const getTablesRequest = async ({ shopId }: GetTablesRequest) => {
  const accessToken = await getAccessTokenLazily();

  const result: {
    tables: Table[];
  } = await apiRequest({
    method: "GET",
    endpoint: `/v1/shops/${shopId}/tables`,
    token: accessToken,
  });

  return result.tables;
};

const createTableRequest = async ({
  shopId,
  name,
  tablePosition,
}: CreateTableRequest) => {
  const accessToken = await getAccessTokenLazily();
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

  return result.table;
};

const updateTableRequest = async ({
  tableId,
  shopId,
  name,
  tablePosition,
}: UpdateTableRequest) => {
  const accessToken = await getAccessTokenLazily();
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

  return result.table;
};

const deleteTableRequest = async ({ tableId, shopId }: DeleteTableRequest) => {
  const accessToken = await getAccessTokenLazily();

  const result: { table: Table } = await apiRequest({
    method: "DELETE",
    endpoint: `/v1/shops/${shopId}/tables/${tableId}`,
    token: accessToken,
  });

  return result.table;
};

export {
  getTablePositionsRequest,
  createTablePositionRequest,
  updateTablePositionRequest,
  deleteTablePositionRequest,
  getTableRequest,
  getTablesRequest,
  createTableRequest,
  updateTableRequest,
  deleteTableRequest,
};
