const _ = require('lodash');
const httpStatus = require('http-status');
const catchAsync = require('../../utils/catchAsync');
const shopManagementService = require('../services/shopManagement.service');
const tableService = require('../services/table.service');
const employeeService = require('../services/employee.service');
const { convertEmployeeForResponse } = require('../converters/employee.converter');

const uploadImage = catchAsync(async (req, res) => {
  if (!req.file) {
    return res.status(400).send('No file uploaded');
  }

  const shopId = _.get(req, 'shop.id');
  const url = await shopManagementService.uploadImage({ shopId, image: req.file });
  res.status(httpStatus.OK).send({ url });
});

const removeImage = catchAsync(async (req, res) => {
  const shopId = _.get(req, 'shop.id');
  const url = await shopManagementService.removeImage({ shopId, ...req.body });
  res.status(httpStatus.OK).send({ url });
});

const getShop = catchAsync(async (req, res) => {
  const shopId = _.get(req, 'shop.id');
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
  await shopManagementService.createShop({ createBody });
  res.status(httpStatus.CREATED).send({ message: 'Tạo thành công' });
});

const updateShop = catchAsync(async (req, res) => {
  const shopId = _.get(req, 'shop.id');
  const updateBody = req.body;
  await shopManagementService.updateShop({ shopId, updateBody });
  res.status(httpStatus.OK).send({ message: 'Cập nhật thành công' });
});

const deleteShop = catchAsync(async (req, res) => {
  const shopId = _.get(req, 'shop.id');
  await shopManagementService.deleteShop({ shopId });
  res.status(httpStatus.OK).send({ message: 'Xoá thành công' });
});

const getTable = catchAsync(async (req, res) => {
  const shopId = _.get(req, 'shop.id');
  const tableId = _.get(req, 'params.tableId');
  const table = await tableService.getTable({
    shopId,
    tableId,
  });
  res.status(httpStatus.OK).send({ table });
});

const getTables = catchAsync(async (req, res) => {
  const shopId = _.get(req, 'shop.id');
  const tables = await tableService.getTables({ shopId });
  res.status(httpStatus.OK).send({ tables });
});

const createTable = catchAsync(async (req, res) => {
  const shopId = _.get(req, 'shop.id');
  const createBody = req.body;
  await tableService.createTable({ shopId, createBody });
  res.status(httpStatus.CREATED).send({ message: 'Tạo thành công' });
});

const updateTable = catchAsync(async (req, res) => {
  const shopId = _.get(req, 'shop.id');
  const tableId = _.get(req, 'params.tableId');
  const updateBody = req.body;
  await tableService.updateTable({ shopId, tableId, updateBody });
  res.status(httpStatus.OK).send({ message: 'Cập nhật thành công' });
});

const deleteTable = catchAsync(async (req, res) => {
  const shopId = _.get(req, 'shop.id');
  const tableId = _.get(req, 'params.tableId');
  await tableService.deleteTable({ shopId, tableId });
  res.status(httpStatus.OK).send({ message: 'Xoá thành công' });
});

const getTablePosition = catchAsync(async (req, res) => {
  const shopId = _.get(req, 'shop.id');
  const tablePositionId = _.get(req, 'params.tablePositionId');
  const tablePosition = await tableService.getTablePosition({ shopId, tablePositionId });
  res.status(httpStatus.OK).send({ tablePosition });
});

const getTablePositions = catchAsync(async (req, res) => {
  const shopId = _.get(req, 'shop.id');
  const tablePositions = await tableService.getTablePositions({ shopId });
  res.status(httpStatus.OK).send({ tablePositions });
});

const createTablePosition = catchAsync(async (req, res) => {
  const shopId = _.get(req, 'shop.id');
  const createBody = req.body;
  await tableService.createTablePosition({ shopId, createBody });
  res.status(httpStatus.CREATED).send({ message: 'Tạo thành công' });
});

const updateTablePosition = catchAsync(async (req, res) => {
  const shopId = _.get(req, 'shop.id');
  const tablePositionId = _.get(req, 'params.tablePositionId');
  const updateBody = req.body;
  await tableService.updateTablePosition({ shopId, tablePositionId, updateBody });
  res.status(httpStatus.OK).send({ message: 'Cập nhật thành công' });
});

const deleteTablePosition = catchAsync(async (req, res) => {
  const shopId = _.get(req, 'shop.id');
  const tablePositionId = _.get(req, 'params.tablePositionId');
  await tableService.deleteTablePosition({ shopId, tablePositionId });
  res.status(httpStatus.OK).send({ message: 'Xoá thành công' });
});

const getEmployee = catchAsync(async (req, res) => {
  const shopId = _.get(req, 'shop.id');
  const employeeId = _.get(req, 'params.employeeId');
  const employee = await employeeService.getEmployee({ shopId, employeeId });
  res.status(httpStatus.OK).send({ employee: convertEmployeeForResponse(employee) });
});

