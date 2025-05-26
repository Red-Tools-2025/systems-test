// src/types/db.ts
export type Store = {
  id: number;
  store_name: string;
  location: string | null;
};

export type Inventory = {
  id: number;
  store_id: number;
  product_name: string;
  quantity: number;
  price: number;
};

export type Employee = {
  id: number;
  store_id: number;
  employee_name: string;
  login_passcode: string;
};

export type Sale = {
  id: number;
  store_id: number;
  employee_id: number;
  inventory_id: number;
  quantity_sold: number;
  sale_time: string;
};
