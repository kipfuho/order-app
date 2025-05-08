import _ from "lodash";
import { apiFormDataRequest, apiRequest } from "./api.service";
import { Dish, DishCategory, Unit } from "../stores/state.interface";
import {
  CreateDefaultUnitsRequest,
  CreateDishCategoryRequest,
  CreateDishRequest,
  DeleteDishCategoryRequest,
  DeleteDishRequest,
  GetDishCategoriesRequest,
  GetDishesRequest,
  GetDishTypesRequest,
  GetUnitsRequest,
  RemoveImageRequest,
  UpdateDishCategoryRequest,
  UpdateDishRequest,
  UploadDishImageRequest,
} from "./dish.api.interface";
import { getAccessTokenLazily } from "./auth.api.service";

const uploadDishImageRequest = async ({
  shopId,
  formData,
}: UploadDishImageRequest) => {
  const accessToken = await getAccessTokenLazily();
  const result: { url: string } = await apiFormDataRequest({
    endpoint: `/v1/shops/${shopId}/dishes/upload-image`,
    formData,
    token: accessToken,
  });

  return result.url;
};

const removeImageRequest = async ({ url }: RemoveImageRequest) => {
  const accessToken = await getAccessTokenLazily();
  await apiRequest({
    method: "POST",
    endpoint: `/v1/shops/remove-image`,
    data: {
      url,
    },
    token: accessToken,
  });
};

/**
 * Create dish category
 * @param param0
 */
const createDishCategoryRequest = async ({
  shopId,
  name,
}: CreateDishCategoryRequest) => {
  const accessToken = await getAccessTokenLazily();
  const body: {
    name: string;
  } = { name };

  const result: { dishCategory: DishCategory } = await apiRequest({
    method: "POST",
    endpoint: `/v1/shops/${shopId}/dishCategories`,
    token: accessToken,
    data: body,
  });

  return result.dishCategory;
};

/**
 * Get dish category
 * @param param0
 */
const getDishCategoriesRequest = async ({
  shopId,
  isCustomerApp = false,
}: GetDishCategoriesRequest) => {
  const accessToken = await getAccessTokenLazily(isCustomerApp);

  const result: { dishCategories: DishCategory[] } = await apiRequest({
    method: "GET",
    endpoint: `/v1/shops/${shopId}/dishCategories`,
    token: accessToken,
    isCustomerApp,
  });

  return result.dishCategories;
};

/**
 * Update dish category
 * @param param0
 */
const updateDishCategoryRequest = async ({
  dishCategoryId,
  shopId,
  name,
}: UpdateDishCategoryRequest) => {
  const accessToken = await getAccessTokenLazily();
  const body: {
    name: string;
  } = { name };

  const result: { dishCategory: DishCategory } = await apiRequest({
    method: "PATCH",
    endpoint: `/v1/shops/${shopId}/dishCategories/${dishCategoryId}`,
    token: accessToken,
    data: body,
  });

  return result.dishCategory;
};

/**
 * Delete dish category
 * @param param0
 */
const deleteDishCategoryRequest = async ({
  shopId,
  dishCategoryId,
}: DeleteDishCategoryRequest) => {
  const accessToken = await getAccessTokenLazily();

  await apiRequest({
    method: "DELETE",
    endpoint: `/v1/shops/${shopId}/dishCategories/${dishCategoryId}`,
    token: accessToken,
  });
};

/**
 * Create dish
 * @param param0
 */
const createDishRequest = async ({
  shopId,
  name,
  category,
  dishType,
  price,
  taxRate = 0,
  unit,
  isTaxIncludedPrice = false,
  imageUrls = [],
}: CreateDishRequest) => {
  const accessToken = await getAccessTokenLazily();
  const body: {
    name: string;
    category: string;
    type: string;
    price: number;
    taxRate: number;
    unit: string;
    isTaxIncludedPrice: boolean;
    imageUrls: string[];
  } = {
    name,
    category: category.id,
    type: dishType,
    price,
    taxRate,
    unit: unit.id,
    isTaxIncludedPrice,
    imageUrls,
  };

  const result: { dish: Dish } = await apiRequest({
    method: "POST",
    endpoint: `/v1/shops/${shopId}/dishes`,
    token: accessToken,
    data: body,
  });

  return result.dish;
};

