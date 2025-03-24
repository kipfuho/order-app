const _ = require('lodash');
const crypto = require('crypto');
const aws = require('../../utils/aws');
const { Dish } = require('../../models');
const { throwBadRequest } = require('../../utils/errorHandling');
const { getDishFromCache, getDishesFromCache, getDishCategoryFromCache } = require('../../metadata/dishMetadata.service');
const { DishTypes } = require('../../utils/constant');
const { refineFileNameForUploading } = require('../../utils/common');

const getDish = async ({ shopId, dishId }) => {
  const dish = await getDishFromCache({ shopId, dishId });
  throwBadRequest(!dish, 'Không tìm thấy món ăn');
  return dish;
};

const getDishes = async ({ shopId }) => {
  const dishes = await getDishesFromCache({ shopId });
  return dishes;
};

const _validateDish = (dish) => {
  const { name, price, category, type } = dish;
  throwBadRequest(
    _.isEmpty(name) || _.isEmpty(category) || _.isEmpty(type),
    'Tên món ăn, loại món ăn và danh mục món ăn không được để trống'
  );
  throwBadRequest(price < 0, 'Giá món ăn không được nhỏ hơn 0');
};

const createDish = async ({ shopId, createBody }) => {
  _validateDish(createBody);
  // eslint-disable-next-line no-param-reassign
  createBody.shop = shopId;
  const dish = await Dish.create(createBody);
  const dishJson = dish.toJSON();
  dishJson.category = await getDishCategoryFromCache({ shopId, categoryId: dish.category });
  return dishJson;
};

const updateDish = async ({ shopId, dishId, updateBody }) => {
  _validateDish(updateBody);
  // eslint-disable-next-line no-param-reassign
  updateBody.shop = shopId;
  const dish = await Dish.findByIdAndUpdate({ dishId, shopId }, { $set: updateBody }, { new: true });
  throwBadRequest(!dish, 'Không tìm thấy món ăn');
  return dish;
};

const deleteDish = async (dishId) => {
  await Dish.deleteOne({ _id: dishId });
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

const removeImage = async ({ url }) => {
  await aws.deleteObjectFromS3(url);
};

module.exports = {
  getDish,
  createDish,
  updateDish,
  deleteDish,
  getDishes,
  getDishTypes,
  uploadImage,
  removeImage,
};
