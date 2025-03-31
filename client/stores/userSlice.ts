import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import _ from "lodash";
import {
  Department,
  Dish,
  DishCategory,
  Employee,
  Shop,
  Table,
  TableForOrder,
  TablePosition,
  Unit,
} from "./state.interface";
import { PURGE } from "redux-persist";

interface ShopState {
  shops: Shop[];
  tables: Table[];
  tablePositions: TablePosition[];
  employees: Employee[];
  departments: Department[];
  units: Unit[];
  dishes: Dish[];
  dishTypes: string[];
  dishCategories: DishCategory[];
  tablesForOrder: TableForOrder[];
}

// Initial state
const initialState: ShopState = {
  shops: [],
  tables: [],
  tablePositions: [],
  employees: [],
  departments: [],
  units: [],
  dishes: [],
  dishTypes: [],
  dishCategories: [],
  tablesForOrder: [],
};

// Create Slice
export const userSlice = createSlice({
  name: "shop_deprecated",
  initialState,
  reducers: {
    updateAllShops: (state, action: PayloadAction<Shop[]>) => {
      if (!_.get(action, "payload")) {
        return;
      }
      state.shops = action.payload;
    },
    updateShop: (state, action: PayloadAction<Shop>) => {
      if (!_.get(action, "payload")) {
        return;
      }

      const id = action.payload.id;
      state.shops = state.shops.map((s) => (s.id === id ? action.payload : s));
    },

    updateAllTables: (state, action: PayloadAction<Table[]>) => {
      if (!_.get(action, "payload")) return;
      state.tables = action.payload;
    },
    updateTable: (state, action: PayloadAction<Table>) => {
      if (!_.get(action, "payload")) return;

      const id = action.payload.id;
      state.tables = state.tables.map((t) =>
        t.id === id ? action.payload : t
      );
    },

    updateAllTablePositions: (
      state,
      action: PayloadAction<TablePosition[]>
    ) => {
      if (!_.get(action, "payload")) return;
      state.tablePositions = action.payload;
    },
    updateTablePosition: (state, action: PayloadAction<TablePosition>) => {
      if (!_.get(action, "payload")) return;

      const id = action.payload.id;
      state.tablePositions = state.tablePositions.map((tp) =>
        tp.id === id ? action.payload : tp
      );
    },

    updateAllEmployees: (state, action: PayloadAction<Employee[]>) => {
      if (!_.get(action, "payload")) return;
      state.employees = action.payload;
    },
    updateEmployee: (state, action: PayloadAction<Employee>) => {
      if (!_.get(action, "payload")) return;

      const id = action.payload.id;
      state.employees = state.employees.map((e) =>
        e.id === id ? action.payload : e
      );
    },

    updateAllDepartments: (state, action: PayloadAction<Department[]>) => {
      if (!_.get(action, "payload")) return;
      state.departments = action.payload;
    },
    updateDepartment: (state, action: PayloadAction<Department>) => {
      if (!_.get(action, "payload")) return;

      const id = action.payload.id;
      state.departments = state.departments.map((d) =>
        d.id === id ? action.payload : d
      );
    },

    updateAllUnits: (state, action: PayloadAction<Unit[]>) => {
      if (!_.get(action, "payload")) return;
      state.units = action.payload;
    },
    updateUnit: (state, action: PayloadAction<Unit>) => {
      if (!_.get(action, "payload")) return;

      const id = action.payload.id;
      state.units = state.units.map((u) => (u.id === id ? action.payload : u));
    },

    updateAllDishes: (state, action: PayloadAction<Dish[]>) => {
      if (!_.get(action, "payload")) return;
      state.dishes = action.payload;
    },
    updateDish: (state, action: PayloadAction<Dish>) => {
      if (!_.get(action, "payload")) return;

      const id = action.payload.id;
      state.dishes = state.dishes.map((d) =>
        d.id === id ? action.payload : d
      );
    },

    //
    updateAllDisheTypes: (state, action: PayloadAction<string[]>) => {
      if (!_.get(action, "payload")) return;
      state.dishTypes = action.payload;
    },

    updateAllDishCategories: (state, action: PayloadAction<DishCategory[]>) => {
      if (!_.get(action, "payload")) return;
      state.dishCategories = action.payload;
    },
    updateDishCategory: (state, action: PayloadAction<DishCategory>) => {
      if (!_.get(action, "payload")) return;

      const id = action.payload.id;
      state.dishCategories = state.dishCategories.map((dc) =>
        dc.id === id ? action.payload : dc
      );
    },

    updateTablesForOrder: (state, action: PayloadAction<TableForOrder[]>) => {
      if (!_.get(action, "payload")) return;
      state.tablesForOrder = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(PURGE, () => {
      return initialState;
    });
  },
});

// Action creators
export const {
  updateAllShops,
  updateShop,
  updateAllTables,
  updateTable,
  updateAllTablePositions,
  updateTablePosition,
  updateAllDepartments,
  updateDepartment,
  updateAllEmployees,
  updateEmployee,
  updateAllDishCategories,
  updateAllDishes,
  updateAllUnits,
  updateAllDisheTypes,
  updateDish,
  updateDishCategory,
  updateTablesForOrder,
  updateUnit,
} = userSlice.actions;

export default userSlice.reducer;
