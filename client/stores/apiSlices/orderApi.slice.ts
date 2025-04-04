import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { API_BASE_URL } from "../../apis/api.service";
import {
  cancelOrderSessionPaidStatusRequest,
  cancelOrderSessionRequest,
  createOrderRequest,
  discountDishOrderRequest,
  discountOrderSessionRequest,
  getOrderSessionDetailRequest,
  getOrderSessionHistoryRequest,
  getTablesForOrderRequest,
  payOrderSessionRequest,
} from "../../apis/order.api.service";
import { OrderSession, TableForOrder } from "../state.interface";
import { RootState } from "../store";
import {
  CancelOrderSessionPaidStatusRequest,
  CancelOrderSessionRequest,
  CreateOrderRequest,
  DiscountDishOrderRequest,
  DiscountOrderSessionRequest,
  GetOrderSessionDetailRequest,
  GetOrderSessionHistoryRequest,
  PayOrderSessionRequest,
} from "../../apis/order.api.interface";

export const orderApiSlice = createApi({
  reducerPath: "orderApi",
  baseQuery: fetchBaseQuery({ baseUrl: API_BASE_URL }),
  tagTypes: ["TablesForOrder", "OrderSessions"],
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
      OrderSession[],
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

    payOrderSession: builder.mutation<undefined, PayOrderSessionRequest>({
      queryFn: async ({ orderSessionId, shopId, paymentDetails }) => {
        try {
          await payOrderSessionRequest({
            shopId,
            orderSessionId,
            paymentDetails,
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

    cancelOrderSession: builder.mutation<undefined, CancelOrderSessionRequest>({
      queryFn: async ({ shopId, orderSessionId, reason }) => {
        try {
          await cancelOrderSessionRequest({
            shopId,
            orderSessionId,
            reason,
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

    discountDishOrder: builder.mutation<undefined, DiscountDishOrderRequest>({
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
  useGetOrderSessionDetailQuery,
  useGetOrderSessionHistoryQuery,
  useCreateOrderMutation,
  usePayOrderSessionMutation,
  useCancelOrderSessionMutation,
  useCancelOrderSessionPaidStatusMutation,
  useDiscountDishOrderMutation,
  useDiscountOrderSessionMutation,
} = orderApiSlice;