const getEmployees = catchAsync(async (req, res) => {
  const shopId = _.get(req, 'shop.id');
  const employees = await employeeService.getEmployees({ shopId });
  const employeeResponse = _.map(employees, (e) => convertEmployeeForResponse(e));
  res.status(httpStatus.OK).send({ employees: employeeResponse });
});

const createEmployee = catchAsync(async (req, res) => {
  const shopId = _.get(req, 'shop.id');
  const createBody = req.body;
  await employeeService.createEmployee({ shopId, createBody });
  res.status(httpStatus.CREATED).send({ message: 'Tạo thành công' });
});

const updateEmployee = catchAsync(async (req, res) => {
  const shopId = _.get(req, 'shop.id');
  const employeeId = _.get(req, 'params.employeeId');
  const updateBody = req.body;
  await employeeService.updateEmployee({ shopId, employeeId, updateBody });
  res.status(httpStatus.OK).send({ message: 'Cập nhật thành công' });
});

const deleteEmployee = catchAsync(async (req, res) => {
  const shopId = _.get(req, 'shop.id');
  const employeeId = _.get(req, 'params.employeeId');
  await employeeService.deleteEmployee({ shopId, employeeId });
  res.status(httpStatus.OK).send({ message: 'Xoá thành công' });
});

const getEmployeePosition = catchAsync(async (req, res) => {
  const shopId = _.get(req, 'shop.id');
  const employeePositionId = _.get(req, 'params.employeePositionId');
  const employeePosition = await employeeService.getEmployeePosition({ shopId, employeePositionId });
  res.status(httpStatus.OK).send({ employeePosition });
});

const getEmployeePositions = catchAsync(async (req, res) => {
  const shopId = _.get(req, 'shop.id');
  const employeePositions = await employeeService.getEmployeePositions({ shopId });
  res.status(httpStatus.OK).send({ employeePositions });
});

const createEmployeePosition = catchAsync(async (req, res) => {
  const shopId = _.get(req, 'shop.id');
  const createBody = req.body;
  await employeeService.createEmployeePosition({ shopId, createBody });
  res.status(httpStatus.CREATED).send({ message: 'Tạo thành công' });
});

const updateEmployeePosition = catchAsync(async (req, res) => {
  const shopId = _.get(req, 'shop.id');
  const employeePositionId = _.get(req, 'params.employeePositionId');
  const updateBody = req.body;
  await employeeService.updateEmployeePosition({ shopId, employeePositionId, updateBody });
  res.status(httpStatus.OK).send({ message: 'Cập nhật thành công' });
});

const deleteEmployeePosition = catchAsync(async (req, res) => {
  const shopId = _.get(req, 'shop.id');
  const employeePositionId = _.get(req, 'params.employeePositionId');
  await employeeService.deleteEmployeePosition({ shopId, employeePositionId });
  res.status(httpStatus.OK).send({ message: 'Xoá thành công' });
});

const getDepartment = catchAsync(async (req, res) => {
  const shopId = _.get(req, 'shop.id');
  const departmentId = _.get(req, 'params.departmentId');
  const department = await employeeService.getDepartment({ shopId, departmentId });
  res.status(httpStatus.OK).send({ department });
});

const getDepartments = catchAsync(async (req, res) => {
  const shopId = _.get(req, 'shop.id');
  const departments = await employeeService.getDepartments({ shopId });
  res.status(httpStatus.OK).send({ departments });
});

const createDepartment = catchAsync(async (req, res) => {
  const shopId = _.get(req, 'shop.id');
  const createBody = req.body;
  await employeeService.createDepartment({ shopId, createBody });
  res.status(httpStatus.CREATED).send({ message: 'Tạo thành công' });
});

const updateDepartment = catchAsync(async (req, res) => {
  const shopId = _.get(req, 'shop.id');
  const departmentId = _.get(req, 'params.departmentId');
  const updateBody = req.body;
  await employeeService.updateDepartment({ shopId, departmentId, updateBody });
  res.status(httpStatus.OK).send({ message: 'Cập nhật thành công' });
});

const deleteDepartment = catchAsync(async (req, res) => {
  const shopId = _.get(req, 'shop.id');
  const departmentId = _.get(req, 'params.departmentId');
  await employeeService.deleteDepartment({ shopId, departmentId });
  res.status(httpStatus.OK).send({ message: 'Xoá thành công' });
});

const getPermissionTypes = catchAsync(async (req, res) => {
  const shopId = _.get(req, 'shop.id');
  const permissionTypes = await employeeService.getAllPermissionTypes(shopId);
  res.status(httpStatus.OK).send({ message: 'Xoá thành công', permissionTypes });
});

module.exports = {
  uploadImage,
  removeImage,
  getShop,
  queryShop,
  createShop,
  updateShop,
  deleteShop,
  getTable,
  getTables,
  createTable,
  updateTable,
  deleteTable,
  getTablePosition,
  getTablePositions,
  createTablePosition,
  updateTablePosition,
  deleteTablePosition,
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
  getDepartment,
  getDepartments,
  createDepartment,
  updateDepartment,
  deleteDepartment,
  getPermissionTypes,
};
