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

const formatDateDDMMYYYY = (dateTime, timeZone) => formatDateTime({ dateTime, timeZone, format: 'DD/MM/YYYY' });
const formatDateHHMMDDMMYYYY = (dateTime, timeZone) => formatDateTime({ dateTime, timeZone, format: 'HH:mm DD/MM/YYYY' });

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

const getRoundPaymentAmount = (amount) => {
  return _getRoundPrice(amount, 'taxRoundingType');
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
 * Creates a query options for date.
 * @params: from date ( ex: 2021-11-02)
 * @params: to date ( ex: 2021-11-03)
 * Tinh theo timezone, khong tinh report time
 */
const createSearchByDateOptionWithShopTimezone = ({ from, to, filterKey = 'createdAt' }) => {
  const timezone = getShopTimeZone();
  const options = {};

  if (!to) {
    // eslint-disable-next-line no-param-reassign
    to = new Date();
  }
  if (!from) {
    // eslint-disable-next-line no-param-reassign
    from = to;
  }
  if (from) {
    // start of day
    const fromDate = moment(from).tz(timezone).startOf('day').toDate();
    options[filterKey] = { ...options[filterKey], gte: fromDate };
  }
  if (to) {
    // end of day
    const toDate = moment(to).tz(timezone).endOf('day').toDate();
    options[filterKey] = { ...options[filterKey], lte: toDate };
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

const getReportPeriod = (period) => {
  if (period === constant.ReportPeriod.MONTH) return 30;
  if (period === constant.ReportPeriod.WEEK) return 7;
  return 1;
};

/**
 * Divides an amount into `n` parts proportionally, ensuring the total of all parts equals the original sum.
 * Currency precision is handled to support different currencies like VND, JPY, USD, etc.
 *
 * @param {Object} params - The function parameters.
 * @param {number} params.initialSum - The total amount to be divided.
 * @param {number[]} params.parts - An array of proportional weights for each part.
 * @param {number} params.precision - The number of decimal places to round each part (e.g., 0 for VND/JPY, 2 for USD).
 * @returns {number[]} - An array of values representing the divided parts of the initial sum.
 */
const divideToNPart = ({ initialSum, parts, precision }) => {
  const totalPartWeight = parts.reduce((sum, part) => sum + part, 0);
  if (totalPartWeight === 0) {
    return parts.map(() => 0);
  }
  if (precision === null || precision === undefined) {
    // eslint-disable-next-line no-param-reassign
    precision = getCurrencyPrecision();
  }

  let dividedParts = parts.map((part) => [(initialSum * part) / totalPartWeight, part]);
  const dividedPartByKey = _.keyBy(dividedParts, (part) => part[1]);

  dividedParts = dividedParts.sort((value1, value2) => {
    const fraction1 = value1[0] - _.floor(value1[0], precision);
    const fraction2 = value2[0] - _.floor(value2[0], precision);
    return fraction1 - fraction2;
  });
  dividedParts.forEach((value) => {
    // eslint-disable-next-line no-param-reassign
    value[0] = _.round(value[0], precision);
  });
  const roundedSum = dividedParts.reduce((sum, arr) => sum + arr[0], 0);
  let difference = initialSum - roundedSum;

  // Chỉnh lại tiền thành phần nếu cộng lại không bằng tổng ban đầu
  const offset = 10 ** -precision;
  for (let i = 0; difference !== 0; i += 1) {
    const adjustment = difference > 0 ? offset : -offset;
    dividedParts[i % dividedParts.length][0] += adjustment;
    difference -= adjustment;
    // Làm tròn lại để tránh loop vô hạn do floating point
    difference = _.round(difference, precision);
  }

  return parts.map((part) => dividedPartByKey[part][0]);
};

const normalizeVietnamese = (str) => {
  return str
    .toLowerCase()
    .normalize('NFD') // separate base characters and accents
    .replace(/[\u0300-\u036f]/g, '') // remove diacritical marks
    .replace(/đ/g, 'd') // replace đ
    .replace(/[^a-z0-9\s]/g, '') // remove punctuation/special chars if needed
    .replace(/\s+/g, ' ') // collapse multiple spaces
    .trim(); // remove leading/trailing spaces
};

module.exports = {
  sleep,
  getStartTimeOfToday,
  formatDateDDMMYYYY,
  formatDateHHMMDDMMYYYY,
  getRoundDishPrice,
  getRoundDiscountAmount,
  getRoundTaxAmount,
  getRoundPaymentAmount,
  refineFileNameForUploading,
  formatOrderSessionNo,
  createSearchByDateOptionWithShopTimezone,
  getDayOfWeek,
  sortObject,
  getReportPeriod,
  divideToNPart,
  normalizeVietnamese,
};
