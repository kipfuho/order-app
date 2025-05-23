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
  const filter = {
    where: {
      name: query.name,
      status: Status.enabled,
    },
  };
  const { employeeUserId } = query;

  if (!employeeUserId)
    return {
      page: 1,
      limit: 10000,
      totalPages: 1,
      totalResults: 0,
      result: [],
    };

  const employees = await Employee.findMany({
    where: {
      userId: employeeUserId,
      status: Status.enabled,
    },
  });
  const employeeShopIds = _.map(employees, 'shopId');
  const selfOwnerShops = await Shop.findMany({
    where: {
      ownerId: employeeUserId,
    },
  });
  const selfOwnerShopIds = _.map(selfOwnerShops, 'id');
  filter.where.id = { in: _.concat(employeeShopIds, selfOwnerShopIds) };

  const options = _.pick(query, ['sortBy', 'limit', 'page']);
  if (options.sortBy) {
    filter.orderBy = {
      [options.sortBy]: 'asc',
    };
  }
  if (options.limit && options.page) {
    filter.skip = Math.max(options.page - 1, 0) * options.limit;
    filter.take = 1 * options.limit;
  }
  const shops = await Shop.findMany(filter);
  return shops;
};

const createShop = async ({ createBody, userId }) => {
  const shop = await Shop.create({
    data: {
      ...createBody,
      ownerId: userId,
    },
  });

  const shopId = shop.id;
  try {
    // create department
    await Department.create({
      data: {
        shopId,
        name: getMessageByLocale({ key: 'department.table' }),
        permissions: TableDepartmentPermissions,
      },
    });
    await Department.create({
      data: {
        shopId,
        name: getMessageByLocale({ key: 'department.cashier' }),
        permissions: CashierDepartmentPermissions,
      },
    });
    const ownerDepartment = await Department.create({
      data: {
        shopId,
        name: getMessageByLocale({ key: 'department.owner' }),
        permissions: Object.values(PermissionType),
      },
    });

    // create units
    await Unit.createDefaultUnits(shopId);

    // create owner
    await Employee.create({
      data: {
        shopId,
        departmentId: ownerDepartment.id,
        userId,
        name: getMessageByLocale({ key: 'shop.owner' }),
      },
    });
  } catch (err) {
    await Employee.deleteMany({ where: { shopId, userId } });
    await Department.deleteMany({ where: { shopId } });
    await Unit.deleteMany({ where: { shopId } });
    await Shop.delete({
      where: {
        id: shopId,
      },
    });
    throw err;
  }

  // job to update s3 logs -> inUse = true
  registerJob({
    type: JobTypes.CONFIRM_S3_OBJECT_USAGE,
    data: {
      keys: _.map(shop.imageUrls, (url) => aws.getS3ObjectKey(url)),
    },
  });
  notifyUpdateShop({ shop, action: EventActionType.CREATE, userId });
  return shop;
};

const updateShop = async ({ shopId, updateBody, userId }) => {
  const shop = await Shop.update({ data: updateBody, where: { id: shopId } });
  throwBadRequest(!shop, getMessageByLocale({ key: 'shop.notFound' }));

  // job to update s3 logs -> inUse = true
  registerJob({
    type: JobTypes.CONFIRM_S3_OBJECT_USAGE,
    data: {
      keys: _.map(shop.imageUrls, (url) => aws.getS3ObjectKey(url)),
    },
  });
  notifyUpdateShop({ shop, action: EventActionType.UPDATE, userId });
  return shop;
};

const deleteShop = async ({ shopId, userId }) => {
  const shop = await Shop.update({ data: { status: Status.disabled }, where: { id: shopId } });

  // job to update s3 logs -> inUse = true
  registerJob({
    type: JobTypes.REMOVE_S3_OBJECT_USAGE,
    data: {
      keys: _.map(shop.imageUrls, (url) => aws.getS3ObjectKey(url)),
    },
  });
  notifyUpdateShop({ shop, action: EventActionType.CREATE, userId });
  return shop;
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
