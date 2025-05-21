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
const prisma = require('../../utils/prisma');

const getDish = async ({ shopId, dishId }) => {
  const dish = await getDishFromCache({ shopId, dishId });
  throwBadRequest(!dish, getMessageByLocale({ key: 'dish.notFound' }));
  return dish;
};

const getDishes = async ({ shopId }) => {
  const dishes = await getDishesFromCache({ shopId });
  return dishes;
};

const createDish = async ({ shopId, createBody, userId }) => {
  const dish = await Dish.create({
    data: _.pickBy({
      name: createBody.name,
      code: createBody.code,
      price: createBody.price,
      type: createBody.type,
      categoryId: createBody.category,
      unitId: createBody.unit,
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
  registerJob({
    type: JobTypes.CONFIRM_S3_OBJECT_USAGE,
    data: {
      keys: _.map(dish.imageUrls, (url) => aws.getS3ObjectKey(url)),
    },
  });
  notifyUpdateDish({
    action: EventActionType.CREATE,
    dish,
    userId,
  });
  return dish;
};

const updateDish = async ({ shopId, dishId, updateBody, userId }) => {
  const dish = await Dish.update({
    data: _.pickBy({
      name: updateBody.name,
      code: updateBody.code,
      price: updateBody.price,
      type: updateBody.type,
      categoryId: updateBody.category,
      unitId: updateBody.unit,
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
  registerJob({
    type: JobTypes.CONFIRM_S3_OBJECT_USAGE,
    data: {
      keys: _.map(dish.imageUrls, (url) => aws.getS3ObjectKey(url)),
    },
  });
  notifyUpdateDish({
    action: EventActionType.UPDATE,
    dish,
    userId,
  });
  return dish;
};

const deleteDish = async ({ shopId, dishId, userId }) => {
  const dish = await Dish.update({
    data: { status: Status.disabled },
    where: {
      id: dishId,
      shopId,
    },
  });
  throwBadRequest(!dish, getMessageByLocale({ key: 'dish.notFound' }));

  // job to update s3 logs -> inUse = true
  registerJob({
    type: JobTypes.DISABLE_S3_OBJECT_USAGE,
    data: {
      keys: _.map(dish.imageUrls, (url) => aws.getS3ObjectKey(url)),
    },
  });
  notifyUpdateDish({
    action: EventActionType.DELETE,
    dish,
    userId,
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

      const updateBody = _.cloneDeep(dish);
      updateBody.shopId = shopId;
      updateBody.unitId = unit.id;
      updateBody.categoryId = dishCategory.id;
      updateBody.imageUrls = imageUrls;
      if (imageUrls) {
        newImageUrls.push(...imageUrls);
        registerJob({
          type: JobTypes.DISABLE_S3_OBJECT_USAGE,
          data: {
            keys: _.map(dish.imageUrls, (url) => aws.getS3ObjectKey(url)),
          },
        });
      }
      delete updateBody.dishCategoryId;
      delete updateBody.dishCategoryName;
      delete updateBody.unitName;
      delete updateBody.images;

      if (shopDishByCode[code]) {
        updatedDishes.push(updateBody);
      } else {
        createdDishes.push(updateBody);
      }
    })
  );

  await Dish.createMany({ data: createdDishes });
  if (updatedDishes.length > 0) {
    await prisma.$transaction(
      updatedDishes.map((dish) =>
        Dish.update({
          data: {
            ...dish,
          },
          where: {
            dish_code_unique: {
              shopId,
              code: dish.code,
            },
          },
        })
      )
    );
  }

  registerJob({
    type: JobTypes.CONFIRM_S3_OBJECT_USAGE,
    data: {
      keys: _.map(newImageUrls, (url) => aws.getS3ObjectKey(url)),
    },
  });
  notifyUpdateDish({
    action: EventActionType.UPDATE,
    dish: {
      shop: shopId,
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
