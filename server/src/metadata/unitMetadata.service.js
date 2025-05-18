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
    const unitsCache = await redisClient.getJson(key);
    if (!_.isEmpty(unitsCache)) {
      setSession({ key, value: unitsCache });
      return _.find(unitsCache, (unit) => unit.id === unitId);
    }
  }

  const unit = await Unit.findUnique({
    where: {
      id: unitId,
      shopId,
      status: { not: constant.Status.disabled },
    },
  });
  return unit;
};

const getUnitsFromCache = async ({ shopId }) => {
  const key = getUnitKey({ shopId });
  const clsHookUnits = _getUnitFromClsHook({ key });
  if (!_.isEmpty(clsHookUnits)) {
    return clsHookUnits;
  }

  if (redisClient.isRedisConnected()) {
    const unitsCache = await redisClient.getJson(key);
    if (!_.isEmpty(unitsCache)) {
      setSession({ key, value: unitsCache });
      return unitsCache;
    }

    const units = await Unit.findMany({
      where: {
        shopId,
        status: { not: constant.Status.disabled },
      },
    });
    redisClient.putJson({ key, jsonVal: units });
    setSession({ key, value: units });
    return units;
  }

  const units = await Unit.findMany({
    where: {
      shopId,
      status: { not: constant.Status.disabled },
    },
  });
  setSession({ key, value: units });
  return units;
};

module.exports = {
  getUnitFromCache,
  getUnitsFromCache,
};
