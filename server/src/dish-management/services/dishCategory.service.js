const _ = require('lodash');
const { getDishCategoryFromCache, getDishCategoriesFromCache } = require('../../metadata/dishMetadata.service');
const { DishCategory } = require('../../models');
const { throwBadRequest } = require('../../utils/errorHandling');
const { notifyUpdateDishCategory, EventActionType } = require('../../utils/awsUtils/appSync.utils');
const { getMessageByLocale } = require('../../locale');
const { Status } = require('../../utils/constant');
const prisma = require('../../utils/prisma');

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
  const dishCategoryByCode = _.keyBy(currentDishCategories, 'code');
  const dishCategoryByName = _.keyBy(currentDishCategories, 'name');

  const errorDishCategories = [];
  const createdDishCategories = [];
  const updatedDishCategories = [];
  _.forEach(dishCategories, (dishCategory) => {
    const { code, name } = dishCategory;
    // eslint-disable-next-line no-param-reassign
    dishCategory.shopId = shopId;

    if (!code) {
      errorDishCategories.push({ dishCategory, message: getMessageByLocale({ key: 'import.missingCode' }) });
      return;
    }

    if (dishCategoryByName[name]) {
      errorDishCategories.push({ dishCategory, message: getMessageByLocale({ key: 'dishCategory.alreadyExist' }) });
      return;
    }

    if (dishCategoryByCode[code]) {
      updatedDishCategories.push(dishCategory);
    } else {
      createdDishCategories.push(dishCategory);
    }
  });

  await DishCategory.createMany({ data: createdDishCategories });
  await prisma.$transaction(
    updatedDishCategories.map((dc) =>
      DishCategory.update({
        data: {
          ...dc,
        },
        where: {
          dishcategory_code_unique: {
            shopId,
            code: dc.code,
          },
        },
      })
    )
  );

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
