import { Table, TablePosition } from "@stores/state.interface";
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
  code,
  categories,
}: CreateTablePositionRequest) => {
  const accessToken = await getAccessTokenLazily();
  const body: {
    name: string;
    code: string;
    dishCategories?: string[];
  } = { name, code };

  if (categories) {
    body.dishCategories = categories;
  }

  await apiRequest({
    method: "POST",
    endpoint: `/v1/shops/${shopId}/tablePositions`,
    token: accessToken,
    data: body,
  });

  return true;
};

const updateTablePositionRequest = async ({
  tablePositionId,
  shopId,
  name,
  code,
  categories,
}: UpdateTablePositionRequest) => {
  const accessToken = await getAccessTokenLazily();
  const body: {
    name?: string;
    code?: string;
    dishCategories?: string[];
  } = {};

  if (name) {
    body.name = name;
  }
  if (code) {
    body.code = code;
  }
  if (categories) {
    body.dishCategories = categories;
  }

  await apiRequest({
    method: "PATCH",
    endpoint: `/v1/shops/${shopId}/tablePositions/${tablePositionId}`,
    token: accessToken,
    data: body,
  });

  return true;
};

const deleteTablePositionRequest = async ({
  tablePositionId,
  shopId,
}: DeleteTablePositionRequest) => {
  const accessToken = await getAccessTokenLazily();

  await apiRequest({
    method: "DELETE",
    endpoint: `/v1/shops/${shopId}/tablePositions/${tablePositionId}`,
    token: accessToken,
  });

  return true;
};

const getTableRequest = async ({
  shopId,
  tableId,
  isCustomerApp = false,
}: {
  tableId: string;
  shopId: string;
  isCustomerApp: boolean;
}) => {
  const accessToken = await getAccessTokenLazily(isCustomerApp);

  const result: {
    table: Table;
  } = await apiRequest({
    method: "GET",
    endpoint: `/v1/shops/${shopId}/tables/${tableId}`,
    token: accessToken,
    isCustomerApp,
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
  code,
  tablePosition,
  allowMultipleOrderSession = false,
  needApprovalWhenCustomerOrder = false,
}: CreateTableRequest) => {
  const accessToken = await getAccessTokenLazily();
  const body: {
    name: string;
    code: string;
    position: string;
    allowMultipleOrderSession: boolean;
    needApprovalWhenCustomerOrder: boolean;
  } = {
    name,
    code,
    position: tablePosition.id,
    allowMultipleOrderSession,
    needApprovalWhenCustomerOrder,
  };

  await apiRequest({
    method: "POST",
    endpoint: `/v1/shops/${shopId}/tables`,
    token: accessToken,
    data: body,
  });

  return true;
};

const updateTableRequest = async ({
  tableId,
  shopId,
  name,
  code,
  tablePosition,
  allowMultipleOrderSession = false,
  needApprovalWhenCustomerOrder = false,
}: UpdateTableRequest) => {
  const accessToken = await getAccessTokenLazily();
  const body: {
    name?: string;
    code?: string;
    position?: string;
    allowMultipleOrderSession?: boolean;
    needApprovalWhenCustomerOrder?: boolean;
  } = {};
  if (name) {
    body.name = name;
  }
  if (code) {
    body.code = code;
  }
  if (tablePosition) {
    body.position = tablePosition.id;
  }
  if (typeof allowMultipleOrderSession === "boolean") {
    body.allowMultipleOrderSession = allowMultipleOrderSession;
  }
  if (typeof needApprovalWhenCustomerOrder === "boolean") {
    body.needApprovalWhenCustomerOrder = needApprovalWhenCustomerOrder;
  }

  await apiRequest({
    method: "PATCH",
    endpoint: `/v1/shops/${shopId}/tables/${tableId}`,
    token: accessToken,
    data: body,
  });

  return true;
};

const deleteTableRequest = async ({ tableId, shopId }: DeleteTableRequest) => {
  const accessToken = await getAccessTokenLazily();

  await apiRequest({
    method: "DELETE",
    endpoint: `/v1/shops/${shopId}/tables/${tableId}`,
    token: accessToken,
  });

  return true;
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
