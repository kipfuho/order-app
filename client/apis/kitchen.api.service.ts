import {
  KitchenDishOrder,
  Kitchen,
  KitchenLog,
} from "../stores/state.interface";
import { apiRequest } from "./api.service";
import { getAccessTokenLazily } from "./auth.api.service";
import {
  CreateKitchenRequest,
  DeleteKitchenRequest,
  GetCookedHistoriesRequest,
  GetKitchenRequest,
  GetKitchensRequest,
  GetServedHistoriesRequest,
  GetUncookedDishOrdersRequest,
  GetUnservedDishOrdersRequest,
  UndoCookedDishOrdersRequest,
  UndoServedDishOrdersRequest,
  UpdateKitchenRequest,
  UpdateUncookedDishOrdersRequest,
  UpdateUnservedDishOrdersRequest,
} from "./kitchen.api.interface";

const createKitchenRequest = async ({
  shopId,
  name,
  dishCategories = [],
  tables = [],
}: CreateKitchenRequest) => {
  const accessToken = await getAccessTokenLazily();
  const result: { kitchen: Kitchen } = await apiRequest({
    method: "POST",
    endpoint: `/v1/shops/${shopId}/kitchen`,
    token: accessToken,
    data: {
      name,
      dishCategories,
      tables: tables,
    },
  });

  return result.kitchen;
};

const getKitchenRequest = async ({ shopId, kitchenId }: GetKitchenRequest) => {
  const accessToken = await getAccessTokenLazily();
  const result: { kitchen: Kitchen } = await apiRequest({
    method: "GET",
    endpoint: `/v1/shops/${shopId}/kitchen/${kitchenId}`,
    token: accessToken,
  });

  return result.kitchen;
};

const getKitchensRequest = async ({ shopId }: GetKitchensRequest) => {
  const accessToken = await getAccessTokenLazily();
  const result: { kitchens: Kitchen[] } = await apiRequest({
    method: "GET",
    endpoint: `/v1/shops/${shopId}/kitchen`,
    token: accessToken,
  });

  return result.kitchens;
};

const updateKitchenRequest = async ({
  shopId,
  kitchenId,
  name,
  dishCategories = [],
  tables = [],
}: UpdateKitchenRequest) => {
  const accessToken = await getAccessTokenLazily();
  await apiRequest({
    method: "PATCH",
    endpoint: `/v1/shops/${shopId}/kitchen/${kitchenId}`,
    token: accessToken,
    data: {
      name,
      dishCategories: dishCategories,
      tables: tables,
    },
  });

  return true;
};

const deleteKitchenRequest = async ({
  shopId,
  kitchenId,
}: DeleteKitchenRequest) => {
  const accessToken = await getAccessTokenLazily();
  await apiRequest({
    method: "GET",
    endpoint: `/v1/shops/${shopId}/kitchen/${kitchenId}`,
    token: accessToken,
  });

  return true;
};

const getUncookedDishOrdersRequest = async ({
  shopId,
}: GetUncookedDishOrdersRequest) => {
  const accessToken = await getAccessTokenLazily();
  const result: { uncookedDishOrders: KitchenDishOrder[] } = await apiRequest({
    method: "GET",
    endpoint: `/v1/shops/${shopId}/kds/uncooked-dishorders`,
    token: accessToken,
  });

  return result.uncookedDishOrders;
};

const updateUncookedDishOrdersRequest = async ({
  shopId,
  updateRequests,
}: UpdateUncookedDishOrdersRequest) => {
  const accessToken = await getAccessTokenLazily();
  await apiRequest({
    method: "POST",
    endpoint: `/v1/shops/${shopId}/kds/uncooked-dishorders`,
    token: accessToken,
    data: { updateRequests },
  });

  return true;
};

const undoCookedDishOrdersRequest = async ({
  shopId,
  updateRequests,
}: UndoCookedDishOrdersRequest) => {
  const accessToken = await getAccessTokenLazily();
  await apiRequest({
    method: "PATCH",
    endpoint: `/v1/shops/${shopId}/kds/uncooked-dishorders`,
    token: accessToken,
    data: { updateRequests },
  });

  return true;
};

const getUnservedDishOrdersRequest = async ({
  shopId,
}: GetUnservedDishOrdersRequest) => {
  const accessToken = await getAccessTokenLazily();
  const result: { unservedDishOrders: KitchenDishOrder[] } = await apiRequest({
    method: "GET",
    endpoint: `/v1/shops/${shopId}/kds/unserved-dishorders`,
    token: accessToken,
  });

  return result.unservedDishOrders;
};

const updateUnservedDishOrdersRequest = async ({
  shopId,
  updateRequests,
}: UpdateUnservedDishOrdersRequest) => {
  const accessToken = await getAccessTokenLazily();
  await apiRequest({
    method: "POST",
    endpoint: `/v1/shops/${shopId}/kds/unserved-dishorders`,
    token: accessToken,
    data: { updateRequests },
  });

  return true;
};

const undoServedDishOrdersRequest = async ({
  shopId,
  updateRequests,
}: UndoServedDishOrdersRequest) => {
  const accessToken = await getAccessTokenLazily();
  await apiRequest({
    method: "GET",
    endpoint: `/v1/shops/${shopId}/kds/unserved-dishorders`,
    token: accessToken,
    data: { updateRequests },
  });

  return true;
};

const getCookedHistoriesRequest = async ({
  shopId,
  from,
  to,
}: GetCookedHistoriesRequest) => {
  const accessToken = await getAccessTokenLazily();
  const result: { cookedHistories: KitchenLog[] } = await apiRequest({
    method: "GET",
    endpoint: `/v1/shops/${shopId}/kds/cooked-history`,
    token: accessToken,
    data: {
      from,
      to,
    },
  });

  return result.cookedHistories;
};

const getServedHistoriesRequest = async ({
  shopId,
  from,
  to,
}: GetServedHistoriesRequest) => {
  const accessToken = await getAccessTokenLazily();
  const result: { servedHistories: KitchenLog[] } = await apiRequest({
    method: "GET",
    endpoint: `/v1/shops/${shopId}/kds/served-history`,
    token: accessToken,
    data: {
      from,
      to,
    },
  });

  return result.servedHistories;
};

export {
  createKitchenRequest,
  getKitchenRequest,
  getKitchensRequest,
  updateKitchenRequest,
  deleteKitchenRequest,
  getUncookedDishOrdersRequest,
  updateUncookedDishOrdersRequest,
  undoCookedDishOrdersRequest,
  getUnservedDishOrdersRequest,
  updateUnservedDishOrdersRequest,
  undoServedDishOrdersRequest,
  getCookedHistoriesRequest,
  getServedHistoriesRequest,
};
