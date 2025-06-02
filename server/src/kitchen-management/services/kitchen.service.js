const _ = require('lodash');
const { Kitchen } = require('../../models');
const { throwBadRequest } = require('../../utils/errorHandling');
const { notifyUpdateKitchen, EventActionType } = require('../../utils/awsUtils/appSync.utils');
const { getMessageByLocale } = require('../../locale');
const { getKitchenFromCache, getKitchensFromCache } = require('../../metadata/kitchenMetadata.service');
const { Status } = require('../../utils/constant');
const { getOperatorFromSession } = require('../../middlewares/clsHooked');

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

  const operator = getOperatorFromSession();
  await notifyUpdateKitchen({
    action: EventActionType.CREATE,
    kitchen,
    userId: _.get(operator, 'user.id'),
  });
  return kitchen;
};

const updateKitchen = async ({ shopId, kitchenId, updateBody }) => {
  const kitchen = await Kitchen.update({
    where: {
      id: kitchenId,
      shopId,
    },
    data: { ...updateBody, shopId },
  });
  throwBadRequest(!kitchen, getMessageByLocale({ key: 'kitchen.notFound' }));

  const operator = getOperatorFromSession();
  await notifyUpdateKitchen({
    action: EventActionType.UPDATE,
    kitchen,
    userId: _.get(operator, 'user.id'),
  });
  return kitchen;
};

const deleteKitchen = async ({ shopId, kitchenId }) => {
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

  const operator = getOperatorFromSession();
  await notifyUpdateKitchen({
    action: EventActionType.DELETE,
    kitchen,
    userId: _.get(operator, 'user.id'),
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
