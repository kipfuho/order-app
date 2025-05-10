const _ = require('lodash');
const redisClient = require('../utils/redis');
const { getSession, setSession } = require('../middlewares/clsHooked');
const { Unit } = require('../models');
const { getUnitKey } = require('./common');
const constant = require('../utils/constant');

const _getUnitFromClsHook = ({ key }) => {
  const unit = getSession({ key });
  return unit;
};

const getUnitFromCache = async ({ shopId, unitId }) => {
  // eslint-disable-next-line no-param-reassign
  unitId = _.toString(unitId);
  const key = getUnitKey({ shopId });
  const clsHookUnits = _getUnitFromClsHook({ key });
  if (!_.isEmpty(clsHookUnits)) {
    return _.find(clsHookUnits, (unit) => unit.id === unitId);
  }

  if (redisClient.isRedisConnected()) {
    const units = await redisClient.getJson(key);
    if (!_.isEmpty(units)) {
      setSession({ key, value: units });
      return _.find(units, (unit) => unit.id === unitId);
    }
  }

  const unit = await Unit.findOne({ _id: unitId, shop: shopId, status: { $ne: constant.Status.disabled } });
  if (!unit) {
    return null;
  }
  const unitJson = unit.toJSON();
  return unitJson;
};

const getUnitsFromCache = async ({ shopId }) => {
  const key = getUnitKey({ shopId });
  const clsHookUnits = _getUnitFromClsHook({ key });
  if (!_.isEmpty(clsHookUnits)) {
    return clsHookUnits;
  }

  if (redisClient.isRedisConnected()) {
    const units = await redisClient.getJson(key);
    if (!_.isEmpty(units)) {
      setSession({ key, value: units });
      return units;
    }

    const unitModels = await Unit.find({ shop: shopId, status: { $ne: constant.Status.disabled } });
    const unitJsons = _.map(unitModels, (unit) => unit.toJSON());
    redisClient.putJson({ key, jsonVal: unitJsons });
    setSession({ key, value: unitJsons });
    return unitJsons;
  }

  const units = await Unit.find({ shop: shopId, status: { $ne: constant.Status.disabled } });
  const unitJsons = _.map(units, (unit) => unit.toJSON());
  setSession({ key, value: unitJsons });
  return unitJsons;
};

module.exports = {
  getUnitFromCache,
  getUnitsFromCache,
};
