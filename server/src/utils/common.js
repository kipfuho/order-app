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
};
