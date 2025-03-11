const _ = require('lodash');
const httpStatus = require('http-status');
const catchAsync = require('../../utils/catchAsync');
const restaurantManagementService = require('../services/restaurantManagement.service');

const getRestaurant = catchAsync(async (req, res) => {
  const restaurantId = _.get(req, 'params.restaurantId');
  const restaurant = await restaurantManagementService.getRestaurant(restaurantId);
  res.status(httpStatus.OK).send({ restaurant });
});

const createRestaurant = catchAsync(async (req, res) => {
  const createBody = req.body;
  const ownerUserId = _.get(req, 'user.id');
  const restaurant = await restaurantManagementService.createRestaurant({ createBody, ownerUserId });
  res.status(httpStatus.CREATED).send({ restaurant });
});

const updateRestaurant = catchAsync(async (req, res) => {
  const restaurantId = _.get(req, 'params.restaurantId');
  const updateBody = req.body;
  await restaurantManagementService.updateRestaurant(restaurantId, updateBody);
  res.status(httpStatus.OK).send({ message: 'Cập nhật thành công' });
});

const deleteRestaurant = catchAsync(async (req, res) => {
  const restaurantId = _.get(req, 'params.restaurantId');
  await restaurantManagementService.deleteRestaurant(restaurantId);
  res.status(httpStatus.OK).send({ message: 'Xoá thành công' });
});

const getTable = catchAsync(async (req, res) => {
  const tableId = _.get(req, 'params.tableId');
  const table = await restaurantManagementService.getTable(tableId);
  res.status(httpStatus.OK).send({ table });
});

const createTable = catchAsync(async (req, res) => {
  const createBody = req.body;
  const table = await restaurantManagementService.createTable(createBody);
  res.status(httpStatus.CREATED).send({ table });
});

const updateTable = catchAsync(async (req, res) => {
  const tableId = _.get(req, 'params.tableId');
  const updateBody = req.body;
  await restaurantManagementService.updateTable(tableId, updateBody);
  res.status(httpStatus.OK).send({ message: 'Cập nhật thành công' });
});

const deleteTable = catchAsync(async (req, res) => {
  const tableId = _.get(req, 'params.tableId');
  await restaurantManagementService.deleteTable(tableId);
  res.status(httpStatus.OK).send({ message: 'Xoá thành công' });
});

const getTablePosition = catchAsync(async (req, res) => {
  const tablePositionId = _.get(req, 'params.tablePositionId');
  const tablePosition = await restaurantManagementService.getTablePosition(tablePositionId);
  res.status(httpStatus.OK).send({ tablePosition });
});

const createTablePosition = catchAsync(async (req, res) => {
  const createBody = req.body;
  const tablePosition = await restaurantManagementService.createTablePosition(createBody);
  res.status(httpStatus.CREATED).send({ tablePosition });
});

const updateTablePosition = catchAsync(async (req, res) => {
  const tablePositionId = _.get(req, 'params.tablePositionId');
  const updateBody = req.body;
  await restaurantManagementService.updateTablePosition(tablePositionId, updateBody);
  res.status(httpStatus.OK).send({ message: 'Cập nhật thành công' });
});

const deleteTablePosition = catchAsync(async (req, res) => {
  const tablePositionId = _.get(req, 'params.tablePositionId');
  await restaurantManagementService.deleteTablePosition(tablePositionId);
  res.status(httpStatus.OK).send({ message: 'Xoá thành công' });
});

const getEmployee = catchAsync(async (req, res) => {
  const employeeId = _.get(req, 'params.employeeId');
  const employee = await restaurantManagementService.getEmployee(employeeId);
  res.status(httpStatus.OK).send({ employee });
});

const createEmployee = catchAsync(async (req, res) => {
  const createBody = req.body;
  const employee = await restaurantManagementService.createEmployee(createBody);
  res.status(httpStatus.CREATED).send({ employee });
});

const updateEmployee = catchAsync(async (req, res) => {
  const employeeId = _.get(req, 'params.employeeId');
  const updateBody = req.body;
  await restaurantManagementService.updateEmployee(employeeId, updateBody);
  res.status(httpStatus.OK).send({ message: 'Cập nhật thành công' });
});

const deleteEmployee = catchAsync(async (req, res) => {
  const employeeId = _.get(req, 'params.employeeId');
  await restaurantManagementService.deleteEmployee(employeeId);
  res.status(httpStatus.OK).send({ message: 'Xoá thành công' });
});

const getEmployeePosition = catchAsync(async (req, res) => {
  const employeePositionId = _.get(req, 'params.employeePositionId');
  const employeePosition = await restaurantManagementService.getEmployeePosition(employeePositionId);
  res.status(httpStatus.OK).send({ employeePosition });
});

const createEmployeePosition = catchAsync(async (req, res) => {
  const createBody = req.body;
  const employeePosition = await restaurantManagementService.createEmployeePosition(createBody);
  res.status(httpStatus.CREATED).send({ employeePosition });
});

const updateEmployeePosition = catchAsync(async (req, res) => {
  const employeePositionId = _.get(req, 'params.employeePositionId');
  const updateBody = req.body;
  await restaurantManagementService.updateEmployeePosition(employeePositionId, updateBody);
  res.status(httpStatus.OK).send({ message: 'Cập nhật thành công' });
});

const deleteEmployeePosition = catchAsync(async (req, res) => {
  const employeePositionId = _.get(req, 'params.employeePositionId');
  await restaurantManagementService.deleteEmployeePosition(employeePositionId);
  res.status(httpStatus.OK).send({ message: 'Xoá thành công' });
});

const getDepartment = catchAsync(async (req, res) => {
  const departmentId = _.get(req, 'params.departmentId');
  const department = await restaurantManagementService.getDepartment(departmentId);
  res.status(httpStatus.OK).send({ department });
});

const createDepartment = catchAsync(async (req, res) => {
  const createBody = req.body;
  const department = await restaurantManagementService.createDepartment(createBody);
  res.status(httpStatus.CREATED).send({ department });
});

const updateDepartment = catchAsync(async (req, res) => {
  const departmentId = _.get(req, 'params.departmentId');
  const updateBody = req.body;
  await restaurantManagementService.updateDepartment(departmentId, updateBody);
  res.status(httpStatus.OK).send({ message: 'Cập nhật thành công' });
});

const deleteDepartment = catchAsync(async (req, res) => {
  const departmentId = _.get(req, 'params.departmentId');
  await restaurantManagementService.deleteDepartment(departmentId);
  res.status(httpStatus.OK).send({ message: 'Xoá thành công' });
});

module.exports = {
  getRestaurant,
  createRestaurant,
  updateRestaurant,
  deleteRestaurant,
  getTable,
  createTable,
  updateTable,
  deleteTable,
  getTablePosition,
  createTablePosition,
  updateTablePosition,
  deleteTablePosition,
  getEmployee,
  createEmployee,
  updateEmployee,
  deleteEmployee,
  getEmployeePosition,
  createEmployeePosition,
  updateEmployeePosition,
  deleteEmployeePosition,
  getDepartment,
  createDepartment,
  updateDepartment,
  deleteDepartment,
};
