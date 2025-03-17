const {
  getEmployeePositionFromCache,
  getEmployeePositionsFromCache,
  getEmployeeFromCache,
  getEmployeesFromCache,
} = require('../../metadata/employeeMetadata.service');
const { EmployeePosition, Employee } = require('../../models');
const { throwBadRequest } = require('../../utils/errorHandling');

const getEmployee = async ({ shopId, employeeId }) => {
  const employee = await getEmployeeFromCache({ employeeId, shopId });
  throwBadRequest(!employee, 'Không tìm thấy nhân viên');
  return employee;
};

const getEmployees = async ({ shopId }) => {
  const employees = await getEmployeesFromCache({ shopId });
  throwBadRequest(!employees, 'Không tìm thấy nhân viên');
  return employees;
};

const createEmployee = async ({ shopId, createBody }) => {
  const employee = await Employee.create({ ...createBody, shop: shopId });
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
  throwBadRequest(!employeePositions, 'Không tìm thấy vị trí nhân viên');
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
};
