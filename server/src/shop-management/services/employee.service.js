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
const { EmployeePosition, Employee } = require('../../models');
const { PermissionType } = require('../../utils/constant');
const { throwBadRequest } = require('../../utils/errorHandling');

const getEmployee = async ({ shopId, employeeId }) => {
  const employee = await getEmployeeFromCache({ employeeId, shopId });
  throwBadRequest(!employee, 'Không tìm thấy nhân viên');
  return employee;
};

const getEmployees = async ({ shopId }) => {
  const employees = await getEmployeesFromCache({ shopId });
  return employees;
};

const createEmployee = async ({ shopId, createBody }) => {
  const { name, email, password, positionId, departmentId, permissions } = createBody;

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
  return employee;
};

const updateEmployee = async ({ shopId, employeeId, updateBody }) => {
  const employee = await Employee.findOneAndUpdate({ _id: employeeId, shop: shopId }, { $set: updateBody }, { new: true });
  throwBadRequest(!employee, 'Không tìm thấy nhân viên');
  return employee;
};

const deleteEmployee = async ({ shopId, employeeId }) => {
  await Employee.deleteOne({ _id: employeeId, shop: shopId });
};

const getEmployeePosition = async ({ shopId, employeePositionId }) => {
  const employeePosition = await getEmployeePositionFromCache({ employeePositionId, shopId });
  throwBadRequest(!employeePosition, 'Không tìm thấy vị trí nhân viên');
  return employeePosition;
};

const getEmployeePositions = async ({ shopId }) => {
  const employeePositions = await getEmployeePositionsFromCache({ shopId });
  return employeePositions;
};

const createEmployeePosition = async ({ shopId, createBody }) => {
  const employeePosition = await EmployeePosition.create({ ...createBody, shop: shopId });
  return employeePosition;
};

const updateEmployeePosition = async ({ shopId, employeePositionId, updateBody }) => {
  const employeePosition = await EmployeePosition.findOneAndUpdate(
    { _id: employeePositionId, shop: shopId },
    { $set: updateBody },
    { new: true }
  );
  throwBadRequest(!employeePosition, 'Không tìm thấy vị trí nhân viên');
  return employeePosition;
};

const deleteEmployeePosition = async ({ shopId, employeePositionId }) => {
  await EmployeePosition.deleteOne({ _id: employeePositionId, shop: shopId });
};

const getAllPermissionTypes = async () => {
  return Object.values(PermissionType);
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
};
