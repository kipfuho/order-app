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
  country: string;
}

interface Table {
  id: string;
  name: string;
  position: TablePosition;
}

interface TableForOrder extends Table {
  activeOrderSessions: OrderSessionPreview[];
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
  role?: string;
}

interface Department {
  id: string;
  name: string;
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

interface OrderSession {
  id: string;
  name: string;
  price: number;
  tables: string[]; // object id
  orders: string[]; // object id
  discounts: OrderSessionDiscount[];
  orderSessionNo: number;
  taxRate: number;
  totalTaxAmount: number;
  taxDetails: {
    taxAmount: number;
    taxRate: number;
  }[];
  status: string;
  createdAt: Date;
  updatedAt: Date;
  endedAt: Date;
  auditedAt: Date;
  paymentDetails: PaymentDetail[];
  paymentAmount: number;
  customerInfo: {
    numberOfCustomer: number;
  };
  totalDiscountAmountBeforeTax: number;
  totalDiscountAmountAfterTax: number;
}

interface OrderSessionDetail extends Omit<OrderSession, "tables" | "orders"> {
  tables: Table[];
  orders: Order[];
}

// contain less information, for display only
interface OrderSessionPreview {
  id: string;
  createdAt: Date;
  numberOfCustomer: number;
  status: string;
  statusColorCode?: number;
  paymentAmount: number;
  averagePaymentAmount: number;
}

interface PaymentDetail {
  paymentMethod: PaymentMethod;
  paymentAmount: number;
}

interface Order {
  table: Table;
  orderNo: number;
  dishOrders: DishOrder[];
  returnedDishOrders: DishOrder[];
  createdAt: Date;
  updatedAt: Date;
}

interface DishOrder {
  dish: Dish;
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
  returnedAt?: Date;
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
  Department,
  MenuItem,
  PaymentDetail,
  DishOrder,
  Order,
  OrderSession,
  OrderSessionPreview,
  OrderSessionDetail,
  OrderSessionDiscount,
  OrderSessionDiscountProduct,
};
