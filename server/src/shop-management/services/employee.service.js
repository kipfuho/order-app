const _ = require('lodash');
const { createUser } = require('../../auth/services/user.service');
const { roles } = require('../../config/roles');
const { getMessageByLocale } = require('../../locale');
const {
  getEmployeePositionFromCache,
  getEmployeePositionsFromCache,
  getEmployeeFromCache,
  getEmployeesFromCache,
} = require('../../metadata/employeeMetadata.service');
const { getUserFromDatabase } = require('../../metadata/userMetadata.service');
const { getOperatorFromSession } = require('../../middlewares/clsHooked');
const { EmployeePosition, Employee, Department } = require('../../models');
const {
  notifyUpdateEmployee,
  EventActionType,
  notifyUpdateEmployeePosition,
  notifyUpdateDepartment,
} = require('../../utils/awsUtils/appSync.utils');
const { PermissionType, Status } = require('../../utils/constant');
const { throwBadRequest } = require('../../utils/errorHandling');
const { getDepartmentFromCache, getDepartmentsFromCache } = require('../../metadata/departmentMetadata.service');

const getEmployee = async ({ shopId, employeeId }) => {
  const employee = await getEmployeeFromCache({ employeeId, shopId });
  throwBadRequest(!employee, getMessageByLocale({ key: 'employee.notFound' }));
  return employee;
};

const getEmployees = async ({ shopId }) => {
  const employees = await getEmployeesFromCache({ shopId });
  return employees;
};

const validatePermissionsUpdate = ({ permissions = [] }) => {
  const { permissions: operatorPermissions } = getOperatorFromSession();
  const operatorPermissionSet = new Set(operatorPermissions);
  const operatorHasEnoughPermission = permissions.every((p) => operatorPermissionSet.has(p));
  throwBadRequest(!operatorHasEnoughPermission, getMessageByLocale({ key: 'permission.missing' }));
};

const createEmployee = async ({ shopId, createBody }) => {
  const { name, email, password, positionId, departmentId, permissions } = createBody;
  // xem operator có đủ quyền để thêm cho nhân viên không
  validatePermissionsUpdate({ permissions });

  let user = await getUserFromDatabase({ email });
  if (!user) {
    user = await createUser({ name, email, password });
  }
  throwBadRequest(user.role === roles.admin, getMessageByLocale({ key: 'email.invalid' }));

  const operator = await getOperatorFromSession();
  const employee = await Employee.create({
    data: _.pickBy({
      name,
      permissions,
      positionId,
      departmentId,
      shopId,
      userId: _.get(operator, 'user.id'),
    }),
    include: {
      user: true,
      position: true,
      department: true,
    },
  });

  await notifyUpdateEmployee({
    employee,
    action: EventActionType.CREATE,
    userId: _.get(operator, 'user.id'),
  });
  return employee;
};

const updateEmployee = async ({ shopId, employeeId, updateBody }) => {
  // xem operator có đủ quyền để thêm cho nhân viên không
  validatePermissionsUpdate(updateBody);
  const employee = await Employee.update({
    data: _.pickBy({ ...updateBody, shopId }),
    where: {
      id: employeeId,
      shopId,
    },
    include: {
      user: true,
      position: true,
      department: true,
    },
  });
  throwBadRequest(!employee, getMessageByLocale({ key: 'employee.notFound' }));

  const operator = await getOperatorFromSession();
  await notifyUpdateEmployee({
    employee,
    action: EventActionType.UPDATE,
    userId: _.get(operator, 'user.id'),
  });
  return employee;
};

const deleteEmployee = async ({ shopId, employeeId }) => {
  const employee = await Employee.update({
    data: { status: Status.disabled },
    where: { id: employeeId, shopId },
    include: { user: true, position: true, department: true },
  });
  throwBadRequest(!employee, getMessageByLocale({ key: 'employee.notFound' }));

  const operator = await getOperatorFromSession();
  await notifyUpdateEmployee({
    employee,
    action: EventActionType.DELETE,
    userId: _.get(operator, 'user.id'),
  });
  return employee;
};

