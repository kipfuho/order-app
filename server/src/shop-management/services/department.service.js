const { getDepartmentFromCache, getDepartmentsFromCache } = require('../../metadata/departmentMetadata.service');
const { Department } = require('../../models');
const { notifyUpdateDepartment, EventActionType } = require('../../utils/awsUtils/appsync.utils');
const { throwBadRequest } = require('../../utils/errorHandling');

const getDepartment = async ({ shopId, departmentId }) => {
  const department = await getDepartmentFromCache({ departmentId, shopId });
  throwBadRequest(!department, 'Không tìm thấy bộ phận');
  return department;
};

const getDepartments = async ({ shopId }) => {
  const departments = await getDepartmentsFromCache({ shopId });
  return departments;
};

const createDepartment = async ({ shopId, createBody }) => {
  const department = await Department.create({ ...createBody, shop: shopId });

  const departmentJson = department.toJSON();
  await notifyUpdateDepartment({
    department: departmentJson,
    type: EventActionType.CREATE,
  });
  return departmentJson;
};

const updateDepartment = async ({ shopId, departmentId, updateBody }) => {
  const department = await Department.findOneAndUpdate(
    { _id: departmentId, shop: shopId },
    { $set: updateBody },
    { new: true }
  );
  throwBadRequest(!department, 'Không tìm thấy bộ phận');

  const departmentJson = department.toJSON();
  await notifyUpdateDepartment({
    department: departmentJson,
    type: EventActionType.UPDATE,
  });
  return departmentJson;
};

const deleteDepartment = async ({ shopId, departmentId }) => {
  const department = await Department.findOneAndDelete({ _id: departmentId, shop: shopId });

  const departmentJson = department.toJSON();
  await notifyUpdateDepartment({
    department: departmentJson,
    type: EventActionType.DELETE,
  });
  return departmentJson;
};

module.exports = {
  getDepartment,
  getDepartments,
  createDepartment,
  updateDepartment,
  deleteDepartment,
};
