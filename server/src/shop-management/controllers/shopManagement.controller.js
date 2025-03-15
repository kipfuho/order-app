const _ = require('lodash');
const httpStatus = require('http-status');
const catchAsync = require('../../utils/catchAsync');
const shopManagementService = require('../services/shopManagement.service');

const getShop = catchAsync(async (req, res) => {
  const shopId = _.get(req, 'params.shopId');
  const shop = await shopManagementService.getShop(shopId);
  res.status(httpStatus.OK).send({ shop });
});

const queryShop = catchAsync(async (req, res) => {
  const query = _.get(req, 'query');
  const shops = await shopManagementService.queryShop(query);
  res.status(httpStatus.OK).send(shops);
});

const createShop = catchAsync(async (req, res) => {
  const createBody = req.body;
  const ownerUserId = _.get(req, 'user.id');
  const shop = await shopManagementService.createShop({ createBody, ownerUserId });
  res.status(httpStatus.CREATED).send({ shop });
});

const updateShop = catchAsync(async (req, res) => {
  const shopId = _.get(req, 'params.shopId');
  const updateBody = req.body;
  await shopManagementService.updateShop(shopId, updateBody);
  res.status(httpStatus.OK).send({ message: 'Cập nhật thành công' });
});

const deleteShop = catchAsync(async (req, res) => {
  const shopId = _.get(req, 'params.shopId');
  await shopManagementService.deleteShop(shopId);
  res.status(httpStatus.OK).send({ message: 'Xoá thành công' });
});

const getTable = catchAsync(async (req, res) => {
  const tableId = _.get(req, 'params.tableId');
  const table = await shopManagementService.getTable(tableId);
  res.status(httpStatus.OK).send({ table });
});

const createTable = catchAsync(async (req, res) => {
  const createBody = req.body;
  const table = await shopManagementService.createTable(createBody);
  res.status(httpStatus.CREATED).send({ table });
});

const updateTable = catchAsync(async (req, res) => {
  const tableId = _.get(req, 'params.tableId');
  const updateBody = req.body;
  await shopManagementService.updateTable(tableId, updateBody);
  res.status(httpStatus.OK).send({ message: 'Cập nhật thành công' });
});

const deleteTable = catchAsync(async (req, res) => {
  const tableId = _.get(req, 'params.tableId');
  await shopManagementService.deleteTable(tableId);
  res.status(httpStatus.OK).send({ message: 'Xoá thành công' });
});

const getTablePosition = catchAsync(async (req, res) => {
  const tablePositionId = _.get(req, 'params.tablePositionId');
  const tablePosition = await shopManagementService.getTablePosition(tablePositionId);
  res.status(httpStatus.OK).send({ tablePosition });
});

const createTablePosition = catchAsync(async (req, res) => {
  const createBody = req.body;
  const tablePosition = await shopManagementService.createTablePosition(createBody);
  res.status(httpStatus.CREATED).send({ tablePosition });
});

const updateTablePosition = catchAsync(async (req, res) => {
  const tablePositionId = _.get(req, 'params.tablePositionId');
  const updateBody = req.body;
  await shopManagementService.updateTablePosition(tablePositionId, updateBody);
  res.status(httpStatus.OK).send({ message: 'Cập nhật thành công' });
});

const deleteTablePosition = catchAsync(async (req, res) => {
  const tablePositionId = _.get(req, 'params.tablePositionId');
  await shopManagementService.deleteTablePosition(tablePositionId);
  res.status(httpStatus.OK).send({ message: 'Xoá thành công' });
});

const getEmployee = catchAsync(async (req, res) => {
  const employeeId = _.get(req, 'params.employeeId');
  const employee = await shopManagementService.getEmployee(employeeId);
  res.status(httpStatus.OK).send({ employee });
});

const createEmployee = catchAsync(async (req, res) => {
  const createBody = req.body;
  const employee = await shopManagementService.createEmployee(createBody);
  res.status(httpStatus.CREATED).send({ employee });
});

const updateEmployee = catchAsync(async (req, res) => {
  const employeeId = _.get(req, 'params.employeeId');
  const updateBody = req.body;
  await shopManagementService.updateEmployee(employeeId, updateBody);
  res.status(httpStatus.OK).send({ message: 'Cập nhật thành công' });
});

const deleteEmployee = catchAsync(async (req, res) => {
  const employeeId = _.get(req, 'params.employeeId');
  await shopManagementService.deleteEmployee(employeeId);
  res.status(httpStatus.OK).send({ message: 'Xoá thành công' });
});

const getEmployeePosition = catchAsync(async (req, res) => {
  const employeePositionId = _.get(req, 'params.employeePositionId');
  const employeePosition = await shopManagementService.getEmployeePosition(employeePositionId);
  res.status(httpStatus.OK).send({ employeePosition });
});

const createEmployeePosition = catchAsync(async (req, res) => {
  const createBody = req.body;
  const employeePosition = await shopManagementService.createEmployeePosition(createBody);
  res.status(httpStatus.CREATED).send({ employeePosition });
});

const updateEmployeePosition = catchAsync(async (req, res) => {
  const employeePositionId = _.get(req, 'params.employeePositionId');
  const updateBody = req.body;
  await shopManagementService.updateEmployeePosition(employeePositionId, updateBody);
  res.status(httpStatus.OK).send({ message: 'Cập nhật thành công' });
});

const deleteEmployeePosition = catchAsync(async (req, res) => {
  const employeePositionId = _.get(req, 'params.employeePositionId');
  await shopManagementService.deleteEmployeePosition(employeePositionId);
  res.status(httpStatus.OK).send({ message: 'Xoá thành công' });
});

const getDepartment = catchAsync(async (req, res) => {
  const departmentId = _.get(req, 'params.departmentId');
  const department = await shopManagementService.getDepartment(departmentId);
  res.status(httpStatus.OK).send({ department });
});

const createDepartment = catchAsync(async (req, res) => {
  const createBody = req.body;
  const department = await shopManagementService.createDepartment(createBody);
  res.status(httpStatus.CREATED).send({ department });
});

const updateDepartment = catchAsync(async (req, res) => {
  const departmentId = _.get(req, 'params.departmentId');
  const updateBody = req.body;
  await shopManagementService.updateDepartment(departmentId, updateBody);
  res.status(httpStatus.OK).send({ message: 'Cập nhật thành công' });
});

const deleteDepartment = catchAsync(async (req, res) => {
  const departmentId = _.get(req, 'params.departmentId');
  await shopManagementService.deleteDepartment(departmentId);
  res.status(httpStatus.OK).send({ message: 'Xoá thành công' });
});

module.exports = {
  getShop,
  queryShop,
  createShop,
  updateShop,
  deleteShop,
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
