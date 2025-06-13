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
const { getOperatorFromSession } = require('../../middlewares/clsHooked');

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
  const operator = getOperatorFromSession();
  const userId = _.get(operator, 'user.id');

  if (!userId)
    return {
      page: 1,
      limit: 10000,
      totalPages: 1,
      totalResults: 0,
      results: [],
    };

  const employees = await Employee.findMany({
    where: {
      userId,
      status: Status.enabled,
    },
  });
  const employeeShopIds = _.map(employees, 'shopId');
  const selfOwnerShops = await Shop.findMany({
    where: {
      ownerId: userId,
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

  return {
    page: options.page || 1,
    limit: options.limit || 10000,
    results: shops,
  };
};

const createShop = async ({ createBody }) => {
  const operator = getOperatorFromSession();
  const shop = await Shop.create({
    data: {
      ...createBody,
      ownerId: _.get(operator, 'user.id'),
    },
  });

  const shopId = shop.id;
  try {
    // create department
    await Department.createMany({
      data: [
        {
          shopId,
          name: getMessageByLocale({ key: 'department.table' }),
          permissions: TableDepartmentPermissions,
        },
        {
          shopId,
          name: getMessageByLocale({ key: 'department.cashier' }),
          permissions: CashierDepartmentPermissions,
        },

        {
          shopId,
          name: getMessageByLocale({ key: 'department.owner' }),
          permissions: Object.values(PermissionType),
        },
      ],
    });

    // create units
    await Unit.createDefaultUnits(shopId);
  } catch (err) {
    await Department.deleteMany({ where: { shopId } });
    await Unit.deleteMany({ where: { shopId } });
    await Shop.delete({
      where: {
        id: shopId,
      },
      select: { id: true },
    });
    throw err;
  }

  // job to update s3 logs -> inUse = true
  await registerJob({
    type: JobTypes.CONFIRM_S3_OBJECT_USAGE,
    data: {
      keys: _.map(shop.imageUrls, (url) => aws.getS3ObjectKey(url)),
    },
  });
  await notifyUpdateShop({ action: EventActionType.CREATE, shop });
};

const updateShop = async ({ shopId, updateBody }) => {
  const shop = await getShopFromCache({ shopId });
  throwBadRequest(!shop, getMessageByLocale({ key: 'shop.notFound' }));

  const compactUpdateBody = _.pickBy(updateBody);
  const updatedShop = await Shop.update({ data: updateBody, where: { id: shopId }, select: { id: true, imageUrls: true } });

  const modifiedFields = { id: shopId };
  Object.entries(compactUpdateBody).forEach(([key, value]) => {
    if (!_.isEqual(value, shop[key])) {
      modifiedFields[key] = value;
    }
  });

  // job to update s3 logs -> inUse = true
  await registerJob({
    type: JobTypes.CONFIRM_S3_OBJECT_USAGE,
    data: {
      keys: _.map(updatedShop.imageUrls, (url) => aws.getS3ObjectKey(url)),
    },
  });

  await notifyUpdateShop({ action: EventActionType.UPDATE, shop: modifiedFields });
};

const deleteShop = async ({ shopId }) => {
  const shop = await getShopFromCache({ shopId });
  throwBadRequest(!shop, getMessageByLocale({ key: 'shop.notFound' }));

  await Shop.update({ data: { status: Status.disabled }, where: { id: shopId }, select: { id: true } });

  // job to update s3 logs -> inUse = true
  await registerJob({
    type: JobTypes.REMOVE_S3_OBJECT_USAGE,
    data: {
      keys: _.map(shop.imageUrls, (url) => aws.getS3ObjectKey(url)),
    },
  });

  await notifyUpdateShop({ action: EventActionType.CREATE, shop: { id: shopId } });
};

const uploadImage = async ({ image }) => {
  const { base } = refineFileNameForUploading(image.originalname);
  const fileName = `${crypto.randomBytes(3).toString('hex')}_${base}`;
  const url = await aws.uploadImageBufferToS3({
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
