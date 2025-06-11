interface GetCartCheckoutHistoryRequest {
  shopId: string;
  isCustomerApp?: boolean;
  cursor?: string;
}

interface GetUnconfirmedCartCheckoutHistoryRequest {
  shopId: string;
  isCustomerApp?: boolean;
  cursor?: string;
}

export {
  GetCartCheckoutHistoryRequest,
  GetUnconfirmedCartCheckoutHistoryRequest,
};