/**
 * Get dish
 * @param param0
 */
const getDishesRequest = async ({
  shopId,
  isCustomerApp = false,
}: GetDishesRequest) => {
  const accessToken = await getAccessTokenLazily(isCustomerApp);

  const result: { dishes: Dish[] } = await apiRequest({
    method: "GET",
    endpoint: `/v1/shops/${shopId}/dishes`,
    token: accessToken,
    isCustomerApp,
  });

  return result.dishes;
};

/**
 * Update dish
 * @param param0
 */
const updateDishRequest = async ({
  shopId,
  dishId,
  name,
  category,
  dishType,
  price,
  taxRate = 0,
  unit,
  isTaxIncludedPrice = false,
  imageUrls = [],
  status,
}: UpdateDishRequest) => {
  const accessToken = await getAccessTokenLazily();
  const body: {
    name?: string;
    category?: string;
    type?: string;
    price?: number;
    taxRate?: number;
    unit?: string;
    isTaxIncludedPrice?: boolean;
    imageUrls?: string[];
    status?: string;
  } = {};

  if (name) {
    body.name = name;
  }
  if (category) {
    body.category = category.id;
  }
  if (dishType) {
    body.type = dishType;
  }
  if (price) {
    body.price = price;
  }
  if (taxRate) {
    body.taxRate = taxRate;
  }
  if (unit) {
    body.unit = unit.id;
  }
  if (isTaxIncludedPrice) {
    body.isTaxIncludedPrice = isTaxIncludedPrice;
  }
  if (imageUrls) {
    body.imageUrls = imageUrls;
  }
  if (status) {
    body.status = status;
  }

  const result: { dish: Dish } = await apiRequest({
    method: "PATCH",
    endpoint: `/v1/shops/${shopId}/dishes/${dishId}`,
    token: accessToken,
    data: body,
  });

  return result.dish;
};

/**
 * Delete dish
 * @param param0
 */
const deleteDishRequest = async ({ shopId, dishId }: DeleteDishRequest) => {
  const accessToken = await getAccessTokenLazily();

  await apiRequest({
    method: "DELETE",
    endpoint: `/v1/shops/${shopId}/dishes/${dishId}`,
    token: accessToken,
  });
};

/**
 * Get dish types
 * @param param0
 */
const getDishTypesRequest = async ({
  shopId,
  isCustomerApp = false,
}: GetDishTypesRequest) => {
  const accessToken = await getAccessTokenLazily(isCustomerApp);

  const result: { dishTypes: string[] } = await apiRequest({
    method: "GET",
    endpoint: `/v1/shops/${shopId}/dishes/dishTypes`,
    token: accessToken,
    isCustomerApp,
  });

  return result.dishTypes;
};

/**
 * Get units
 * @param param0
 */
const getUnitsRequest = async ({ shopId }: GetUnitsRequest) => {
  const accessToken = await getAccessTokenLazily();
  const result: { units: Unit[] } = await apiRequest({
    method: "GET",
    endpoint: `/v1/shops/${shopId}/units/`,
    token: accessToken,
  });

  return result.units;
};

const createDefaultUnitsRequest = async ({
  shopId,
}: CreateDefaultUnitsRequest) => {
  const accessToken = await getAccessTokenLazily();
  const result: { units: Unit[] } = await apiRequest({
    method: "GET",
    endpoint: `/v1/shops/${shopId}/units/create-default`,
    token: accessToken,
  });

  return result.units;
};

export {
  uploadDishImageRequest,
  removeImageRequest,
  createDishCategoryRequest,
  getDishCategoriesRequest,
  updateDishCategoryRequest,
  deleteDishCategoryRequest,
  createDishRequest,
  getDishesRequest,
  updateDishRequest,
  deleteDishRequest,
  getDishTypesRequest,
  getUnitsRequest,
  createDefaultUnitsRequest,
};
