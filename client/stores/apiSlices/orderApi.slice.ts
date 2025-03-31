import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { API_BASE_URL } from "../../apis/api.service";
import { getTablesForOrderRequest } from "../../apis/order.api.service";
import { TableForOrder } from "../state.interface";

export const orderApiSlice = createApi({
  reducerPath: "orderApi",
  baseQuery: fetchBaseQuery({ baseUrl: API_BASE_URL }),
  tagTypes: ["TablesForOrder"],
  // keepUnusedDataFor: 600,
  endpoints: (builder) => ({
    /** Table Positions */
    getTablesForOrder: builder.query<TableForOrder[], string>({
      queryFn: async (shopId) => {
        try {
          const tablePositions = await getTablesForOrderRequest({
            shopId,
          });

          return { data: tablePositions };
        } catch (error) {
          return { error: { status: 500, data: error } };
        }
      },
      providesTags: ["TablesForOrder"], // Enables cache invalidation
    }),
  }),
});

export const { useGetTablesForOrderQuery } = orderApiSlice;
