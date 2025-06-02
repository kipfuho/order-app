const _ = require('lodash');
const redisClient = require('../utils/redis');
const { getSession, setSession, setOperatorToSession } = require('../middlewares/clsHooked');
const { Employee, EmployeePosition } = require('../models');
const { getEmployeeKey, getEmployeePositionKey, getEmployeeByUserIdKey } = require('./common');
const constant = require('../utils/constant');
const { getUserFromCache } = require('./userMetadata.service');

const _getEmployeesFromClsHook = ({ key }) => {
  const employees = getSession({ key });
  return employees;
};

const _getEmployeePositionsFromClsHook = ({ key }) => {
  const employeePositions = getSession({ key });
  return employeePositions;
};

const getEmployeeFromCache = async ({ shopId, employeeId }) => {
  // eslint-disable-next-line no-param-reassign
  employeeId = _.toString(employeeId);
  if (!employeeId) {
    return;
  }

  const key = getEmployeeKey({ shopId });
  const clsHookEmployees = _getEmployeesFromClsHook({ key });
  if (!_.isEmpty(clsHookEmployees)) {
    return _.find(clsHookEmployees, (employee) => employee.id === employeeId);
  }

  if (redisClient.isRedisConnected()) {
    const employeesCache = await redisClient.getJson(key);
    if (!_.isEmpty(employeesCache)) {
      setSession({ key, value: employeesCache });
      return _.find(employeesCache, (employee) => employee.id === employeeId);
    }
  }

  const employee = await Employee.findFirst({
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
  if (employee) {
    employee.permissions = [...employee.permissions, ..._.get(employee, 'department.permissions')];
  }
  return employee;
};

const getEmployeesFromCache = async ({ shopId }) => {
  const key = getEmployeeKey({ shopId });
  const clsHookEmployees = _getEmployeesFromClsHook({ key });
  if (!_.isEmpty(clsHookEmployees)) {
    return clsHookEmployees;
  }

  if (redisClient.isRedisConnected()) {
    const employeesCache = await redisClient.getJson(key);
    if (!_.isEmpty(employeesCache)) {
      setSession({ key, value: employeesCache });
      return employeesCache;
    }

    const employees = await Employee.findMany({
      where: {
        shopId,
        status: constant.Status.enabled,
      },
      include: {
        user: true,
        position: true,
        department: true,
      },
    });
    _.forEach(employees, (employee) => {
      // eslint-disable-next-line no-param-reassign
      employee.permissions = [...employee.permissions, ..._.get(employee, 'department.permissions')];
    });
    redisClient.putJson({ key, jsonVal: employees });
    setSession({ key, value: employees });
    return employees;
  }

  const employees = await Employee.findMany({
    where: {
      shopId,
      status: constant.Status.enabled,
    },
    include: {
      user: true,
      position: true,
      department: true,
    },
  });
  _.forEach(employees, (employee) => {
    // eslint-disable-next-line no-param-reassign
    employee.permissions = [...employee.permissions, ..._.get(employee, 'department.permissions')];
  });
  setSession({ key, value: employees });
  return employees;
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

  const employee = await Employee.findFirst({
    where: {
      user: userId,
      shopId,
    },
    include: {
      department: {
        select: {
          permissions: true,
        },
      },
    },
  });
  if (employee) {
    const user = await getUserFromCache({ userId });
    const permissions = (employee.permissions || []).concat(_.get(employee, 'department.permissions') || []);
    delete employee.department;
    delete employee.permissions;
    setOperatorToSession({
      user,
      employee,
      permissions,
    });
    if (redisClient.isRedisConnected()) {
      await redisClient.putJson({ key, jsonVal: { employee, permissions } });
    }
    return { employee, permissions };
  }

  return { employee, permissions: [] };
};

const getEmployeePositionFromCache = async ({ shopId, employeePositionId }) => {
  // eslint-disable-next-line no-param-reassign
  employeePositionId = _.toString(employeePositionId);
  if (!employeePositionId) {
    return;
  }

  const key = getEmployeePositionKey({ shopId });
  const clsHookEmployeePositions = _getEmployeePositionsFromClsHook({ key });
  if (!_.isEmpty(clsHookEmployeePositions)) {
    return _.find(clsHookEmployeePositions, (employeePosition) => employeePosition.id === employeePositionId);
  }

  if (redisClient.isRedisConnected()) {
    const employeePositionsCache = await redisClient.getJson(key);
    if (!_.isEmpty(employeePositionsCache)) {
      setSession({ key, value: employeePositionsCache });
      return _.find(employeePositionsCache, (employeePosition) => employeePosition.id === employeePositionId);
    }
  }

  const employeePosition = await EmployeePosition.findFirst({ where: { id: employeePositionId, shopId } });
  return employeePosition;
};

const getEmployeePositionsFromCache = async ({ shopId }) => {
  const key = getEmployeePositionKey({ shopId });
  const clsHookEmployeePositions = _getEmployeePositionsFromClsHook({ key });
  if (!_.isEmpty(clsHookEmployeePositions)) {
    return clsHookEmployeePositions;
  }

  if (redisClient.isRedisConnected()) {
    const employeePositionsCache = await redisClient.getJson(key);
    if (!_.isEmpty(employeePositionsCache)) {
      setSession({ key, value: employeePositionsCache });
      return employeePositionsCache;
    }

    const employeePositions = await EmployeePosition.findMany({
      where: {
        shopId,
        status: constant.Status.enabled,
      },
    });
    redisClient.putJson({ key, jsonVal: employeePositions });
    setSession({ key, value: employeePositions });
    return employeePositions;
  }

  const employeePositions = await EmployeePosition.findMany({
    where: {
      shopId,
      status: constant.Status.enabled,
    },
  });
  setSession({ key, value: employeePositions });
  return employeePositions;
};

module.exports = {
  getEmployeeFromCache,
  getEmployeeWithPermissionByUserId,
  getEmployeesFromCache,
  getEmployeePositionFromCache,
  getEmployeePositionsFromCache,
};
