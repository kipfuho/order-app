import {
  OrderSession,
  OrderSessionHistory,
  TableForOrder,
  UnconfirmedOrder,
} from "@stores/state.interface";
import { apiRequest } from "./api.service";
import { getAccessTokenLazily } from "./auth.api.service";
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
  GetTablesForOrderRequest,
  GetUnconfirmedOrderRequest,
  PayOrderSessionRequest,
  RemoveDiscountFromOrderSessionRequest,
  UpdateOrderSessionRequest,
  UpdateUnconfirmedOrderRequest,
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
    method: "GET",
    endpoint: `/v1/shops/${shopId}/orders/${orderSessionId}`,
    token: accessToken,
  });

  return result.orderSession;
};

/**
 * Update order session detail
 * @param param0
 */
const updateOrderSessionRequest = async ({
  shopId,
  orderSessionId,
  taxRate,
}: UpdateOrderSessionRequest) => {
  const accessToken = await getAccessTokenLazily();

  await apiRequest({
    method: "PATCH",
    endpoint: `/v1/shops/${shopId}/orders/${orderSessionId}`,
    token: accessToken,
    data: {
      taxRate,
    },
  });

  return true;
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

  await apiRequest({
    method: "POST",
    endpoint: `/v1/shops/${shopId}/orders/create-order`,
    token: accessToken,
    data: {
      tableId,
      orderSessionId,
      dishOrders,
    },
  });

  return true;
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
  customerPaidAmount,
}: PayOrderSessionRequest) => {
  const accessToken = await getAccessTokenLazily();

  await apiRequest({
    method: "POST",
    endpoint: `/v1/shops/${shopId}/orders/pay-ordersession`,
    token: accessToken,
    data: {
      orderSessionId,
      paymentDetails,
      customerPaidAmount,
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

/**
 * remove discount from order session
 * @param param0
 */
const removeDiscountFromOrderSessionRequest = async ({
  shopId,
  orderSessionId,
  discountId,
}: RemoveDiscountFromOrderSessionRequest) => {
  const accessToken = await getAccessTokenLazily();

  await apiRequest({
    method: "POST",
    endpoint: `/v1/shops/${shopId}/orders/remove-discount`,
    token: accessToken,
    data: {
      orderSessionId,
      discountId,
    },
  });
};

/**
 * get unconfirmed order
 * @param param0
 */
const getUnconfirmedOrderRequest = async ({
  shopId,
}: GetUnconfirmedOrderRequest) => {
  const accessToken = await getAccessTokenLazily();

  const result: { unconfirmedOrders: UnconfirmedOrder[] } = await apiRequest({
    method: "GET",
    endpoint: `/v1/shops/${shopId}/orders/unconfirmed-order`,
    token: accessToken,
  });

  return result.unconfirmedOrders;
};

/**
 * approve unconfirmed order
 * @param param0
 */
const approveUnconfirmedOrderRequest = async ({
  shopId,
  orderId,
  orderSessionId,
}: ApproveUnconfirmedOrderRequest) => {
  const accessToken = await getAccessTokenLazily();

  await apiRequest({
    method: "POST",
    endpoint: `/v1/shops/${shopId}/orders/unconfirmed-order`,
    token: accessToken,
    data: {
      orderId,
      orderSessionId,
    },
  });
};

/**
 * update unconfirmed order
 * @param param0
 */
const updateUnconfirmedOrderRequest = async ({
  shopId,
  orderId,
  updateDishOrders,
}: UpdateUnconfirmedOrderRequest) => {
  const accessToken = await getAccessTokenLazily();

  await apiRequest({
    method: "PATCH",
    endpoint: `/v1/shops/${shopId}/orders/unconfirmed-order`,
    token: accessToken,
    data: {
      orderId,
      updateDishOrders,
    },
  });
};

/**
 * cancel unconfirmed order
 * @param param0
 */
const cancelUnconfirmedOrderRequest = async ({
  shopId,
  orderId,
}: CancelUnconfirmedOrderRequest) => {
  const accessToken = await getAccessTokenLazily();

  await apiRequest({
    method: "DELETE",
    endpoint: `/v1/shops/${shopId}/orders/unconfirmed-order`,
    token: accessToken,
    data: {
      orderId,
    },
  });
};

const getVnPayUrl = async ({
  shopId,
  orderSessionId,
}: {
  shopId: string;
  orderSessionId: string;
}) => {
  const accessToken = await getAccessTokenLazily();

  // pid: orderSessionId
  const result: { url: string; pid: string } = await apiRequest({
    method: "POST",
    endpoint: `/v1/shops/${shopId}/payment/vnpay-url`,
    token: accessToken,
    data: {
      orderSessionId,
    },
  });

  return result.url;
};

export {
  getTablesForOrderRequest,
  getActiveOrderSessionsRequest,
  getOrderSessionDetailRequest,
  updateOrderSessionRequest,
  createOrderRequest,
  changeDishQuantityRequest,
  getOrderSessionHistoryRequest,
  payOrderSessionRequest,
  cancelOrderSessionRequest,
  cancelOrderSessionPaidStatusRequest,
  discountDishOrderRequest,
  discountOrderSessionRequest,
  removeDiscountFromOrderSessionRequest,
  getUnconfirmedOrderRequest,
  approveUnconfirmedOrderRequest,
  updateUnconfirmedOrderRequest,
  cancelUnconfirmedOrderRequest,
  getVnPayUrl,
};
