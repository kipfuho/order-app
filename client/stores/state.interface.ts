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
  email: string;
  location?: string;
}

export interface Table {
  id: string;
  name: string;
  position: TablePosition;
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
