import { Shop, User } from "../stores/state.interface";
import store from "../stores/store";
import { updateAllShops } from "../stores/userSlice";
import { apiRequest } from "./api.service";
import { getAccessToken } from "./utils.service";

const createShopRequest = async ({
  name,
  phone,
  email,
  taxRate,
  location,
  rtk = false,
}: {
  name: string;
  email: string;
  phone?: string;
  taxRate?: number;
  location?: string;
  rtk?: boolean;
}) => {
  const accessToken = await getAccessToken();
  const body: {
    name: string;
    email: string;
    phone?: string;
    taxRate?: number;
    location?: string;
  } = { name, email };

  if (location) {
    body.location = location;
  }
  if (phone) {
    body.name = name;
  }
  if (taxRate) {
    body.taxRate = taxRate;
  }

  const reponse: { shop: Shop } = await apiRequest({
    method: "POST",
    endpoint: "/v1/shops",
    token: accessToken,
    data: body,
  });

  return reponse.shop;
};

const queryShopsRequest = async ({
  user,
  searchName,
  sortBy = "createdAt",
  page = 1,
  limit = 10,
  rtk = false,
}: {
  user: User | null;
  searchName?: string;
  sortBy?: string;
  page: number;
  limit: number;
  rtk?: boolean;
}) => {
  if (!user) return [];
  const accessToken = await getAccessToken();
  const queryParams = new URLSearchParams({
    employeeUserId: user.id,
    sortBy,
    page: page.toString(),
    limit: limit.toString(),
  });

  if (searchName) {
    queryParams.append("name", searchName);
  }
  // Append user ID or token if necessary
  if (user.id) {
    queryParams.append("userId", user.id);
  }

  const response: { results: Shop[] } = await apiRequest({
    method: "GET",
    endpoint: `/v1/shops?${queryParams.toString()}`,
    token: accessToken,
  });

  if (!rtk) {
    store.dispatch(updateAllShops(response.results));
  }

  return response.results;
};

const updateShopRequest = async ({
  shopId,
  name,
  phone,
  email,
  taxRate,
  location,
  rtk = false,
}: {
  shopId: string;
  name: string;
  email: string;
  phone?: string;
  taxRate?: number;
  location?: string;
  rtk?: boolean;
}) => {
  const accessToken = await getAccessToken();
  const body: {
    name: string;
    email: string;
    phone?: string;
    taxRate?: number;
    location?: string;
  } = { name, email };

  if (location) {
    body.location = location;
  }
  if (phone) {
    body.name = name;
  }
  if (taxRate) {
    body.taxRate = taxRate;
  }

  const response: { shop: Shop } = await apiRequest({
    method: "PATCH",
    endpoint: `/v1/shops/${shopId}`,
    token: accessToken,
    data: body,
  });

  return response.shop;
};

const deleteShopRequest = async ({
  shopId,
  rtk = false,
}: {
  shopId: string;
  rtk?: boolean;
}) => {
  const accessToken = await getAccessToken();

  const response: { shop: Shop } = await apiRequest({
    method: "DELETE",
    endpoint: `/v1/shops/${shopId}`,
    token: accessToken,
  });

  return response.shop;
};

export {
  createShopRequest,
  queryShopsRequest,
  updateShopRequest,
  deleteShopRequest,
};
