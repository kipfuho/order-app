import {
  Department,
  Employee,
  EmployeePosition,
} from "../stores/state.interface";
import { apiRequest } from "./api.service";
import { getAccessTokenLazily } from "./auth.api.service";
import {
  CreateDepartmentRequest,
  CreateEmployeePositionRequest,
  CreateEmployeeRequest,
  DeleteDepartmentRequest,
  DeleteEmployeePositionRequest,
  DeleteEmployeeRequest,
  GetAllPermissionTypesRequest,
  GetDepartmentRequest,
  GetDepartmentsRequest,
  GetEmployeePositionsRequest,
  GetEmployeeRequest,
  GetEmployeesRequest,
  UpdateDepartmentRequest,
  UpdateEmployeePositionRequest,
  UpdateEmployeeRequest,
} from "./staff.api.interface";

const getDepartmentsRequest = async ({ shopId }: GetDepartmentsRequest) => {
  const accessToken = await getAccessTokenLazily();

  const result: {
    departments: Department[];
  } = await apiRequest({
    method: "GET",
    endpoint: `/v1/shops/${shopId}/departments`,
    token: accessToken,
  });

  return result.departments;
};

const getDepartmentRequest = async ({
  shopId,
  departmentId,
}: GetDepartmentRequest) => {
  const accessToken = await getAccessTokenLazily();

  const result: {
    department: Department;
  } = await apiRequest({
    method: "GET",
    endpoint: `/v1/shops/${shopId}/departments/${departmentId}`,
    token: accessToken,
  });

  return result.department;
};

const createDepartmentRequest = async ({
  shopId,
  name,
  permissions,
}: CreateDepartmentRequest) => {
  const accessToken = await getAccessTokenLazily();

  const result: {
    department: Department;
  } = await apiRequest({
    method: "POST",
    endpoint: `/v1/shops/${shopId}/departments`,
    token: accessToken,
    data: {
      name,
      permissions,
    },
  });

  return result.department;
};

const updateDepartmentRequest = async ({
  shopId,
  departmentId,
  name,
  permissions,
}: UpdateDepartmentRequest) => {
  const accessToken = await getAccessTokenLazily();

  const result: {
    department: Department;
  } = await apiRequest({
    method: "PATCH",
    endpoint: `/v1/shops/${shopId}/departments/${departmentId}`,
    token: accessToken,
    data: { name, permissions },
  });

  return result.department;
};

const deleteDepartmentRequest = async ({
  shopId,
  departmentId,
}: DeleteDepartmentRequest) => {
  const accessToken = await getAccessTokenLazily();

  await apiRequest({
    method: "DELETE",
    endpoint: `/v1/shops/${shopId}/departments/${departmentId}`,
    token: accessToken,
  });
};

const getEmployeesRequest = async ({ shopId }: GetEmployeesRequest) => {
  const accessToken = await getAccessTokenLazily();

  const result: {
    employees: Employee[];
  } = await apiRequest({
    method: "GET",
    endpoint: `/v1/shops/${shopId}/employees`,
    token: accessToken,
  });

  return result.employees;
};

const getEmployeeRequest = async ({
  shopId,
  employeeId,
}: GetEmployeeRequest) => {
  const accessToken = await getAccessTokenLazily();

  const result: {
    employee: Employee;
  } = await apiRequest({
    method: "GET",
    endpoint: `/v1/shops/${shopId}/employees/${employeeId}`,
    token: accessToken,
  });

  return result.employee;
};

const createEmployeeRequest = async ({
  shopId,
  departmentId,
  email,
  name,
  password,
  permissions,
  positionId,
}: CreateEmployeeRequest) => {
  const accessToken = await getAccessTokenLazily();

  const result: {
    employee: Employee;
  } = await apiRequest({
    method: "POST",
    endpoint: `/v1/shops/${shopId}/employees`,
    token: accessToken,
    data: {
      departmentId,
      email,
      name,
      password,
      permissions,
      positionId,
    },
  });

  return result.employee;
};

const updateEmployeeRequest = async ({
  shopId,
  employeeId,
  departmentId,
  name,
  permissions,
  positionId,
}: UpdateEmployeeRequest) => {
  const accessToken = await getAccessTokenLazily();

  const result: {
    employee: Employee;
  } = await apiRequest({
    method: "PATCH",
    endpoint: `/v1/shops/${shopId}/employees/${employeeId}`,
    token: accessToken,
    data: {
      departmentId,
      name,
      permissions,
      positionId,
    },
  });

  return result.employee;
};

const deleteEmployeeRequest = async ({
  shopId,
  employeeId,
}: DeleteEmployeeRequest) => {
  const accessToken = await getAccessTokenLazily();

  await apiRequest({
    method: "DELETE",
    endpoint: `/v1/shops/${shopId}/employees/${employeeId}`,
    token: accessToken,
  });
};

const getEmployeePositionsRequest = async ({
  shopId,
}: GetEmployeePositionsRequest) => {
  const accessToken = await getAccessTokenLazily();

  const result: {
    employeePositions: EmployeePosition[];
  } = await apiRequest({
    method: "GET",
    endpoint: `/v1/shops/${shopId}/employeePositions`,
    token: accessToken,
  });

  return result.employeePositions;
};

const createEmployeePositionRequest = async ({
  shopId,
  name,
}: CreateEmployeePositionRequest) => {
  const accessToken = await getAccessTokenLazily();

  const result: {
    employeePosition: EmployeePosition;
  } = await apiRequest({
    method: "POST",
    endpoint: `/v1/shops/${shopId}/employeePositions`,
    token: accessToken,
    data: {
      name,
    },
  });

  return result.employeePosition;
};

const updateEmployeePositionRequest = async ({
  shopId,
  employeePositionId,
  name,
}: UpdateEmployeePositionRequest) => {
  const accessToken = await getAccessTokenLazily();

  const result: {
    employeePosition: EmployeePosition;
  } = await apiRequest({
    method: "PATCH",
    endpoint: `/v1/shops/${shopId}/employeePositions/${employeePositionId}`,
    token: accessToken,
    data: {
      name,
    },
  });

  return result.employeePosition;
};

const deleteEmployeePositionRequest = async ({
  shopId,
  employeePositionId,
}: DeleteEmployeePositionRequest) => {
  const accessToken = await getAccessTokenLazily();

  await apiRequest({
    method: "DELETE",
    endpoint: `/v1/shops/${shopId}/employeePositions/${employeePositionId}`,
    token: accessToken,
  });
};

const getAllPermissionTypesRequest = async ({
  shopId,
}: GetAllPermissionTypesRequest) => {
  const accessToken = await getAccessTokenLazily();

  const result: {
    permissionTypes: string[];
  } = await apiRequest({
    method: "GET",
    endpoint: `/v1/shops/${shopId}/employees/permissionTypes`,
    token: accessToken,
  });

  return result.permissionTypes;
};

export {
  getDepartmentsRequest,
  getDepartmentRequest,
  createDepartmentRequest,
  updateDepartmentRequest,
  deleteDepartmentRequest,
  getEmployeesRequest,
  getEmployeeRequest,
  createEmployeeRequest,
  updateEmployeeRequest,
  deleteEmployeeRequest,
  getEmployeePositionsRequest,
  createEmployeePositionRequest,
  updateEmployeePositionRequest,
  deleteEmployeePositionRequest,
  getAllPermissionTypesRequest,
};
