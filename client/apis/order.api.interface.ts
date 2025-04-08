import { DiscountType } from "../constants/common";
import { DishOrder, PaymentDetail } from "../stores/state.interface";

interface GetTablesForOrderRequest {
  shopId: string;
}

interface GetActiveOrderSessionRequest {
  shopId: string;
  tableId: string;
}

interface GetOrderSessionDetailRequest {
  shopId: string;
  orderSessionId: string;
}

interface GetOrderSessionHistoryRequest {
  shopId: string;
  from?: Date;
  to?: Date;
}

interface CreateOrderRequest {
  shopId: string;
  tableId: string;
  orderSessionId?: string;
  dishOrders: Partial<DishOrder>[];
}

interface ChangeDishQuantityRequest {
  shopId: string;
  orderId: string;
  dishOrderId: string;
  newQuantity: number;
  orderSessionId?: string;
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
  GetActiveOrderSessionRequest,
  GetOrderSessionDetailRequest,
  GetOrderSessionHistoryRequest,
  CreateOrderRequest,
  ChangeDishQuantityRequest,
  PayOrderSessionRequest,
  CancelOrderSessionRequest,
  CancelOrderSessionPaidStatusRequest,
  DiscountDishOrderRequest,
  DiscountOrderSessionRequest,
};
