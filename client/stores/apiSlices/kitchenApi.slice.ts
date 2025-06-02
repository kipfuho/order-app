import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { KitchenDishOrder, Kitchen, KitchenLog } from "../state.interface";
import { API_BASE_URL } from "@apis/api.service";
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
} from "@apis/kitchen.api.service";
import {
  CreateKitchenRequest,
  DeleteKitchenRequest,
  GetCookedHistoriesRequest,
  GetKitchenRequest,
  GetKitchensRequest,
  GetServedHistoriesRequest,
  GetUncookedDishOrdersRequest,
  GetUnservedDishOrdersRequest,
  UndoCookedDishOrdersRequest,
  UndoServedDishOrdersRequest,
  UpdateKitchenRequest,
  UpdateUncookedDishOrdersRequest,
  UpdateUnservedDishOrdersRequest,
} from "@apis/kitchen.api.interface";

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
                draft[index] = {
                  ...draft[index],
                  ...args,
                };
              }
            },
          ),
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
            },
          ),
        );

        try {
          await queryFulfilled; // Wait for actual API request to complete
        } catch {
          patchResult.undo(); // Rollback if API call fails
        }
      },
    }),

    // uncooked region
    getUncookedDishOrders: builder.query<
      {
        items: KitchenDishOrder[];
        nextCursor: string;
      },
      GetUncookedDishOrdersRequest
    >({
      queryFn: async ({ shopId, cursor }) => {
        try {
          const { uncookedDishOrders, nextCursor } =
            await getUncookedDishOrdersRequest({
              shopId,
              cursor,
            });

          return {
            data: {
              items: uncookedDishOrders,
              nextCursor,
            },
          };
        } catch (error) {
          return { error: { status: 500, data: error } };
        }
      },
      // This ensures that different cursors for the same shopId are treated as the same query
      serializeQueryArgs: ({ queryArgs, endpointName }) => {
        return `${endpointName}-${queryArgs.shopId}`;
      },
      // Merge function to combine paginated results
      merge: (currentCache, newItems, { arg }) => {
        if (arg.cursor) {
          // If we have a cursor, we're loading more data - append it
          return {
            ...newItems,
            items: [...currentCache.items, ...newItems.items],
          };
        } else {
          // If no cursor, this is a fresh load - replace the data
          return newItems;
        }
      },
      // Force refetch when the cursor changes
      forceRefetch({ currentArg, previousArg }) {
        if (!currentArg?.cursor) return false;
        return currentArg?.cursor !== previousArg?.cursor;
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

      invalidatesTags: (result, error, args) =>
        error
          ? ["UncookedDishOrders", "UnservedDishOrders", "CookedHistories"]
          : ["UnservedDishOrders", "CookedHistories"],

      // ✅ Optimistic Update Implementation
      onQueryStarted: async (args, { dispatch, queryFulfilled }) => {
        const patchResult = dispatch(
          kitchenApiSlice.util.updateQueryData(
            "getUncookedDishOrders",
            {
              shopId: args.shopId,
            },
            (draft) => {
              const updatedDishOrder = new Set(
                args.updateRequests.map((request) => request.dishOrderId),
              );
              return {
                items: draft.items.filter(
                  (dishOrder) => !updatedDishOrder.has(dishOrder.id),
                ),
                nextCursor: draft.nextCursor,
              };
            },
          ),
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
    getUnservedDishOrdersRequest: builder.query<
      {
        items: KitchenDishOrder[];
        nextCursor: string;
      },
      GetUnservedDishOrdersRequest
    >({
      queryFn: async ({ shopId, cursor }) => {
        try {
          const { unservedDishOrders, nextCursor } =
            await getUnservedDishOrdersRequest({
              shopId,
              cursor,
            });

          return {
            data: {
              items: unservedDishOrders,
              nextCursor,
            },
          };
        } catch (error) {
          return { error: { status: 500, data: error } };
        }
      },
      // This ensures that different cursors for the same shopId are treated as the same query
      serializeQueryArgs: ({ queryArgs, endpointName }) => {
        return `${endpointName}-${queryArgs.shopId}`;
      },
      // Merge function to combine paginated results
      merge: (currentCache, newItems, { arg }) => {
        if (arg.cursor) {
          // If we have a cursor, we're loading more data - append it
          return {
            ...newItems,
            items: [...currentCache.items, ...newItems.items],
          };
        } else {
          // If no cursor, this is a fresh load - replace the data
          return newItems;
        }
      },
      // Force refetch when the cursor changes
      forceRefetch({ currentArg, previousArg }) {
        if (!currentArg?.cursor) return false;
        return currentArg?.cursor !== previousArg?.cursor;
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

      invalidatesTags: (result, error, args) =>
        error ? ["UnservedDishOrders", "ServedHistories"] : ["ServedHistories"],

      // ✅ Optimistic Update Implementation
      onQueryStarted: async (args, { dispatch, queryFulfilled }) => {
        const patchResult = dispatch(
          kitchenApiSlice.util.updateQueryData(
            "getUnservedDishOrdersRequest",
            {
              shopId: args.shopId,
            },
            (draft) => {
              const updatedDishOrder = new Set(
                args.updateRequests.map((request) => request.dishOrderId),
              );
              return {
                items: draft.items.filter(
                  (dishOrder) => !updatedDishOrder.has(dishOrder.id),
                ),
                nextCursor: draft.nextCursor,
              };
            },
          ),
        );

        try {
          await queryFulfilled; // Wait for actual API request to complete
        } catch {
          patchResult.undo(); // Rollback if API call fails
        }
      },
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
      {
        items: KitchenLog[];
        nextCursor: string;
      },
      GetCookedHistoriesRequest
    >({
      queryFn: async ({ shopId, from, to, cursor }) => {
        try {
          const { cookedHistories, nextCursor } =
            await getCookedHistoriesRequest({
              shopId,
              from,
              to,
              cursor,
            });

          return {
            data: {
              items: cookedHistories,
              nextCursor,
            },
          };
        } catch (error) {
          return { error: { status: 500, data: error } };
        }
      },
      // This ensures that different cursors for the same shopId are treated as the same query
      serializeQueryArgs: ({ queryArgs, endpointName }) => {
        return `${endpointName}-${queryArgs.shopId}-${queryArgs.from}-${queryArgs.to}`;
      },
      // Merge function to combine paginated results
      merge: (currentCache, newItems, { arg }) => {
        if (arg.cursor) {
          // If we have a cursor, we're loading more data - append it
          return {
            ...newItems,
            items: [...currentCache.items, ...newItems.items],
          };
        } else {
          // If no cursor, this is a fresh load - replace the data
          return newItems;
        }
      },
      // Force refetch when the cursor changes
      forceRefetch({ currentArg, previousArg }) {
        if (!currentArg?.cursor) return false;
        return currentArg?.cursor !== previousArg?.cursor;
      },
      providesTags: ["CookedHistories"],
    }),

    getServedHistoriesRequest: builder.query<
      {
        items: KitchenLog[];
        nextCursor: string;
      },
      GetServedHistoriesRequest
    >({
      queryFn: async ({ shopId, from, to }) => {
        try {
          const { servedHistories, nextCursor } =
            await getServedHistoriesRequest({
              shopId,
              from,
              to,
            });

          return {
            data: { items: servedHistories, nextCursor },
          };
        } catch (error) {
          return { error: { status: 500, data: error } };
        }
      },
      // This ensures that different cursors for the same shopId are treated as the same query
      serializeQueryArgs: ({ queryArgs, endpointName }) => {
        return `${endpointName}-${queryArgs.shopId}-${queryArgs.from}-${queryArgs.to}`;
      },
      // Merge function to combine paginated results
      merge: (currentCache, newItems, { arg }) => {
        if (arg.cursor) {
          // If we have a cursor, we're loading more data - append it
          return {
            ...newItems,
            items: [...currentCache.items, ...newItems.items],
          };
        } else {
          // If no cursor, this is a fresh load - replace the data
          return newItems;
        }
      },
      // Force refetch when the cursor changes
      forceRefetch({ currentArg, previousArg }) {
        if (!currentArg?.cursor) return false;
        return currentArg?.cursor !== previousArg?.cursor;
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
