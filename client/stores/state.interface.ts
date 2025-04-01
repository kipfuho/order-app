export interface Tokens {
  access: {
    token: string;
    expires: number;
  };
  refresh: {
    token: string;
    expires: number;
  };
}

export interface User {
  id: string;
  email: string;
  name?: string;
  tokens?: Tokens;
}

export interface Shop {
  id: string;
  name: string;
  phone?: string;
  email: string;
  location?: string;
  imageUrls?: string[];
  country: string;
}

export interface Table {
  id: string;
  name: string;
  position: TablePosition;
}

export interface TableForOrder extends Table {
  activeOrderSessions: OrderSessionPreview[];
}

export interface TablePosition {
  id: string;
  name: string;
  shop: string;
  dishCategories: string[];
}

export interface Employee {
  id: string;
  name: string;
  role?: string;
}

export interface Department {
  id: string;
  name: string;
}

export interface Unit {
  id: string;
  name: string;
  code: string;
}

export interface Dish {
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

export interface DishOrder {
  dishId: string;
  quantity: number;
  name?: string;
  taxRate?: number;
  price?: number;
  isTaxIncludedPrice?: boolean;
}

export interface DishCategory {
  id: string;
  name: string;
}

// customer
export interface Customer {
  id?: string;
  name?: string;
  email?: string;
}

export interface Cart {
  items: Array<{ id: string; quantity: number }>;
  total: number;
}

export interface MenuItem {
  id: string;
  name: string;
  price: number;
}

// contain less information, for display only
export interface OrderSessionPreview {
  id: string;
  createdAt: Date;
  numberOfCustomer: number;
  status: string;
  statusColorCode?: number;
  paymentAmount: number;
  averagePaymentAmount: number;
}

export interface OrderSession {
  id: string;
  name: string;
  price: number;
}
