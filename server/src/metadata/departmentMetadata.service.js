const _ = require('lodash');
const redisClient = require('../utils/redis');
const { getSession, setSession } = require('../middlewares/clsHooked');
const { Department } = require('../models');
const { getDepartmentKey } = require('./common');
const constant = require('../utils/constant');

const _getDepartmentsFromClsHook = ({ key }) => {
  const departments = getSession({ key });
  return departments;
};

const getDepartmentFromCache = async ({ shopId, departmentId }) => {
  // eslint-disable-next-line no-param-reassign
  departmentId = _.toString(departmentId);
  if (!departmentId) {
    return;
  }

  const key = getDepartmentKey({ shopId });
  const clsHookDepartments = _getDepartmentsFromClsHook({ key });
  if (!_.isEmpty(clsHookDepartments)) {
    return _.find(clsHookDepartments, (department) => department.id === departmentId);
  }

  if (redisClient.isRedisConnected()) {
    const departmentsCache = await redisClient.getJson(key);
    if (!_.isEmpty(departmentsCache)) {
      setSession({ key, value: departmentsCache });
      return _.find(departmentsCache, (department) => department.id === departmentId);
    }
  }

  const department = await Department.findFirst({
    where: {
      id: departmentId,
      shopId,
    },
  });
  return department;
};

const getDepartmentsFromCache = async ({ shopId }) => {
  const key = getDepartmentKey({ shopId });
  const clsHookDepartments = _getDepartmentsFromClsHook({ key });
  if (!_.isEmpty(clsHookDepartments)) {
    return clsHookDepartments;
  }

  if (redisClient.isRedisConnected()) {
    const departmentsCache = await redisClient.getJson(key);
    if (!_.isEmpty(departmentsCache)) {
      setSession({ key, value: departmentsCache });
      return departmentsCache;
    }

    const departments = await Department.findMany({ where: { shopId, status: constant.Status.enabled } });
    redisClient.putJson({ key, jsonVal: departments });
    setSession({ key, value: departments });
    return departments;
  }

  const departments = await Department.findMany({
    where: {
      shopId,
      status: constant.Status.enabled,
    },
  });
  setSession({ key, value: departments });
  return departments;
};

module.exports = {
  getDepartmentFromCache,
  getDepartmentsFromCache,
};
