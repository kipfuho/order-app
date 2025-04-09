import { OrderSessionStatus } from "../constants/common";
import { PaymentMethod } from "../constants/paymentMethod";

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
}

interface Table {
  id: string;
  name: string;
  position: TablePosition;
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
  shop: string;
  dishCategories: string[];
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
  category: DishCategory;
  unit: Unit;
  price: number;
  isTaxIncludedPrice: boolean;
  type: string;
  taxRate: number;
  imageUrls: string[];
}

interface DishCategory {
  id: string;
  name: string;
}

interface Customer {
  id?: string;
  name?: string;
  email?: string;
}

interface Cart {
  items: Array<{ id: string; quantity: number }>;
  total: number;
}

interface MenuItem {
  id: string;
  name: string;
  price: number;
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
  customerInfo: {
    numberOfCustomer: number;
    customerName: string;
    customerPhone: string;
    customerId: string;
    customerAddress: string;
  };
  totalDiscountAmountBeforeTax: number;
  totalDiscountAmountAfterTax: number;
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
  MenuItem,
  PaymentDetail,
  DishOrder,
  Order,
  OrderSession,
  OrderSessionDiscount,
  OrderSessionDiscountProduct,
  OrderSessionHistory,
};
