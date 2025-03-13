import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import _ from "lodash";
import {
  Department,
  Dish,
  DishCategory,
  Employee,
  Restaurant,
  Table,
  TablePosition,
  Tokens,
  Unit,
  User,
} from "./state.interface";

interface ShopState {
  user: User;
  restaurants: Restaurant[];
  tables: Table[];
  tablePositions: TablePosition[];
  employees: Employee[];
  departments: Department[];
  units: Unit[];
  dishes: Dish[];
  dishCategories: DishCategory[];
  tableWithActiveOrders: Table[];
}

// Initial state
const initialState: ShopState = {
  user: {},
  restaurants: [],
  tables: [],
  tablePositions: [],
  employees: [],
  departments: [],
  units: [],
  dishes: [],
  dishCategories: [],
  tableWithActiveOrders: [],
};

// Create Slice
export const userSlice = createSlice({
  name: "shop",
  initialState,
  reducers: {
    updateUser: (state, action: PayloadAction<User>) => {
      if (!_.get(action, "payload")) {
        return;
      }
      state.user = {
        ...state.user,
        ...action.payload,
      };
    },
    resetUser: (state) => {
      state.user = {};
    },

    updateAllRestaurants: (state, action: PayloadAction<Restaurant[]>) => {
      if (!_.get(action, "payload")) {
        return;
      }
      state.restaurants = action.payload;
    },
    updateRestaurant: (state, action: PayloadAction<Restaurant>) => {
      if (!_.get(action, "payload")) {
        return;
      }
      const { id, ...updatedData } = action.payload;
      const index = _.findIndex(state.restaurants, (res) => res.id === id);

      if (index !== -1) {
        state.restaurants[index] = {
          ...state.restaurants[index],
          ...updatedData,
        };
      }
    },

    updateAllTables: (state, action: PayloadAction<Table[]>) => {
      if (!_.get(action, "payload")) return;
      state.tables = action.payload;
    },
    updateTable: (state, action: PayloadAction<Table>) => {
      if (!_.get(action, "payload")) return;
      const { id, ...updatedData } = action.payload;
      const index = _.findIndex(state.tables, (tab) => tab.id === id);

      if (index !== -1) {
        state.tables[index] = {
          ...state.tables[index],
          ...updatedData,
        };
      }
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
      const { id, ...updatedData } = action.payload;
      const index = _.findIndex(
        state.tablePositions,
        (tabPos) => tabPos.id === id
      );

      if (index !== -1) {
        state.tablePositions[index] = {
          ...state.tablePositions[index],
          ...updatedData,
        };
      }
    },

    updateAllEmployees: (state, action: PayloadAction<Employee[]>) => {
      if (!_.get(action, "payload")) return;
      state.employees = action.payload;
    },
    updateEmployee: (state, action: PayloadAction<Employee>) => {
      if (!_.get(action, "payload")) return;
      const { id, ...updatedData } = action.payload;
      const index = _.findIndex(state.employees, (emp) => emp.id === id);

      if (index !== -1) {
        state.employees[index] = {
          ...state.employees[index],
          ...updatedData,
        };
      }
    },

    updateAllDepartments: (state, action: PayloadAction<Department[]>) => {
      if (!_.get(action, "payload")) return;
      state.departments = action.payload;
    },
    updateDepartment: (state, action: PayloadAction<Department>) => {
      if (!_.get(action, "payload")) return;
      const { id, ...updatedData } = action.payload;
      const index = _.findIndex(state.departments, (dep) => dep.id === id);

      if (index !== -1) {
        state.departments[index] = {
          ...state.departments[index],
          ...updatedData,
        };
      }
    },

    updateAllUnits: (state, action: PayloadAction<Unit[]>) => {
      if (!_.get(action, "payload")) return;
      state.units = action.payload;
    },
    updateUnit: (state, action: PayloadAction<Unit>) => {
      if (!_.get(action, "payload")) return;
      const { id, ...updatedData } = action.payload;
      const index = _.findIndex(state.units, (unit) => unit.id === id);

      if (index !== -1) {
        state.units[index] = {
          ...state.units[index],
          ...updatedData,
        };
      }
    },

    updateAllDishes: (state, action: PayloadAction<Dish[]>) => {
      if (!_.get(action, "payload")) return;
      state.dishes = action.payload;
    },
    updateDish: (state, action: PayloadAction<Dish>) => {
      if (!_.get(action, "payload")) return;
      const { id, ...updatedData } = action.payload;
      const index = _.findIndex(state.dishes, (dish) => dish.id === id);

      if (index !== -1) {
        state.dishes[index] = {
          ...state.dishes[index],
          ...updatedData,
        };
      }
    },

    updateAllDishCategories: (state, action: PayloadAction<DishCategory[]>) => {
      if (!_.get(action, "payload")) return;
      state.dishCategories = action.payload;
    },
    updateDishCategory: (state, action: PayloadAction<DishCategory>) => {
      if (!_.get(action, "payload")) return;
      const { id, ...updatedData } = action.payload;
      const index = _.findIndex(
        state.dishCategories,
        (dishCat) => dishCat.id === id
      );

      if (index !== -1) {
        state.dishCategories[index] = {
          ...state.dishCategories[index],
          ...updatedData,
        };
      }
    },

    updateTableWithActiveOrders: (state, action: PayloadAction<Table[]>) => {
      if (!_.get(action, "payload")) return;
      state.tableWithActiveOrders = action.payload;
    },
  },
});

// Action creators
export const {
  updateUser,
  resetUser,
  updateAllRestaurants,
  updateRestaurant,
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
  updateDish,
  updateDishCategory,
  updateTableWithActiveOrders,
  updateUnit,
} = userSlice.actions;

export default userSlice.reducer;
