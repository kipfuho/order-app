import { DiscountType } from "../constants/common";
import { DishOrder, PaymentDetail } from "../stores/state.interface";

interface GetTablesForOrderRequest {
  shopId: string;
}

interface GetOrderSessionDetailRequest {
  shopId: string;
  orderSessionId: string;
}

interface GetOrderSessionHistoryRequest {
  shopId: string;
  from: string;
  to: string;
}

interface CreateOrderRequest {
  shopId: string;
  tableId: string;
  orderSessionId?: string;
  dishOrders: Partial<DishOrder>[];
}

interface PayOrderSessionRequest {
  shopId: string;
  orderSessionId: string;
  paymentDetails: PaymentDetail[];
}

interface CancelOrderSessionRequest {
  shopId: string;
  orderSessionId: string;
  reason: string;
}

interface CancelOrderSessionPaidStatusRequest {
  shopId: string;
  orderSessionId?: string;
}

interface DiscountDishOrderRequest {
  shopId: string;
  orderSessionId: string;
  dishOrderId: string;
  orderId: string;
  discountReason?: string;
  discountValue: number;
  discountType: DiscountType;
  discountAfterTax: boolean;
}

interface DiscountOrderSessionRequest {
  shopId: string;
  orderSessionId: string;
  discountReason?: string;
  discountValue: number;
  discountType: DiscountType;
  discountAfterTax: boolean;
}

export {
  GetTablesForOrderRequest,
  GetOrderSessionDetailRequest,
  GetOrderSessionHistoryRequest,
  CreateOrderRequest,
  PayOrderSessionRequest,
  CancelOrderSessionRequest,
  CancelOrderSessionPaidStatusRequest,
  DiscountDishOrderRequest,
  DiscountOrderSessionRequest,
};
