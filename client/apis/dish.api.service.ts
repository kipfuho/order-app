import _ from "lodash";
import { apiFormDataRequest, apiRequest } from "./api.service";
import { getAccessToken } from "./utils.service";
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
  UploadImageRequest,
} from "./dish.api.interface";

const uploadImageRequest = async ({ shopId, formData }: UploadImageRequest) => {
  const accessToken = await getAccessToken();
  const result: { url: string } = await apiFormDataRequest({
    endpoint: `/v1/shops/${shopId}/dishes/upload`,
    formData,
    token: accessToken,
  });

  return result.url;
};

const removeImageRequest = async ({ shopId, url }: RemoveImageRequest) => {
  const accessToken = await getAccessToken();
  await apiRequest({
    method: "POST",
    endpoint: `/v1/shops/${shopId}/dishes/remove`,
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
  const accessToken = await getAccessToken();
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
}: GetDishCategoriesRequest) => {
  const accessToken = await getAccessToken();

  const result: { dishCategories: DishCategory[] } = await apiRequest({
    method: "GET",
    endpoint: `/v1/shops/${shopId}/dishCategories`,
    token: accessToken,
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
  const accessToken = await getAccessToken();
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
  const accessToken = await getAccessToken();

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
  const accessToken = await getAccessToken();
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
const getDishesRequest = async ({ shopId }: GetDishesRequest) => {
  const accessToken = await getAccessToken();

  const result: { dishes: Dish[] } = await apiRequest({
    method: "GET",
    endpoint: `/v1/shops/${shopId}/dishes`,
    token: accessToken,
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
}: UpdateDishRequest) => {
  const accessToken = await getAccessToken();
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
  const accessToken = await getAccessToken();

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
const getDishTypesRequest = async ({ shopId }: GetDishTypesRequest) => {
  const accessToken = await getAccessToken();

  const result: { dishTypes: string[] } = await apiRequest({
    method: "GET",
    endpoint: `/v1/shops/${shopId}/dishes/dishTypes`,
    token: accessToken,
  });

  return result.dishTypes;
};

/**
 * Get units
 * @param param0
 */
const getUnitsRequest = async ({ shopId }: GetUnitsRequest) => {
  const accessToken = await getAccessToken();
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
  const accessToken = await getAccessToken();
  const result: { units: Unit[] } = await apiRequest({
    method: "GET",
    endpoint: `/v1/shops/${shopId}/units/create-default`,
    token: accessToken,
  });

  return result.units;
};

export {
  uploadImageRequest,
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
