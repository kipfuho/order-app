const _ = require('lodash');
const path = require('path');
const fs = require('fs');
const { getClientLanguageWithHook } = require('../middlewares/clsHooked');

const loadLocale = (lang) => {
  const filePath = path.join(__dirname, lang, 'locale.json');
  // eslint-disable-next-line security/detect-non-literal-fs-filename
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
};

const en = loadLocale('en');
const vi = loadLocale('vi');

const getMessageByLocale = ({ key, lang }) => {
  const allMessage = { vi, en };
  if (!lang) {
    // eslint-disable-next-line no-param-reassign
    lang = getClientLanguageWithHook();
  }
  const targetLanguageMessage = _.get(allMessage, lang) || en;
  return _.get(targetLanguageMessage, key);
};

const getMessageByLocaleWithReplacing = ({ key, lang, repList = [] }) => {
  const s = getMessageByLocale({ key, lang });
  if (s) {
    let i = 0;
    // eslint-disable-next-line no-plusplus
    return s.replace(/%s/g, () => repList[i++] || '');
  }
  return s;
};

module.exports = {
  getMessageByLocale,
  getMessageByLocaleWithReplacing,
};
