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
  shop: Shop | null;
  tableById: Record<string, Table>;
  tablePositionById: Record<string, TablePosition>;
  employeeById: Record<string, Employee>;
  departmentById: Record<string, Department>;
  unitById: Record<string, Unit>;
  dishById: Record<string, Dish>;
  dishCategoryById: Record<string, DishCategory>;
  tablesForOrderByPosition: Record<string, TableForOrder[]>;
}

// Initial state
const initialState: ShopState = {
  shop: null,
  tableById: {},
  tablePositionById: {},
  employeeById: {},
  departmentById: {},
  unitById: {},
  dishById: {},
  dishCategoryById: {},
  tablesForOrderByPosition: {},
};

// Create Slice
export const shopSlice = createSlice({
  name: "shop_2",
  initialState,
  reducers: {
    updateCurrentShop: (state, action: PayloadAction<Shop>) => {
      if (!_.get(action, "payload")) {
        return;
      }
      state.shop = action.payload;
    },

    updateTableMap: (state, action: PayloadAction<Table[]>) => {
      if (!_.get(action, "payload")) {
        return;
      }
      state.tableById = _.keyBy(action.payload, "id");
    },

    updateTablePositionMap: (state, action: PayloadAction<TablePosition[]>) => {
      if (!_.get(action, "payload")) {
        return;
      }
      state.tablePositionById = _.keyBy(action.payload, "id");
    },

    updateEmployeeMap: (state, action: PayloadAction<Employee[]>) => {
      if (!_.get(action, "payload")) {
        return;
      }
      state.employeeById = _.keyBy(action.payload, "id");
    },

    updateDepartmentMap: (state, action: PayloadAction<Department[]>) => {
      if (!_.get(action, "payload")) {
        return;
      }
      state.departmentById = _.keyBy(action.payload, "id");
    },

    updateUnitMap: (state, action: PayloadAction<Unit[]>) => {
      if (!_.get(action, "payload")) {
        return;
      }
      state.unitById = _.keyBy(action.payload, "id");
    },

    updateDishMap: (state, action: PayloadAction<Dish[]>) => {
      if (!_.get(action, "payload")) {
        return;
      }
      state.dishById = _.keyBy(action.payload, "id");
    },

    updateDishCategoryMap: (state, action: PayloadAction<DishCategory[]>) => {
      if (!_.get(action, "payload")) {
        return;
      }
      state.dishCategoryById = _.keyBy(action.payload, "id");
    },

    updateTablesForOrderMap: (
      state,
      action: PayloadAction<TableForOrder[]>
    ) => {
      if (!_.get(action, "payload")) return;
      state.tablesForOrderByPosition = _.groupBy(action.payload, "position.id");
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
  updateCurrentShop,
  updateDepartmentMap,
  updateDishCategoryMap,
  updateDishMap,
  updateEmployeeMap,
  updateTableMap,
  updateTablePositionMap,
  updateTablesForOrderMap,
  updateUnitMap,
} = shopSlice.actions;

export default shopSlice.reducer;
