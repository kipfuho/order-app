interface GetDepartmentsRequest {
  shopId: string;
}

interface GetDepartmentRequest {
  shopId: string;
  departmentId: string;
}

interface CreateDepartmentRequest {
  shopId: string;
  name: string;
  permissions: string[];
}

interface UpdateDepartmentRequest {
  shopId: string;
  departmentId: string;
  name: string;
  permissions: string[];
}

interface DeleteDepartmentRequest {
  shopId: string;
  departmentId: string;
}

interface GetEmployeesRequest {
  shopId: string;
}

interface GetEmployeeRequest {
  shopId: string;
  employeeId: string;
}

interface CreateEmployeeRequest {
  shopId: string;
  name: string;
  email: string;
  password: string;
  positionId?: string;
  departmentId: string;
  permissions: string[];
}

interface UpdateEmployeeRequest {
  shopId: string;
  employeeId: string;
  name: string;
  positionId?: string;
  departmentId: string;
  permissions: string[];
}

interface DeleteEmployeeRequest {
  shopId: string;
  employeeId: string;
}

interface GetEmployeePositionsRequest {
  shopId: string;
}

interface GetEmployeePositionRequest {
  shopId: string;
  employeePositionId: string;
}

interface CreateEmployeePositionRequest {
  shopId: string;
  name: string;
}

interface UpdateEmployeePositionRequest {
  shopId: string;
  employeePositionId: string;
  name: string;
}

interface DeleteEmployeePositionRequest {
  shopId: string;
  employeePositionId: string;
}

interface GetAllPermissionTypesRequest {
  shopId: string;
}

export {
  CreateDepartmentRequest,
  CreateEmployeePositionRequest,
  CreateEmployeeRequest,
  DeleteDepartmentRequest,
  DeleteEmployeePositionRequest,
  DeleteEmployeeRequest,
  GetDepartmentsRequest,
  GetDepartmentRequest,
  GetEmployeePositionsRequest,
  GetEmployeePositionRequest,
  GetEmployeesRequest,
  GetEmployeeRequest,
  UpdateDepartmentRequest,
  UpdateEmployeePositionRequest,
  UpdateEmployeeRequest,
  GetAllPermissionTypesRequest,
};
