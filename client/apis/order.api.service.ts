import { OrderSession, OrderSessionHistory, TableForOrder } from "../stores/state.interface";
import { apiRequest } from "./api.service";
import { getAccessTokenLazily } from "./auth.api.service";
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
  GetTablesForOrderRequest,
  PayOrderSessionRequest,
} from "./order.api.interface";

/**
 * Get tables for order
 * @param param0
 */
const getTablesForOrderRequest = async ({
  shopId,
}: GetTablesForOrderRequest) => {
  const accessToken = await getAccessTokenLazily();

  const result: { tables: TableForOrder[] } = await apiRequest({
    method: "POST",
    endpoint: `/v1/shops/${shopId}/orders/get-table-for-orders`,
    token: accessToken,
  });

  return result.tables;
};

/**
 * Get active order sessions of table
 * @param param0
 */
const getActiveOrderSessionsRequest = async ({
  shopId,
  tableId,
}: GetActiveOrderSessionRequest) => {
  const accessToken = await getAccessTokenLazily();

  const result: { orderSessions: OrderSession[] } = await apiRequest({
    method: "POST",
    endpoint: `/v1/shops/${shopId}/orders/get-active-ordersessions`,
    token: accessToken,
    data: {
      tableId,
    },
  });

  return result.orderSessions;
};

/**
 * Get order session detail
 * @param param0
 */
const getOrderSessionDetailRequest = async ({
  shopId,
  orderSessionId,
}: GetOrderSessionDetailRequest) => {
  const accessToken = await getAccessTokenLazily();

  const result: { orderSession: OrderSession } = await apiRequest({
    method: "POST",
    endpoint: `/v1/shops/${shopId}/orders/get-ordersession-detail`,
    token: accessToken,
    data: {
      orderSessionId,
    },
  });

  return result.orderSession;
};

/**
 * Get order session history
 * @param param0
 */
const getOrderSessionHistoryRequest = async ({
  shopId,
  from,
  to,
}: GetOrderSessionHistoryRequest) => {
  const accessToken = await getAccessTokenLazily();

  const result: { orderSessions: OrderSessionHistory[] } = await apiRequest({
    method: "POST",
    endpoint: `/v1/shops/${shopId}/orders/get-ordersession-history`,
    token: accessToken,
    data: {
      from,
      to,
    },
  });

  return result.orderSessions;
};

/**
 * create order
 * @param param0
 */
const createOrderRequest = async ({
  shopId,
  dishOrders,
  tableId,
  orderSessionId,
}: CreateOrderRequest) => {
  const accessToken = await getAccessTokenLazily();

  const result: { orderSession: OrderSession } = await apiRequest({
    method: "POST",
    endpoint: `/v1/shops/${shopId}/orders/create-order`,
    token: accessToken,
    data: {
      tableId,
      orderSessionId,
      dishOrders,
    },
  });

  return result.orderSession;
};

/**
 * create order
 * @param param0
 */
const changeDishQuantityRequest = async ({
  shopId,
  dishOrderId,
  newQuantity,
  orderId,
}: ChangeDishQuantityRequest) => {
  const accessToken = await getAccessTokenLazily();

  await apiRequest({
    method: "POST",
    endpoint: `/v1/shops/${shopId}/orders/change-dish-quantity`,
    token: accessToken,
    data: {
      dishOrderId,
      newQuantity,
      orderId,
    },
  });
};

/**
 * create order
 * @param param0
 */
const payOrderSessionRequest = async ({
  shopId,
  orderSessionId,
  paymentDetails,
}: PayOrderSessionRequest) => {
  const accessToken = await getAccessTokenLazily();

  await apiRequest({
    method: "POST",
    endpoint: `/v1/shops/${shopId}/orders/pay-ordersession`,
    token: accessToken,
    data: {
      orderSessionId,
      paymentDetails,
    },
  });
};

/**
 * create order
 * @param param0
 */
const cancelOrderSessionRequest = async ({
  shopId,
  orderSessionId,
  reason,
}: CancelOrderSessionRequest) => {
  const accessToken = await getAccessTokenLazily();

  await apiRequest({
    method: "POST",
    endpoint: `/v1/shops/${shopId}/orders/cancel-ordersession`,
    token: accessToken,
    data: {
      orderSessionId,
      reason,
    },
  });
};

/**
 * create order
 * @param param0
 */
const cancelOrderSessionPaidStatusRequest = async ({
  shopId,
  orderSessionId,
}: CancelOrderSessionPaidStatusRequest) => {
  const accessToken = await getAccessTokenLazily();

  await apiRequest({
    method: "POST",
    endpoint: `/v1/shops/${shopId}/orders/cancel-ordersession-paid-status`,
    token: accessToken,
    data: {
      orderSessionId,
    },
  });
};

/**
 * discount dish order
 * @param param0
 */
const discountDishOrderRequest = async ({
  shopId,
  orderSessionId,
  discountAfterTax,
  discountType,
  discountValue,
  dishOrderId,
  orderId,
  discountReason = "",
}: DiscountDishOrderRequest) => {
  const accessToken = await getAccessTokenLazily();

  await apiRequest({
    method: "POST",
    endpoint: `/v1/shops/${shopId}/orders/discount-dishorder`,
    token: accessToken,
    data: {
      orderSessionId,
      discountAfterTax,
      discountType,
      discountValue,
      dishOrderId,
      orderId,
      discountReason,
    },
  });
};

/**
 * discount order session
 * @param param0
 */
const discountOrderSessionRequest = async ({
  shopId,
  orderSessionId,
  discountReason,
  discountValue,
  discountType,
  discountAfterTax,
}: DiscountOrderSessionRequest) => {
  const accessToken = await getAccessTokenLazily();

  await apiRequest({
    method: "POST",
    endpoint: `/v1/shops/${shopId}/orders/discount-ordersession`,
    token: accessToken,
    data: {
      orderSessionId,
      discountReason,
      discountValue,
      discountType,
      discountAfterTax,
    },
  });
};

export {
  getTablesForOrderRequest,
  getActiveOrderSessionsRequest,
  getOrderSessionDetailRequest,
  createOrderRequest,
  changeDishQuantityRequest,
  getOrderSessionHistoryRequest,
  payOrderSessionRequest,
  cancelOrderSessionRequest,
  cancelOrderSessionPaidStatusRequest,
  discountDishOrderRequest,
  discountOrderSessionRequest,
};
