import _ from "lodash";
import {
  updateAllDishCategories,
  updateAllDishes,
  updateAllDisheTypes,
} from "../stores/userSlice";
import { apiFormDataRequest, apiRequest } from "./api.service";
import { getAccessToken } from "./utils.service";
import store from "../stores/store";
import { Dish, DishCategory, Unit } from "../stores/state.interface";

export const uploadImageRequest = async ({
  shopId,
  formData,
}: {
  shopId: string;
  formData: FormData;
}) => {
  const accessToken = await getAccessToken();
  const result: { url: string } = await apiFormDataRequest({
    endpoint: `/v1/shops/${shopId}/dishes/upload`,
    formData,
    token: accessToken,
  });

  return result.url;
};

export const removeImageRequest = async ({
  shopId,
  url,
}: {
  shopId: string;
  url: string;
}) => {
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
export const createDishCategoryRequest = async ({
  shopId,
  name,
}: {
  shopId: string;
  name: string;
}) => {
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

  const state = store.getState();
  store.dispatch(
    updateAllDishCategories([...state.shop.dishCategories, result.dishCategory])
  );
};

/**
 * Get dish category
 * @param param0
 */
export const getDishCategoriesRequest = async ({
  shopId,
}: {
  shopId: string;
}) => {
  const accessToken = await getAccessToken();

  const result: { dishCategories: DishCategory[] } = await apiRequest({
    method: "GET",
    endpoint: `/v1/shops/${shopId}/dishCategories`,
    token: accessToken,
  });

  store.dispatch(updateAllDishCategories(result.dishCategories));
};

/**
 * Update dish category
 * @param param0
 */
export const updateDishCategoryRequest = async ({
  dishCategoryId,
  shopId,
  name,
}: {
  dishCategoryId: string;
  shopId: string;
  name: string;
}) => {
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

  const state = store.getState();
  store.dispatch(
    updateAllDishCategories([
      ..._.filter(state.shop.dishCategories, (dc) => dc.id !== dishCategoryId),
      result.dishCategory,
    ])
  );
};

/**
 * Create dish
 * @param param0
 */
export const createDishRequest = async ({
  shopId,
  name,
  category,
  dishType,
  price,
  taxRate = 0,
  unit,
  isTaxIncludedPrice = false,
  imageUrls = [],
}: {
  shopId: string;
  name: string;
  category: DishCategory;
  dishType: string;
  price: number;
  taxRate: number;
  unit: Unit;
  isTaxIncludedPrice: boolean;
  imageUrls: string[];
}) => {
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

  const state = store.getState();
  store.dispatch(updateAllDishes([...state.shop.dishes, result.dish]));
};

/**
 * Get dish
 * @param param0
 */
export const getDishesRequest = async ({ shopId }: { shopId: string }) => {
  const accessToken = await getAccessToken();

  const result: { dishes: Dish[] } = await apiRequest({
    method: "GET",
    endpoint: `/v1/shops/${shopId}/dishes`,
    token: accessToken,
  });

  store.dispatch(updateAllDishes(result.dishes));
};

/**
 * Update dish
 * @param param0
 */
export const updateDishRequest = async ({
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
}: {
  shopId: string;
  dishId: string;
  name: string;
  category: DishCategory;
  dishType: string;
  price: number;
  taxRate: number;
  unit: Unit;
  isTaxIncludedPrice: boolean;
  imageUrls: string[];
}) => {
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

  const state = store.getState();
  store.dispatch(
    updateAllDishes([
      ..._.filter(state.shop.dishes, (d) => d.id !== dishId),
      result.dish,
    ])
  );
};

/**
 * Delete dish
 * @param param0
 */
export const deleteDishRequest = async ({
  shopId,
  dishId,
}: {
  shopId: string;
  dishId: string;
}) => {
  const accessToken = await getAccessToken();

  await apiRequest({
    method: "DELETE",
    endpoint: `/v1/shops/${shopId}/dishes/${dishId}`,
    token: accessToken,
  });

  const state = store.getState();
  store.dispatch(
    updateAllDishes(_.filter(state.shop.dishes, (d) => d.id !== dishId))
  );
};

/**
 * Get dish types
 * @param param0
 */
export const getDishTypesRequest = async ({ shopId }: { shopId: string }) => {
  const accessToken = await getAccessToken();

  const result: { dishTypes: string[] } = await apiRequest({
    method: "GET",
    endpoint: `/v1/shops/${shopId}/dishes/dishTypes`,
    token: accessToken,
  });

  store.dispatch(updateAllDisheTypes(result.dishTypes));
};
