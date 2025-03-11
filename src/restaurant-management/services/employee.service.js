const { EmployeePosition, Employee } = require('../../models');
const { throwBadRequest } = require('../../utils/errorHandling');

const getEmployee = async (employeeId) => {
  const employee = await Employee.findById(employeeId);
  throwBadRequest(!employee, 'Không tìm thấy nhân viên');
  return employee;
};

const createEmployee = async (createBody) => {
  const employee = await Employee.create(createBody);
  return employee;
};

const updateEmployee = async (employeeId, updateBody) => {
  const employee = await Employee.findByIdAndUpdate(employeeId, { $set: updateBody }, { new: true });
  throwBadRequest(!employee, 'Không tìm thấy nhân viên');
  return employee;
};

const deleteEmployee = async (employeeId) => {
  await Employee.deleteOne({ _id: employeeId });
};

const getEmployeePosition = async (employeePositionId) => {
  const employeePosition = await EmployeePosition.findById(employeePositionId);
  throwBadRequest(!employeePosition, 'Không tìm thấy vị trí nhân viên');
  return employeePosition;
};

const createEmployeePosition = async (createBody) => {
  const employeePosition = await EmployeePosition.create(createBody);
  return employeePosition;
};

const updateEmployeePosition = async (employeePositionId, updateBody) => {
  const employeePosition = await EmployeePosition.findByIdAndUpdate(employeePositionId, { $set: updateBody }, { new: true });
  throwBadRequest(!employeePosition, 'Không tìm thấy vị trí nhân viên');
  return employeePosition;
};

const deleteEmployeePosition = async (employeePositionId) => {
  await EmployeePosition.deleteOne({ _id: employeePositionId });
};

const getEmployeesPosition = async () => {};

module.exports = {
  getEmployee,
  createEmployee,
  updateEmployee,
  deleteEmployee,
  getEmployeePosition,
  createEmployeePosition,
  updateEmployeePosition,
  deleteEmployeePosition,
  getEmployeesPosition,
};
