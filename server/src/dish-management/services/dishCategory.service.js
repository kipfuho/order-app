const _ = require('lodash');
const { getDishCategoryFromCache, getDishCategoriesFromCache } = require('../../metadata/dishMetadata.service');
const { DishCategory } = require('../../models');
const { throwBadRequest } = require('../../utils/errorHandling');
const { notifyUpdateDishCategory, EventActionType } = require('../../utils/awsUtils/appSync.utils');
const { getMessageByLocale } = require('../../locale');
const { Status } = require('../../utils/constant');

const getDishCategory = async ({ shopId, dishCategoryId }) => {
  const dishCategory = await getDishCategoryFromCache({ shopId, dishCategoryId });
  throwBadRequest(!dishCategory, getMessageByLocale({ key: 'dishCategory.notFound' }));
  return dishCategory;
};

const getDishCategories = async ({ shopId }) => {
  const dishCategories = await getDishCategoriesFromCache({ shopId });
  throwBadRequest(!dishCategories, getMessageByLocale({ key: 'dishCategory.notFound' }));
  return dishCategories;
};

const createDishCategory = async ({ shopId, createBody, userId }) => {
  const dishCategories = await getDishCategoriesFromCache({ shopId });
  throwBadRequest(
    _.find(dishCategories, (dishCategory) => dishCategory.name === createBody.name),
    getMessageByLocale({ key: 'dishCategory.alreadyExist' })
  );
  const dishCategory = await DishCategory.create({
    data: {
      ...createBody,
      shopId,
    },
  });
  notifyUpdateDishCategory({
    action: EventActionType.CREATE,
    dishCategory,
    userId,
  });
  return dishCategory;
};

const updateDishCategory = async ({ shopId, dishCategoryId, updateBody, userId }) => {
  const dishCategories = await getDishCategoriesFromCache({ shopId });
  throwBadRequest(
    _.find(dishCategories, (dishCategory) => dishCategory.name === updateBody.name && dishCategory.id !== dishCategoryId),
    getMessageByLocale({ key: 'dishCategory.alreadyExist' })
  );
  const dishCategory = await DishCategory.update({ data: updateBody, where: { id: dishCategoryId, shopId } });
  throwBadRequest(!dishCategory, getMessageByLocale({ key: 'dishCategory.notFound' }));

  notifyUpdateDishCategory({
    action: EventActionType.UPDATE,
    dishCategory,
    userId,
  });
  return dishCategory;
};

const deleteDishCategory = async ({ shopId, dishCategoryId, userId }) => {
  const dishCategory = await DishCategory.update({
    data: { status: Status.disabled },
    where: { id: dishCategoryId, shopId },
  });
  throwBadRequest(!dishCategory, getMessageByLocale({ key: 'dishCategory.notFound' }));

  notifyUpdateDishCategory({
    action: EventActionType.DELETE,
    dishCategory,
    userId,
  });
  return dishCategory;
};

const importDishCategories = async ({ dishCategories, shopId }) => {
  const currentDishCategories = await getDishCategoriesFromCache({ shopId });
  const dishCategoryByName = _.keyBy(currentDishCategories, 'name');

  const errorDishCategories = [];
  _.forEach(dishCategories, (dishCategory) => {
    const { code, name } = dishCategory;

    if (!code) {
      errorDishCategories.push({ dishCategory, message: getMessageByLocale({ key: 'import.missingCode' }) });
      return;
    }

    if (dishCategoryByName[name]) {
      errorDishCategories.push({ dishCategory, message: getMessageByLocale({ key: 'dishCategory.alreadyExist' }) });
      return;
    }

    const updateBody = _.cloneDeep(dishCategory);
    return DishCategory.upsert({
      where: {
        dishcategory_code_unique: {
          shopId,
          code,
        },
      },
      create: { ...updateBody, shopId },
      update: updateBody,
    });
  });

  return errorDishCategories;
};

module.exports = {
  getDishCategory,
  getDishCategories,
  createDishCategory,
  updateDishCategory,
  deleteDishCategory,
  importDishCategories,
};
