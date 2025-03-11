const { Department } = require('../../models');
const { throwBadRequest } = require('../../utils/errorHandling');

const getDepartment = async (departmentId) => {
  const department = await Department.findById(departmentId);
  throwBadRequest(!department, 'Không tìm thấy bộ phận');
  return department;
};

const createDepartment = async (createBody) => {
  const department = await Department.create(createBody);
  return department;
};

const updateDepartment = async (departmentId, updateBody) => {
  const department = await Department.findByIdAndUpdate(departmentId, { $set: updateBody }, { new: true });
  throwBadRequest(!department, 'Không tìm thấy bộ phận');
  return department;
};

const deleteDepartment = async (departmentId) => {
  await Department.deleteOne({ _id: departmentId });
};

module.exports = {
  getDepartment,
  createDepartment,
  updateDepartment,
  deleteDepartment,
};
