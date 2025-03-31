import { Shop } from "../stores/state.interface";
import { apiRequest } from "./api.service";
import {
  CreateShopRequest,
  DeleteShopRequest,
  QueryShopsRequest,
  UpdateShopRequest,
} from "./shop.api.interface";
import { getAccessToken } from "./utils.service";

const createShopRequest = async ({
  name,
  phone,
  email,
  taxRate,
  location,
}: CreateShopRequest) => {
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

  const result: { shop: Shop } = await apiRequest({
    method: "POST",
    endpoint: "/v1/shops",
    token: accessToken,
    data: body,
  });

  return result.shop;
};

const queryShopsRequest = async ({
  user,
  searchName,
  sortBy = "createdAt",
  page = 1,
  limit = 10,
}: QueryShopsRequest) => {
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

  const result: { results: Shop[] } = await apiRequest({
    method: "GET",
    endpoint: `/v1/shops?${queryParams.toString()}`,
    token: accessToken,
  });

  return result.results;
};

const updateShopRequest = async ({
  shopId,
  name,
  phone,
  email,
  taxRate,
  location,
}: UpdateShopRequest) => {
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

const deleteShopRequest = async ({ shopId }: DeleteShopRequest) => {
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
