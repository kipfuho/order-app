import { Cart, CartItem, Dish, Order } from "@stores/state.interface";
import { apiRequest } from "./api.service";
import { getAccessTokenLazily } from "./auth.api.service";

const getCartRequest = async (shopId: string, isCustomerApp = false) => {
  const accessToken = await getAccessTokenLazily(isCustomerApp);

  const result: { cart: Cart } = await apiRequest({
    method: "POST",
    endpoint: `/v1/shops/${shopId}/orders/get-cart`,
    token: accessToken,
    isCustomerApp,
  });

  return result.cart;
};

const updateCartRequest = async ({
  shopId,
  cartItems,
  isCustomerApp = false,
}: {
  shopId: string;
  cartItems: CartItem[];
  isCustomerApp?: boolean;
}) => {
  const accessToken = await getAccessTokenLazily(isCustomerApp);

  await apiRequest({
    method: "POST",
    endpoint: `/v1/shops/${shopId}/orders/update-cart`,
    token: accessToken,
    data: {
      cartItems,
    },
    isCustomerApp,
  });

  return true;
};

const checkoutCartRequest = async ({
  shopId,
  tableId,
  isCustomerApp = false,
}: {
  shopId: string;
  tableId: string;
  isCustomerApp: boolean;
}) => {
  const accessToken = await getAccessTokenLazily(isCustomerApp);

  await apiRequest({
    method: "POST",
    endpoint: `/v1/shops/${shopId}/orders/checkout-cart`,
    token: accessToken,
    data: {
      tableId,
    },
    isCustomerApp,
  });

  return true;
};

const getCartCheckoutHistoryRequest = async ({
  shopId,
  isCustomerApp = false,
}: {
  shopId: string;
  isCustomerApp?: boolean;
}) => {
  const accessToken = await getAccessTokenLazily(isCustomerApp);

  const result: {
    histories: Order[];
  } = await apiRequest({
    method: "POST",
    endpoint: `/v1/shops/${shopId}/orders/checkout-cart-history`,
    token: accessToken,
    isCustomerApp,
  });

  return result.histories;
};

const getRecommendationDishesRequest = async ({
  shopId,
  isCustomerApp = false,
}: {
  shopId: string;
  isCustomerApp?: boolean;
}) => {
  const accessToken = await getAccessTokenLazily(isCustomerApp);

  const result: {
    dishes: Dish[];
  } = await apiRequest({
    method: "GET",
    endpoint: `/v1/shops/${shopId}/suggestion`,
    token: accessToken,
    isCustomerApp,
  });

  return result.dishes;
};

export {
  getCartRequest,
  updateCartRequest,
  checkoutCartRequest,
  getCartCheckoutHistoryRequest,
  getRecommendationDishesRequest,
};
