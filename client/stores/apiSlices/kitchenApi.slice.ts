import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { KitchenDishOrder, Kitchen, KitchenLog } from "../state.interface";
import { API_BASE_URL } from "../../apis/api.service";
import {
  createKitchenRequest,
  deleteKitchenRequest,
  getCookedHistoriesRequest,
  getKitchenRequest,
  getKitchensRequest,
  getServedHistoriesRequest,
  getUncookedDishOrdersRequest,
  getUnservedDishOrdersRequest,
  undoCookedDishOrdersRequest,
  undoServedDishOrdersRequest,
  updateKitchenRequest,
  updateUncookedDishOrdersRequest,
  updateUnservedDishOrdersRequest,
} from "../../apis/kitchen.api.service";
import {
  CreateKitchenRequest,
  DeleteKitchenRequest,
  GetCookedHistoriesRequest,
  GetKitchenRequest,
  GetKitchensRequest,
  GetServedHistoriesRequest,
  UndoCookedDishOrdersRequest,
  UndoServedDishOrdersRequest,
  UpdateKitchenRequest,
  UpdateUncookedDishOrdersRequest,
  UpdateUnservedDishOrdersRequest,
} from "../../apis/kitchen.api.interface";

export const kitchenApiSlice = createApi({
  reducerPath: "kitchenApi",
  baseQuery: fetchBaseQuery({ baseUrl: API_BASE_URL }),
  tagTypes: [
    "Kitchens",
    "UncookedDishOrders",
    "UnservedDishOrders",
    "CookedHistories",
    "ServedHistories",
  ],
  // keepUnusedDataFor: 600,
  endpoints: (builder) => ({
    getKitchen: builder.query<Kitchen, GetKitchenRequest>({
      queryFn: async ({ shopId, kitchenId }) => {
        try {
          const kitchen = await getKitchenRequest({
            shopId,
            kitchenId,
          });

          return { data: kitchen };
        } catch (error) {
          return { error: { status: 500, data: error } };
        }
      },
      providesTags: ["Kitchens"], // Enables cache invalidation
    }),

    getKitchens: builder.query<Kitchen[], GetKitchensRequest>({
      queryFn: async ({ shopId }) => {
        try {
          const kitchens = await getKitchensRequest({
            shopId,
          });

          return { data: kitchens };
        } catch (error) {
          return { error: { status: 500, data: error } };
        }
      },
      providesTags: ["Kitchens"], // Enables cache invalidation
    }),

    createKitchen: builder.mutation<Kitchen, CreateKitchenRequest>({
      queryFn: async (args) => {
        try {
          const kitchen = await createKitchenRequest(args);

          return { data: kitchen };
        } catch (error) {
          return { error: { status: 500, data: error } };
        }
      },
      invalidatesTags: ["Kitchens"],
    }),

    updateKitchen: builder.mutation<boolean, UpdateKitchenRequest>({
      queryFn: async (args) => {
        try {
          await updateKitchenRequest(args);

          return { data: true };
        } catch (error) {
          return { error: { status: 500, data: error } };
        }
      },

      invalidatesTags: (result, error, args) => (error ? ["Kitchens"] : []),

      // ✅ Optimistic Update Implementation
      onQueryStarted: async (args, { dispatch, queryFulfilled }) => {
        const patchResult = dispatch(
          kitchenApiSlice.util.updateQueryData(
            "getKitchens",
            { shopId: args.shopId },
            (draft) => {
              const index = draft.findIndex((k) => k.id === args.kitchenId);
              if (index !== -1) {
                const dishCategories = args.dishCategories.map((dc) => dc.id);
                const tables = args.tables.map((t) => t.id);
                draft[index] = {
                  ...draft[index],
                  name: args.name,
                  dishCategories,
                  tables,
                };
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

    deleteKitchen: builder.mutation<boolean, DeleteKitchenRequest>({
      queryFn: async (args) => {
        try {
          await deleteKitchenRequest(args);

          return { data: true };
        } catch (error) {
          return { error: { status: 500, data: error } };
        }
      },

      invalidatesTags: (result, error, args) => (error ? ["Kitchens"] : []),

      // ✅ Optimistic Update Implementation
      onQueryStarted: async (args, { dispatch, queryFulfilled }) => {
        const patchResult = dispatch(
          kitchenApiSlice.util.updateQueryData(
            "getKitchens",
            { shopId: args.shopId },
            (draft) => {
              const index = draft.findIndex((d) => d.id === args.kitchenId);
              if (index !== -1) draft.splice(index, 1);
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

    // uncooked region
    getUncookedDishOrders: builder.query<KitchenDishOrder[], string>({
      queryFn: async (shopId) => {
        try {
          const uncookedDishOrders = await getUncookedDishOrdersRequest({
            shopId,
          });

          return {
            data: uncookedDishOrders,
          };
        } catch (error) {
          return { error: { status: 500, data: error } };
        }
      },

      providesTags: ["UncookedDishOrders"],
    }),

    updateUncookedDishOrdersRequest: builder.mutation<
      boolean,
      UpdateUncookedDishOrdersRequest
    >({
      queryFn: async ({ shopId, updateRequests }) => {
        try {
          await updateUncookedDishOrdersRequest({
            shopId,
            updateRequests,
          });

          return {
            data: true,
          };
        } catch (error) {
          return { error: { status: 500, data: error } };
        }
      },

      invalidatesTags: [
        "UncookedDishOrders",
        "UnservedDishOrders",
        "CookedHistories",
        "ServedHistories",
      ],

      // ✅ Optimistic Update Implementation
      onQueryStarted: async (args, { dispatch, queryFulfilled }) => {
        const patchResult = dispatch(
          kitchenApiSlice.util.updateQueryData(
            "getUncookedDishOrders",
            args.shopId,
            (draft) => {
              const updatedDishOrder = new Set(
                args.updateRequests.map((request) => request.dishOrderId)
              );
              return draft.filter(
                (dishOrder) => !updatedDishOrder.has(dishOrder.id)
              );
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

    undoCookedDishOrdersRequest: builder.mutation<
      boolean,
      UndoCookedDishOrdersRequest
    >({
      queryFn: async ({ shopId, updateRequests }) => {
        try {
          await undoCookedDishOrdersRequest({
            shopId,
            updateRequests,
          });

          return {
            data: true,
          };
        } catch (error) {
          return { error: { status: 500, data: error } };
        }
      },

      invalidatesTags: [
        "UncookedDishOrders",
        "UnservedDishOrders",
        "CookedHistories",
        "ServedHistories",
      ],
    }),

    // unserved region
    getUnservedDishOrdersRequest: builder.query<KitchenDishOrder[], string>({
      queryFn: async (shopId) => {
        try {
          const unservedDishOrders = await getUnservedDishOrdersRequest({
            shopId,
          });

          return {
            data: unservedDishOrders,
          };
        } catch (error) {
          return { error: { status: 500, data: error } };
        }
      },

      providesTags: ["UnservedDishOrders"],
    }),

    updateUnservedDishOrdersRequest: builder.mutation<
      boolean,
      UpdateUnservedDishOrdersRequest
    >({
      queryFn: async ({ shopId, updateRequests }) => {
        try {
          await updateUnservedDishOrdersRequest({
            shopId,
            updateRequests,
          });

          return {
            data: true,
          };
        } catch (error) {
          return { error: { status: 500, data: error } };
        }
      },

      invalidatesTags: ["UnservedDishOrders", "ServedHistories"],
    }),

    undoServedDishOrdersRequest: builder.mutation<
      boolean,
      UndoServedDishOrdersRequest
    >({
      queryFn: async ({ shopId, updateRequests }) => {
        try {
          await undoServedDishOrdersRequest({
            shopId,
            updateRequests,
          });

          return {
            data: true,
          };
        } catch (error) {
          return { error: { status: 500, data: error } };
        }
      },

      invalidatesTags: ["UnservedDishOrders", "ServedHistories"],
    }),

    getCookedHistoriesRequest: builder.query<
      KitchenLog[],
      GetCookedHistoriesRequest
    >({
      queryFn: async ({ shopId, from, to }) => {
        try {
          const histories = await getCookedHistoriesRequest({
            shopId,
            from,
            to,
          });

          return {
            data: histories,
          };
        } catch (error) {
          return { error: { status: 500, data: error } };
        }
      },

      providesTags: ["CookedHistories"],
    }),

    getServedHistoriesRequest: builder.query<
      KitchenLog[],
      GetServedHistoriesRequest
    >({
      queryFn: async ({ shopId, from, to }) => {
        try {
          const histories = await getServedHistoriesRequest({
            shopId,
            from,
            to,
          });

          return {
            data: histories,
          };
        } catch (error) {
          return { error: { status: 500, data: error } };
        }
      },

      providesTags: ["ServedHistories"],
    }),
  }),
});

export const {
  useCreateKitchenMutation,
  useGetKitchenQuery,
  useGetKitchensQuery,
  useDeleteKitchenMutation,
  useUpdateKitchenMutation,

  useGetUncookedDishOrdersQuery,
  useUpdateUncookedDishOrdersRequestMutation,
  useUndoCookedDishOrdersRequestMutation,

  useGetUnservedDishOrdersRequestQuery,
  useUpdateUnservedDishOrdersRequestMutation,
  useUndoServedDishOrdersRequestMutation,

  useGetCookedHistoriesRequestQuery,
  useGetServedHistoriesRequestQuery,
} = kitchenApiSlice;
