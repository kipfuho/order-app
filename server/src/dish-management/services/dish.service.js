const _ = require('lodash');
const crypto = require('crypto');
const aws = require('../../utils/aws');
const { Dish } = require('../../models');
const { throwBadRequest } = require('../../utils/errorHandling');
const {
  getDishFromCache,
  getDishesFromCache,
  getDishCategoryFromCache,
  getDishCategoriesFromCache,
} = require('../../metadata/dishMetadata.service');
const { DishTypes } = require('../../utils/constant');
const { refineFileNameForUploading } = require('../../utils/common');
const { registerJob } = require('../../jobs/jobUtils');
const { JobTypes } = require('../../jobs/constant');
const { notifyUpdateDish, EventActionType } = require('../../utils/awsUtils/appSync.utils');
const { getMessageByLocale } = require('../../locale');
const { getUnitsFromCache } = require('../../metadata/unitMetadata.service');

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
  // eslint-disable-next-line no-param-reassign
  createBody.shop = shopId;
  const dish = await Dish.create(createBody);
  const dishJson = dish.toJSON();
  dishJson.category = await getDishCategoryFromCache({ shopId, dishCategoryId: dish.category });

  // job to update s3 logs -> inUse = true
  registerJob({
    type: JobTypes.CONFIRM_S3_OBJECT_USAGE,
    data: {
      keys: _.map(dish.imageUrls, (url) => aws.getS3ObjectKey(url)),
    },
  });
  notifyUpdateDish({
    action: EventActionType.CREATE,
    dish: dishJson,
    userId,
  });
  return dishJson;
};

const updateDish = async ({ shopId, dishId, updateBody, userId }) => {
  // eslint-disable-next-line no-param-reassign
  updateBody.shop = shopId;
  const dish = await Dish.findOneAndUpdate({ _id: dishId, shop: shopId }, { $set: updateBody }, { new: true });
  throwBadRequest(!dish, getMessageByLocale({ key: 'dish.notFound' }));
  const dishJson = dish.toJSON();
  dishJson.category = await getDishCategoryFromCache({ shopId, dishCategoryId: dish.category });

  // job to update s3 logs -> inUse = true
  registerJob({
    type: JobTypes.CONFIRM_S3_OBJECT_USAGE,
    data: {
      keys: _.map(dish.imageUrls, (url) => aws.getS3ObjectKey(url)),
    },
  });
  notifyUpdateDish({
    action: EventActionType.UPDATE,
    dish: dishJson,
    userId,
  });
  return dishJson;
};

const deleteDish = async ({ shopId, dishId, userId }) => {
  const dish = await Dish.findOneAndDelete({ _id: dishId, shopId });
  throwBadRequest(!dish, getMessageByLocale({ key: 'dish.notFound' }));

  const dishJson = dish.toJSON();
  // job to update s3 logs -> inUse = true
  registerJob({
    type: JobTypes.DISABLE_S3_OBJECT_USAGE,
    data: {
      keys: _.map(dish.imageUrls, (url) => aws.getS3ObjectKey(url)),
    },
  });
  notifyUpdateDish({
    action: EventActionType.DELETE,
    dish: dishJson,
    userId,
  });
  return dishJson;
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

const importDishes = async ({ dishes, shopId }) => {
  const dishCategories = await getDishCategoriesFromCache({ shopId });
  const dishCategoryByName = _.keyBy(dishCategories, 'name');
  const dishCategoryById = _.keyBy(dishCategories, 'id');
  const units = await getUnitsFromCache({ shopId });
  const unitByName = _.keyBy(units, 'name');
  const unitById = _.keyBy(units, 'id');

  const bulkOps = [];
  const errorDishes = [];
  _.forEach(dishes, (dish) => {
    const { code, dishCategoryId, dishCategoryName, unitId, unitName } = dish;

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
    updateBody.shop = shopId;
    updateBody.unit = unit.id;
    updateBody.category = dishCategory.id;
    delete updateBody.dishCategoryId;
    delete updateBody.dishCategoryName;
    delete updateBody.unitId;
    delete updateBody.unitName;
    bulkOps.push({
      updateOne: {
        filter: { shop: shopId, code: dish.code },
        update: { $set: updateBody },
        upsert: true,
      },
    });
  });

  await Dish.bulkWrite(bulkOps);
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
