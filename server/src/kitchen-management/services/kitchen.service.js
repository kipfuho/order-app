const { Kitchen } = require('../../models');
const { throwBadRequest } = require('../../utils/errorHandling');
const { notifyUpdateKitchen, EventActionType } = require('../../utils/awsUtils/appSync.utils');
const { getMessageByLocale } = require('../../locale');
const { getKitchenFromCache, getKitchensFromCache } = require('../../metadata/kitchenMetadata.service');
const { Status } = require('../../utils/constant');

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
  const kitchen = await Kitchen.create({
    data: {
      ...createBody,
      shopId,
    },
  });

  notifyUpdateKitchen({
    action: EventActionType.CREATE,
    kitchen,
    userId,
  });
  return kitchen;
};

const updateKitchen = async ({ shopId, kitchenId, updateBody, userId }) => {
  const kitchen = await Kitchen.update({
    where: {
      id: kitchenId,
      shopId,
    },
    data: { ...updateBody, shopId },
  });
  throwBadRequest(!kitchen, getMessageByLocale({ key: 'kitchen.notFound' }));

  notifyUpdateKitchen({
    action: EventActionType.UPDATE,
    kitchen,
    userId,
  });
  return kitchen;
};

const deleteKitchen = async ({ shopId, kitchenId, userId }) => {
  const kitchen = await Kitchen.update({
    data: {
      status: Status.disabled,
    },
    where: {
      id: kitchenId,
      shopId,
    },
  });
  throwBadRequest(!kitchen, getMessageByLocale({ key: 'kitchen.notFound' }));

  notifyUpdateKitchen({
    action: EventActionType.DELETE,
    kitchen,
    userId,
  });
  return kitchen;
};

module.exports = {
  getKitchen,
  createKitchen,
  updateKitchen,
  deleteKitchen,
  getKitchens,
};
