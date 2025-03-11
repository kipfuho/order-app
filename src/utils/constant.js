const SESSION_NAME_SPACE = 'userSession';

const Language = {
  vietnamese: 'vi',
  english: 'en',
};

const Countries = {
  VietNam: {
    name: 'Việt Nam',
    currency: 'VND',
  },
};

const CurrencySetting = {
  VND: {
    precision: 0,
  },
  USD: {
    precision: 2,
  },
};

const RoundingPaymentType = {
  NO_ROUND: 'NO_ROUND',
  ROUND: 'ROUND',
  FLOOR: 'FLOOR',
  CEIL: 'CEIL',
};

const Status = {
  enabled: 'enabled',
  disabled: 'disabled',
  activated: 'activated',
  deactivated: 'deactivated',
};

const OrderSessionStatus = {
  unpaid: 'unpaid',
  paid: 'paid',
  cancelled: 'cancelled',
};

const OrderSessionDiscountType = {
  INVOICE: 'INVOICE',
  PRODUCT: 'PRODUCT',
};

const DiscountValueType = {
  PERCENTAGE: 'PERCENTAGE',
  ABSOLUTE: 'ABSOLUTE',
};

const PaymentMethod = {
  CASH: 'CASH',
  BANK_TRANSFER: 'BANK_TRANSFER',
};

const PermissionType = {
  VIEW_RESTAURANT: 'restaurant_view_restaurant',
  UPDATE_RESTAURANT: 'restaurant_update_restaurant',
  CREATE_EMPLOYEE: 'restaurant_create_employee',
  UPDATE_EMPLOYEE: 'restaurant_update_employee',
  VIEW_EMPLOYEE: 'restaurant_view_employee',
  CREATE_ORDER: 'restaurant_create_order',
  UPDATE_ORDER: 'restaurant_update_order',
  CANCEL_ORDER: 'restaurant_cancel_order_session',
  CANCEL_ORDER_PAID_STATUS: 'restaurant_cancel_paid_status',
  INCREASE_DISH_ORDER: 'restaurant_increase_dishOrder_quantity',
  DECREASE_DISH_ORDER: 'restaurant_decrease_dishOrder_quantity',
  PAYMENT_ORDER: 'restaurant_payment_order',
  APPROVE_ORDER: 'restaurant_approve_order',
  VIEW_ORDER: 'restaurant_view_order',
  VIEW_MENU: 'restaurant_view_menu',
  CREATE_MENU: 'restaurant_create_menu',
  UPDATE_MENU: 'restaurant_update_menu',
  VIEW_REPORT: 'restaurant_view_report',
};

const TableDepartmentPermissions = [
  PermissionType.CREATE_ORDER,
  PermissionType.UPDATE_ORDER,
  PermissionType.APPROVE_ORDER,
  PermissionType.VIEW_ORDER,
  PermissionType.VIEW_MENU,
  PermissionType.UPDATE_MENU,
  PermissionType.CANCEL_ORDER,
  PermissionType.INCREASE_DISH_ORDER,
  PermissionType.DECREASE_DISH_ORDER,
];

const CashierDepartmentPermissions = [
  PermissionType.UPDATE_ORDER,
  PermissionType.CANCEL_ORDER,
  PermissionType.INCREASE_DISH_ORDER,
  PermissionType.DECREASE_DISH_ORDER,
  PermissionType.APPROVE_ORDER,
  PermissionType.VIEW_ORDER,
  PermissionType.PAYMENT_ORDER,
  PermissionType.CANCEL_ORDER,
  PermissionType.CANCEL_ORDER_PAID_STATUS,
];

module.exports = {
  SESSION_NAME_SPACE,
  Language,
  Countries,
  Status,
  CurrencySetting,
  RoundingPaymentType,
  OrderSessionDiscountType,
  DiscountValueType,
  PaymentMethod,
  OrderSessionStatus,
  PermissionType,
  TableDepartmentPermissions,
  CashierDepartmentPermissions,
};
