import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { Cart, CartItem, Shop } from "../state.interface";
import { updateShopRequest } from "../../apis/shop.api.service";
import { API_BASE_URL } from "../../apis/api.service";
import { UpdateShopRequest } from "../../apis/shop.api.interface";
import {
  checkoutCartRequest,
  getCartRequest,
  updateCartRequest,
} from "../../apis/cart.api.service";
import { updateCurrentCart } from "../customerSlice";

export const cartApiSlice = createApi({
  reducerPath: "cartApi",
  baseQuery: fetchBaseQuery({ baseUrl: API_BASE_URL }),
  tagTypes: ["Cart", "CartHistory"],
  // keepUnusedDataFor: 600,
  endpoints: (builder) => ({
    getCart: builder.query<Cart, string>({
      queryFn: async (shopId, api) => {
        try {
          const cart = await getCartRequest(shopId);
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
          await checkoutCartRequest(args);

          return { data: true };
        } catch (error) {
          return { error: { status: 500, data: error } };
        }
      },
      invalidatesTags: ["Cart", "CartHistory"],
    }),

    getCheckoutCartHistory: builder.query<Shop, UpdateShopRequest>({
      queryFn: async (args) => {
        try {
          const shop = await updateShopRequest({
            ...args,
          });

          return { data: shop };
        } catch (error) {
          return { error: { status: 500, data: error } };
        }
      },

      providesTags: ["CartHistory"],
    }),
  }),
});

export const {
  useGetCartQuery,
  useUpdateCartMutation,
  useCheckoutCartMutation,
} = cartApiSlice;
