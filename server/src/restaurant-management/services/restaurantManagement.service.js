const { Restaurant, Unit, Department, Employee } = require('../../models');
const { throwBadRequest } = require('../../utils/errorHandling');
const { getMessageByLocale } = require('../../locale');
const { TableDepartmentPermissions, CashierDepartmentPermissions, PermissionType } = require('../../utils/constant');

const getRestaurant = async (restaurantId) => {
  const restaurant = await Restaurant.findById(restaurantId);
  throwBadRequest(!restaurant, 'Không tìm thấy nhà hàng');
  return restaurant;
};

const createRestaurant = async ({ createBody, ownerUserId }) => {
  const restaurant = await Restaurant.create({
    ...createBody,
    owner: ownerUserId,
  });

  const restaurantId = restaurant._id;
  // create department
  await Department.create({
    restaurant: restaurantId,
    name: getMessageByLocale({ key: 'department.table' }),
    permissions: TableDepartmentPermissions,
  });
  await Department.create({
    restaurant: restaurantId,
    name: getMessageByLocale({ key: 'department.cashier' }),
    permissions: CashierDepartmentPermissions,
  });
  const ownerDepartment = await Department.create({
    restaurant: restaurantId,
    name: getMessageByLocale({ key: 'department.owner' }),
    permissions: Object.values(PermissionType),
  });

  // create units
  await Unit.createDefaultUnits(restaurantId);

  // create owner
  await Employee.create({
    restaurant: restaurantId,
    department: ownerDepartment._id,
    user: ownerUserId,
  });
  return restaurant;
};

const updateRestaurant = async (restaurantId, updateBody) => {
  const restaurant = await Restaurant.findByIdAndUpdate(restaurantId, { $set: updateBody }, { new: true });
  throwBadRequest(!restaurant, 'Không tìm thấy nhà hàng');
  return restaurant;
};

const deleteRestaurant = async (restaurantId) => {
  await Restaurant.deleteOne({ _id: restaurantId });
};

const getRestaurantes = async () => {};

module.exports = {
  getRestaurant,
  createRestaurant,
  updateRestaurant,
  deleteRestaurant,
  getRestaurantes,
};
