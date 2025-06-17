export const BLURHASH =
  "|rF?hV%2WCj[ayj[a|j[az_NaeWBj@ayfRayfQfQM{M|azj[azf6fQfQfQIpWXofj[ayj[j[fQayWCoeoeaya}j[ayfQa{oLj?j[WVj[ayayj[fQoff7azayj[ayj[j[ayofayayayj[fQj[ayayj[ayfjj[j[ayjuayj[";

export enum DiscountType {
  PRODUCT = "product",
  INVOICE = "invoice",
}

export enum OrderSessionStatus {
  unpaid = "unpaid",
  paid = "paid",
  cancelled = "cancelled",
}

export enum CurrencyText {
  VND = "đ",
  USD = "$",
}

export const Countries = {
  VietNam: {
    name: "Việt Nam",
    currency: "VND",
  },
} as const;

export enum DishStatus {
  activated = "activated",
  deactivated = "deactivated",
}

export enum DiscountValueType {
  PERCENTAGE = "percentage",
  ABSOLUTE = "absolute",
}

export enum DishOrderStatus {
  confirmed = "confirmed",
  cooked = "cooked",
  served = "served",
}

export enum ReportPeriod {
  DAY = "day",
  WEEK = "week",
  MONTH = "month",
}

export const UNIVERSAL_WIDTH_PIVOT = 600;
export const UNIVERSAL_MAX_WIDTH_SIDEBAR = 200;

export enum PermissionType {
  SHOP_APP = "shop_app",
  VIEW_SHOP = "shop_view",
  UPDATE_SHOP = "shop_update",
  DELETE_SHOP = "shop_delete",
  CREATE_EMPLOYEE = "shop_create_employee",
  UPDATE_EMPLOYEE = "shop_update_employee",
  VIEW_EMPLOYEE = "shop_view_employee",
  CREATE_ORDER = "shop_create_order",
  UPDATE_ORDER = "shop_update_order",
  CANCEL_ORDER = "shop_cancel_order_session",
  CANCEL_ORDER_PAID_STATUS = "shop_cancel_paid_status",
  CHANGE_DISH_ORDER = "shop_change_dishOrder_quantity",
  PAYMENT_ORDER = "shop_payment_order",
  APPROVE_ORDER = "shop_approve_order",
  VIEW_ORDER = "shop_view_order",
  VIEW_MENU = "shop_view_menu",
  CREATE_MENU = "shop_create_menu",
  UPDATE_MENU = "shop_update_menu",
  VIEW_REPORT = "shop_view_report",
  VIEW_KITCHEN = "shop_view_kitchen",
  UPDATE_KITCHEN = "shop_update_kitchen",
}
