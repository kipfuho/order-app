import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { API_BASE_URL } from "../../apis/api.service";
import {
  cancelOrderSessionPaidStatusRequest,
  cancelOrderSessionRequest,
  changeDishQuantityRequest,
  createOrderRequest,
  discountDishOrderRequest,
  discountOrderSessionRequest,
  getActiveOrderSessionsRequest,
  getOrderSessionDetailRequest,
  getOrderSessionHistoryRequest,
  getTablesForOrderRequest,
  payOrderSessionRequest,
} from "../../apis/order.api.service";
import {
  OrderSession,
  OrderSessionHistory,
  TableForOrder,
} from "../state.interface";
import { RootState } from "../store";
import {
  CancelOrderSessionPaidStatusRequest,
  CancelOrderSessionRequest,
  ChangeDishQuantityRequest,
  CreateOrderRequest,
  DiscountDishOrderRequest,
  DiscountOrderSessionRequest,
  GetActiveOrderSessionRequest,
  GetOrderSessionDetailRequest,
  GetOrderSessionHistoryRequest,
  PayOrderSessionRequest,
} from "../../apis/order.api.interface";
import { resetCurrentOrder, resetCurrentTable } from "../shop.slice";

export const orderApiSlice = createApi({
  reducerPath: "orderApi",
  baseQuery: fetchBaseQuery({ baseUrl: API_BASE_URL }),
  tagTypes: ["TablesForOrder", "OrderSessions", "ActiveOrderSessions"],
  // keepUnusedDataFor: 600,
  endpoints: (builder) => ({
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
      providesTags: ["TablesForOrder"],
    }),

    getActiveOrderSessions: builder.query<
      OrderSession[],
      GetActiveOrderSessionRequest
    >({
      queryFn: async ({ shopId, tableId }) => {
        try {
          const orderSessions = await getActiveOrderSessionsRequest({
            shopId,
            tableId,
          });

          return { data: orderSessions };
        } catch (error) {
          return { error: { status: 500, data: error } };
        }
      },
      providesTags: (_, __, arg) => [
        { type: "ActiveOrderSessions", id: arg.tableId },
        "TablesForOrder",
      ],
    }),

    getOrderSessionDetail: builder.query<
      OrderSession,
      GetOrderSessionDetailRequest
    >({
      queryFn: async ({ shopId, orderSessionId }) => {
        try {
          const orderSession = await getOrderSessionDetailRequest({
            shopId,
            orderSessionId,
          });

          return { data: orderSession };
        } catch (error) {
          return { error: { status: 500, data: error } };
        }
      },
      providesTags: (result) =>
        result
          ? [{ type: "OrderSessions" as const, id: result.id }]
          : [{ type: "OrderSessions" as const, id: "ALL" }],
    }),

    getOrderSessionHistory: builder.query<
      OrderSessionHistory[],
      GetOrderSessionHistoryRequest
    >({
      queryFn: async ({ shopId, from, to }) => {
        try {
          const orderSessions = await getOrderSessionHistoryRequest({
            shopId,
            from,
            to,
          });

          return { data: orderSessions };
        } catch (error) {
          return { error: { status: 500, data: error } };
        }
      },
      providesTags: (result): { type: "OrderSessions"; id: string }[] =>
        result
          ? [
              ...result.map(({ id }) => ({
                type: "OrderSessions" as const,
                id,
              })),
              { type: "OrderSessions" as const, id: "ALL" },
            ]
          : [{ type: "OrderSessions" as const, id: "ALL" }],
    }),

    createOrder: builder.mutation<OrderSession, CreateOrderRequest>({
      queryFn: async ({ orderSessionId, shopId, tableId }, api) => {
        try {
          const state = api.getState() as RootState;

          const orderSession = await createOrderRequest({
            shopId,
            dishOrders: Object.values(state.shop.currentOrder),
            orderSessionId,
            tableId,
          });

          api.dispatch(resetCurrentOrder());

          return { data: orderSession };
        } catch (error) {
          return { error: { status: 500, data: error } };
        }
      },
      invalidatesTags: (_, __, { orderSessionId }) => [
        { type: "OrderSessions", id: orderSessionId },
        "TablesForOrder",
      ], // Enables cache invalidation
    }),

    changeDishQuantity: builder.mutation<boolean, ChangeDishQuantityRequest>({
      queryFn: async ({
        orderSessionId,
        shopId,
        orderId,
        dishOrderId,
        newQuantity,
      }) => {
        try {
          await changeDishQuantityRequest({
            shopId,
            orderId,
            dishOrderId,
            newQuantity,
          });

          return { data: true };
        } catch (error) {
          return { error: { status: 500, data: error } };
        }
      },

      invalidatesTags: (_, __, { orderSessionId }) => [
        { type: "OrderSessions", id: orderSessionId },
        "TablesForOrder",
      ], // Enables cache invalidation
    }),

    payOrderSession: builder.mutation<boolean, PayOrderSessionRequest>({
      queryFn: async ({ orderSessionId, shopId, paymentDetails }) => {
        try {
          await payOrderSessionRequest({
            shopId,
            orderSessionId,
            paymentDetails,
          });

          return { data: true };
        } catch (error) {
          return { error: { status: 500, data: error } };
        }
      },
      invalidatesTags: (_, __, { orderSessionId }) => [
        { type: "OrderSessions", id: orderSessionId },
        "TablesForOrder",
      ], // Enables cache invalidation
    }),

    cancelOrderSession: builder.mutation<boolean, CancelOrderSessionRequest>({
      queryFn: async ({ shopId, orderSessionId, reason }) => {
        try {
          await cancelOrderSessionRequest({
            shopId,
            orderSessionId,
            reason,
          });

          return { data: true };
        } catch (error) {
          return { error: { status: 500, data: error } };
        }
      },
      invalidatesTags: (_, __, { orderSessionId }) => [
        { type: "OrderSessions", id: orderSessionId },
        "TablesForOrder",
      ], // Enables cache invalidation
    }),

    cancelOrderSessionPaidStatus: builder.mutation<
      undefined,
      CancelOrderSessionPaidStatusRequest
    >({
      queryFn: async ({ shopId, orderSessionId }) => {
        try {
          await cancelOrderSessionPaidStatusRequest({
            shopId,
            orderSessionId,
          });

          return { data: undefined };
        } catch (error) {
          return { error: { status: 500, data: error } };
        }
      },
      invalidatesTags: (_, __, { orderSessionId }) => [
        { type: "OrderSessions", id: orderSessionId },
        "TablesForOrder",
      ], // Enables cache invalidation
    }),

    discountDishOrder: builder.mutation<boolean, DiscountDishOrderRequest>({
      queryFn: async ({
        shopId,
        orderSessionId,
        discountAfterTax,
        discountType,
        discountValue,
        dishOrderId,
        orderId,
        discountReason,
      }) => {
        try {
          await discountDishOrderRequest({
            shopId,
            orderSessionId,
            discountAfterTax,
            discountType,
            discountValue,
            dishOrderId,
            orderId,
            discountReason,
          });

          return { data: true };
        } catch (error) {
          return { error: { status: 500, data: error } };
        }
      },
      invalidatesTags: (_, __, { orderSessionId }) => [
        { type: "OrderSessions", id: orderSessionId },
        "TablesForOrder",
      ], // Enables cache invalidation
    }),

    discountOrderSession: builder.mutation<
      undefined,
      DiscountOrderSessionRequest
    >({
      queryFn: async ({
        shopId,
        orderSessionId,
        discountAfterTax,
        discountType,
        discountValue,
        discountReason,
      }) => {
        try {
          await discountOrderSessionRequest({
            shopId,
            orderSessionId,
            discountAfterTax,
            discountType,
            discountValue,
            discountReason,
          });

          return { data: undefined };
        } catch (error) {
          return { error: { status: 500, data: error } };
        }
      },
      invalidatesTags: (_, __, { orderSessionId }) => [
        { type: "OrderSessions", id: orderSessionId },
        "TablesForOrder",
      ], // Enables cache invalidation
    }),
  }),
});

export const {
  useGetTablesForOrderQuery,
  useGetActiveOrderSessionsQuery,
  useGetOrderSessionDetailQuery,
  useGetOrderSessionHistoryQuery,
  useCreateOrderMutation,
  useChangeDishQuantityMutation,
  usePayOrderSessionMutation,
  useCancelOrderSessionMutation,
  useCancelOrderSessionPaidStatusMutation,
  useDiscountDishOrderMutation,
  useDiscountOrderSessionMutation,
} = orderApiSlice;
