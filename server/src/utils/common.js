const _ = require('lodash');
const moment = require('moment-timezone');
const { getShopTimeZone, getShopCurrency, getShopFromSession } = require('../middlewares/clsHooked');
const constant = require('./constant');

const sleep = (msec) => new Promise((resolve) => setTimeout(resolve, msec));

const getStartTimeOfToday = ({ timezone = 'UTC', reportTime = 0 }) =>
  moment().tz(timezone).subtract(reportTime, 'hours').startOf('day').add(reportTime, 'hours').toDate();

const formatDateTime = ({ dateTime, format, timeZone }) => {
  moment.locale('en');
  if (!timeZone) {
    // eslint-disable-next-line no-param-reassign
    timeZone = getShopTimeZone();
  }

  // eslint-disable-next-line no-param-reassign
  return moment(dateTime).tz(timeZone).format(format);
};

const formatDateDDMMYYYY = (dateTime, timeZone) => formatDateTime({ dateTime, timeZone, format: 'HH:MM DD/MM/YYYY' });
const formatDateHHMMDDMMYYYY = (dateTime, timeZone) => formatDateTime({ dateTime, timeZone, format: 'HH:MM DD/MM/YYYY' });

const getCurrencyPrecision = (currency) => {
  if (!currency) {
    // eslint-disable-next-line no-param-reassign
    currency = getShopCurrency();
  }

  return constant.CurrencySetting[currency];
};

const _getRoundPrice = (price, type) => {
  let p = 0;
  try {
    const shop = getShopFromSession();
    p = getCurrencyPrecision({ country: _.get(shop, 'country.currency') });
    switch (_.get(shop, type)) {
      case constant.RoundingPaymentType.FLOOR:
        return _.floor(price, p);
      case constant.RoundingPaymentType.CEIL:
        return _.ceil(price, p);
      default:
        return _.round(price, p);
    }
  } catch (err) {
    return _.round(price, p);
  }
};

const getRoundDishPrice = (amount) => {
  return _getRoundPrice(amount, 'dishPriceRoundingType');
};

const getRoundDiscountAmount = (amount) => {
  return _getRoundPrice(amount, 'discountRoundingType');
};

const getRoundTaxAmount = (amount) => {
  return _getRoundPrice(amount, 'taxRoundingType');
};

/*
 * eg: get shopId tu orderSession. co the shopId la object do populate.
 * const shopId = getStringId({ object: orderSession, key: 'shopId' });
 */
const getStringId = ({ object, key }) => {
  const id = _.get(object, `${key}.id`);
  if (id && typeof id === 'string') {
    return id;
  }
  const value = _.get(object, `${key}._id`) || _.get(object, key);
  return _.toString(value);
};

const refineFileNameForUploading = (fileName) => {
  const splits = (fileName || '').split('.');
  const ext = splits.pop();
  const baseName = splits.join('.').replace(/[`~!@#$%^&*()_|+\-=?;:'",.<>{}[\]\\/]/gi, '_');
  if (ext) {
    return `${baseName}.${ext}`;
  }
  return baseName;
};

const formatIntegerWithZeroPadding = (num, places) => String(num).padStart(places, '0');

const formatDateTimeToISOString = (dateTime) => {
  try {
    const timeZone = getShopTimeZone();
    return moment(dateTime)
      .tz(timeZone)
      .toISOString(true)
      .replace(/\+0\d:00/, 'Z');
  } catch (err) {
    return dateTime.toISOString();
  }
};

const formatOrderSessionNo = (orderSessionJson) => {
  try {
    const orderSessionNo = _.get(orderSessionJson, 'orderSessionNo', 0);
    const orderSessionNoWithPadding = formatIntegerWithZeroPadding(orderSessionNo, 4);

    let createdAt = _.get(orderSessionJson, 'createdAt');
    if (createdAt instanceof Date) {
      createdAt = formatDateTimeToISOString(createdAt);
    }
    return `${createdAt.substring(0, 10).split('-').join('')}-${orderSessionNoWithPadding}`;
  } catch (err) {
    return '';
  }
};

/**
 * Creates a query options for date in mongoose.
 * @params: from date ( ex: 2021-11-02)
 * @params: to date ( ex: 2021-11-03)
 * Tinh theo timezone, khong tinh report time
 */
const createSearchByDateOptionWithShopTimezone = ({ from, to, filterKey = 'createdAt' }) => {
  const timezone = getShopTimeZone();
  const options = {};

  if (!from) {
    // eslint-disable-next-line no-param-reassign
    from = new Date();
    // eslint-disable-next-line no-param-reassign
    to = new Date();
  }
  if (from) {
    // start of day
    const fromDate = moment(from).tz(timezone).startOf('day').toDate();
    options[filterKey] = { ...options[filterKey], $gte: fromDate };
  }
  if (to) {
    // end of day
    const toDate = moment(to).tz(timezone).endOf('day').toDate();
    options[filterKey] = { ...options[filterKey], $lte: toDate };
  }

  return options;
};

const getDayOfWeek = (date) => {
  const day = new Date(date).getDay();
  return day;
};

function sortObject(obj) {
  const sorted = {};
  const str = [];
  let key;
  // eslint-disable-next-line no-restricted-syntax
  for (key in obj) {
    // eslint-disable-next-line no-prototype-builtins
    if (obj.hasOwnProperty(key)) {
      str.push(encodeURIComponent(key));
    }
  }
  str.sort();
  for (key = 0; key < str.length; key += 1) {
    sorted[str[key]] = encodeURIComponent(obj[str[key]]).replace(/%20/g, '+');
  }
  return sorted;
}

module.exports = {
  sleep,
  getStartTimeOfToday,
  formatDateDDMMYYYY,
  formatDateHHMMDDMMYYYY,
  getRoundDishPrice,
  getRoundDiscountAmount,
  getRoundTaxAmount,
  getStringId,
  refineFileNameForUploading,
  formatOrderSessionNo,
  createSearchByDateOptionWithShopTimezone,
  getDayOfWeek,
  sortObject,
};
