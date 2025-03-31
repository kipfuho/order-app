import _ from "lodash";
import {
  updateAllDishCategories,
  updateAllDishes,
  updateAllDisheTypes,
  updateAllUnits,
} from "../stores/userSlice";
import { apiFormDataRequest, apiRequest } from "./api.service";
import { getAccessToken } from "./utils.service";
import store from "../stores/store";
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
  rtk = false,
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

  if (!rtk) {
    const state = store.getState();
    // store.dispatch();
  }
  return result.dishCategory;
};

/**
 * Get dish category
 * @param param0
 */
const getDishCategoriesRequest = async ({
  shopId,
  rtk = false,
}: GetDishCategoriesRequest) => {
  const accessToken = await getAccessToken();

  const result: { dishCategories: DishCategory[] } = await apiRequest({
    method: "GET",
    endpoint: `/v1/shops/${shopId}/dishCategories`,
    token: accessToken,
  });

  if (!rtk) {
    // store.dispatch();
  }

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
  rtk = false,
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

  if (!rtk) {
    const state = store.getState();
    // store.dispatch();
  }

  return result.dishCategory;
};

/**
 * Delete dish category
 * @param param0
 */
const deleteDishCategoryRequest = async ({
  shopId,
  dishCategoryId,
  rtk = false,
}: DeleteDishCategoryRequest) => {
  const accessToken = await getAccessToken();

  await apiRequest({
    method: "DELETE",
    endpoint: `/v1/shops/${shopId}/dishCategories/${dishCategoryId}`,
    token: accessToken,
  });

  if (!rtk) {
    const state = store.getState();
    // store.dispatch();
  }
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
  rtk = false,
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

  if (!rtk) {
    const state = store.getState();
    // store.dispatch();
  }

  return result.dish;
};

/**
 * Get dish
 * @param param0
 */
const getDishesRequest = async ({ shopId, rtk = false }: GetDishesRequest) => {
  const accessToken = await getAccessToken();

  const result: { dishes: Dish[] } = await apiRequest({
    method: "GET",
    endpoint: `/v1/shops/${shopId}/dishes`,
    token: accessToken,
  });

  if (!rtk) {
    // store.dispatch();
  }

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
  rtk = false,
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

  if (!rtk) {
    const state = store.getState();
    // store.dispatch();
  }

  return result.dish;
};

/**
 * Delete dish
 * @param param0
 */
const deleteDishRequest = async ({
  shopId,
  dishId,
  rtk = false,
}: DeleteDishRequest) => {
  const accessToken = await getAccessToken();

  await apiRequest({
    method: "DELETE",
    endpoint: `/v1/shops/${shopId}/dishes/${dishId}`,
    token: accessToken,
  });

  if (!rtk) {
    const state = store.getState();
    // store.dispatch();
  }
};

/**
 * Get dish types
 * @param param0
 */
const getDishTypesRequest = async ({
  shopId,
  rtk = false,
}: GetDishTypesRequest) => {
  const accessToken = await getAccessToken();

  const result: { dishTypes: string[] } = await apiRequest({
    method: "GET",
    endpoint: `/v1/shops/${shopId}/dishes/dishTypes`,
    token: accessToken,
  });

  if (!rtk) {
    // store.dispatch();
  }

  return result.dishTypes;
};

/**
 * Get units
 * @param param0
 */
const getUnitsRequest = async ({ shopId, rtk = false }: GetUnitsRequest) => {
  const accessToken = await getAccessToken();
  store;
  const result: { units: Unit[] } = await apiRequest({
    method: "GET",
    endpoint: `/v1/shops/${shopId}/units/`,
    token: accessToken,
  });

  if (!rtk) {
    // store.dispatch();
  }

  return result.units;
};

const createDefaultUnitsRequest = async ({
  shopId,
  rtk = false,
}: CreateDefaultUnitsRequest) => {
  const accessToken = await getAccessToken();
  const result: { units: Unit[] } = await apiRequest({
    method: "GET",
    endpoint: `/v1/shops/${shopId}/units/create-default`,
    token: accessToken,
  });

  if (!rtk) {
    // store.dispatch();
  }

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
