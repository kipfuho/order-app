import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { Table, TablePosition } from "../state.interface";
import { API_BASE_URL } from "../../apis/api.service";
import {
  createTablePositionRequest,
  createTableRequest,
  deleteTablePositionRequest,
  deleteTableRequest,
  getTablePositionsRequest,
  getTablesRequest,
  updateTablePositionRequest,
  updateTableRequest,
} from "../../apis/table.api.service";
import {
  CreateTablePositionRequest,
  CreateTableRequest,
  DeleteTablePositionRequest,
  DeleteTableRequest,
  UpdateTablePositionRequest,
  UpdateTableRequest,
} from "../../apis/table.api.interface";

export const tableApiSlice = createApi({
  reducerPath: "tableApi",
  baseQuery: fetchBaseQuery({ baseUrl: API_BASE_URL }),
  tagTypes: ["Tables", "TablePositions"],
  // keepUnusedDataFor: 600,
  endpoints: (builder) => ({
    /** Table Positions */
    getTablePositions: builder.query<TablePosition[], string>({
      queryFn: async (shopId) => {
        try {
          const tablePositions = await getTablePositionsRequest({
            shopId,
            rtk: true,
          });

          return { data: tablePositions };
        } catch (error) {
          return { error: { status: 500, data: error } };
        }
      },
      providesTags: ["TablePositions"], // Enables cache invalidation
    }),

    createTablePosition: builder.mutation<
      TablePosition,
      CreateTablePositionRequest
    >({
      queryFn: async (args) => {
        try {
          const tablePosition = await createTablePositionRequest({
            ...args,
            rtk: true,
          });

          return { data: tablePosition };
        } catch (error) {
          return { error: { status: 500, data: error } };
        }
      },
      invalidatesTags: ["TablePositions"],
    }),

    updateTablePosition: builder.mutation<
      TablePosition,
      UpdateTablePositionRequest
    >({
      queryFn: async (args) => {
        try {
          const tablePosition = await updateTablePositionRequest({
            ...args,
            rtk: true,
          });

          return { data: tablePosition };
        } catch (error) {
          return { error: { status: 500, data: error } };
        }
      },
      invalidatesTags: ["TablePositions"],
    }),

    deleteTablePosition: builder.mutation<
      undefined,
      DeleteTablePositionRequest
    >({
      queryFn: async (args) => {
        try {
          await deleteTablePositionRequest({ ...args, rtk: true });

          return { data: undefined };
        } catch (error) {
          return { error: { status: 500, data: error } };
        }
      },
      invalidatesTags: ["TablePositions"],
    }),

    /** Tables */
    getTables: builder.query<Table[], string>({
      queryFn: async (shopId) => {
        try {
          const tables = await getTablesRequest({
            shopId,
            rtk: true,
          });

          return { data: tables };
        } catch (error) {
          return { error: { status: 500, data: error } };
        }
      },
      providesTags: ["TablePositions", "Tables"], // Enables cache invalidation
    }),

    createTable: builder.mutation<Table, CreateTableRequest>({
      queryFn: async (args) => {
        try {
          const table = await createTableRequest({
            ...args,
            rtk: true,
          });

          return { data: table };
        } catch (error) {
          return { error: { status: 500, data: error } };
        }
      },
      invalidatesTags: ["Tables"],
    }),

    updateTable: builder.mutation<Table, UpdateTableRequest>({
      queryFn: async (args) => {
        try {
          const table = await updateTableRequest({
            ...args,
            rtk: true,
          });

          return { data: table };
        } catch (error) {
          return { error: { status: 500, data: error } };
        }
      },
      invalidatesTags: ["Tables"],
    }),

    deleteTable: builder.mutation<undefined, DeleteTableRequest>({
      queryFn: async (args) => {
        try {
          await deleteTableRequest({ ...args, rtk: true });

          return { data: undefined };
        } catch (error) {
          return { error: { status: 500, data: error } };
        }
      },
      invalidatesTags: ["Tables"],
    }),
  }),
});

export const {
  useGetTablePositionsQuery,
  useCreateTablePositionMutation,
  useUpdateTablePositionMutation,
  useDeleteTablePositionMutation,
  useGetTablesQuery,
  useCreateTableMutation,
  useUpdateTableMutation,
  useDeleteTableMutation,
} = tableApiSlice;
