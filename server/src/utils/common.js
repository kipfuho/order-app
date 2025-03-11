const _ = require('lodash');
const moment = require('moment-timezone');
const { getRestaurantTimeZone, getRestaurantCurrency, getRestaurantFromSession } = require('../middlewares/clsHooked');
const constant = require('./constant');

const sleep = (msec) => new Promise((resolve) => setTimeout(resolve, msec));

const getStartTimeOfToday = ({ timezone = 'UTC', reportTime = 0 }) =>
  moment().tz(timezone).subtract(reportTime, 'hours').startOf('day').add(reportTime, 'hours').toDate();

const formatDateTime = ({ dateTime, format, timeZone }) => {
  moment.locale('en');
  if (!timeZone) {
    // eslint-disable-next-line no-param-reassign
    timeZone = getRestaurantTimeZone();
  }

  // eslint-disable-next-line no-param-reassign
  return moment(dateTime).tz(timeZone).format(format);
};

const formatDateDDMMYYYY = (dateTime, timeZone) => formatDateTime({ dateTime, timeZone, format: 'DD/MM/YYYY' });

const getCurrencyPrecision = (currency) => {
  if (!currency) {
    // eslint-disable-next-line no-param-reassign
    currency = getRestaurantCurrency();
  }

  return constant.CurrencySetting[currency];
};

const _getRoundPrice = (price, type) => {
  let p = 0;
  try {
    const restaurant = getRestaurantFromSession();
    p = getCurrencyPrecision({ country: _.get(restaurant, 'country.currency') });
    switch (_.get(restaurant, type)) {
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
 * eg: get restaurantId tu orderSession. co the restaurantId la object do populate.
 * const restaurantId = getStringId({ object: orderSession, key: 'restaurantId' });
 */
const getStringId = ({ object, key }) => {
  const id = _.get(object, `${key}.id`);
  if (id && typeof id === 'string') {
    return id;
  }
  const value = _.get(object, `${key}._id`) || _.get(object, key);
  return _.toString(value);
};

module.exports = {
  sleep,
  getStartTimeOfToday,
  formatDateDDMMYYYY,
  getRoundDishPrice,
  getRoundDiscountAmount,
  getRoundTaxAmount,
  getStringId,
};
