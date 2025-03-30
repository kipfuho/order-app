import { TablePosition } from "../stores/state.interface";

interface GetTablePositionsRequest {
  shopId: string;
  rtk?: boolean;
}

interface CreateTablePositionRequest {
  shopId: string;
  name: string;
  categories: string[];
  rtk?: boolean;
}

interface UpdateTablePositionRequest {
  tablePositionId: string;
  shopId: string;
  name: string;
  categories: string[];
  rtk?: boolean;
}

interface DeleteTablePositionRequest {
  tablePositionId: string;
  shopId: string;
  rtk?: boolean;
}

interface GetTablesRequest {
  shopId: string;
  rtk?: boolean;
}

interface CreateTableRequest {
  shopId: string;
  name: string;
  tablePosition: TablePosition;
  rtk?: boolean;
}

interface UpdateTableRequest {
  tableId: string;
  shopId: string;
  name: string;
  tablePosition: TablePosition;
  rtk?: boolean;
}

interface DeleteTableRequest {
  tableId: string;
  shopId: string;
  rtk?: boolean;
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
