const _ = require('lodash');
const crypto = require('crypto');
const { default: axios } = require('axios');
const path = require('path');
const mime = require('mime');
const aws = require('../../utils/aws');
const { Dish } = require('../../models');
const { throwBadRequest } = require('../../utils/errorHandling');
const {
  getDishFromCache,
  getDishesFromCache,
  getDishCategoriesFromCache,
  getDishCategoryFromCache,
} = require('../../metadata/dishMetadata.service');
const { DishTypes, Status } = require('../../utils/constant');
const { refineFileNameForUploading } = require('../../utils/common');
const { registerJob } = require('../../jobs/jobUtils');
const { JobTypes } = require('../../jobs/constant');
const { notifyUpdateDish, EventActionType } = require('../../utils/awsUtils/appSync.utils');
const { getMessageByLocale } = require('../../locale');
const { getUnitsFromCache, getUnitFromCache } = require('../../metadata/unitMetadata.service');
const logger = require('../../config/logger');
const { bulkUpdate, PostgreSQLTable } = require('../../utils/prisma');

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
  await notifyUpdateDish({
    action: EventActionType.CREATE,
    shopId,
    dish,
  });
};

const updateDish = async ({ shopId, dishId, updateBody }) => {
  const dish = await getDishFromCache({ shopId, dishId });
  throwBadRequest(!dish, getMessageByLocale({ key: 'dish.notFound' }));

  const compactUpdateBody = _.pickBy({
    id: dishId,
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
  });
  const updatedDish = await Dish.update({
    data: compactUpdateBody,
    where: { id: dishId, shopId },
    select: {
      id: true,
      imageUrls: true,
    },
  });

  const modifiedFields = { id: dishId };
  Object.entries(compactUpdateBody).forEach(([key, value]) => {
    if (!_.isEqual(value, dish[key])) {
      modifiedFields[key] = value;
    }
  });

  if (!_.isEmpty(modifiedFields.categoryId)) {
    const newCategory = await getDishCategoryFromCache({ shopId, dishCategoryId: modifiedFields.categoryId });
    modifiedFields.category = newCategory;
    delete modifiedFields.categoryId;
  }

  if (!_.isEmpty(modifiedFields.unitId)) {
    const newUnit = await getUnitFromCache({ shopId, unitId: modifiedFields.unitId });
    modifiedFields.unit = newUnit;
    delete modifiedFields.unitId;
  }

  // job to update s3 logs -> inUse = true
  await registerJob({
    type: JobTypes.CONFIRM_S3_OBJECT_USAGE,
    data: {
      keys: _.map(updatedDish.imageUrls, (url) => aws.getS3ObjectKey(url)),
    },
  });
  await notifyUpdateDish({
    action: EventActionType.UPDATE,
    shopId,
    dish: modifiedFields,
  });
};

