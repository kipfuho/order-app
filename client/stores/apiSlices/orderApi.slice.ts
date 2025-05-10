import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { API_BASE_URL } from "../../apis/api.service";
import {
  approveUnconfirmedOrderRequest,
  cancelOrderSessionPaidStatusRequest,
  cancelOrderSessionRequest,
  cancelUnconfirmedOrderRequest,
  changeDishQuantityRequest,
  createOrderRequest,
  discountDishOrderRequest,
  discountOrderSessionRequest,
  getActiveOrderSessionsRequest,
  getOrderSessionDetailRequest,
  getOrderSessionHistoryRequest,
  getTablesForOrderRequest,
  getUnconfirmedOrderRequest,
  payOrderSessionRequest,
  removeDiscountFromOrderSessionRequest,
  updateUnconfirmedOrderRequest,
} from "../../apis/order.api.service";
import {
  OrderSession,
  OrderSessionHistory,
  TableForOrder,
  UnconfirmedOrder,
} from "../state.interface";
import { RootState } from "../store";
import {
  ApproveUnconfirmedOrderRequest,
  CancelOrderSessionPaidStatusRequest,
  CancelOrderSessionRequest,
  CancelUnconfirmedOrderRequest,
  ChangeDishQuantityRequest,
  CreateOrderRequest,
  DiscountDishOrderRequest,
  DiscountOrderSessionRequest,
  GetActiveOrderSessionRequest,
  GetOrderSessionDetailRequest,
  GetOrderSessionHistoryRequest,
  GetUnconfirmedOrderRequest,
  PayOrderSessionRequest,
  RemoveDiscountFromOrderSessionRequest,
  UpdateUnconfirmedOrderRequest,
} from "../../apis/order.api.interface";
import { resetCurrentOrder } from "../shop.slice";
import _ from "lodash";

export const orderApiSlice = createApi({
  reducerPath: "orderApi",
  baseQuery: fetchBaseQuery({ baseUrl: API_BASE_URL }),
  tagTypes: [
    "TablesForOrder",
    "OrderSessions",
    "ActiveOrderSessions",
    "UnconfirmedOrders",
  ],
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
      boolean,
      CancelOrderSessionPaidStatusRequest
    >({
      queryFn: async ({ shopId, orderSessionId }) => {
        try {
          await cancelOrderSessionPaidStatusRequest({
            shopId,
            orderSessionId,
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
      boolean,
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

    removeDiscountFromOrderSession: builder.mutation<
      boolean,
      RemoveDiscountFromOrderSessionRequest
    >({
      queryFn: async ({ shopId, orderSessionId, discountId }) => {
        try {
          await removeDiscountFromOrderSessionRequest({
            shopId,
            orderSessionId,
            discountId,
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

    // unconfirmed orders
    getUnconfirmedOrder: builder.query<
      UnconfirmedOrder[],
      GetUnconfirmedOrderRequest
    >({
      queryFn: async ({ shopId }) => {
        try {
          const unconfirmedOrders = await getUnconfirmedOrderRequest({
            shopId,
          });

          return { data: unconfirmedOrders };
        } catch (error) {
          return { error: { status: 500, data: error } };
        }
      },
      providesTags: ["UnconfirmedOrders"], // Enables cache invalidation
    }),

    approveUnconfirmedOrder: builder.mutation<
      boolean,
      ApproveUnconfirmedOrderRequest
    >({
      queryFn: async ({ shopId, orderSessionId, orderId }) => {
        try {
          await approveUnconfirmedOrderRequest({
            shopId,
            orderSessionId,
            orderId,
          });

          return { data: true };
        } catch (error) {
          return { error: { status: 500, data: error } };
        }
      },
      invalidatesTags: (result, error, args) =>
        error
          ? [
              { type: "OrderSessions", id: args.orderSessionId },
              "UnconfirmedOrders",
            ]
          : [{ type: "OrderSessions", id: args.orderSessionId }], // Enables cache invalidation

      // ✅ Optimistic Update Implementation
      onQueryStarted: async (args, { dispatch, queryFulfilled }) => {
        const patchResult = dispatch(
          orderApiSlice.util.updateQueryData(
            "getUnconfirmedOrder",
            { shopId: args.shopId },
            (draft) => {
              const index = draft.findIndex((uo) => uo.id === args.orderId);
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

    updateUnconfirmedOrder: builder.mutation<
      boolean,
      UpdateUnconfirmedOrderRequest
    >({
      queryFn: async ({ shopId, orderId, updateDishOrders }) => {
        try {
          await updateUnconfirmedOrderRequest({
            shopId,
            orderId,
            updateDishOrders,
          });

          return { data: true };
        } catch (error) {
          return { error: { status: 500, data: error } };
        }
      },
      invalidatesTags: (result, error, args) =>
        error ? ["UnconfirmedOrders"] : [], // Enables cache invalidation

      // ✅ Optimistic Update Implementation
      onQueryStarted: async (args, { dispatch, queryFulfilled }) => {
        const patchResult = dispatch(
          orderApiSlice.util.updateQueryData(
            "getUnconfirmedOrder",
            { shopId: args.shopId },
            (draft) => {
              const index = draft.findIndex((uo) => uo.id === args.orderId);
              if (index !== -1) {
                const dishOrders = draft[index].dishOrders;
                const dishOrderById = _.keyBy(dishOrders, "id");
                _.forEach(args.updateDishOrders, (i) => {
                  if (dishOrderById[i.dishOrderId]) {
                    dishOrderById[i.dishOrderId] = {
                      ...dishOrderById[i.dishOrderId],
                      quantity: i.quantity,
                      note: i.note,
                    };
                  }
                });
                draft[index] = {
                  ...draft[index],
                  dishOrders: _.filter(
                    Object.values(dishOrderById),
                    (d) => d.quantity > 0
                  ),
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

    cancelUnconfirmedOrder: builder.mutation<
      boolean,
      CancelUnconfirmedOrderRequest
    >({
      queryFn: async ({ shopId, orderId }) => {
        try {
          await cancelUnconfirmedOrderRequest({
            shopId,
            orderId,
          });

          return { data: true };
        } catch (error) {
          return { error: { status: 500, data: error } };
        }
      },
      invalidatesTags: (result, error, args) =>
        error ? ["UnconfirmedOrders"] : [], // Enables cache invalidation

      // ✅ Optimistic Update Implementation
      onQueryStarted: async (args, { dispatch, queryFulfilled }) => {
        const patchResult = dispatch(
          orderApiSlice.util.updateQueryData(
            "getUnconfirmedOrder",
            { shopId: args.shopId },
            (draft) => {
              const index = draft.findIndex((uo) => uo.id === args.orderId);
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
  useRemoveDiscountFromOrderSessionMutation,
  useGetUnconfirmedOrderQuery,
  useApproveUnconfirmedOrderMutation,
  useUpdateUnconfirmedOrderMutation,
  useCancelUnconfirmedOrderMutation,
} = orderApiSlice;
