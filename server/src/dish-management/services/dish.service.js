const _ = require('lodash');
const crypto = require('crypto');
const aws = require('../../utils/aws');
const { Dish } = require('../../models');
const { throwBadRequest } = require('../../utils/errorHandling');
const { getDishFromCache, getDishesFromCache, getDishCategoryFromCache } = require('../../metadata/dishMetadata.service');
const { DishTypes } = require('../../utils/constant');
const { refineFileNameForUploading } = require('../../utils/common');
const { registerJob } = require('../../jobs/jobUtils');
const { JobTypes } = require('../../jobs/constant');

const getDish = async ({ shopId, dishId }) => {
  const dish = await getDishFromCache({ shopId, dishId });
  throwBadRequest(!dish, 'Không tìm thấy món ăn');
  return dish;
};

const getDishes = async ({ shopId }) => {
  const dishes = await getDishesFromCache({ shopId });
  return dishes;
};

const createDish = async ({ shopId, createBody }) => {
  // eslint-disable-next-line no-param-reassign
  createBody.shop = shopId;
  const dish = await Dish.create(createBody);
  const dishJson = dish.toJSON();
  dishJson.category = await getDishCategoryFromCache({ shopId, dishCategoryId: dish.category });
  return dishJson;
};

const updateDish = async ({ shopId, dishId, updateBody }) => {
  // eslint-disable-next-line no-param-reassign
  updateBody.shop = shopId;
  const dish = await Dish.findOneAndUpdate({ _id: dishId, shop: shopId }, { $set: updateBody }, { new: true });
  throwBadRequest(!dish, 'Không tìm thấy món ăn');
  const dishJson = dish.toJSON();
  dishJson.category = await getDishCategoryFromCache({ shopId, dishCategoryId: dish.category });

  // job to update s3 logs -> inUse = true
  registerJob({
    type: JobTypes.CONFIRM_S3_OBJECT_USAGE,
    data: {
      keys: _.map(dish.imageUrls, (url) => aws.getS3ObjectKey(url)),
    },
  });
  return dishJson;
};

const deleteDish = async ({ shopId, dishId }) => {
  await Dish.deleteOne({ _id: dishId, shopId });
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
  await aws.deleteObjectFromS3(aws.getS3ObjectKey(url));
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
