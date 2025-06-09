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
    action: EventActionType.CREATE,
    shopId,
    employee,
  });
};

const updateEmployee = async ({ shopId, employeeId, updateBody }) => {
  // xem operator có đủ quyền để thêm cho nhân viên không
  validatePermissionsUpdate(updateBody);
  const employee = await getEmployeeFromCache({ employeeId, shopId });
  throwBadRequest(!employee, getMessageByLocale({ key: 'employee.notFound' }));

  const compactUpdateBody = _.pickBy({ ...updateBody, shopId });
  await Employee.update({
    data: compactUpdateBody,
    where: {
      id: employeeId,
      shopId,
    },
    select: {
      id: true,
    },
  });

  const modifiedFields = { id: employeeId };
  Object.entries(compactUpdateBody).forEach(([key, value]) => {
    if (!_.isEqual(value, employee[key])) {
      modifiedFields[key] = value;
    }
  });

  if (!_.isEmpty(modifiedFields.positionId)) {
    const newPosition = await getEmployeePositionFromCache({ employeePositionId: modifiedFields.positionId, shopId });
    modifiedFields.position = newPosition;
  }
  if (!_.isEmpty(modifiedFields.departmentId)) {
    const newDepartment = await getDepartmentFromCache({ departmentId: modifiedFields.departmentId, shopId });
    modifiedFields.department = newDepartment;
  }

  await notifyUpdateEmployee({
    action: EventActionType.UPDATE,
    shopId,
    employee: modifiedFields,
  });
};

const deleteEmployee = async ({ shopId, employeeId }) => {
  const employee = await getEmployeeFromCache({ employeeId, shopId });
  throwBadRequest(!employee, getMessageByLocale({ key: 'employee.notFound' }));

  await Employee.update({
    data: { status: Status.disabled },
    where: { id: employeeId, shopId },
    select: { id: true },
  });

  await notifyUpdateEmployee({
    action: EventActionType.DELETE,
    shopId,
    employee: { id: employeeId },
  });
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

  await notifyUpdateEmployeePosition({
    action: EventActionType.CREATE,
    shopId,
    employeePosition,
  });
};

const updateEmployeePosition = async ({ shopId, employeePositionId, updateBody }) => {
  const employeePosition = await getEmployeePositionFromCache({ employeePositionId, shopId });
  throwBadRequest(!employeePosition, getMessageByLocale({ key: 'employeePosition.notFound' }));

  const compactUpdateBody = _.pickBy({ ...updateBody, shopId });
  await EmployeePosition.update({
    data: compactUpdateBody,
    where: { id: employeePositionId, shopId },
    select: { id: true },
  });

  const modifiedFields = { id: employeePositionId };
  Object.entries(compactUpdateBody).forEach(([key, value]) => {
    if (!_.isEqual(value, employeePosition[key])) {
      modifiedFields[key] = value;
    }
  });

  await notifyUpdateEmployeePosition({
    action: EventActionType.UPDATE,
    shopId,
    employeePosition: modifiedFields,
  });
};

const deleteEmployeePosition = async ({ shopId, employeePositionId }) => {
  const employeePosition = await EmployeePosition.update({
    data: { status: Status.disabled },
    where: {
      id: employeePositionId,
      shopId,
    },
    select: { id: true },
  });

  await notifyUpdateEmployeePosition({
    action: EventActionType.DELETE,
    shopId,
    employeePosition: {
      id: employeePosition.id,
    },
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

  await notifyUpdateDepartment({
    action: EventActionType.CREATE,
    shopId,
    department,
  });
  return department;
};

const updateDepartment = async ({ shopId, departmentId, updateBody }) => {
  validatePermissionsUpdate(updateBody);
  const department = await getDepartmentFromCache({ departmentId, shopId });
  throwBadRequest(!department, getMessageByLocale({ key: 'department.notFound' }));

  const compactUpdateBody = _.pickBy({
    ...updateBody,
    shopId,
  });
  await Department.update({
    data: compactUpdateBody,
    where: { id: departmentId, shopId },
    select: { id: true },
  });

  const modifiedFields = { id: departmentId };
  Object.entries(compactUpdateBody).forEach(([key, value]) => {
    if (!_.isEqual(value, department[key])) {
      modifiedFields[key] = value;
    }
  });

  await notifyUpdateDepartment({
    action: EventActionType.UPDATE,
    shopId,
    department: modifiedFields,
  });
};

const deleteDepartment = async ({ shopId, departmentId }) => {
  const department = await getDepartmentFromCache({ departmentId, shopId });
  throwBadRequest(!department, getMessageByLocale({ key: 'department.notFound' }));

  await Department.update({
    data: { status: Status.disabled },
    where: {
      id: departmentId,
      shopId,
    },
    select: { id: true },
  });

  await notifyUpdateDepartment({
    action: EventActionType.DELETE,
    shopId,
    department: {
      id: department.id,
    },
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
