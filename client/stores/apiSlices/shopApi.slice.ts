import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { Shop } from "../state.interface";
import { API_BASE_URL } from "../../apis/api.service";
import { RootState } from "../store";
import {
  createShopRequest,
  deleteShopRequest,
  queryShopsRequest,
  updateShopRequest,
} from "../../apis/shop.api.service";

export const shopApiSlice = createApi({
  reducerPath: "shopApi",
  baseQuery: fetchBaseQuery({ baseUrl: API_BASE_URL }),
  tagTypes: ["Shops"],
  // keepUnusedDataFor: 600,
  endpoints: (builder) => ({
    getShops: builder.query<
      Shop[],
      {
        searchName?: string;
        sortBy?: string;
        page?: number;
        limit?: number;
      }
    >({
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
            rtk: true,
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

    createShop: builder.mutation<
      Shop,
      {
        name: string;
        email: string;
        phone?: string;
        taxRate?: number;
        location?: string;
      }
    >({
      queryFn: async (args) => {
        try {
          const shop = await createShopRequest({
            ...args,
            rtk: true,
          });

          return { data: shop };
        } catch (error) {
          return { error: { status: 500, data: error } };
        }
      },
      invalidatesTags: ["Shops"],
    }),

    updateShop: builder.mutation<
      Shop,
      {
        shopId: string;
        name: string;
        email: string;
        phone?: string;
        taxRate?: number;
        location?: string;
      }
    >({
      queryFn: async (args) => {
        try {
          const shop = await updateShopRequest({
            ...args,
            rtk: true,
          });

          return { data: shop };
        } catch (error) {
          return { error: { status: 500, data: error } };
        }
      },
      invalidatesTags: ["Shops"],
    }),

    deleteShop: builder.mutation<undefined, string>({
      queryFn: async (shopId: string) => {
        try {
          await deleteShopRequest({
            shopId,
            rtk: true,
          });

          return { data: undefined };
        } catch (error) {
          return { error: { status: 500, data: error } };
        }
      },
      invalidatesTags: ["Shops"],
    }),
  }),
});

export const {
  useGetShopsQuery,
  useCreateShopMutation,
  useUpdateShopMutation,
  useDeleteShopMutation,
} = shopApiSlice;
