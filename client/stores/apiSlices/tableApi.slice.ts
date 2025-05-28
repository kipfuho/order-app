import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { Table, TablePosition } from "../state.interface";
import {
  createTablePositionRequest,
  createTableRequest,
  deleteTablePositionRequest,
  deleteTableRequest,
  getTablePositionsRequest,
  getTableRequest,
  getTablesRequest,
  updateTablePositionRequest,
  updateTableRequest,
} from "@apis/table.api.service";
import {
  CreateTablePositionRequest,
  CreateTableRequest,
  DeleteTablePositionRequest,
  DeleteTableRequest,
  UpdateTablePositionRequest,
  UpdateTableRequest,
} from "@apis/table.api.interface";
import { API_BASE_URL } from "@apis/api.service";

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
          const tablePosition = await createTablePositionRequest(args);

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
          const tablePosition = await updateTablePositionRequest(args);

          return { data: tablePosition };
        } catch (error) {
          return { error: { status: 500, data: error } };
        }
      },

      invalidatesTags: (result, error, args) =>
        error ? ["TablePositions"] : [],

      // ✅ Optimistic Update Implementation
      onQueryStarted: async (args, { dispatch, queryFulfilled }) => {
        const patchResult = dispatch(
          tableApiSlice.util.updateQueryData(
            "getTablePositions",
            args.shopId,
            (draft) => {
              const index = draft.findIndex(
                (tp) => tp.id === args.tablePositionId,
              );
              if (index !== -1) {
                draft[index] = { ...draft[index], ...args };
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

    deleteTablePosition: builder.mutation<boolean, DeleteTablePositionRequest>({
      queryFn: async (args) => {
        try {
          await deleteTablePositionRequest(args);

          return { data: true };
        } catch (error) {
          return { error: { status: 500, data: error } };
        }
      },

      invalidatesTags: (result, error, args) =>
        error ? ["TablePositions"] : [],

      // ✅ Optimistic Update Implementation
      onQueryStarted: async (args, { dispatch, queryFulfilled }) => {
        const patchResult = dispatch(
          tableApiSlice.util.updateQueryData(
            "getTablePositions",
            args.shopId,
            (draft) => {
              return draft.filter((tp) => tp.id !== args.tablePositionId);
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

    /** Tables */
    getTable: builder.query<
      Table,
      { tableId: string; shopId: string; isCustomerApp: boolean }
    >({
      queryFn: async ({ shopId, tableId, isCustomerApp = false }) => {
        try {
          const table = await getTableRequest({
            shopId,
            tableId,
            isCustomerApp,
          });

          return { data: table };
        } catch (error) {
          return { error: { status: 500, data: error } };
        }
      },
      providesTags: (table) =>
        table
          ? [
              { type: "TablePositions", id: table.position.id },
              { type: "Tables", id: table.id },
            ]
          : [], // Enables cache invalidation
    }),

    getTables: builder.query<Table[], string>({
      queryFn: async (shopId) => {
        try {
          const tables = await getTablesRequest({
            shopId,
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
          const table = await createTableRequest(args);

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
          const table = await updateTableRequest(args);

          return { data: table };
        } catch (error) {
          return { error: { status: 500, data: error } };
        }
      },

      invalidatesTags: (result, error, args) => (error ? ["Tables"] : []),

      // ✅ Optimistic Update Implementation
      onQueryStarted: async (args, { dispatch, queryFulfilled }) => {
        const patchResult = dispatch(
          tableApiSlice.util.updateQueryData(
            "getTables",
            args.shopId,
            (draft) => {
              const index = draft.findIndex((tp) => tp.id === args.tableId);
              if (index !== -1) {
                draft[index] = { ...draft[index], ...args };
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

    deleteTable: builder.mutation<boolean, DeleteTableRequest>({
      queryFn: async (args) => {
        try {
          await deleteTableRequest(args);

          return { data: true };
        } catch (error) {
          return { error: { status: 500, data: error } };
        }
      },

      invalidatesTags: (result, error, args) => (error ? ["Tables"] : []),

      // ✅ Optimistic Update Implementation
      onQueryStarted: async (args, { dispatch, queryFulfilled }) => {
        const patchResult = dispatch(
          tableApiSlice.util.updateQueryData(
            "getTables",
            args.shopId,
            (draft) => {
              return draft.filter((t) => t.id !== args.tableId);
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
  }),
});

export const {
  useGetTablePositionsQuery,
  useCreateTablePositionMutation,
  useUpdateTablePositionMutation,
  useDeleteTablePositionMutation,
  useGetTableQuery,
  useGetTablesQuery,
  useCreateTableMutation,
  useUpdateTableMutation,
  useDeleteTableMutation,
} = tableApiSlice;
