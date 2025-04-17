import { Cart, CartItem } from "../stores/state.interface";
import { apiRequest } from "./api.service";
import { getAccessTokenLazily } from "./auth.api.service";

const getCartRequest = async (shopId: string) => {
  const accessToken = await getAccessTokenLazily();

  const result: { cart: Cart } = await apiRequest({
    method: "POST",
    endpoint: `/v1/shops/${shopId}/orders/get-cart`,
    token: accessToken,
  });

  return result.cart;
};

const updateCartRequest = async ({
  shopId,
  cartItems,
}: {
  shopId: string;
  cartItems: CartItem[];
}) => {
  const accessToken = await getAccessTokenLazily();

  await apiRequest({
    method: "POST",
    endpoint: `/v1/shops/${shopId}/orders/update-cart`,
    token: accessToken,
    data: {
      cartItems,
    },
  });

  return true;
};

const checkoutCartRequest = async ({
  shopId,
  tableId,
}: {
  shopId: string;
  tableId: string;
}) => {
  const accessToken = await getAccessTokenLazily();

  await apiRequest({
    method: "POST",
    endpoint: `/v1/shops/${shopId}/orders/checkout-cart`,
    token: accessToken,
    data: {
      tableId,
    },
  });

  return true;
};

const getCartCheckoutHistoryRequest = async ({
  shopId,
  tableId,
}: {
  shopId: string;
  tableId: string;
}) => {
  const accessToken = await getAccessTokenLazily();

  await apiRequest({
    method: "POST",
    endpoint: `/v1/shops/${shopId}/orders/checkout-cart-history`,
    token: accessToken,
    data: {
      tableId,
    },
  });

  return true;
};

export {
  getCartRequest,
  updateCartRequest,
  checkoutCartRequest,
  getCartCheckoutHistoryRequest,
};
