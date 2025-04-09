import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import {
  createDepartmentRequest,
  createEmployeePositionRequest,
  createEmployeeRequest,
  deleteDepartmentRequest,
  deleteEmployeePositionRequest,
  deleteEmployeeRequest,
  getAllPermissionTypesRequest,
  getDepartmentsRequest,
  getEmployeePositionsRequest,
  getEmployeesRequest,
  updateDepartmentRequest,
  updateEmployeePositionRequest,
  updateEmployeeRequest,
} from "../../apis/staff.api.service";
import { Department, Employee, EmployeePosition } from "../state.interface";
import { API_BASE_URL } from "../../apis/api.service";
import {
  CreateDepartmentRequest,
  CreateEmployeePositionRequest,
  CreateEmployeeRequest,
  DeleteDepartmentRequest,
  DeleteEmployeePositionRequest,
  DeleteEmployeeRequest,
  UpdateDepartmentRequest,
  UpdateEmployeePositionRequest,
  UpdateEmployeeRequest,
} from "../../apis/staff.api.interface";

export const staffApiSlice = createApi({
  reducerPath: "staffApi",
  baseQuery: fetchBaseQuery({ baseUrl: API_BASE_URL }),
  tagTypes: [
    "Employees",
    "EmployeePositions",
    "Departments",
    "PermissionTypes",
  ],
  // keepUnusedDataFor: 600,
  endpoints: (builder) => ({
    /** Employees */
    getEmployees: builder.query<Employee[], string>({
      queryFn: async (shopId) => {
        try {
          const employees = await getEmployeesRequest({
            shopId,
          });

          return { data: employees };
        } catch (error) {
          return { error: { status: 500, data: error } };
        }
      },
      providesTags: ["Employees"], // Enables cache invalidation
    }),

    createEmployee: builder.mutation<Employee, CreateEmployeeRequest>({
      queryFn: async (args) => {
        try {
          const employee = await createEmployeeRequest(args);

          return { data: employee };
        } catch (error) {
          return { error: { status: 500, data: error } };
        }
      },
      invalidatesTags: ["Employees"],
    }),

    updateEmployee: builder.mutation<Employee, UpdateEmployeeRequest>({
      queryFn: async (args) => {
        try {
          const employee = await updateEmployeeRequest(args);

          return { data: employee };
        } catch (error) {
          return { error: { status: 500, data: error } };
        }
      },

      invalidatesTags: (result, error, args) => (error ? ["Employees"] : []),

      // ✅ Optimistic Update Implementation
      onQueryStarted: async (args, { dispatch, queryFulfilled }) => {
        const patchResult = dispatch(
          staffApiSlice.util.updateQueryData(
            "getEmployees",
            args.shopId,
            (draft) => {
              const index = draft.findIndex((e) => e.id === args.employeeId);
              if (index !== -1) {
                draft[index] = {
                  ...draft[index],
                  ...args,
                };
              }
            }
          )
        );

        try {
          await queryFulfilled; // Wait for actual API request to complete
        } catch {
          patchResult.undo(); // Rollback if API call fails
        }
      },
    }),

    deleteEmployee: builder.mutation<boolean, DeleteEmployeeRequest>({
      queryFn: async (args) => {
        try {
          await deleteEmployeeRequest(args);

          return { data: true };
        } catch (error) {
          return { error: { status: 500, data: error } };
        }
      },

      invalidatesTags: (result, error, args) => (error ? ["Employees"] : []),

      // ✅ Optimistic Update Implementation
      onQueryStarted: async (args, { dispatch, queryFulfilled }) => {
        const patchResult = dispatch(
          staffApiSlice.util.updateQueryData(
            "getEmployees",
            args.shopId,
            (draft) => {
              return draft.filter((e) => e.id !== args.employeeId);
            }
          )
        );

        try {
          await queryFulfilled; // Wait for actual API request to complete
        } catch {
          patchResult.undo(); // Rollback if API call fails
        }
      },
    }),

    /** Employee positions */
    getEmployeePositions: builder.query<EmployeePosition[], string>({
      queryFn: async (shopId) => {
        try {
          const employeePositions = await getEmployeePositionsRequest({
            shopId,
          });

          return { data: employeePositions };
        } catch (error) {
          return { error: { status: 500, data: error } };
        }
      },
      providesTags: ["EmployeePositions"], // Enables cache invalidation
    }),

    createEmployeePosition: builder.mutation<
      EmployeePosition,
      CreateEmployeePositionRequest
    >({
      queryFn: async (args) => {
        try {
          const employeePosition = await createEmployeePositionRequest(args);

          return { data: employeePosition };
        } catch (error) {
          return { error: { status: 500, data: error } };
        }
      },
      invalidatesTags: ["EmployeePositions"],
    }),

    updateEmployeePosition: builder.mutation<
      EmployeePosition,
      UpdateEmployeePositionRequest
    >({
      queryFn: async (args) => {
        try {
          const employeePosition = await updateEmployeePositionRequest(args);

          return { data: employeePosition };
        } catch (error) {
          return { error: { status: 500, data: error } };
        }
      },

      invalidatesTags: (result, error, args) =>
        error ? ["EmployeePositions"] : [],

      // ✅ Optimistic Update Implementation
      onQueryStarted: async (args, { dispatch, queryFulfilled }) => {
        const patchResult = dispatch(
          staffApiSlice.util.updateQueryData(
            "getEmployeePositions",
            args.shopId,
            (draft) => {
              const index = draft.findIndex(
                (ep) => ep.id === args.employeePositionId
              );
              if (index !== -1) {
                draft[index] = { ...draft[index], ...args };
              }
            }
          )
        );

        try {
          await queryFulfilled; // Wait for actual API request to complete
        } catch {
          patchResult.undo(); // Rollback if API call fails
        }
      },
    }),

    deleteEmployeePosition: builder.mutation<
      boolean,
      DeleteEmployeePositionRequest
    >({
      queryFn: async (args) => {
        try {
          await deleteEmployeePositionRequest(args);

          return { data: true };
        } catch (error) {
          return { error: { status: 500, data: error } };
        }
      },

      invalidatesTags: (result, error, args) =>
        error ? ["EmployeePositions"] : [],

      // ✅ Optimistic Update Implementation
      onQueryStarted: async (args, { dispatch, queryFulfilled }) => {
        const patchResult = dispatch(
          staffApiSlice.util.updateQueryData(
            "getEmployeePositions",
            args.shopId,
            (draft) => {
              return draft.filter((ep) => ep.id !== args.employeePositionId);
            }
          )
        );

        try {
          await queryFulfilled; // Wait for actual API request to complete
        } catch {
          patchResult.undo(); // Rollback if API call fails
        }
      },
    }),

    /** Departments */
    getDepartments: builder.query<Department[], string>({
      queryFn: async (shopId) => {
        try {
          const departments = await getDepartmentsRequest({
            shopId,
          });

          return { data: departments };
        } catch (error) {
          return { error: { status: 500, data: error } };
        }
      },
      providesTags: ["Departments"], // Enables cache invalidation
    }),

    createDepartment: builder.mutation<Department, CreateDepartmentRequest>({
      queryFn: async (args) => {
        try {
          const department = await createDepartmentRequest(args);

          return { data: department };
        } catch (error) {
          return { error: { status: 500, data: error } };
        }
      },
      invalidatesTags: ["Departments"],
    }),

    updateDepartment: builder.mutation<Department, UpdateDepartmentRequest>({
      queryFn: async (args) => {
        try {
          const department = await updateDepartmentRequest(args);

          return { data: department };
        } catch (error) {
          return { error: { status: 500, data: error } };
        }
      },

      invalidatesTags: (result, error, args) => (error ? ["Departments"] : []),

      // ✅ Optimistic Update Implementation
      onQueryStarted: async (args, { dispatch, queryFulfilled }) => {
        const patchResult = dispatch(
          staffApiSlice.util.updateQueryData(
            "getDepartments",
            args.shopId,
            (draft) => {
              const index = draft.findIndex((d) => d.id === args.departmentId);
              if (index !== -1) {
                draft[index] = { ...draft[index], ...args };
              }
            }
          )
        );

        try {
          await queryFulfilled; // Wait for actual API request to complete
        } catch {
          patchResult.undo(); // Rollback if API call fails
        }
      },
    }),

    deleteDepartment: builder.mutation<boolean, DeleteDepartmentRequest>({
      queryFn: async (args) => {
        try {
          await deleteDepartmentRequest(args);

          return { data: true };
        } catch (error) {
          return { error: { status: 500, data: error } };
        }
      },

      invalidatesTags: (result, error, args) => (error ? ["Departments"] : []),

      // ✅ Optimistic Update Implementation
      onQueryStarted: async (args, { dispatch, queryFulfilled }) => {
        const patchResult = dispatch(
          staffApiSlice.util.updateQueryData(
            "getDepartments",
            args.shopId,
            (draft) => {
              return draft.filter((d) => d.id !== args.departmentId);
            }
          )
        );

        try {
          await queryFulfilled; // Wait for actual API request to complete
        } catch {
          patchResult.undo(); // Rollback if API call fails
        }
      },
    }),

    getAllPermissionTypes: builder.query<string[], string>({
      queryFn: async (shopId) => {
        try {
          const permissionTypes = await getAllPermissionTypesRequest({
            shopId,
          });

          return { data: permissionTypes };
        } catch (error) {
          return { error: { status: 500, data: error } };
        }
      },
      keepUnusedDataFor: 24 * 60 * 60, // 1 day
      providesTags: ["PermissionTypes"], // Enables cache invalidation
    }),
  }),
});

export const {
  useGetEmployeesQuery,
  useCreateEmployeeMutation,
  useUpdateEmployeeMutation,
  useDeleteEmployeeMutation,
  useGetEmployeePositionsQuery,
  useCreateEmployeePositionMutation,
  useUpdateEmployeePositionMutation,
  useDeleteEmployeePositionMutation,
  useGetDepartmentsQuery,
  useCreateDepartmentMutation,
  useUpdateDepartmentMutation,
  useDeleteDepartmentMutation,
  useGetAllPermissionTypesQuery,
} = staffApiSlice;
