const { DishCategory } = require('../../models');
const { throwBadRequest } = require('../../utils/errorHandling');

const getDishCategory = async (dishCategoryId) => {
  const dishCategory = await DishCategory.findById(dishCategoryId);
  throwBadRequest(!dishCategory, 'Không tìm thấy món ăn');
  return dishCategory;
};

const createDishCategory = async (createBody) => {
  const dishCategory = await DishCategory.create(createBody);
  return dishCategory;
};

const updateDishCategory = async (dishCategoryId, updateBody) => {
  const dishCategory = await DishCategory.findByIdAndUpdate(dishCategoryId, { $set: updateBody }, { new: true });
  throwBadRequest(!dishCategory, 'Không tìm thấy món ăn');
  return dishCategory;
};

const deleteDishCategory = async (dishCategoryId) => {
  await DishCategory.deleteOne({ _id: dishCategoryId });
};

const getDishCategories = async () => {};

module.exports = {
  getDishCategory,
  createDishCategory,
  updateDishCategory,
  deleteDishCategory,
  getDishCategories,
};
