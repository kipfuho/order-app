const _ = require('lodash');
const { AsyncLocalStorage } = require('async_hooks');
const logger = require('../config/logger');
const { Countries, Language } = require('../utils/constant');

const asyncLocalStorage = new AsyncLocalStorage();

const alsHooked = (req, res, next) => {
  if (req.method === 'OPTIONS') {
    return next();
  }

  const store = new Map();
  store.set('clientLanguage', _.get(req, 'headers.lang') || Language.vietnamese);
  store.set('path', _.get(req, 'path') || '');
  asyncLocalStorage.run(store, () => {
    next();
  });
};

const getSession = ({ key }) => {
  try {
    const store = asyncLocalStorage.getStore();
    if (store && store.has(key)) {
      return store.get(key);
    }
    return null;
  } catch (err) {
    const message = `error get session errStack = ${err.stack}. `;
    logger.error(message);
    return null;
  }
};

const setSession = ({ key, value }) => {
  try {
    const store = asyncLocalStorage.getStore();
    if (store) {
      store.set(key, value);
      return true;
    }
    return false;
  } catch (err) {
    const message = `error set session errStack = ${err.stack}.`;
    logger.error(message);
    return false;
  }
};

const setOperatorToSession = ({ user, employee, permissions }) => {
  setSession({ key: 'operator', value: _.pickBy({ user, employee, permissions }) });
};

const getOperatorFromSession = () => {
  return getSession({ key: 'operator' }) || {};
};

const setClientIdToSession = ({ clientId }) => {
  setSession({ key: 'clientId', value: clientId });
};

const getClientIdFromSession = () => {
  return getSession({ key: 'clientId' }) || '';
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

const runInAsyncContext = (fn, initialData = {}) => {
  const store = new Map();

  Object.entries(initialData).forEach(([key, value]) => {
    store.set(key, value);
  });
  return asyncLocalStorage.run(store, fn);
};

const getCurrentStore = () => {
  return asyncLocalStorage.getStore();
};

const hasActiveContext = () => {
  return asyncLocalStorage.getStore() !== undefined;
};

module.exports = {
  alsHooked,
  setSession,
  getSession,
  setShopToSession,
  getShopFromSession,
  getShopCurrency,
  getShopTimeZone,
  getShopCountry,
  getShopLang,
  setOperatorToSession,
  getOperatorFromSession,
  setClientIdToSession,
  getClientIdFromSession,
  getClientLanguageWithHook,
  runInAsyncContext,
  getCurrentStore,
  hasActiveContext,
  asyncLocalStorage,
};
