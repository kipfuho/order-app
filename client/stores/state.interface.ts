import { OrderSessionStatus, ReportPeriod } from "@constants/common";
import { PaymentMethod } from "@constants/paymentMethod";

interface Tokens {
  access: {
    token: string;
    expires: number;
  };
  refresh: {
    token: string;
    expires: number;
  };
}

interface User {
  id: string;
  email: string;
  name?: string;
  tokens?: Tokens;
}

interface Shop {
  id: string;
  name: string;
  phone?: string;
  email: string;
  location?: string;
  imageUrls?: string[];
  country: {
    name: string;
    currency: string;
  };
  taxRate: number;
}

interface Table {
  id: string;
  name: string;
  code: string;
  position: TablePosition;
  allowMultipleOrderSession: boolean;
  needApprovalWhenCustomerOrder: boolean;
}

interface TableForOrder extends Omit<Table, "position"> {
  position: string; // position id
  numberOfOrderSession?: number;
  numberOfCustomer?: number;
  totalPaymentAmount?: number;
  averagePaymentAmount?: number;
  orderStatus?: OrderSessionStatus;
  orderCreatedAtEpoch?: number;
  orderColorCode?: number;
}

interface TablePosition {
  id: string;
  name: string;
  code?: string;
  shopId: string;
  dishCategoryIds: string[];
}

interface Employee {
  id: string;
  name: string;
  permissions: string[];
  positionId: string;
  departmentId: string;
}

interface EmployeePosition {
  id: string;
  name: string;
}

interface Department {
  id: string;
  name: string;
  permissions: string[];
}

interface Unit {
  id: string;
  name: string;
  code: string;
}

interface Dish {
  id: string;
  name: string;
  code: string;
  shopId: string;
  category: DishCategory;
  unit: Unit;
  price: number;
  isTaxIncludedPrice: boolean;
  type: string;
  taxRate: number;
  imageUrls: string[];
  description: string;
  status: string;
}

interface DishCategory {
  id: string;
  name: string;
  code: string;
}

interface Customer {
  id?: string;
  name?: string;
  phone?: string;
  email?: string;
  tokens?: Tokens;
  anonymous?: boolean;
  address?: string;
}

interface Cart {
  shopId: string;
  customer: string;
  cartItems: CartItem[];
  totalAmount: number;
}

interface CartItem {
  id: string;
  dishId: string;
  quantity: number;
  note?: string;
}

interface OrderSessionDiscountProduct {
  dishOrderId: string;
  dishId: string;
  dishName: string;
  discountRate: string;
  discountValue: number;
  discountValueType: string;
  beforeTaxDiscountPrice: number;
  afterTaxDiscountPrice: number;
  taxDiscountPrice: number;
}

interface OrderSessionDiscount {
  id: string;
  name: string;
  discountType: string;
  discountValue: number;
  discountValueType: string;
  beforeTaxTotalDiscountAmount: number;
  afterTaxTotalDiscountAmount: number;
  taxTotalDiscountAmount: number;
  discountProducts: OrderSessionDiscountProduct[];
}

interface OrderSessionHistory {
  id: string;
  billNo: string;
  createdAt: string;
  endedAt: string;
  tableName: string;
  paymentAmount: number;
  status: OrderSessionStatus;
}

interface OrderSession {
  id: string;
  tableIds: string[]; // ids
  orders: Order[]; // object id
  tableName: string;
  discounts: OrderSessionDiscount[];
  billNo: string;
  taxRate: number;
  totalTaxAmount: number;
  taxDetails: {
    taxAmount: number;
    taxRate: number;
  }[];
  status: string;
  createdAt: string;
  updatedAt: string;
  endedAt: string;
  paymentDetails: PaymentDetail[];
  pretaxPaymentAmount: number;
  paymentAmount: number;
  numberOfCustomer: number;
  customerName: string;
  customerPhone: string;
  customerId: string;
  customerAddress: string;
  beforeTaxTotalDiscountAmount: number;
  afterTaxTotalDiscountAmount: number;
  employeeName?: string;
}

interface PaymentDetail {
  paymentMethod: PaymentMethod;
  paymentAmount?: number;
}

interface Order {
  id: string;
  table: string;
  orderNo: number;
  dishOrders: DishOrder[];
  returnedDishOrders: DishOrder[];
  createdAt: string;
  updatedAt: string;
  customerId: string;
  totalQuantity: number;
  totalBeforeTaxAmount: number;
  totalAfterTaxAmount: number;
  approvedBy: string;
  cancelledBy: string;
}

interface UnconfirmedOrder extends Order {
  customer: Customer;
  numberOfCustomer: number;
}

interface DishOrder {
  id: string;
  dishId?: string; // for create order
  name: string;
  unit: string;
  price: number;
  isTaxIncludedPrice: boolean;
  taxIncludedPrice: number;
  quantity: number;
  beforeTaxTotalPrice: number;
  afterTaxTotalPrice: number;
  taxRate: number;
  taxAmount: number;
  status: string;
  returnedAt?: string;
  note?: string;
  dishOrderNo: number;
}

interface KitchenDishOrder {
  id: string;
  dish: string; // dishId
  name: string;
  unit: string;
  quantity: string;
  status: string;
  orderId: string;
  orderSessionId: string;
  orderSessionNo: number;
  tableName: string;
  createdAt: string;
  dishOrderNo: number;
}

interface Kitchen {
  id: string;
  name: string;
  dishCategories: string[];
  tables: string[];
}

interface KitchenLog {
  id: string;
  orderId: string;
  dishOrderId: string;
  dishName: string;
  dishQuantity: string;
  action: string;
  createdAt: string;
}

interface DailySalesReportItem {
  date: string;
  orders: number;
  revenue: number;
}

interface PopularDishesReportItem {
  name: string;
  quantity: number;
  revenue: number;
}

interface PaymentMethodDistributionReportItem {
  paymentMethod: string;
  percentage: number;
}

interface HourlySalesReportItem {
  hour: number;
  orders: number;
  revenue: number;
}

interface ReportDashboard {
  from: Date;
  to: Date;
  period: ReportPeriod;
  totalOrders: number;
  totalRevenue: number;
  averageRevenuePerOrder: number;
  peakHour?: HourlySalesReportItem;
  dailySalesReport: DailySalesReportItem[];
  popularDishesReport: PopularDishesReportItem[];
  paymentMethodDistributionReport: PaymentMethodDistributionReportItem[];
  hourlySalesReport: HourlySalesReportItem[];
}

export {
  Shop,
  User,
  Tokens,
  Table,
  TableForOrder,
  TablePosition,
  DishCategory,
  Dish,
  Unit,
  Cart,
  Customer,
  Employee,
  EmployeePosition,
  Department,
  CartItem,
  PaymentDetail,
  DishOrder,
  Order,
  UnconfirmedOrder,
  OrderSession,
  OrderSessionDiscount,
  OrderSessionDiscountProduct,
  OrderSessionHistory,
  KitchenDishOrder,
  Kitchen,
  KitchenLog,
  DailySalesReportItem,
  PopularDishesReportItem,
  PaymentMethodDistributionReportItem,
  HourlySalesReportItem,
  ReportDashboard,
};
