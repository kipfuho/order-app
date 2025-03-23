const SESSION_NAME_SPACE = 'userSession';
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB
const ALLOWED_IMAGE_MIME_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];

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
  VIEW_SHOP: 'shop_view_shop',
  UPDATE_SHOP: 'shop_update_shop',
  CREATE_EMPLOYEE: 'shop_create_employee',
  UPDATE_EMPLOYEE: 'shop_update_employee',
  VIEW_EMPLOYEE: 'shop_view_employee',
  CREATE_ORDER: 'shop_create_order',
  UPDATE_ORDER: 'shop_update_order',
  CANCEL_ORDER: 'shop_cancel_order_session',
  CANCEL_ORDER_PAID_STATUS: 'shop_cancel_paid_status',
  INCREASE_DISH_ORDER: 'shop_increase_dishOrder_quantity',
  DECREASE_DISH_ORDER: 'shop_decrease_dishOrder_quantity',
  PAYMENT_ORDER: 'shop_payment_order',
  APPROVE_ORDER: 'shop_approve_order',
  VIEW_ORDER: 'shop_view_order',
  VIEW_MENU: 'shop_view_menu',
  CREATE_MENU: 'shop_create_menu',
  UPDATE_MENU: 'shop_update_menu',
  VIEW_REPORT: 'shop_view_report',
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

const DishTypes = {
  FOOD: 'FOOD',
  DRINK: 'DRINK',
};

module.exports = {
  SESSION_NAME_SPACE,
  MAX_FILE_SIZE,
  ALLOWED_IMAGE_MIME_TYPES,
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
  DishTypes,
};
