const { Kitchen } = require('../../models');
const { throwBadRequest } = require('../../utils/errorHandling');
const { notifyUpdateKitchen, EventActionType } = require('../../utils/awsUtils/appSync.utils');
const { getMessageByLocale } = require('../../locale');
const { getKitchenFromCache, getKitchensFromCache } = require('../../metadata/kitchenMetadata.service');

const getKitchen = async ({ shopId, kitchenId }) => {
  const kitchen = await getKitchenFromCache({ shopId, kitchenId });
  throwBadRequest(!kitchen, getMessageByLocale({ key: 'kitchen.notFound' }));
  return kitchen;
};

const getKitchens = async ({ shopId }) => {
  const kitchens = await getKitchensFromCache({ shopId });
  return kitchens;
};

const createKitchen = async ({ shopId, createBody, userId }) => {
  // eslint-disable-next-line no-param-reassign
  createBody.shop = shopId;
  const kitchen = await Kitchen.create(createBody);
  const kitchenJson = kitchen.toJSON();

  notifyUpdateKitchen({
    action: EventActionType.CREATE,
    kitchen: kitchenJson,
    userId,
  });
  return kitchenJson;
};

const updateKitchen = async ({ shopId, kitchenId, updateBody, userId }) => {
  // eslint-disable-next-line no-param-reassign
  updateBody.shop = shopId;
  const kitchen = await Kitchen.findOneAndUpdate({ _id: kitchenId, shop: shopId }, { $set: updateBody }, { new: true });
  throwBadRequest(!kitchen, getMessageByLocale({ key: 'kitchen.notFound' }));
  const kitchenJson = kitchen.toJSON();

  notifyUpdateKitchen({
    action: EventActionType.UPDATE,
    kitchen: kitchenJson,
    userId,
  });
  return kitchenJson;
};

const deleteKitchen = async ({ shopId, kitchenId, userId }) => {
  const kitchen = await Kitchen.findOneAndDelete({ _id: kitchenId, shop: shopId });
  throwBadRequest(!kitchen, getMessageByLocale({ key: 'kitchen.notFound' }));

  const kitchenJson = kitchen.toJSON();
  notifyUpdateKitchen({
    action: EventActionType.DELETE,
    kitchen: kitchenJson,
    userId,
  });
  return kitchenJson;
};

module.exports = {
  getKitchen,
  createKitchen,
  updateKitchen,
  deleteKitchen,
  getKitchens,
};
