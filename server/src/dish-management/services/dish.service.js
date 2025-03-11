const _ = require('lodash');
const { Dish } = require('../../models');
const { throwBadRequest } = require('../../utils/errorHandling');
const { getDishFromCache, getDishesFromCache } = require('../../metadata/dishMetadata.service');

const getDish = async ({ restaurantId, dishId }) => {
  const dish = await getDishFromCache({ restaurantId, dishId });
  throwBadRequest(!dish, 'Không tìm thấy món ăn');
  return dish;
};

const getDishes = async ({ restaurantId }) => {
  return getDishesFromCache({ restaurantId });
};

const _validateDish = (dish) => {
  const { name, price, category, type } = dish;
  throwBadRequest(
    _.isEmpty(name) || _.isEmpty(category) || _.isEmpty(type),
    'Tên món ăn, loại món ăn và danh mục món ăn không được để trống'
  );
  throwBadRequest(price < 0, 'Giá món ăn không được nhỏ hơn 0');
};
const createDish = async ({ restaurantId, createBody }) => {
  _validateDish(createBody);
  // eslint-disable-next-line no-param-reassign
  createBody.restaurant = restaurantId;
  const dish = await Dish.create(createBody);
  return dish;
};

const updateDish = async ({ restaurantId, dishId, updateBody }) => {
  _validateDish(updateBody);
  // eslint-disable-next-line no-param-reassign
  updateBody.restaurant = restaurantId;
  const dish = await Dish.findByIdAndUpdate({ dishId, restaurantId }, { $set: updateBody }, { new: true });
  throwBadRequest(!dish, 'Không tìm thấy món ăn');
  return dish;
};

const deleteDish = async (dishId) => {
  await Dish.deleteOne({ _id: dishId });
};

module.exports = {
  getDish,
  createDish,
  updateDish,
  deleteDish,
  getDishes,
};
