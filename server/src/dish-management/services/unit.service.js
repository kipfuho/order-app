const { Unit } = require('../../models');
const { throwBadRequest } = require('../../utils/errorHandling');
const { getUnitFromCache, getUnitsFromCache } = require('../../metadata/unitMetadata.service');
const { getMessageByLocale } = require('../../locale');
const { Status } = require('../../utils/constant');

const getUnit = async ({ shopId, unitId }) => {
  const unit = await getUnitFromCache({ shopId, unitId });
  throwBadRequest(!unit, getMessageByLocale({ key: 'unit.notFound' }));
  return unit;
};

const getUnits = async ({ shopId }) => {
  const units = await getUnitsFromCache({ shopId });
  return units;
};

const createUnit = async ({ shopId, createBody }) => {
  const unit = await Unit.create({
    data: {
      ...createBody,
      shopId,
    },
  });
  return unit;
};

const createDefaultUnits = async ({ shopId }) => {
  await Unit.createDefaultUnits(shopId);
  const units = await getUnits({ shopId });
  return units;
};

const updateUnit = async ({ shopId, unitId, updateBody }) => {
  const unit = await Unit.update({
    data: {
      ...updateBody,
      shopId,
    },
    where: { id: unitId, shopId },
    select: { id: true },
  });
  throwBadRequest(!unit, getMessageByLocale({ key: 'unit.notFound' }));
};

const deleteUnit = async ({ shopId, unitId }) => {
  await Unit.update({
    data: { status: Status.disabled },
    where: {
      id: unitId,
      shopId,
    },
    select: { id: 1 },
  });
};

module.exports = {
  getUnit,
  createUnit,
  createDefaultUnits,
  updateUnit,
  deleteUnit,
  getUnits,
};