const deleteDish = async ({ shopId, dishId }) => {
  const dish = await getDishFromCache({ shopId, dishId });
  throwBadRequest(!dish, getMessageByLocale({ key: 'dish.notFound' }));

  const updatedDish = await Dish.update({
    data: { status: Status.disabled },
    where: {
      id: dishId,
      shopId,
    },
    select: {
      id: true,
      imageUrls: true,
    },
  });

  // job to update s3 logs -> inUse = true
  await registerJob({
    type: JobTypes.REMOVE_S3_OBJECT_USAGE,
    data: {
      keys: _.map(updatedDish.imageUrls, (url) => aws.getS3ObjectKey(url)),
    },
  });
  await notifyUpdateDish({
    action: EventActionType.DELETE,
    shopId,
    dish: {
      id: dish.id,
    },
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

const downloadAndUploadSingleImage = async ({ shopId, url, index = 0 }) => {
  const response = await axios.get(url, { responseType: 'arraybuffer' });

  const extension = path.extname(new URL(url).pathname) || '';
  const originalname = `${index}_image${extension}`;
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
  const results = await Promise.allSettled(
    imageUrls.map((url, index) => downloadAndUploadSingleImage({ shopId, url, index }))
  );

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
  const oldImageUrls = [];
  const newCreateImageUrls = [];
  const newUpdateImageUrls = [];
  const createdDishes = [];
  const updatedDishes = [];
  await Promise.all(
    dishes.map(async (dish) => {
      const { code, dishCategoryId, dishCategoryName, unitId, unitName, images } = dish;

      // eslint-disable-next-line no-await-in-loop
      const imageUrls =
        dish.status === Status.disabled ? [] : await downloadAndUploadDishImages({ imageUrls: images, shopId });

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
      // eslint-disable-next-line no-param-reassign
      delete dish.dishCategoryId;
      // eslint-disable-next-line no-param-reassign
      delete dish.dishCategoryName;
      // eslint-disable-next-line no-param-reassign
      delete dish.unitName;
      // eslint-disable-next-line no-param-reassign
      delete dish.images;

      if (shopDishByCode[code]) {
        oldImageUrls.push(...(shopDishByCode[code].imageUrls || []));
        updatedDishes.push({ ...shopDishByCode[code], ...dish });
        newUpdateImageUrls.push(...imageUrls);
      } else if (dish.status !== Status.disabled) {
        createdDishes.push(dish);
        newCreateImageUrls.push(...imageUrls);
      }
    })
  );

  try {
    await Dish.createMany({ data: createdDishes });
    await registerJob({
      type: JobTypes.CONFIRM_S3_OBJECT_USAGE,
      data: {
        keys: _.map(newCreateImageUrls, (url) => aws.getS3ObjectKey(url)),
      },
    });
  } catch (err) {
    await registerJob({
      type: JobTypes.REMOVE_S3_OBJECT_USAGE,
      data: {
        keys: _.map(newCreateImageUrls, (url) => aws.getS3ObjectKey(url)),
      },
    });
    errorDishes.push(...createdDishes.map((dish) => ({ dish, message: 'Tạo thất bại' })));
  }
  if (updatedDishes.length > 0) {
    const updateData = updatedDishes.map((dish) => ({
      id: dish.id,
      name: dish.name,
      code: dish.code,
      price: dish.price,
      isTaxIncludedPrice: dish.isTaxIncludedPrice || false,
      categoryId: dish.categoryId,
      taxRate: dish.taxRate || 0,
      isNewlyCreated: dish.isNewlyCreated || false,
      isBestSeller: dish.isBestSeller || false,
      stockQuantity: dish.stockQuantity || 0,
      hideForCustomers: dish.hideForCustomers || false,
      hideForEmployees: dish.hideForEmployees || false,
      outOfStockNotification: dish.outOfStockNotification || false,
      description: dish.description || '',
      imageUrls: dish.imageUrls || [],
      type: dish.type || DishTypes.FOOD,
      status: dish.status || Status.activated,
    }));
    try {
      await bulkUpdate(PostgreSQLTable.Dish, updateData);
      await registerJob({
        type: JobTypes.CONFIRM_S3_OBJECT_USAGE,
        data: {
          keys: _.map(newUpdateImageUrls, (url) => aws.getS3ObjectKey(url)),
        },
      });
      await registerJob({
        type: JobTypes.REMOVE_S3_OBJECT_USAGE,
        data: {
          keys: _.map(oldImageUrls, (url) => aws.getS3ObjectKey(url)),
        },
      });
    } catch (err) {
      await registerJob({
        type: JobTypes.REMOVE_S3_OBJECT_USAGE,
        data: {
          keys: _.map(newUpdateImageUrls, (url) => aws.getS3ObjectKey(url)),
        },
      });
      errorDishes.push(...updatedDishes.map((dish) => ({ dish, message: 'Cập nhật thất bại' })));
    }
  }

  await notifyUpdateDish({
    action: EventActionType.UPDATE,
    shopId,
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
