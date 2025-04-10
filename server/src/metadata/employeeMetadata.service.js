const _ = require('lodash');
const redisClient = require('../utils/redis');
const { getSession, setSession, setEmployeePermissions } = require('../middlewares/clsHooked');
const { Employee, EmployeePosition } = require('../models');
const { getEmployeeKey, getEmployeePositionKey, getEmployeeByUserIdKey } = require('./common');
const constant = require('../utils/constant');

const _getEmployeesFromClsHook = ({ key }) => {
  const employees = getSession({ key });
  return employees;
};

const _getEmployeePositionsFromClsHook = ({ key }) => {
  const employeePositions = getSession({ key });
  return employeePositions;
};

const getEmployeeFromCache = async ({ shopId, employeeId }) => {
  if (!employeeId) {
    return;
  }

  const key = getEmployeeKey({ shopId });
  const clsHookEmployees = _getEmployeesFromClsHook({ key });
  if (!_.isEmpty(clsHookEmployees)) {
    return _.find(clsHookEmployees, (employee) => employee.id === employeeId);
  }

  if (redisClient.isRedisConnected()) {
    const employees = await redisClient.getJson(key);
    if (!_.isEmpty(employees)) {
      setSession({ key, value: employees });
      return _.find(employees, (employee) => employee.id === employeeId);
    }
  }

  const employee = await Employee.findOne({ shop: shopId, _id: employeeId })
    .populate('user')
    .populate('position')
    .populate('department');
  const employeeJson = employee.toJSON();
  employeeJson.permissions = [...employeeJson.permissions, ..._.get(employeeJson, 'department.permissions')];
  return employeeJson;
};

const getEmployeesFromCache = async ({ shopId }) => {
  const key = getEmployeeKey({ shopId });
  const clsHookEmployees = _getEmployeesFromClsHook({ key });
  if (!_.isEmpty(clsHookEmployees)) {
    return clsHookEmployees;
  }

  if (redisClient.isRedisConnected()) {
    const employees = await redisClient.getJson(key);
    if (!_.isEmpty(employees)) {
      setSession({ key, value: employees });
      return employees;
    }

    const employeeModels = await Employee.find({ shop: shopId, status: constant.Status.enabled })
      .populate('user')
      .populate('position')
      .populate('department');
    const employeeJsons = _.map(employeeModels, (employee) => {
      const employeeJson = employee.toJSON();
      employeeJson.permissions = [...employeeJson.permissions, ..._.get(employeeJson, 'department.permissions')];
      return employeeJson;
    });
    redisClient.putJson({ key, jsonVal: employeeJsons });
    setSession({ key, value: employeeJsons });
    return employeeJsons;
  }

  const employees = await Employee.find({ shop: shopId, status: constant.Status.enabled })
    .populate('user')
    .populate('position')
    .populate('department');
  const employeeJsons = _.map(employees, (employee) => {
    const employeeJson = employee.toJSON();
    employeeJson.permissions = [...employeeJson.permissions, ..._.get(employeeJson, 'department.permissions')];
    return employeeJson;
  });
  setSession({ key, value: employeeJsons });
  return employeeJsons;
};

const getEmployeeWithPermissionByUserId = async ({ userId, shopId }) => {
  const key = getEmployeeByUserIdKey({ shopId, userId });
  if (redisClient.isRedisConnected()) {
    const employeeVal = await redisClient.getJson(key);
    const employee = _.get(employeeVal, 'employee');
    const permissions = _.get(employeeVal, 'permissions');
    if (!_.isEmpty(employee)) {
      return { employee, permissions };
    }
  }

  const employee = await Employee.findOne({ user: userId, shop: shopId })
    .populate('user')
    .populate('position')
    .populate('department');
  const employeeJson = employee.toJSON();
  const permissions = (employeeJson.permissions || []).concat(_.get(employeeJson, 'departmentId.permissions') || []);
  setEmployeePermissions(permissions);

  if (redisClient.isRedisConnected()) {
    await redisClient.putJson({ key, jsonVal: { employee: employeeJson, permissions } });
  }
  return { employee, permissions };
};

const getEmployeePositionFromCache = async ({ shopId, employeePositionId }) => {
  if (!employeePositionId) {
    return;
  }

  const key = getEmployeePositionKey({ shopId });
  const clsHookEmployeePositions = _getEmployeePositionsFromClsHook({ key });
  if (!_.isEmpty(clsHookEmployeePositions)) {
    return _.find(clsHookEmployeePositions, (employeePosition) => employeePosition.id === employeePositionId);
  }

  if (redisClient.isRedisConnected()) {
    const employeePositions = await redisClient.getJson(key);
    if (!_.isEmpty(employeePositions)) {
      setSession({ key, value: employeePositions });
      return _.find(employeePositions, (employeePosition) => employeePosition.id === employeePositionId);
    }
  }

  const employeePosition = await EmployeePosition.findById(employeePositionId);
  return employeePosition.toJSON();
};

const getEmployeePositionsFromCache = async ({ shopId }) => {
  const key = getEmployeePositionKey({ shopId });
  const clsHookEmployeePositions = _getEmployeePositionsFromClsHook({ key });
  if (!_.isEmpty(clsHookEmployeePositions)) {
    return clsHookEmployeePositions;
  }

  if (redisClient.isRedisConnected()) {
    const employeePositions = await redisClient.getJson(key);
    if (!_.isEmpty(employeePositions)) {
      setSession({ key, value: employeePositions });
      return employeePositions;
    }

    const employeePositionModels = await EmployeePosition.find({ shop: shopId, status: constant.Status.enabled });
    const employeePositionJsons = _.map(employeePositionModels, (employeePosition) => employeePosition.toJSON());
    redisClient.putJson({ key, jsonVal: employeePositionJsons });
    setSession({ key, value: employeePositionJsons });
    return employeePositionJsons;
  }

  const employeePositions = await EmployeePosition.find({ shop: shopId, status: constant.Status.enabled });
  const employeePositionJsons = _.map(employeePositions, (employeePosition) => employeePosition.toJSON());
  setSession({ key, value: employeePositionJsons });
  return employeePositionJsons;
};

module.exports = {
  getEmployeeFromCache,
  getEmployeeWithPermissionByUserId,
  getEmployeesFromCache,
  getEmployeePositionFromCache,
  getEmployeePositionsFromCache,
};
