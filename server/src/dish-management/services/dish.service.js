const _ = require('lodash');
const crypto = require('crypto');
const { default: axios } = require('axios');
const path = require('path');
const mime = require('mime');
const aws = require('../../utils/aws');
const { Dish } = require('../../models');
const { throwBadRequest } = require('../../utils/errorHandling');
const { getDishFromCache, getDishesFromCache, getDishCategoriesFromCache } = require('../../metadata/dishMetadata.service');
const { DishTypes, Status } = require('../../utils/constant');
const { refineFileNameForUploading } = require('../../utils/common');
const { registerJob } = require('../../jobs/jobUtils');
const { JobTypes } = require('../../jobs/constant');
const { notifyUpdateDish, EventActionType } = require('../../utils/awsUtils/appSync.utils');
const { getMessageByLocale } = require('../../locale');
const { getUnitsFromCache } = require('../../metadata/unitMetadata.service');
const logger = require('../../config/logger');
const { bulkUpdate, PostgreSQLTable } = require('../../utils/prisma');
const { getOperatorFromSession } = require('../../middlewares/clsHooked');

const getDish = async ({ shopId, dishId }) => {
  const dish = await getDishFromCache({ shopId, dishId });
  throwBadRequest(!dish, getMessageByLocale({ key: 'dish.notFound' }));
  return dish;
};

const getDishes = async ({ shopId }) => {
  const dishes = await getDishesFromCache({ shopId });
  return dishes;
};

const createDish = async ({ shopId, createBody }) => {
  const dish = await Dish.create({
    data: _.pickBy({
      name: createBody.name,
      code: createBody.code,
      price: createBody.price,
      type: createBody.type,
      categoryId: createBody.categoryId,
      unitId: createBody.unitId,
      shopId,
      imageUrls: createBody.imageUrls || [],
      description: createBody.description,
      hideForCustomers: createBody.hideForCustomers,
      hideForEmployees: createBody.hideForEmployees,
      taxRate: createBody.taxRate,
      isBestSeller: createBody.isBestSeller,
      isNewlyCreated: createBody.isNewlyCreated,
      isTaxIncludedPrice: createBody.isTaxIncludedPrice,
      outOfStockNotification: createBody.outOfStockNotification,
    }),
    include: {
      category: true,
      unit: true,
    },
  });

  // job to update s3 logs -> inUse = true
  await registerJob({
    type: JobTypes.CONFIRM_S3_OBJECT_USAGE,
    data: {
      keys: _.map(dish.imageUrls, (url) => aws.getS3ObjectKey(url)),
    },
  });
  const operator = getOperatorFromSession();
  await notifyUpdateDish({
    action: EventActionType.CREATE,
    dish,
    userId: _.get(operator, 'user.id'),
  });
  return dish;
};

const updateDish = async ({ shopId, dishId, updateBody }) => {
  const dish = await Dish.update({
    data: _.pickBy({
      name: updateBody.name,
      code: updateBody.code,
      price: updateBody.price,
      type: updateBody.type,
      categoryId: updateBody.categoryId,
      unitId: updateBody.unitId,
      status: updateBody.status,
      shopId,
      imageUrls: updateBody.imageUrls || [],
      description: updateBody.description,
      hideForCustomers: updateBody.hideForCustomers,
      hideForEmployees: updateBody.hideForEmployees,
      taxRate: updateBody.taxRate,
      isBestSeller: updateBody.isBestSeller,
      isNewlyCreated: updateBody.isNewlyCreated,
      isTaxIncludedPrice: updateBody.isTaxIncludedPrice,
      outOfStockNotification: updateBody.outOfStockNotification,
    }),
    where: { id: dishId, shopId },
    include: {
      category: true,
      unit: true,
    },
  });
  throwBadRequest(!dish, getMessageByLocale({ key: 'dish.notFound' }));

  // job to update s3 logs -> inUse = true
  await registerJob({
    type: JobTypes.CONFIRM_S3_OBJECT_USAGE,
    data: {
      keys: _.map(dish.imageUrls, (url) => aws.getS3ObjectKey(url)),
    },
  });
  const operator = getOperatorFromSession();
  await notifyUpdateDish({
    action: EventActionType.UPDATE,
    dish,
    userId: _.get(operator, 'user.id'),
  });
  return dish;
};

const deleteDish = async ({ shopId, dishId }) => {
  const dish = await Dish.update({
    data: { status: Status.disabled },
    where: {
      id: dishId,
      shopId,
    },
  });
  throwBadRequest(!dish, getMessageByLocale({ key: 'dish.notFound' }));

  // job to update s3 logs -> inUse = true
  await registerJob({
    type: JobTypes.REMOVE_S3_OBJECT_USAGE,
    data: {
      keys: _.map(dish.imageUrls, (url) => aws.getS3ObjectKey(url)),
    },
  });
  const operator = getOperatorFromSession();
  await notifyUpdateDish({
    action: EventActionType.DELETE,
    dish,
    userId: _.get(operator, 'user.id'),
  });
  return dish;
};

// eslint-disable-next-line no-unused-vars
const getDishTypes = (shopId) => {
  return Object.values(DishTypes);
};

