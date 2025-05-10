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
    const departments = await redisClient.getJson(key);
    if (!_.isEmpty(departments)) {
      setSession({ key, value: departments });
      return _.find(departments, (department) => department.id === departmentId);
    }
  }

  const department = await Department.findOne({ _id: departmentId, shop: shopId });
  if (!department) {
    return null;
  }
  return department.toJSON();
};

const getDepartmentsFromCache = async ({ shopId }) => {
  const key = getDepartmentKey({ shopId });
  const clsHookDepartments = _getDepartmentsFromClsHook({ key });
  if (!_.isEmpty(clsHookDepartments)) {
    return clsHookDepartments;
  }

  if (redisClient.isRedisConnected()) {
    const departments = await redisClient.getJson(key);
    if (!_.isEmpty(departments)) {
      setSession({ key, value: departments });
      return departments;
    }

    const departmentModels = await Department.find({ shop: shopId, status: constant.Status.enabled });
    const departmentJsons = _.map(departmentModels, (department) => department.toJSON());
    redisClient.putJson({ key, jsonVal: departmentJsons });
    setSession({ key, value: departmentJsons });
    return departmentJsons;
  }

  const departments = await Department.find({ shop: shopId, status: constant.Status.enabled });
  const departmentJsons = _.map(departments, (department) => department.toJSON());
  setSession({ key, value: departmentJsons });
  return departmentJsons;
};

module.exports = {
  getDepartmentFromCache,
  getDepartmentsFromCache,
};
