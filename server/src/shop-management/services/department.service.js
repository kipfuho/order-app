const { getMessageByLocale } = require('../../locale');
const { getDepartmentFromCache, getDepartmentsFromCache } = require('../../metadata/departmentMetadata.service');
const { Department } = require('../../models');
const { notifyUpdateDepartment, EventActionType } = require('../../utils/awsUtils/appSync.utils');
const { throwBadRequest } = require('../../utils/errorHandling');
const { validatePermissionsUpdate } = require('./employee.service');

const getDepartment = async ({ shopId, departmentId }) => {
  const department = await getDepartmentFromCache({ departmentId, shopId });
  throwBadRequest(!department, getMessageByLocale({ key: 'department.notFound' }));
  return department;
};

const getDepartments = async ({ shopId }) => {
  const departments = await getDepartmentsFromCache({ shopId });
  return departments;
};

const createDepartment = async ({ shopId, createBody, userId }) => {
  validatePermissionsUpdate(createBody);
  const department = await Department.create({ ...createBody, shop: shopId });

  const departmentJson = department.toJSON();
  notifyUpdateDepartment({
    department: departmentJson,
    action: EventActionType.CREATE,
    userId,
  });
  return departmentJson;
};

const updateDepartment = async ({ shopId, departmentId, updateBody, userId }) => {
  validatePermissionsUpdate(updateBody);
  const department = await Department.findOneAndUpdate(
    { _id: departmentId, shop: shopId },
    { $set: updateBody },
    { new: true }
  );
  throwBadRequest(!department, getMessageByLocale({ key: 'department.notFound' }));

  const departmentJson = department.toJSON();
  notifyUpdateDepartment({
    department: departmentJson,
    action: EventActionType.UPDATE,
    userId,
  });
  return departmentJson;
};

const deleteDepartment = async ({ shopId, departmentId, userId }) => {
  const department = await Department.findOneAndDelete({ _id: departmentId, shop: shopId });

  const departmentJson = department.toJSON();
  notifyUpdateDepartment({
    department: departmentJson,
    action: EventActionType.DELETE,
    userId,
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
