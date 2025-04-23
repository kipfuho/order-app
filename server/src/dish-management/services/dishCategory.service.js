const _ = require('lodash');
const { getDishCategoryFromCache, getDishCategoriesFromCache } = require('../../metadata/dishMetadata.service');
const { DishCategory } = require('../../models');
const { throwBadRequest } = require('../../utils/errorHandling');
const { notifyUpdateDishCategory, EventActionType } = require('../../utils/awsUtils/appsync.utils');

const getDishCategory = async ({ shopId, dishCategoryId }) => {
  const dishCategory = await getDishCategoryFromCache({ shopId, dishCategoryId });
  throwBadRequest(!dishCategory, 'Không tìm thấy danh mục');
  return dishCategory;
};

const getDishCategories = async ({ shopId }) => {
  const dishCategories = await getDishCategoriesFromCache({ shopId });
  throwBadRequest(!dishCategories, 'Không tìm thấy danh mục');
  return dishCategories;
};

const createDishCategory = async ({ shopId, createBody }) => {
  const dishCategories = await getDishCategoriesFromCache({ shopId });
  throwBadRequest(
    _.find(dishCategories, (dishCategory) => dishCategory.name === createBody.name),
    'Danh mục đã tồn tại'
  );
  const dishCategory = await DishCategory.create({ ...createBody, shop: shopId });
  const dishCategoryJson = dishCategory.toJSON();
  notifyUpdateDishCategory({
    action: EventActionType.CREATE,
    dishCategory: dishCategoryJson,
  });
  return dishCategoryJson;
};

const updateDishCategory = async ({ shopId, dishCategoryId, updateBody }) => {
  const dishCategories = await getDishCategoriesFromCache({ shopId });
  throwBadRequest(
    _.find(dishCategories, (dishCategory) => dishCategory.name === updateBody.name && dishCategory.id !== dishCategoryId),
    'Danh mục đã tồn tại'
  );
  const dishCategory = await DishCategory.findOneAndUpdate(
    { _id: dishCategoryId, shop: shopId },
    { $set: updateBody },
    { new: true }
  );
  throwBadRequest(!dishCategory, 'Không tìm thấy danh mục');

  const dishCategoryJson = dishCategory.toJSON();
  notifyUpdateDishCategory({
    action: EventActionType.CREATE,
    dishCategory: dishCategoryJson,
  });
  return dishCategoryJson;
};

const deleteDishCategory = async ({ shopId, dishCategoryId }) => {
  const dishCategory = await DishCategory.findOneAndDelete({ _id: dishCategoryId, shop: shopId });
  throwBadRequest(!dishCategory, 'Không tìm thấy danh mục');

  const dishCategoryJson = dishCategory.toJSON();
  notifyUpdateDishCategory({
    action: EventActionType.CREATE,
    dishCategory: dishCategoryJson,
  });
  return dishCategoryJson;
};

module.exports = {
  getDishCategory,
  getDishCategories,
  createDishCategory,
  updateDishCategory,
  deleteDishCategory,
};
