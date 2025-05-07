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
const { getEmployeePermissions } = require('../../middlewares/clsHooked');
const { EmployeePosition, Employee } = require('../../models');
const {
  notifyUpdateEmployee,
  EventActionType,
  notifyUpdateEmployeePosition,
} = require('../../utils/awsUtils/appSync.utils');
const { PermissionType } = require('../../utils/constant');
const { throwBadRequest } = require('../../utils/errorHandling');

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
  const operatorPermissions = getEmployeePermissions();
  const operatorPermissionSet = new Set(operatorPermissions);
  const operatorHasEnoughPermission = permissions.every((p) => operatorPermissionSet.has(p));
  throwBadRequest(!operatorHasEnoughPermission, getMessageByLocale({ key: 'permission.missing' }));
};

const createEmployee = async ({ shopId, createBody, userId }) => {
  const { name, email, password, positionId, departmentId, permissions } = createBody;
  // xem operator có đủ quyền để thêm cho nhân viên không
  validatePermissionsUpdate({ permissions });

  let user = await getUserFromDatabase({ email });
  if (!user) {
    user = await createUser({ name, email, password });
  }
  throwBadRequest(user.role === roles.admin, getMessageByLocale({ key: 'email.invalid' }));

  const employee = await Employee.create({
    name,
    permissions,
    position: positionId,
    department: departmentId,
    shop: shopId,
    user: user._id,
  });

  await employee.populate('user').populate('position').populate('department');
  const employeeJson = employee.toJSON();
  notifyUpdateEmployee({
    employee: employeeJson,
    action: EventActionType.CREATE,
    userId,
  });
  return employeeJson;
};

const updateEmployee = async ({ shopId, employeeId, updateBody, userId }) => {
  // xem operator có đủ quyền để thêm cho nhân viên không
  validatePermissionsUpdate(updateBody);
  const employee = await Employee.findOneAndUpdate({ _id: employeeId, shop: shopId }, { $set: updateBody }, { new: true });
  throwBadRequest(!employee, getMessageByLocale({ key: 'employee.notFound' }));

  await employee.populate('user').populate('position').populate('department');
  const employeeJson = employee.toJSON();
  notifyUpdateEmployee({
    employee: employeeJson,
    action: EventActionType.UPDATE,
    userId,
  });
  return employeeJson;
};

const deleteEmployee = async ({ shopId, employeeId, userId }) => {
  const employee = await Employee.findOneAndDelete({ _id: employeeId, shop: shopId });
  throwBadRequest(!employee, getMessageByLocale({ key: 'employee.notFound' }));

  await employee.populate('user').populate('position').populate('department');
  const employeeJson = employee.toJSON();
  notifyUpdateEmployee({
    employee: employeeJson,
    action: EventActionType.DELETE,
    userId,
  });
  return employeeJson;
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

const createEmployeePosition = async ({ shopId, createBody, userId }) => {
  const employeePosition = await EmployeePosition.create({ ...createBody, shop: shopId });

  const employeePositionJson = employeePosition.toJSON();
  notifyUpdateEmployeePosition({
    employeePosition: employeePositionJson,
    action: EventActionType.CREATE,
    userId,
  });
  return employeePositionJson;
};

const updateEmployeePosition = async ({ shopId, employeePositionId, updateBody, userId }) => {
  const employeePosition = await EmployeePosition.findOneAndUpdate(
    { _id: employeePositionId, shop: shopId },
    { $set: updateBody },
    { new: true }
  );
  throwBadRequest(!employeePosition, getMessageByLocale({ key: 'employeePosition.notFound' }));

  const employeePositionJson = employeePosition.toJSON();
  notifyUpdateEmployeePosition({
    employeePosition: employeePositionJson,
    action: EventActionType.UPDATE,
    userId,
  });
  return employeePositionJson;
};

const deleteEmployeePosition = async ({ shopId, employeePositionId, userId }) => {
  const employeePosition = await EmployeePosition.findOneAndDelete({ _id: employeePositionId, shop: shopId });

  const employeePositionJson = employeePosition.toJSON();
  notifyUpdateEmployeePosition({
    employeePosition: employeePositionJson,
    action: EventActionType.DELETE,
    userId,
  });
  return employeePositionJson;
};

const getAllPermissionTypes = async () => {
  const allPermissionTypes = Object.values(PermissionType);
  return allPermissionTypes.filter((type) => type !== PermissionType.SHOP_APP);
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
};
