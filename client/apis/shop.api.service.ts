import { Shop } from "@stores/state.interface";
import { apiFormDataRequest, apiRequest } from "./api.service";
import { getAccessTokenLazily } from "./auth.api.service";
import {
  CreateShopRequest,
  DeleteShopRequest,
  QueryShopsRequest,
  UpdateShopRequest,
  UploadImageRequest,
} from "./shop.api.interface";

const uploadImageRequest = async ({ formData }: UploadImageRequest) => {
  const accessToken = await getAccessTokenLazily();
  const result: { url: string } = await apiFormDataRequest({
    endpoint: `/v1/shops/upload-image`,
    formData,
    token: accessToken,
  });

  return result.url;
};

const createShopRequest = async ({
  name,
  phone,
  email,
  taxRate,
  location,
  imageUrls,
}: CreateShopRequest) => {
  const accessToken = await getAccessTokenLazily();
  const body: {
    name: string;
    email: string;
    phone?: string;
    taxRate?: number;
    location?: string;
    imageUrls?: string[];
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
  if (imageUrls) {
    body.imageUrls = imageUrls;
  }

  const result: { shop: Shop } = await apiRequest({
    method: "POST",
    endpoint: "/v1/shops",
    token: accessToken,
    data: body,
  });

  return result.shop;
};

const getShopRequest = async (shopId: string, isCustomerApp = false) => {
  const accessToken = await getAccessTokenLazily(isCustomerApp);

  const result: { shop: Shop } = await apiRequest({
    method: "GET",
    endpoint: `/v1/shops/${shopId}`,
    token: accessToken,
    isCustomerApp,
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
  const accessToken = await getAccessTokenLazily();
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

  const result: any = await apiRequest({
    method: "GET",
    endpoint: `/v1/shops?${queryParams.toString()}`,
    token: accessToken,
  });

  const shops: Shop[] = result.results || result;
  return shops;
};

const updateShopRequest = async ({
  shopId,
  name,
  phone,
  email,
  taxRate,
  location,
  imageUrls,
}: UpdateShopRequest) => {
  const accessToken = await getAccessTokenLazily();
  const body: {
    name: string;
    email: string;
    phone?: string;
    taxRate?: number;
    location?: string;
    imageUrls?: string[];
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
  if (imageUrls) {
    body.imageUrls = imageUrls;
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
  const accessToken = await getAccessTokenLazily();

  const response: { shop: Shop } = await apiRequest({
    method: "DELETE",
    endpoint: `/v1/shops/${shopId}`,
    token: accessToken,
  });

  return response.shop;
};

export {
  createShopRequest,
  getShopRequest,
  queryShopsRequest,
  updateShopRequest,
  deleteShopRequest,
  uploadImageRequest,
};
