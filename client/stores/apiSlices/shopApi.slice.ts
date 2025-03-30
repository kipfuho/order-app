import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { Shop, User } from "../state.interface";
import { API_BASE_URL, queryShopsRequest } from "../../apis/api.service";
import store from "../store";

export const shopApiSlice = createApi({
  reducerPath: "shopApi",
  baseQuery: fetchBaseQuery({ baseUrl: API_BASE_URL }),
  tagTypes: ["Shops"],
  endpoints: (builder) => ({
    getShops: builder.query<
      Shop[],
      {
        user?: User | null;
        searchName?: string;
        sortBy?: string;
        page?: number;
        limit?: number;
      }
    >({
      queryFn: async ({
        user,
        searchName,
        sortBy = "createdAt",
        page = 1,
        limit = 1000,
      }) => {
        if (!user) {
          user = store.getState().auth.session;
        }
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
      keepUnusedDataFor: 300,
    }),

    updateShop: builder.mutation<Shop, Partial<Shop>>({
      query: ({ id, ...updatedData }) => ({
        url: `/shops/${id}`,
        method: "PATCH",
        body: updatedData,
      }),
      invalidatesTags: ["Shops"],
    }),
  }),
});

export const { useGetShopsQuery } = shopApiSlice;
