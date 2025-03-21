const { Unit } = require('../../models');
const { throwBadRequest } = require('../../utils/errorHandling');
const { getUnitFromCache, getUnitsFromCache } = require('../../metadata/unitMetadata.service');

const getUnit = async ({ shopId, unitId }) => {
  const unit = await getUnitFromCache({ shopId, unitId });
  throwBadRequest(!unit, 'Không tìm thấy đơn vị');
  return unit;
};

const getUnits = async ({ shopId }) => {
  const units = await getUnitsFromCache({ shopId });
  return units;
};

const createUnit = async ({ shopId, createBody }) => {
  // eslint-disable-next-line no-param-reassign
  createBody.shop = shopId;
  const unit = await Unit.create(createBody);
  return unit;
};

const createDefaultUnits = async ({ shopId }) => {
  await Unit.createDefaultUnits(shopId);
  const units = await getUnits({ shopId });
  return units;
};

const updateUnit = async ({ shopId, unitId, updateBody }) => {
  // eslint-disable-next-line no-param-reassign
  updateBody.shop = shopId;
  const unit = await Unit.findByIdAndUpdate({ unitId, shop: shopId }, { $set: updateBody }, { new: true });
  throwBadRequest(!unit, 'Không tìm thấy đơn vị');
  return unit;
};

const deleteUnit = async ({ shopId, unitId }) => {
  await Unit.deleteOne({ _id: unitId, shop: shopId });
};

module.exports = {
  getUnit,
  createUnit,
  createDefaultUnits,
  updateUnit,
  deleteUnit,
  getUnits,
};
