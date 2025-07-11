interface CreateKitchenRequest {
  shopId: string;
  name: string;
  dishCategories: string[];
  tables: string[];
}

interface GetKitchenRequest {
  shopId: string;
  kitchenId: string;
}

interface GetKitchensRequest {
  shopId: string;
}

interface UpdateKitchenRequest {
  shopId: string;
  kitchenId: string;
  name: string;
  dishCategories: string[];
  tables: string[];
}

interface DeleteKitchenRequest {
  shopId: string;
  kitchenId: string;
}

interface GetUncookedDishOrdersRequest {
  shopId: string;
  cursor?: string;
}

interface UpdateUncookedDishOrdersRequest {
  shopId: string;
  updateRequests: { orderId: string; dishOrderId: string }[];
}

interface UndoCookedDishOrdersRequest {
  shopId: string;
  updateRequests: { orderId: string; dishOrderId: string }[];
}

interface GetUnservedDishOrdersRequest {
  shopId: string;
  cursor?: string;
}

interface UpdateUnservedDishOrdersRequest {
  shopId: string;
  updateRequests: { orderId: string; dishOrderId: string }[];
}

interface UndoServedDishOrdersRequest {
  shopId: string;
  updateRequests: { orderId: string; dishOrderId: string }[];
}

interface GetCookedHistoriesRequest {
  shopId: string;
  from?: Date;
  to?: Date;
  cursor?: string;
}

interface GetServedHistoriesRequest {
  shopId: string;
  from?: Date;
  to?: Date;
  cursor?: string;
}

export {
  CreateKitchenRequest,
  GetKitchenRequest,
  GetKitchensRequest,
  UpdateKitchenRequest,
  DeleteKitchenRequest,
  GetCookedHistoriesRequest,
  GetServedHistoriesRequest,
  GetUncookedDishOrdersRequest,
  GetUnservedDishOrdersRequest,
  UndoCookedDishOrdersRequest,
  UndoServedDishOrdersRequest,
  UpdateUncookedDishOrdersRequest,
  UpdateUnservedDishOrdersRequest,
};
