const { getDepartmentFromCache, getDepartmentsFromCache } = require('../../metadata/departmentMetadata.service');
const { Department } = require('../../models');
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
  return department;
};

const updateDepartment = async ({ shopId, departmentId, updateBody }) => {
  const department = await Department.findOneAndUpdate(
    { _id: departmentId, shop: shopId },
    { $set: updateBody },
    { new: true }
  );
  throwBadRequest(!department, 'Không tìm thấy bộ phận');
  return department;
};

const deleteDepartment = async ({ shopId, departmentId }) => {
  await Department.deleteOne({ _id: departmentId, shop: shopId });
};

module.exports = {
  getDepartment,
  getDepartments,
  createDepartment,
  updateDepartment,
  deleteDepartment,
};
