import { DiscountValueType } from "@constants/common";
import { DishOrder, PaymentDetail } from "@stores/state.interface";

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

interface UpdateOrderSessionRequest {
  shopId: string;
  orderSessionId: string;
  taxRate?: number;
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
  customerPaidAmount?: number;
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
  discountType: DiscountValueType;
  discountAfterTax: boolean;
}

interface DiscountOrderSessionRequest {
  shopId: string;
  orderSessionId: string;
  discountReason?: string;
  discountValue: number;
  discountType: DiscountValueType;
  discountAfterTax: boolean;
}

interface RemoveDiscountFromOrderSessionRequest {
  shopId: string;
  orderSessionId: string;
  discountId: string;
}

interface GetUnconfirmedOrderRequest {
  shopId: string;
}

interface UpdateUnconfirmedOrderRequest {
  shopId: string;
  orderId: string;
  updateDishOrders: {
    dishOrderId: string;
    quantity: number;
    note: string;
  }[];
}

interface CancelUnconfirmedOrderRequest {
  shopId: string;
  orderId: string;
}

interface ApproveUnconfirmedOrderRequest {
  shopId: string;
  orderId: string;
  orderSessionId?: string;
}

export {
  GetTablesForOrderRequest,
  GetActiveOrderSessionRequest,
  GetOrderSessionDetailRequest,
  UpdateOrderSessionRequest,
  GetOrderSessionHistoryRequest,
  CreateOrderRequest,
  ChangeDishQuantityRequest,
  PayOrderSessionRequest,
  CancelOrderSessionRequest,
  CancelOrderSessionPaidStatusRequest,
  DiscountDishOrderRequest,
  DiscountOrderSessionRequest,
  RemoveDiscountFromOrderSessionRequest,
  GetUnconfirmedOrderRequest,
  UpdateUnconfirmedOrderRequest,
  CancelUnconfirmedOrderRequest,
  ApproveUnconfirmedOrderRequest,
};