const uploadImage = async ({ shopId, image }) => {
  const fileName = `${crypto.randomBytes(3).toString('hex')}_${refineFileNameForUploading(image.originalname)}`;
  const url = await aws.uploadFileBufferToS3({
    fileBuffer: image.buffer,
    targetFilePath: `shops/${shopId}/dishes/${fileName}`,
    mimeType: image.mimetype,
  });
  return url;
};

const downloadAndUploadSingleImage = async ({ shopId, url }) => {
  const response = await axios.get(url, { responseType: 'arraybuffer' });

  const extension = path.extname(new URL(url).pathname) || '';
  const originalname = `image${extension}`;
  const mimetype = response.headers['content-type'] || mime.lookup(extension) || 'application/octet-stream';

  const buffer = Buffer.from(response.data);

  return uploadImage({
    shopId,
    image: {
      originalname,
      mimetype,
      buffer,
    },
  });
};

const downloadAndUploadDishImages = async ({ shopId, imageUrls = [] }) => {
  const results = await Promise.allSettled(imageUrls.map((url) => downloadAndUploadSingleImage({ shopId, url })));

  const uploadedUrls = results.map((result, index) => {
    if (result.status === 'fulfilled') {
      return result.value;
    }
    logger.error(`Failed to process image at index ${index}:`, result.reason);
    return null;
  });

  return uploadedUrls.filter(Boolean);
};

const importDishes = async ({ dishes, shopId }) => {
  const shopDishes = await getDishesFromCache({ shopId });
  const shopDishByCode = _.keyBy(shopDishes, 'code');
  const dishCategories = await getDishCategoriesFromCache({ shopId });
  const dishCategoryByName = _.keyBy(dishCategories, 'name');
  const dishCategoryById = _.keyBy(dishCategories, 'id');
  const units = await getUnitsFromCache({ shopId });
  const unitByName = _.keyBy(units, 'name');
  const unitById = _.keyBy(units, 'id');

  const errorDishes = [];
  const newImageUrls = [];
  const createdDishes = [];
  const updatedDishes = [];
  await Promise.all(
    dishes.map(async (dish) => {
      const { code, dishCategoryId, dishCategoryName, unitId, unitName, images } = dish;

      // eslint-disable-next-line no-await-in-loop
      const imageUrls = await downloadAndUploadDishImages({ imageUrls: images, shopId });

      if (!code) {
        errorDishes.push({ dish, message: getMessageByLocale({ key: 'import.missingCode' }) });
        return;
      }

      const dishCategory = dishCategoryById[dishCategoryId] || dishCategoryByName[dishCategoryName];
      const unit = unitById[unitId] || unitByName[unitName];

      if (!dishCategory) {
        errorDishes.push({ dish, message: getMessageByLocale({ key: 'import.missingDishCategory' }) });
        return;
      }
      if (!unit) {
        errorDishes.push({ dish, message: getMessageByLocale({ key: 'import.missingUnit' }) });
        return;
      }

      // eslint-disable-next-line no-param-reassign
      dish.shopId = shopId;
      // eslint-disable-next-line no-param-reassign
      dish.unitId = unit.id;
      // eslint-disable-next-line no-param-reassign
      dish.categoryId = dishCategory.id;
      // eslint-disable-next-line no-param-reassign
      dish.imageUrls = imageUrls;
      if (imageUrls) {
        newImageUrls.push(...imageUrls);
        await registerJob({
          type: JobTypes.REMOVE_S3_OBJECT_USAGE,
          data: {
            keys: _.map(dish.imageUrls, (url) => aws.getS3ObjectKey(url)),
          },
        });
      }
      // eslint-disable-next-line no-param-reassign
      delete dish.dishCategoryId;
      // eslint-disable-next-line no-param-reassign
      delete dish.dishCategoryName;
      // eslint-disable-next-line no-param-reassign
      delete dish.unitName;
      // eslint-disable-next-line no-param-reassign
      delete dish.images;

      if (shopDishByCode[code]) {
        updatedDishes.push({ ...shopDishByCode[code], ...dish });
      } else {
        createdDishes.push(dish);
      }
    })
  );

  await Dish.createMany({ data: createdDishes });
  if (updatedDishes.length > 0) {
    await bulkUpdate(
      PostgreSQLTable.Dish,
      updatedDishes.map((dish) => ({
        id: dish.id,
        name: dish.name,
        code: dish.code,
        price: dish.price,
        isTaxIncludedPrice: dish.isTaxIncludedPrice,
        categoryId: dish.categoryId,
        taxRate: dish.taxRate,
        isNewlyCreated: dish.isNewlyCreated,
        isBestSeller: dish.isBestSeller,
        stockQuantity: dish.stockQuantity,
        hideForCustomers: dish.hideForCustomers,
        hideForEmployees: dish.hideForEmployees,
        outOfStockNotification: dish.outOfStockNotification,
        description: dish.description,
        imageUrls: dish.imageUrls,
        type: dish.type,
      }))
    );
  }

  await registerJob({
    type: JobTypes.CONFIRM_S3_OBJECT_USAGE,
    data: {
      keys: _.map(newImageUrls, (url) => aws.getS3ObjectKey(url)),
    },
  });
  await notifyUpdateDish({
    action: EventActionType.UPDATE,
    dish: {
      shopId,
    },
  });
  return errorDishes;
};

module.exports = {
  getDish,
  createDish,
  updateDish,
  deleteDish,
  getDishes,
  getDishTypes,
  uploadImage,
  importDishes,
};
