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
    currency: 'vnd',
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
  NO_ROUND: 'no_round',
  ROUND: 'round',
  FLOOR: 'floor',
  CEIL: 'ceil',
};

const Status = {
  enabled: 'enabled',
  disabled: 'disabled',
  activated: 'activated',
  deactivated: 'deactivated',
};

const DishOrderStatus = {
  confirmed: 'confirmed',
  cooked: 'cooked',
  served: 'served',
};

const OrderSessionStatus = {
  unpaid: 'unpaid',
  paid: 'paid',
  cancelled: 'cancelled',
};

const OrderSessionDiscountType = {
  INVOICE: 'invoice',
  PRODUCT: 'product',
};

const DiscountValueType = {
  PERCENTAGE: 'percentage',
  ABSOLUTE: 'absolute',
};

const PaymentMethod = {
  CASH: 'cash',
  BANK_TRANSFER: 'bank_transfer',
  CREDIT_CARD: 'credit_card',
  VNPAY: 'vnpay',
};

const PermissionType = {
  SHOP_APP: 'shop_app',
  VIEW_SHOP: 'shop_view',
  UPDATE_SHOP: 'shop_update',
  DELETE_SHOP: 'shop_delete',
  CREATE_EMPLOYEE: 'shop_create_employee',
  UPDATE_EMPLOYEE: 'shop_update_employee',
  VIEW_EMPLOYEE: 'shop_view_employee',
  CREATE_ORDER: 'shop_create_order',
  UPDATE_ORDER: 'shop_update_order',
  CANCEL_ORDER: 'shop_cancel_order_session',
  CANCEL_ORDER_PAID_STATUS: 'shop_cancel_paid_status',
  CHANGE_DISH_ORDER: 'shop_change_dishOrder_quantity',
  PAYMENT_ORDER: 'shop_payment_order',
  APPROVE_ORDER: 'shop_approve_order',
  VIEW_ORDER: 'shop_view_order',
  VIEW_MENU: 'shop_view_menu',
  CREATE_MENU: 'shop_create_menu',
  UPDATE_MENU: 'shop_update_menu',
  VIEW_REPORT: 'shop_view_report',
  VIEW_KITCHEN: 'shop_view_kitchen',
  UPDATE_KITCHEN: 'shop_update_kitchen',
};

const TableDepartmentPermissions = [
  PermissionType.CREATE_ORDER,
  PermissionType.UPDATE_ORDER,
  PermissionType.APPROVE_ORDER,
  PermissionType.VIEW_ORDER,
  PermissionType.VIEW_MENU,
  PermissionType.UPDATE_MENU,
  PermissionType.CANCEL_ORDER,
  PermissionType.CHANGE_DISH_ORDER,
];

const CashierDepartmentPermissions = [
  PermissionType.UPDATE_ORDER,
  PermissionType.CANCEL_ORDER,
  PermissionType.CHANGE_DISH_ORDER,
  PermissionType.APPROVE_ORDER,
  PermissionType.VIEW_ORDER,
  PermissionType.PAYMENT_ORDER,
  PermissionType.CANCEL_ORDER,
  PermissionType.CANCEL_ORDER_PAID_STATUS,
];

const DishTypes = {
  FOOD: 'food',
  DRINK: 'drink',
};

const KitchenAction = {
  UPDATE_COOKED: 'update_served',
  UPDATE_SERVED: 'update_cooked',
  UNDO_COOKED: 'undo_cooked',
  UNDO_SERVED: 'undo_served',
};

