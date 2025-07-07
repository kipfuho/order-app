import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import {
  Cart,
  CartItem,
  Dish,
  OrderCartCheckoutHistory,
  OrderSessionCartCheckoutHistory,
} from "../state.interface";
import { API_BASE_URL } from "@apis/api.service";
import {
  checkoutCartRequest,
  getCartCheckoutHistoryRequest,
  getCartRequest,
  getRecommendationDishesRequest,
  getUnconfirmedCartCheckoutHistoryRequest,
  updateCartRequest,
} from "@apis/cart.api.service";
import {
  updateCurrentCart,
  updateIsUpdateCartDebouncing,
} from "../customerSlice";
import { GetCartCheckoutHistoryRequest } from "@/apis/cart.api.interface";
import _ from "lodash";

export const cartApiSlice = createApi({
  reducerPath: "cartApi",
  baseQuery: fetchBaseQuery({ baseUrl: API_BASE_URL }),
  tagTypes: [
    "Cart",
    "CartHistory",
    "UnconfirmedCartHistory",
    "DishRecommendation",
  ],
  // keepUnusedDataFor: 600,
  endpoints: (builder) => ({
    getCart: builder.query<Cart, string>({
      queryFn: async (shopId, api) => {
        try {
          const cart = await getCartRequest(shopId, true);
          api.dispatch(updateCurrentCart(cart));

          return { data: cart };
        } catch (error) {
          return { error: { status: 500, data: error } };
        }
      },
      providesTags: ["Cart"], // Enables cache invalidation
    }),

    updateCart: builder.mutation<
      boolean,
      { shopId: string; cartItems: CartItem[]; isDebounce?: boolean }
    >({
      queryFn: async ({ cartItems, shopId, isDebounce }, api) => {
        try {
          const state = api.getState();
          if (isDebounce && !_.get(state, "customer.isUpdateCartDebouncing")) {
            return { data: true };
          }

          await updateCartRequest({
            shopId,
            cartItems,
            isCustomerApp: true,
          });
          api.dispatch(updateIsUpdateCartDebouncing(false));

          return { data: true };
        } catch (error) {
          return { error: { status: 500, data: error } };
        }
      },
      invalidatesTags: (result) => (result ? ["Cart"] : []),
    }),

    checkoutCart: builder.mutation<
      boolean,
      { shopId: string; tableId: string }
    >({
      queryFn: async (args) => {
        try {
          await checkoutCartRequest({ ...args, isCustomerApp: true });

          return { data: true };
        } catch (error) {
          return {
            error: { status: 500, data: error },
          };
        }
      },
      invalidatesTags: ["Cart", "CartHistory", "UnconfirmedCartHistory"],
    }),

    getCheckoutCartHistory: builder.query<
      {
        items: OrderSessionCartCheckoutHistory[];
        nextCursor: string;
      },
      GetCartCheckoutHistoryRequest
    >({
      queryFn: async ({ shopId, cursor }) => {
        try {
          const { histories, nextCursor } = await getCartCheckoutHistoryRequest(
            {
              shopId,
              cursor,
              isCustomerApp: true,
            },
          );

          return {
            data: {
              items: histories,
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
      providesTags: ["CartHistory"],
    }),

    getUnconfirmedCheckoutCartHistory: builder.query<
      {
        items: OrderCartCheckoutHistory[];
        nextCursor: string;
      },
      GetCartCheckoutHistoryRequest
    >({
      queryFn: async ({ shopId, cursor }) => {
        try {
          const { histories, nextCursor } =
            await getUnconfirmedCartCheckoutHistoryRequest({
              shopId,
              cursor,
              isCustomerApp: true,
            });

          return {
            data: {
              items: histories,
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
      providesTags: ["UnconfirmedCartHistory"],
    }),

    getRecommendationDishes: builder.query<Dish[], string>({
      queryFn: async (shopId) => {
        try {
          const dishes = await getRecommendationDishesRequest({
            shopId,
            isCustomerApp: true,
          });

          return {
            data: dishes,
          };
        } catch (error) {
          return { error: { status: 500, data: error } };
        }
      },

      providesTags: ["DishRecommendation"],
    }),
  }),
});

export const {
  useGetCartQuery,
  useGetCheckoutCartHistoryQuery,
  useGetUnconfirmedCheckoutCartHistoryQuery,
  useGetRecommendationDishesQuery,
  useUpdateCartMutation,
  useCheckoutCartMutation,
} = cartApiSlice;
