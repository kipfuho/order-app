import {
  Cart,
  CartItem,
  Dish,
  OrderCartCheckoutHistory,
  OrderSessionCartCheckoutHistory,
} from "@stores/state.interface";
import { apiRequest } from "./api.service";
import { getAccessTokenLazily } from "./auth.api.service";
import {
  GetCartCheckoutHistoryRequest,
  GetUnconfirmedCartCheckoutHistoryRequest,
} from "./cart.api.interface";
import { getEndpointWithCursor } from "./common.service";

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

let updateCartPromise: Promise<any> | null = null;
const updateCartRequest = async ({
  shopId,
  cartItems,
  isCustomerApp = false,
}: {
  shopId: string;
  cartItems: CartItem[];
  isCustomerApp?: boolean;
}) => {
  try {
    if (updateCartPromise) {
      await updateCartPromise;
      return true;
    }
    const accessToken = await getAccessTokenLazily(isCustomerApp);

    updateCartPromise = apiRequest({
      method: "POST",
      endpoint: `/v1/shops/${shopId}/orders/update-cart`,
      token: accessToken,
      data: {
        cartItems,
      },
      isCustomerApp,
    });

    await updateCartPromise;
    return true;
  } finally {
    updateCartPromise = null;
  }
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
  cursor,
  isCustomerApp = false,
}: GetCartCheckoutHistoryRequest) => {
  const accessToken = await getAccessTokenLazily(isCustomerApp);

  const result: {
    histories: OrderSessionCartCheckoutHistory[];
    nextCursor: string;
  } = await apiRequest({
    method: "POST",
    endpoint: getEndpointWithCursor({
      endpoint: `/v1/shops/${shopId}/orders/checkout-cart-history`,
      cursor,
    }),
    token: accessToken,
    isCustomerApp,
  });

  return result;
};

const getUnconfirmedCartCheckoutHistoryRequest = async ({
  shopId,
  cursor,
  isCustomerApp = false,
}: GetUnconfirmedCartCheckoutHistoryRequest) => {
  const accessToken = await getAccessTokenLazily(isCustomerApp);

  const result: {
    histories: OrderCartCheckoutHistory[];
    nextCursor: string;
  } = await apiRequest({
    method: "POST",
    endpoint: getEndpointWithCursor({
      endpoint: `/v1/shops/${shopId}/orders/unconfirmed-checkout-cart-history`,
      cursor,
    }),
    token: accessToken,
    isCustomerApp,
  });

  return result;
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
  getUnconfirmedCartCheckoutHistoryRequest,
  getRecommendationDishesRequest,
};
