import { createSlice } from "@reduxjs/toolkit";
import _ from "lodash";

// states for shop owners and employees
export const userSlice = createSlice({
  name: "restaurant",
  initialState: {
    restaurants: [],
    tables: [],
    tablePositions: [],
    employees: [],
    departments: [],
    units: [],
    dishes: [],
    dishCategories: [],
    tableWithActiveOrders: [],
  },
  reducers: {
    // restaurant states
    updateAllRestaurants: (state, action) => {
      if (_.get(action, "payload")) return;

      state.restaurants = action.payload;
    },
    updateRestaurant: (state, action) => {
      if (_.get(action, "payload")) return;

      const { id, ...updatedData } = action.payload;
      const index = _.findIndex(state.restaurants, (res) => res.id === id);

      if (index !== -1) {
        state.restaurants[index] = {
          ...state.restaurants[index],
          ...updatedData,
        };
      }
    },

    // table states
    updateAllTables: (state, action) => {
      if (_.get(action, "payload")) return;

      state.tables = action.payload;
    },
    updateTable: (state, action) => {
      if (_.get(action, "payload")) return;

      const { id, ...updatedData } = action.payload;
      const index = _.findIndex(state.tables, (tab) => tab.id === id);

      if (index !== -1) {
        state.tables[index] = {
          ...state.tables[index],
          ...updatedData,
        };
      }
    },

    // tablePosition states
    updateAllTablePositions: (state, action) => {
      if (_.get(action, "payload")) return;

      state.tablePositions = action.payload;
    },
    updateTablePosition: (state, action) => {
      if (_.get(action, "payload")) return;

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

    // employee states
    updateAllEmployees: (state, action) => {
      if (_.get(action, "payload")) return;

      state.employees = action.payload;
    },
    updateEmployee: (state, action) => {
      if (_.get(action, "payload")) return;

      const { id, ...updatedData } = action.payload;
      const index = _.findIndex(state.employees, (emp) => emp.id === id);

      if (index !== -1) {
        state.employees[index] = {
          ...state.employees[index],
          ...updatedData,
        };
      }
    },

    // department states
    updateAllDepartments: (state, action) => {
      if (_.get(action, "payload")) return;

      state.departments = action.payload;
    },
    updateDepartment: (state, action) => {
      if (_.get(action, "payload")) return;

      const { id, ...updatedData } = action.payload;
      const index = _.findIndex(state.departments, (dep) => dep.id === id);

      if (index !== -1) {
        state.departments[index] = {
          ...state.departments[index],
          ...updatedData,
        };
      }
    },

    // unit states
    updateAllUnits: (state, action) => {
      if (_.get(action, "payload")) return;

      state.units = action.payload;
    },
    updateUnit: (state, action) => {
      if (_.get(action, "payload")) return;

      const { id, ...updatedData } = action.payload;
      const index = _.findIndex(state.units, (unit) => unit.id === id);

      if (index !== -1) {
        state.units[index] = {
          ...state.units[index],
          ...updatedData,
        };
      }
    },

    // dish states
    updateAllDishes: (state, action) => {
      if (_.get(action, "payload")) return;

      state.dishes = action.payload;
    },
    updateDish: (state, action) => {
      if (_.get(action, "payload")) return;

      const { id, ...updatedData } = action.payload;
      const index = _.findIndex(state.dishes, (dish) => dish.id === id);

      if (index !== -1) {
        state.dishes[index] = {
          ...state.dishes[index],
          ...updatedData,
        };
      }
    },

    // dishCategory states
    updateAllDishCategories: (state, action) => {
      if (_.get(action, "payload")) return;

      state.dishCategories = action.payload;
    },
    updateDishCategory: (state, action) => {
      if (_.get(action, "payload")) return;

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

    // tableWithActiveOrders states
    updateTableWithActiveOrders: (state, action) => {
      if (_.get(action, "payload")) return;

      state.tableWithActiveOrders = action.payload;
    },
  },
});

// Action creators are generated for each case reducer function
export const {
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

export default counterSlice.reducer;
