const _ = require('lodash');
const { Shop, Unit, Department, Employee } = require('../../models');
const { throwBadRequest } = require('../../utils/errorHandling');
const { getMessageByLocale } = require('../../locale');
const { TableDepartmentPermissions, CashierDepartmentPermissions, PermissionType, Status } = require('../../utils/constant');
const { getShopFromCache } = require('../../metadata/shopMetadata.service');

const getShop = async (shopId) => {
  const shop = await getShopFromCache({ shopId });
  throwBadRequest(!shop, 'Không tìm thấy nhà hàng');
  return shop;
};

const queryShop = async (query) => {
  const filter = _.pick(query, ['name']);
  filter.status = Status.enabled;
  const { employeeUserId } = query;

  if (!employeeUserId)
    return {
      page: 1,
      limit: 10000,
      totalPages: 1,
      totalResults: 0,
      result: [],
    };

  const employees = await Employee.find({ user: employeeUserId, status: Status.enabled });
  const employeeShopIds = _.map(employees, 'shop');
  const selfOwnerShops = await Shop.find({ userId: employeeUserId }, { _id: 1 });
  const selfOwnerShopIds = _.map(selfOwnerShops, (shop) => shop._id);
  filter._id = { $in: _.concat(employeeShopIds, selfOwnerShopIds) };

  const options = _.pick(query, ['sortBy', 'limit', 'page']);
  const shops = await Shop.paginate(filter, options);
  return shops;
};

const createShop = async ({ createBody, ownerUserId }) => {
  const shop = await Shop.create({
    ...createBody,
    owner: ownerUserId,
  });

  const shopId = shop._id;
  // create department
  await Department.create({
    shop: shopId,
    name: getMessageByLocale({ key: 'department.table' }),
    permissions: TableDepartmentPermissions,
  });
  await Department.create({
    shop: shopId,
    name: getMessageByLocale({ key: 'department.cashier' }),
    permissions: CashierDepartmentPermissions,
  });
  const ownerDepartment = await Department.create({
    shop: shopId,
    name: getMessageByLocale({ key: 'department.owner' }),
    permissions: Object.values(PermissionType),
  });

  // create units
  await Unit.createDefaultUnits(shopId);

  // create owner
  await Employee.create({
    shop: shopId,
    department: ownerDepartment._id,
    user: ownerUserId,
    name: getMessageByLocale({ key: 'shop.owner' }),
  });
  return shop;
};

const updateShop = async ({ shopId, updateBody }) => {
  const shop = await Shop.findByIdAndUpdate(shopId, { $set: updateBody }, { new: true });
  throwBadRequest(!shop, 'Không tìm thấy nhà hàng');
  return shop;
};

const deleteShop = async (shopId) => {
  const shop = await Shop.findByIdAndDelete({ _id: shopId });
  return shop;
};

module.exports = {
  getShop,
  queryShop,
  createShop,
  updateShop,
  deleteShop,
};
