const _ = require('lodash');
const { createNamespace, getNamespace } = require('cls-hooked');
const logger = require('../config/logger');
const { Countries, SESSION_NAME_SPACE, Language } = require('../utils/constant');

if (!getNamespace(SESSION_NAME_SPACE)) {
  createNamespace(SESSION_NAME_SPACE);
}
const CLS_HOOK_KEYS = 'ALL_CLS_HOOK_KEY';

const clsHooked = (req, res, next) => {
  if (req.method === 'OPTIONS') {
    return;
  }
  let clsSession;
  if (!getNamespace(SESSION_NAME_SPACE)) {
    clsSession = createNamespace(SESSION_NAME_SPACE);
  } else {
    clsSession = getNamespace(SESSION_NAME_SPACE);
  }
  clsSession.run(() => {
    clsSession.set('clientLanguage', _.get(req, 'headers.lang') || Language.english);
    clsSession.set('path', _.get(req, 'path') || '');
    next();
  });
};

const getSession = ({ key }) => {
  try {
    const clsSession = getNamespace(SESSION_NAME_SPACE);
    if (clsSession) {
      return clsSession.get(key);
    }
    return null;
  } catch (err) {
    const message = `error set session errStack = ${err.stack}. `;
    logger.error(message);
  }
};

const _putKeysForAllClsHook = (key) => {
  try {
    const clsSession = getNamespace(SESSION_NAME_SPACE);
    let clsHookAllKeys = getSession({ key: CLS_HOOK_KEYS }) || [];
    clsHookAllKeys = [...clsHookAllKeys, key];
    clsHookAllKeys = _.uniq(clsHookAllKeys);
    clsSession.set(CLS_HOOK_KEYS, clsHookAllKeys);
    // eslint-disable-next-line
  } catch (err) {}
};

const setSession = ({ key, value }) => {
  try {
    const clsSession = getNamespace(SESSION_NAME_SPACE);
    if (clsSession) {
      clsSession.set(key, value);
    }
    _putKeysForAllClsHook(key);
    return true;
  } catch (err) {
    const message = `error set session errStack = ${err.stack}.`;
    logger.error(message);
    return false;
  }
};

const setEmployeePermissions = (permissions) => {
  setSession({ key: 'permissions', value: permissions });
};

const getEmployeePermissions = () => {
  return getSession({ key: 'permissions' }) || [];
};

const setRestaurantToSession = (restaurantJson) => {
  return setSession({ key: 'restaurant', value: restaurantJson });
};

const getRestaurantFromSession = () => {
  return getSession({ key: 'restaurant' });
};

const getRestaurantTimeZone = () => {
  const restaurant = getRestaurantFromSession();
  const utcOffSet = _.get(restaurant, 'utcOffset') || 7;
  if (utcOffSet === 9) {
    return 'Asia/Tokyo';
  }

  if (utcOffSet === 7) {
    return 'Asia/Ho_Chi_Minh';
  }
  if (_.get(restaurant, 'timezone')) {
    return restaurant.timezone;
  }
  return 'Asia/Ho_Chi_Minh';
};

const getRestaurantCountry = () => {
  const restaurant = getRestaurantFromSession();
  return _.get(restaurant, 'country.name') || Countries.VietNam.name;
};

const getRestaurantCurrency = () => {
  const restaurant = getRestaurantFromSession();
  return _.get(restaurant, 'country.currency') || Countries.VietNam.currency;
};

const getRestaurantLang = () => {
  const restaurant = getRestaurantFromSession();
  const country = _.get(restaurant, 'country.name');
  if (country === Countries.VietNam.name) {
    return 'vi';
  }
  return 'en';
};

const getClientLanguageWithHook = () => {
  return getSession({ key: 'clientLanguage' }) || getRestaurantLang();
};

module.exports = {
  clsHooked,
  setSession,
  getSession,
  setRestaurantToSession,
  getRestaurantFromSession,
  getRestaurantCurrency,
  getRestaurantTimeZone,
  getRestaurantCountry,
  getRestaurantLang,
  setEmployeePermissions,
  getEmployeePermissions,
  getClientLanguageWithHook,
};
