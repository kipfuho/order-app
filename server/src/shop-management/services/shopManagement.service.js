const _ = require('lodash');
const crypto = require('crypto');
const { Shop, Unit, Department, Employee } = require('../../models');
const { throwBadRequest } = require('../../utils/errorHandling');
const { getMessageByLocale } = require('../../locale');
const { TableDepartmentPermissions, CashierDepartmentPermissions, PermissionType, Status } = require('../../utils/constant');
const { getShopFromCache } = require('../../metadata/shopMetadata.service');
const { notifyUpdateShop, EventActionType } = require('../../utils/awsUtils/appSync.utils');
const { refineFileNameForUploading } = require('../../utils/common');
const aws = require('../../utils/aws');
const { registerJob } = require('../../jobs/jobUtils');
const { JobTypes } = require('../../jobs/constant');

const getShop = async (shopId) => {
  const shop = await getShopFromCache({ shopId });
  throwBadRequest(!shop, getMessageByLocale({ key: 'shop.notFound' }));
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

const createShop = async ({ createBody, userId }) => {
  const shop = await Shop.create({
    ...createBody,
    owner: userId,
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
    user: userId,
    name: getMessageByLocale({ key: 'shop.owner' }),
  });

  const shopJson = shop.toJSON();
  // job to update s3 logs -> inUse = true
  registerJob({
    type: JobTypes.CONFIRM_S3_OBJECT_USAGE,
    data: {
      keys: _.map(shop.imageUrls, (url) => aws.getS3ObjectKey(url)),
    },
  });
  notifyUpdateShop({ shop: shopJson, action: EventActionType.CREATE, userId });
  return shopJson;
};

const updateShop = async ({ shopId, updateBody, userId }) => {
  const shop = await Shop.findByIdAndUpdate(shopId, { $set: updateBody }, { new: true });
  throwBadRequest(!shop, getMessageByLocale({ key: 'shop.notFound' }));

  const shopJson = shop.toJSON();
  // job to update s3 logs -> inUse = true
  registerJob({
    type: JobTypes.CONFIRM_S3_OBJECT_USAGE,
    data: {
      keys: _.map(shop.imageUrls, (url) => aws.getS3ObjectKey(url)),
    },
  });
  notifyUpdateShop({ shop: shopJson, action: EventActionType.UPDATE, userId });
  return shopJson;
};

const deleteShop = async ({ shopId, userId }) => {
  const shop = await Shop.findByIdAndDelete({ _id: shopId });

  const shopJson = shop.toJSON();
  // job to update s3 logs -> inUse = true
  registerJob({
    type: JobTypes.DISABLE_S3_OBJECT_USAGE,
    data: {
      keys: _.map(shop.imageUrls, (url) => aws.getS3ObjectKey(url)),
    },
  });
  notifyUpdateShop({ shop: shopJson, action: EventActionType.CREATE, userId });
  return shopJson;
};

const uploadImage = async ({ image }) => {
  const fileName = `${crypto.randomBytes(3).toString('hex')}_${refineFileNameForUploading(image.originalname)}`;
  const url = await aws.uploadFileBufferToS3({
    fileBuffer: image.buffer,
    targetFilePath: `shops/${fileName}`,
    mimeType: image.mimetype,
  });
  return url;
};

const removeImage = async ({ url }) => {
  await aws.deleteObjectFromS3(aws.getS3ObjectKey(url));
};

module.exports = {
  getShop,
  queryShop,
  createShop,
  updateShop,
  deleteShop,
  uploadImage,
  removeImage,
};
