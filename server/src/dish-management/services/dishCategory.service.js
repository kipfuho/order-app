const _ = require('lodash');
const { getDishCategoryFromCache, getDishCategoriesFromCache } = require('../../metadata/dishMetadata.service');
const { DishCategory } = require('../../models');
const { throwBadRequest } = require('../../utils/errorHandling');
const { notifyUpdateDishCategory, EventActionType } = require('../../utils/awsUtils/appSync.utils');
const { getMessageByLocale } = require('../../locale');
const { Status } = require('../../utils/constant');
const { bulkUpdate, PostgreSQLTable } = require('../../utils/prisma');
const { getOperatorFromSession } = require('../../middlewares/clsHooked');

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

const createDishCategory = async ({ shopId, createBody }) => {
  const dishCategories = await getDishCategoriesFromCache({ shopId });
  throwBadRequest(
    _.find(dishCategories, (dishCategory) => dishCategory.name === createBody.name),
    getMessageByLocale({ key: 'dishCategory.alreadyExist' })
  );
  const dishCategory = await DishCategory.create({
    data: _.pickBy({
      name: createBody.name,
      code: createBody.code,
      shopId,
    }),
  });
  const operator = getOperatorFromSession();
  await notifyUpdateDishCategory({
    action: EventActionType.CREATE,
    dishCategory,
    userId: _.get(operator, 'user.id'),
  });
  return dishCategory;
};

const updateDishCategory = async ({ shopId, dishCategoryId, updateBody }) => {
  const dishCategory = await getDishCategoryFromCache({ dishCategoryId, shopId });
  throwBadRequest(!dishCategory, getMessageByLocale({ key: 'dishCategory.notFound' }));
  const dishCategories = await getDishCategoriesFromCache({ shopId });
  throwBadRequest(
    _.find(dishCategories, (dc) => dc.name === updateBody.name && dc.id !== dishCategoryId),
    getMessageByLocale({ key: 'dishCategory.alreadyExist' })
  );

  const compactUpdateBody = _.pickBy({
    name: updateBody.name,
    code: updateBody.code,
    shopId,
  });
  await DishCategory.update({
    data: compactUpdateBody,
    where: { id: dishCategoryId, shopId },
    select: {
      id: true,
    },
  });

  const modifiedFields = { id: dishCategoryId };
  Object.entries(compactUpdateBody).forEach(([key, value]) => {
    if (!_.isEqual(value, dishCategory[key])) {
      modifiedFields[key] = value;
    }
  });

  const operator = getOperatorFromSession();
  await notifyUpdateDishCategory({
    action: EventActionType.UPDATE,
    shopId,
    dishCategory: modifiedFields,
    userId: _.get(operator, 'user.id'),
  });
  return dishCategory;
};

const deleteDishCategory = async ({ shopId, dishCategoryId }) => {
  const dishCategory = await DishCategory.update({
    data: { status: Status.disabled },
    where: { id: dishCategoryId, shopId },
    select: {
      id: true,
    },
  });
  throwBadRequest(!dishCategory, getMessageByLocale({ key: 'dishCategory.notFound' }));

  const operator = getOperatorFromSession();
  await notifyUpdateDishCategory({
    action: EventActionType.DELETE,
    dishCategory: { id: dishCategory.id, shopId },
    userId: _.get(operator, 'user.id'),
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
      updatedDishCategories.push({ ...dishCategoryByCode[code], ...dishCategory });
    } else {
      createdDishCategories.push(dishCategory);
    }
  });

  await DishCategory.createMany({ data: createdDishCategories });
  await bulkUpdate(
    PostgreSQLTable.DishCategory,
    updatedDishCategories.map((dc) => ({
      id: dc.id,
      name: dc.name,
      code: dc.name,
    }))
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
