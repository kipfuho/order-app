import { TablePosition } from "../stores/state.interface";

interface GetTablePositionsRequest {
  shopId: string;
}

interface CreateTablePositionRequest {
  shopId: string;
  name: string;
  categories: string[];
}

interface UpdateTablePositionRequest {
  tablePositionId: string;
  shopId: string;
  name: string;
  categories: string[];
}

interface DeleteTablePositionRequest {
  tablePositionId: string;
  shopId: string;
}

interface GetTablesRequest {
  shopId: string;
}

interface CreateTableRequest {
  shopId: string;
  name: string;
  tablePosition: TablePosition;
}

interface UpdateTableRequest {
  tableId: string;
  shopId: string;
  name: string;
  tablePosition: TablePosition;
}

interface DeleteTableRequest {
  tableId: string;
  shopId: string;
}

export {
  GetTablePositionsRequest,
  CreateTablePositionRequest,
  UpdateTablePositionRequest,
  DeleteTablePositionRequest,
  GetTablesRequest,
  CreateTableRequest,
  UpdateTableRequest,
  DeleteTableRequest,
};