const getEmployeePosition = async ({ shopId, employeePositionId }) => {
  const employeePosition = await getEmployeePositionFromCache({ employeePositionId, shopId });
  throwBadRequest(!employeePosition, getMessageByLocale({ key: 'employeePosition.notFound' }));
  return employeePosition;
};

const getEmployeePositions = async ({ shopId }) => {
  const employeePositions = await getEmployeePositionsFromCache({ shopId });
  return employeePositions;
};

const createEmployeePosition = async ({ shopId, createBody }) => {
  const employeePosition = await EmployeePosition.create({
    data: _.pickBy({
      ...createBody,
      shopId,
    }),
  });

  const operator = await getOperatorFromSession();
  await notifyUpdateEmployeePosition({
    employeePosition,
    action: EventActionType.CREATE,
    userId: _.get(operator, 'user.id'),
  });
  return employeePosition;
};

const updateEmployeePosition = async ({ shopId, employeePositionId, updateBody }) => {
  const employeePosition = await EmployeePosition.update({
    data: _.pickBy({ ...updateBody, shopId }),
    where: { id: employeePositionId, shopId },
  });
  throwBadRequest(!employeePosition, getMessageByLocale({ key: 'employeePosition.notFound' }));

  const operator = await getOperatorFromSession();
  await notifyUpdateEmployeePosition({
    employeePosition,
    action: EventActionType.UPDATE,
    userId: _.get(operator, 'user.id'),
  });
  return employeePosition;
};

const deleteEmployeePosition = async ({ shopId, employeePositionId }) => {
  const employeePosition = await EmployeePosition.update({
    data: { status: Status.disabled },
    where: {
      id: employeePositionId,
      shopId,
    },
  });

  const operator = await getOperatorFromSession();
  await notifyUpdateEmployeePosition({
    employeePosition,
    action: EventActionType.DELETE,
    userId: _.get(operator, 'user.id'),
  });
  return employeePosition;
};

const getAllPermissionTypes = async () => {
  const allPermissionTypes = Object.values(PermissionType);
  return allPermissionTypes.filter((type) => type !== PermissionType.SHOP_APP);
};

const getDepartment = async ({ shopId, departmentId }) => {
  const department = await getDepartmentFromCache({ departmentId, shopId });
  throwBadRequest(!department, getMessageByLocale({ key: 'department.notFound' }));
  return department;
};

const getDepartments = async ({ shopId }) => {
  const departments = await getDepartmentsFromCache({ shopId });
  return departments;
};

const createDepartment = async ({ shopId, createBody }) => {
  validatePermissionsUpdate(createBody);
  const department = await Department.create({
    data: _.pickBy({
      ...createBody,
      shopId,
    }),
  });

  const operator = await getOperatorFromSession();
  await notifyUpdateDepartment({
    department,
    action: EventActionType.CREATE,
    userId: _.get(operator, 'user.id'),
  });
  return department;
};

const updateDepartment = async ({ shopId, departmentId, updateBody }) => {
  validatePermissionsUpdate(updateBody);
  const department = await Department.update({
    data: _.pickBy({
      ...updateBody,
      shopId,
    }),
    where: { id: departmentId, shopId },
  });
  throwBadRequest(!department, getMessageByLocale({ key: 'department.notFound' }));

  const operator = await getOperatorFromSession();
  await notifyUpdateDepartment({
    department,
    action: EventActionType.UPDATE,
    userId: _.get(operator, 'user.id'),
  });
  return department;
};

const deleteDepartment = async ({ shopId, departmentId }) => {
  const department = await Department.update({
    data: { status: Status.disabled },
    where: {
      id: departmentId,
      shopId,
    },
  });

  const operator = await getOperatorFromSession();
  await notifyUpdateDepartment({
    department,
    action: EventActionType.DELETE,
    userId: _.get(operator, 'user.id'),
  });
  return department;
};

module.exports = {
  getEmployee,
  getEmployees,
  createEmployee,
  updateEmployee,
  deleteEmployee,
  getEmployeePosition,
  getEmployeePositions,
  createEmployeePosition,
  updateEmployeePosition,
  deleteEmployeePosition,
  getAllPermissionTypes,
  validatePermissionsUpdate,
  getDepartment,
  getDepartments,
  createDepartment,
  updateDepartment,
  deleteDepartment,
};
