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
  tags: string[];
}

interface DishCategory {
  id: string;
  name: string;
  code: string;
}

interface Customer {
  id: string;
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
  revenueAmount: number;
  paymentAmount: number;
  numberOfCustomer: number;
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  beforeTaxTotalDiscountAmount: number;
  afterTaxTotalDiscountAmount: number;
  startedByUserName?: string;
  paidByUserName?: string;
  cancelledByUserName?: string;
  cancellationReason?: string;
}

interface PaymentDetail {
  paymentMethod: PaymentMethod;
  paymentAmount: number;
}

interface Order {
  id: string;
  orderNo: number;
  dishOrders: DishOrder[];
  returnedDishOrders: ReturnedDishOrder[];
  createdAt: string;
  updatedAt: string;
  approvedByName?: string;
  cancelledByName?: string;
  totalQuantity: number;
  totalBeforeTaxAmount: number;
  totalAfterTaxAmount: number;
  beforeTaxTotalDiscountAmount?: number;
  afterTaxTotalDiscountAmount?: number;
  paymentAmount?: number;
  revenueAmount?: number;
  approvedBy?: string;
  cancelledBy?: string;
  customerId?: string;
  isCustomerOrder: boolean;
}

interface OrderCartCheckoutHistory {
  id: string;
  dishOrders: {
    dishId: string;
    name: string;
    quantity: number;
    price: number;
    note: string;
  }[];
  createdAt: string;
  paymentAmount: number;
  tableName: string;
}

interface OrderSessionCartCheckoutHistory {
  id: string;
  billNo: string;
  orders: {
    id: string;
    customerId: string;
    dishOrders: {
      dishId: string;
      name: string;
      quantity: number;
      price: number;
      note: string;
    }[];
  }[];
  createdAt: string;
  paymentAmount: number;
  tableName: string;
  status: OrderSessionStatus;
}

interface UnconfirmedOrder extends Order {
  customer: Customer;
  numberOfCustomer: number;
}

interface DishOrder {
  id: string;
  dishId?: string; // for create order
  dishOrderNo: number;
  name: string;
  unit: string;
  price: number;
  isTaxIncludedPrice: boolean;
  taxIncludedPrice: number;
  quantity: number;
  beforeTaxTotalPrice: number;
  afterTaxTotalPrice: number;
  taxRate: number;
  beforeTaxTotalDiscountAmount: number;
  afterTaxTotalDiscountAmount: number;
  paymentAmount: number;
  revenueAmount: number;
  status: string;
  note: string;
}

interface ReturnedDishOrder {
  id: string;
  dishId?: string; // for create order
  dishOrderNo: number;
  name: string;
  unit: string;
  quantity: number;
  status: string;
  note: string;
  createdAt: string;
}

interface KitchenDishOrder {
  id: string;
  dishId: string; // dishId
  name: string;
  unit: string;
  quantity: string;
  status: string;
  orderId: string;
  orderNo: number;
  tableName: string;
  tablePositionName: string;
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
  OrderCartCheckoutHistory,
  OrderSessionCartCheckoutHistory,
};
