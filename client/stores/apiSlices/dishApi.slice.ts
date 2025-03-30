import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { Dish, DishCategory } from "../state.interface";
import { API_BASE_URL } from "../../apis/api.service";
import {
  createDishCategoryRequest,
  createDishRequest,
  deleteDishCategoryRequest,
  deleteDishRequest,
  getDishCategoriesRequest,
  getDishesRequest,
  updateDishCategoryRequest,
  updateDishRequest,
} from "../../apis/dish.api.service";
import {
  CreateDishCategoryRequest,
  CreateDishRequest,
  DeleteDishCategoryRequest,
  DeleteDishRequest,
  UpdateDishCategoryRequest,
  UpdateDishRequest,
} from "../../apis/dish.api.interface";

export const dishApiSlice = createApi({
  reducerPath: "dishApi",
  baseQuery: fetchBaseQuery({ baseUrl: API_BASE_URL }),
  tagTypes: ["Dishes", "DishCategories", "DishTypes"],
  // keepUnusedDataFor: 600,
  endpoints: (builder) => ({
    /** Dish Categories */
    getDishCategories: builder.query<DishCategory[], string>({
      queryFn: async (shopId) => {
        try {
          const dishCategories = await getDishCategoriesRequest({
            shopId,
            rtk: true,
          });

          return { data: dishCategories };
        } catch (error) {
          return { error: { status: 500, data: error } };
        }
      },
      providesTags: ["DishCategories"], // Enables cache invalidation
    }),

    createDishCategory: builder.mutation<
      DishCategory,
      CreateDishCategoryRequest
    >({
      queryFn: async (args) => {
        try {
          const dishCategory = await createDishCategoryRequest({
            ...args,
            rtk: true,
          });

          return { data: dishCategory };
        } catch (error) {
          return { error: { status: 500, data: error } };
        }
      },
      invalidatesTags: ["DishCategories"],
    }),

    updateDishCategory: builder.mutation<
      DishCategory,
      UpdateDishCategoryRequest
    >({
      queryFn: async (args) => {
        try {
          const dishCategory = await updateDishCategoryRequest({
            ...args,
            rtk: true,
          });

          return { data: dishCategory };
        } catch (error) {
          return { error: { status: 500, data: error } };
        }
      },
      invalidatesTags: ["DishCategories"],
    }),

    deleteDishCategory: builder.mutation<undefined, DeleteDishCategoryRequest>({
      queryFn: async (args) => {
        try {
          await deleteDishCategoryRequest({ ...args, rtk: true });

          return { data: undefined };
        } catch (error) {
          return { error: { status: 500, data: error } };
        }
      },
      invalidatesTags: ["DishCategories"],
    }),

    /** Dishes */
    getDishes: builder.query<Dish[], string>({
      queryFn: async (shopId) => {
        try {
          const dishes = await getDishesRequest({
            shopId,
            rtk: true,
          });

          return { data: dishes };
        } catch (error) {
          return { error: { status: 500, data: error } };
        }
      },
      providesTags: ["DishCategories", "Dishes"], // Enables cache invalidation
    }),

    createDish: builder.mutation<Dish, CreateDishRequest>({
      queryFn: async (args) => {
        try {
          const dish = await createDishRequest({
            ...args,
            rtk: true,
          });

          return { data: dish };
        } catch (error) {
          return { error: { status: 500, data: error } };
        }
      },
      invalidatesTags: ["Dishes"],
    }),

    updateDish: builder.mutation<Dish, UpdateDishRequest>({
      queryFn: async (args) => {
        try {
          const dish = await updateDishRequest({
            ...args,
            rtk: true,
          });

          return { data: dish };
        } catch (error) {
          return { error: { status: 500, data: error } };
        }
      },
      invalidatesTags: ["Dishes"],
    }),

    deleteDish: builder.mutation<undefined, DeleteDishRequest>({
      queryFn: async (args) => {
        try {
          await deleteDishRequest({ ...args, rtk: true });

          return { data: undefined };
        } catch (error) {
          return { error: { status: 500, data: error } };
        }
      },
      invalidatesTags: ["Dishes"],
    }),
  }),
});

export const {
  useGetDishCategoriesQuery,
  useCreateDishCategoryMutation,
  useUpdateDishCategoryMutation,
  useDeleteDishCategoryMutation,
  useGetDishesQuery,
  useCreateDishMutation,
  useUpdateDishMutation,
  useDeleteDishMutation,
} = dishApiSlice;
