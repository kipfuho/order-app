import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { Cart, CartItem, Dish, Order, Shop } from "../state.interface";
import { updateShopRequest } from "../../apis/shop.api.service";
import { API_BASE_URL } from "../../apis/api.service";
import { UpdateShopRequest } from "../../apis/shop.api.interface";
import {
  checkoutCartRequest,
  getCartCheckoutHistoryRequest,
  getCartRequest,
  getRecommendationDishesRequest,
  updateCartRequest,
} from "../../apis/cart.api.service";
import { updateCurrentCart } from "../customerSlice";

export const cartApiSlice = createApi({
  reducerPath: "cartApi",
  baseQuery: fetchBaseQuery({ baseUrl: API_BASE_URL }),
  tagTypes: ["Cart", "CartHistory", "DishRecommendation"],
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
      { shopId: string; cartItems: CartItem[] }
    >({
      queryFn: async ({ cartItems, shopId }) => {
        try {
          await updateCartRequest({
            shopId,
            cartItems,
            isCustomerApp: true,
          });

          return { data: true };
        } catch (error) {
          return { error: { status: 500, data: error } };
        }
      },
      invalidatesTags: ["Cart"],
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
          return { error: { status: 500, data: error } };
        }
      },
      invalidatesTags: ["Cart", "CartHistory"],
    }),

    getCheckoutCartHistory: builder.query<Order[], string>({
      queryFn: async (shopId) => {
        try {
          const histories = await getCartCheckoutHistoryRequest({
            shopId,
            isCustomerApp: true,
          });

          return {
            data: histories,
          };
        } catch (error) {
          return { error: { status: 500, data: error } };
        }
      },

      providesTags: ["CartHistory"],
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
  useGetRecommendationDishesQuery,
  useUpdateCartMutation,
  useCheckoutCartMutation,
} = cartApiSlice;
