import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { Shop } from "../state.interface";
import { RootState } from "../store";
import {
  createShopRequest,
  deleteShopRequest,
  getShopRequest,
  queryShopsRequest,
  updateShopRequest,
} from "../../apis/shop.api.service";
import { API_BASE_URL } from "../../apis/api.service";
import {
  CreateShopRequest,
  QueryShopsRequest,
  UpdateShopRequest,
} from "../../apis/shop.api.interface";

export const shopApiSlice = createApi({
  reducerPath: "shopApi",
  baseQuery: fetchBaseQuery({ baseUrl: API_BASE_URL }),
  tagTypes: ["Shops"],
  // keepUnusedDataFor: 600,
  endpoints: (builder) => ({
    getShop: builder.query<Shop, { shopId: string; isCustomerApp?: boolean }>({
      queryFn: async ({ shopId, isCustomerApp = false }) => {
        try {
          const shop = await getShopRequest(shopId, isCustomerApp);

          return { data: shop };
        } catch (error) {
          return { error: { status: 500, data: error } };
        }
      },
      providesTags: (_, __, { shopId }) => [{ type: "Shops", shopId }], // Enables cache invalidation
    }),

    getShops: builder.query<Shop[], QueryShopsRequest>({
      queryFn: async (
        { searchName, sortBy = "createdAt", page = 1, limit = 1000 },
        api
      ) => {
        const user = (api.getState() as RootState).auth.session;
        if (!user) {
          return { error: { status: 400, data: "User is required" } };
        }

        try {
          const shops = await queryShopsRequest({
            user,
            limit,
            page,
            searchName,
            sortBy,
          });

          return { data: shops };
        } catch (error) {
          return { error: { status: 500, data: error } };
        }
      },
      providesTags: ["Shops"], // Enables cache invalidation
    }),

    createShop: builder.mutation<Shop, CreateShopRequest>({
      queryFn: async (args) => {
        try {
          const shop = await createShopRequest({
            ...args,
          });

          return { data: shop };
        } catch (error) {
          return { error: { status: 500, data: error } };
        }
      },
      invalidatesTags: ["Shops"],
    }),

    updateShop: builder.mutation<Shop, UpdateShopRequest>({
      queryFn: async (args) => {
        try {
          const shop = await updateShopRequest({
            ...args,
          });

          return { data: shop };
        } catch (error) {
          return { error: { status: 500, data: error } };
        }
      },

      invalidatesTags: (result, error, args) => (error ? ["Shops"] : []),

      // ✅ Optimistic Update Implementation
      onQueryStarted: async (args, { dispatch, queryFulfilled }) => {
        const patchResult = dispatch(
          shopApiSlice.util.updateQueryData("getShops", {}, (draft) => {
            const index = draft.findIndex((s) => s.id === args.shopId);
            if (index !== -1) {
              draft[index] = { ...draft[index], ...args };
            }
          })
        );

        try {
          await queryFulfilled; // Wait for actual API request to complete
        } catch {
          patchResult.undo(); // Rollback if API call fails
        }
      },
    }),

    deleteShop: builder.mutation<boolean, string>({
      queryFn: async (shopId: string) => {
        try {
          await deleteShopRequest({
            shopId,
          });

          return { data: true };
        } catch (error) {
          return { error: { status: 500, data: error } };
        }
      },

      invalidatesTags: (result, error, args) => (error ? ["Shops"] : []),

      // ✅ Optimistic Update Implementation
      onQueryStarted: async (shopId, { dispatch, queryFulfilled }) => {
        const patchResult = dispatch(
          shopApiSlice.util.updateQueryData("getShops", {}, (draft) => {
            return draft.filter((s) => s.id !== shopId);
          })
        );

        try {
          await queryFulfilled; // Wait for actual API request to complete
        } catch {
          patchResult.undo(); // Rollback if API call fails
        }
      },
    }),
  }),
});

export const {
  useGetShopQuery,
  useGetShopsQuery,
  useCreateShopMutation,
  useUpdateShopMutation,
  useDeleteShopMutation,
} = shopApiSlice;