const DefaultUnitList = {
  'Việt Nam': [
    { unitName: 'Ấm', unitCode: 'am' },
    { unitName: 'Bánh', unitCode: 'banh' },
    { unitName: 'Bao', unitCode: 'bao' },
    { unitName: 'Bắp', unitCode: 'bap' },
    { unitName: 'Bát', unitCode: 'bat' },
    { unitName: 'Bìa', unitCode: 'bia' },
    { unitName: 'Bịch', unitCode: 'bich' },
    { unitName: 'Bình', unitCode: 'binh' },
    { unitName: 'Bình (2l)', unitCode: 'binh2l' },
    { unitName: 'Bình (750gr)', unitCode: 'binh650gr' },
    { unitName: 'Bó', unitCode: 'bo1' },
    { unitName: 'Bộ', unitCode: 'bo2' },
    { unitName: 'Bó Hoa', unitCode: 'bohoa' },
    { unitName: 'Bom', unitCode: 'bom' },
    { unitName: 'Bông', unitCode: 'bong' },
    { unitName: 'Bottle', unitCode: 'bottle' },
    { unitName: 'Box', unitCode: 'box' },
    { unitName: 'Bundle', unitCode: 'bunndle' },
    { unitName: 'Ca', unitCode: 'ca' },
    { unitName: 'Cái', unitCode: 'cai' },
    { unitName: 'Can', unitCode: 'can' },
    { unitName: 'Cặp', unitCode: 'cap' },
    { unitName: 'Carafe', unitCode: 'carafe' },
    { unitName: 'Cây', unitCode: 'cay' },
    { unitName: 'Chai', unitCode: 'chai' },
    { unitName: 'Chén', unitCode: 'chen' },
    { unitName: 'Chiếc', unitCode: 'chien' },
    { unitName: 'Chum', unitCode: 'chum' },
    { unitName: 'Cốc', unitCode: 'coc' },
    { unitName: 'Con', unitCode: 'con' },
    { unitName: 'Củ', unitCode: 'cu' },
    { unitName: 'Cục', unitCode: 'cuc' },
    { unitName: 'Cuộn', unitCode: 'cuon' },
    { unitName: 'Cup', unitCode: 'cup' },
    { unitName: 'Dây', unitCode: 'day' },
    { unitName: 'Đĩa', unitCode: 'dia' },
    { unitName: 'Điếu', unitCode: 'dieu' },
    { unitName: 'Dish', unitCode: 'dish' },
    { unitName: 'Đôi', unitCode: 'doi' },
    { unitName: 'Đồng', unitCode: 'dong' },
    { unitName: 'Each', unitCode: 'each' },
    { unitName: 'Giờ', unitCode: 'gio' },
    { unitName: 'Giọt', unitCode: 'giot' },
    { unitName: 'Glass', unitCode: 'glass' },
    { unitName: 'Gói', unitCode: 'goi' },
    { unitName: 'Gram', unitCode: 'gram' },
    { unitName: 'Hạt', unitCode: 'hat' },
    { unitName: 'Hộp', unitCode: 'hop' },
    { unitName: 'Hộp (480gr)', unitCode: 'hop480gr' },
    { unitName: 'Hũ', unitCode: 'hu' },
    { unitName: 'Jug', unitCode: 'jug' },
    { unitName: 'Kệ', unitCode: 'ke' },
    { unitName: 'Keng', unitCode: 'keng' },
    { unitName: 'Két', unitCode: 'ket' },
    { unitName: 'Kg', unitCode: 'kg' },
    { unitName: 'Kg (338c)', unitCode: 'kg388c' },
    { unitName: 'Kg (490c)', unitCode: 'kg490c' },
    { unitName: 'Khay', unitCode: 'khay' },
    { unitName: 'Khoanh', unitCode: 'khoanh' },
    { unitName: 'Lá', unitCode: 'la' },
    { unitName: 'Lần', unitCode: 'lan' },
    { unitName: 'Lẵng', unitCode: 'lang1' },
    { unitName: 'Lạng', unitCode: 'lang2' },
    { unitName: 'Lát', unitCode: 'lat' },
    { unitName: 'Lít', unitCode: 'lit' },
    { unitName: 'Lọ', unitCode: 'lo' },
    { unitName: 'Lốc', unitCode: 'loc' },
    { unitName: 'Lon', unitCode: 'lon' },
    { unitName: 'Lon (320ml)', unitCode: 'lon320ml' },
    { unitName: 'Lồng', unitCode: 'long' },
    { unitName: 'Lượt', unitCode: 'luot' },
    { unitName: 'Ly', unitCode: 'ly' },
    { unitName: 'Mẻ', unitCode: 'me' },
    { unitName: 'Mét', unitCode: 'met1' },
    { unitName: 'Mẹt', unitCode: 'met2' },
    { unitName: 'Miếng', unitCode: 'mieng' },
    { unitName: 'Miligam', unitCode: 'miligam' },
    { unitName: 'ml', unitCode: 'ml' },
    { unitName: 'Mớ', unitCode: 'mo' },
    { unitName: 'Món', unitCode: 'mon' },
    { unitName: 'Muỗng', unitCode: 'muong' },
    { unitName: 'Nải', unitCode: 'nai' },
    { unitName: 'Nậm', unitCode: 'nam' },
    { unitName: 'Nhánh', unitCode: 'nhanh' },
    { unitName: 'Nồi', unitCode: 'noi' },
    { unitName: 'Ổ', unitCode: 'o' },
    { unitName: 'Ống', unitCode: 'ong' },
    { unitName: 'Pack', unitCode: 'pack' },
    { unitName: 'Part', unitCode: 'part' },
    { unitName: 'PCS', unitCode: 'pcs' },
    { unitName: 'Phần', unitCode: 'phan' },
    { unitName: 'Phin', unitCode: 'phin' },
    { unitName: 'Phong', unitCode: 'phong' },
    { unitName: 'Phút', unitCode: 'phut' },
    { unitName: 'Piece', unitCode: 'piece' },
    { unitName: 'PK', unitCode: 'pk' },
    { unitName: 'Portion', unitCode: 'portion' },
    { unitName: 'Pot', unitCode: 'pot' },
    { unitName: 'Quả', unitCode: 'qua' },
    { unitName: 'Que', unitCode: 'que' },
    { unitName: 'Quyển', unitCode: 'quyen' },
    { unitName: 'R', unitCode: 'r' },
    { unitName: 'Serve', unitCode: 'serve' },
    { unitName: 'Serving', unitCode: 'serving' },
    { unitName: 'Set', unitCode: 'set' },
    { unitName: 'Shot', unitCode: 'shot' },
    { unitName: 'Suất', unitCode: 'suat' },
    { unitName: 'Tập', unitCode: 'tap' },
    { unitName: 'TBSP', unitCode: 'tpsp' },
    { unitName: 'Tép', unitCode: 'tep' },
    { unitName: 'Thanh', unitCode: 'thanh' },
    { unitName: 'Tháp', unitCode: 'thap' },
    { unitName: 'Thố', unitCode: 'tho' },
    { unitName: 'Thỏi', unitCode: 'thoi' },
    { unitName: 'Thùng', unitCode: 'thung' },
    { unitName: 'Thùng (7680ml)', unitCode: 'thung7680ml' },
    { unitName: 'Tô', unitCode: 'to1' },
    { unitName: 'Tờ', unitCode: 'to2' },
    { unitName: 'Tờ giấy nến', unitCode: 'togiaynen' },
    { unitName: 'Trái', unitCode: 'trai' },
    { unitName: 'TSP', unitCode: 'tsp' },
    { unitName: 'Túi', unitCode: 'tui' },
    { unitName: 'Túi (1800gr)', unitCode: 'tui1800gr' },
    { unitName: 'Túi (970gr)', unitCode: 'tui970gr' },
    { unitName: 'Tuýp', unitCode: 'tuyp' },
    { unitName: 'Vại', unitCode: 'vai' },
    { unitName: 'Vắt', unitCode: 'vat' },
    { unitName: 'Vỉ', unitCode: 'vi' },
    { unitName: 'Viên', unitCode: 'vien' },
    { unitName: 'Xấp', unitCode: 'xap' },
    { unitName: 'Xếp', unitCode: 'xep' },
    { unitName: 'Xiên', unitCode: 'xien' },
    { unitName: 'Xô', unitCode: 'xo' },
    { unitName: 'Xuất', unitCode: 'xuat' },
    { unitName: 'Xúc', unitCode: 'xuc' },
    { unitName: 'Y', unitCode: 'y' },
  ],
};

const ReportPeriod = {
  DAY: 'day',
  WEEK: 'week',
  MONTH: 'month',
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
  DishOrderStatus,
  KitchenAction,
  DefaultUnitList,
  ReportPeriod,
};
