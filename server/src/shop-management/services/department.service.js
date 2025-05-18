const { getMessageByLocale } = require('../../locale');
const { getDepartmentFromCache, getDepartmentsFromCache } = require('../../metadata/departmentMetadata.service');
const { Department } = require('../../models');
const { notifyUpdateDepartment, EventActionType } = require('../../utils/awsUtils/appSync.utils');
const { Status } = require('../../utils/constant');
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
  const department = await Department.create({ ...createBody, shopId });

  notifyUpdateDepartment({
    department,
    action: EventActionType.CREATE,
    userId,
  });
  return department;
};

const updateDepartment = async ({ shopId, departmentId, updateBody, userId }) => {
  validatePermissionsUpdate(updateBody);
  const department = await Department.update({ data: updateBody, where: { id: departmentId, shopId } });
  throwBadRequest(!department, getMessageByLocale({ key: 'department.notFound' }));

  notifyUpdateDepartment({
    department,
    action: EventActionType.UPDATE,
    userId,
  });
  return department;
};

const deleteDepartment = async ({ shopId, departmentId, userId }) => {
  const department = await Department.update({
    data: { status: Status.disabled },
    where: {
      id: departmentId,
      shopId,
    },
  });

  notifyUpdateDepartment({
    department,
    action: EventActionType.DELETE,
    userId,
  });
  return department;
};

module.exports = {
  getDepartment,
  getDepartments,
  createDepartment,
  updateDepartment,
  deleteDepartment,
};
