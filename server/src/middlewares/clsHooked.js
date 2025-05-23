const _ = require('lodash');
const mongoose = require('mongoose');
const { createNamespace, getNamespace } = require('cls-hooked');
const logger = require('../config/logger');
const { Countries, SESSION_NAME_SPACE, Language } = require('../utils/constant');

if (!getNamespace(SESSION_NAME_SPACE)) {
  createNamespace(SESSION_NAME_SPACE);
}
const CLS_HOOK_KEYS = 'ALL_CLS_HOOK_KEY';

// Patch Mongoose to use the namespace
const bindMongooseToCLS = (clsSession) => {
  mongoose.Query.prototype.exec = clsSession.bind(mongoose.Query.prototype.exec);
  mongoose.Aggregate.prototype.exec = clsSession.bind(mongoose.Aggregate.prototype.exec);
};

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
  bindMongooseToCLS(clsSession);

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

const setShopToSession = (shopJson) => {
  return setSession({ key: 'shop', value: shopJson });
};

const getShopFromSession = () => {
  return getSession({ key: 'shop' });
};

const getShopTimeZone = () => {
  const shop = getShopFromSession();
  const utcOffSet = _.get(shop, 'utcOffset') || 7;
  if (utcOffSet === 9) {
    return 'Asia/Tokyo';
  }

  if (utcOffSet === 7) {
    return 'Asia/Ho_Chi_Minh';
  }
  if (_.get(shop, 'timezone')) {
    return shop.timezone;
  }
  return 'Asia/Ho_Chi_Minh';
};

const getShopCountry = () => {
  const shop = getShopFromSession();
  return _.get(shop, 'country.name') || Countries.VietNam.name;
};

const getShopCurrency = () => {
  const shop = getShopFromSession();
  return _.get(shop, 'country.currency') || Countries.VietNam.currency;
};

const getShopLang = () => {
  const shop = getShopFromSession();
  const country = _.get(shop, 'country.name');
  if (country === Countries.VietNam.name) {
    return 'vi';
  }
  return 'en';
};

const getClientLanguageWithHook = () => {
  return getSession({ key: 'clientLanguage' }) || getShopLang();
};

module.exports = {
  clsHooked,
  bindMongooseToCLS,
  setSession,
  getSession,
  setShopToSession,
  getShopFromSession,
  getShopCurrency,
  getShopTimeZone,
  getShopCountry,
  getShopLang,
  setEmployeePermissions,
  getEmployeePermissions,
  getClientLanguageWithHook,
};
