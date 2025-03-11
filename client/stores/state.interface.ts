export interface Tokens {
  access: {
    token: string;
    expires: Date;
  };
  refresh: {
    token: string;
    expires: Date;
  };
}

export interface User {
  id?: string;
  name?: string;
  email?: string;
  tokens?: Tokens;
}

export interface Restaurant {
  id: string;
  name: string;
  location?: string;
}

export interface Table {
  id: string;
  number: number;
}

export interface TablePosition {
  id: string;
  x: number;
  y: number;
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
}

export interface Dish {
  id: string;
  name: string;
  categoryId: string;
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
