const _ = require('lodash');
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

const createKitchen = async ({ shopId, createBody }) => {
  const kitchen = await Kitchen.create({
    data: {
      ...createBody,
      shopId,
    },
  });

  await notifyUpdateKitchen({
    action: EventActionType.CREATE,
    shopId,
    kitchen,
  });
  return kitchen;
};

const updateKitchen = async ({ shopId, kitchenId, updateBody }) => {
  const kitchen = await getKitchenFromCache({ shopId, kitchenId });
  throwBadRequest(!kitchen, getMessageByLocale({ key: 'kitchen.notFound' }));

  const compactUpdateBody = _.pickBy({ ...updateBody, shopId });
  await Kitchen.update({
    where: {
      id: kitchenId,
      shopId,
    },
    data: compactUpdateBody,
    select: {
      id: true,
    },
  });

  const modifiedFields = { id: kitchenId };
  Object.entries(compactUpdateBody).forEach(([key, value]) => {
    if (!_.isEqual(value, kitchen[key])) {
      modifiedFields[key] = value;
    }
  });

  await notifyUpdateKitchen({
    action: EventActionType.UPDATE,
    shopId,
    kitchen: modifiedFields,
  });
  return kitchen;
};

const deleteKitchen = async ({ shopId, kitchenId }) => {
  const kitchen = await getKitchenFromCache({ kitchenId, shopId });
  throwBadRequest(!kitchen, getMessageByLocale({ key: 'kitchen.notFound' }));
  await Kitchen.update({
    data: {
      status: Status.disabled,
    },
    where: {
      id: kitchenId,
      shopId,
    },
    select: { id: true },
  });

  await notifyUpdateKitchen({
    action: EventActionType.DELETE,
    shopId,
    kitchen: { id: kitchenId },
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
