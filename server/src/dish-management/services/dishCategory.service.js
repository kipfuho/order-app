const { getDishCategoryFromCache, getDishCategoriesFromCache } = require('../../metadata/dishMetadata.service');
const { DishCategory } = require('../../models');
const { throwBadRequest } = require('../../utils/errorHandling');

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
  return dishCategory;
};

const updateDishCategory = async ({ shopId, dishCategoryId, updateBody }) => {
  const dishCategories = await getDishCategoriesFromCache({ shopId });
  throwBadRequest(
    _.find(dishCategories, (dishCategory) => dishCategory.name === createBody.name && dishCategory.id !== dishCategoryId),
    'Danh mục đã tồn tại'
  );
  const dishCategory = await DishCategory.findOneAndUpdate(
    { _id: dishCategoryId, shop: shopId },
    { $set: updateBody },
    { new: true }
  );
  throwBadRequest(!dishCategory, 'Không tìm thấy danh mục');
  return dishCategory;
};

const deleteDishCategory = async ({ shopId, dishCategoryId }) => {
  await DishCategory.deleteOne({ _id: dishCategoryId, shop: shopId });
};

module.exports = {
  getDishCategory,
  getDishCategories,
  createDishCategory,
  updateDishCategory,
  deleteDishCategory,
};
