import { TablePosition } from "../stores/state.interface";

interface GetTablePositionsRequest {
  shopId: string;
}

interface CreateTablePositionRequest {
  shopId: string;
  name: string;
  code: string;
  categories: string[];
}

interface UpdateTablePositionRequest {
  tablePositionId: string;
  shopId: string;
  name?: string;
  code?: string;
  categories?: string[];
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
  code: string;
  tablePosition: TablePosition;
  allowMultipleOrderSession?: boolean;
  needApprovalWhenCustomerOrder?: boolean;
}

interface UpdateTableRequest {
  tableId: string;
  shopId: string;
  name?: string;
  code?: string;
  tablePosition?: TablePosition;
  allowMultipleOrderSession?: boolean;
  needApprovalWhenCustomerOrder?: boolean;
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
