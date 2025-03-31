import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { Dish, DishCategory, Unit } from "../state.interface";
import {
  createDefaultUnitsRequest,
  createDishCategoryRequest,
  createDishRequest,
  deleteDishCategoryRequest,
  deleteDishRequest,
  getDishCategoriesRequest,
  getDishesRequest,
  getDishTypesRequest,
  getUnitsRequest,
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
import { API_BASE_URL } from "../../apis/api.service";

export const dishApiSlice = createApi({
  reducerPath: "dishApi",
  baseQuery: fetchBaseQuery({ baseUrl: API_BASE_URL }),
  tagTypes: ["Dishes", "DishCategories", "DishTypes", "Units"],
  // keepUnusedDataFor: 600,
  endpoints: (builder) => ({
    /** Dish Categories */
    getDishCategories: builder.query<DishCategory[], string>({
      queryFn: async (shopId) => {
        try {
          const dishCategories = await getDishCategoriesRequest({
            shopId,
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
          const dishCategory = await createDishCategoryRequest(args);

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
          const dishCategory = await updateDishCategoryRequest(args);

          return { data: dishCategory };
        } catch (error) {
          return { error: { status: 500, data: error } };
        }
      },
      invalidatesTags: (result, error, args) =>
        error ? ["DishCategories"] : [],

      // ✅ Optimistic Update Implementation
      onQueryStarted: async (args, { dispatch, queryFulfilled }) => {
        const patchResult = dispatch(
          dishApiSlice.util.updateQueryData(
            "getDishCategories",
            args.shopId,
            (draft) => {
              const index = draft.findIndex(
                (dc) => dc.id === args.dishCategoryId
              );
              if (index !== -1) {
                draft[index] = { ...draft[index], ...args };
              }
            }
          )
        );

        try {
          await queryFulfilled; // Wait for actual API request to complete
        } catch {
          patchResult.undo(); // Rollback if API call fails
        }
      },
    }),

    deleteDishCategory: builder.mutation<undefined, DeleteDishCategoryRequest>({
      queryFn: async (args) => {
        try {
          await deleteDishCategoryRequest(args);

          return { data: undefined };
        } catch (error) {
          return { error: { status: 500, data: error } };
        }
      },
      invalidatesTags: (result, error, args) =>
        error ? ["DishCategories"] : [],

      // ✅ Optimistic Update Implementation
      onQueryStarted: async (args, { dispatch, queryFulfilled }) => {
        const patchResult = dispatch(
          dishApiSlice.util.updateQueryData(
            "getDishCategories",
            args.shopId,
            (draft) => {
              return draft.filter((dc) => dc.id !== args.dishCategoryId);
            }
          )
        );

        try {
          await queryFulfilled; // Wait for actual API request to complete
        } catch {
          patchResult.undo(); // Rollback if API call fails
        }
      },
    }),

    /** Dishes */
    getDishes: builder.query<Dish[], string>({
      queryFn: async (shopId) => {
        try {
          const dishes = await getDishesRequest({
            shopId,
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
          const dish = await createDishRequest(args);

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
          const dish = await updateDishRequest(args);

          return { data: dish };
        } catch (error) {
          return { error: { status: 500, data: error } };
        }
      },

      invalidatesTags: (result, error, args) => (error ? ["Dishes"] : []),

      // ✅ Optimistic Update Implementation
      onQueryStarted: async (args, { dispatch, queryFulfilled }) => {
        const patchResult = dispatch(
          dishApiSlice.util.updateQueryData(
            "getDishes",
            args.shopId,
            (draft) => {
              const index = draft.findIndex((d) => d.id === args.dishId);
              if (index !== -1) {
                draft[index] = { ...draft[index], ...args };
              }
            }
          )
        );

        try {
          await queryFulfilled; // Wait for actual API request to complete
        } catch {
          patchResult.undo(); // Rollback if API call fails
        }
      },
    }),

    deleteDish: builder.mutation<undefined, DeleteDishRequest>({
      queryFn: async (args) => {
        try {
          await deleteDishRequest(args);

          return { data: undefined };
        } catch (error) {
          return { error: { status: 500, data: error } };
        }
      },

      invalidatesTags: (result, error, args) => (error ? ["Dishes"] : []),

      // ✅ Optimistic Update Implementation
      onQueryStarted: async (args, { dispatch, queryFulfilled }) => {
        const patchResult = dispatch(
          dishApiSlice.util.updateQueryData(
            "getDishes",
            args.shopId,
            (draft) => {
              return draft.filter((d) => d.id !== args.dishId);
            }
          )
        );

        try {
          await queryFulfilled; // Wait for actual API request to complete
        } catch {
          patchResult.undo(); // Rollback if API call fails
        }
      },
    }),

    /** Dish Types */
    getDishTypes: builder.query<string[], string>({
      queryFn: async (shopId) => {
        try {
          const dishTypes = await getDishTypesRequest({
            shopId,
          });

          return { data: dishTypes };
        } catch (error) {
          return { error: { status: 500, data: error } };
        }
      },
      providesTags: [],
      keepUnusedDataFor: 3600,
    }),

    /** Units */
    getUnits: builder.query<Unit[], string>({
      queryFn: async (shopId) => {
        try {
          const units = await getUnitsRequest({
            shopId,
          });

          return { data: units };
        } catch (error) {
          return { error: { status: 500, data: error } };
        }
      },
      providesTags: ["Units"],
      keepUnusedDataFor: 3600,
    }),

    createDefaultUnits: builder.mutation<Unit[], string>({
      queryFn: async (shopId) => {
        try {
          const units = await createDefaultUnitsRequest({
            shopId,
          });

          return { data: units };
        } catch (error) {
          return { error: { status: 500, data: error } };
        }
      },
      invalidatesTags: ["Units"],
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
  useGetDishTypesQuery,
  useGetUnitsQuery,
  useCreateDefaultUnitsMutation,
} = dishApiSlice;
