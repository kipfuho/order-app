const _ = require('lodash');
const fs = require('fs');
const { getClientLanguageWithHook } = require('../middlewares/clsHooked');

const vi = JSON.parse(fs.readFileSync('./src/locale/vi/locale.json', 'utf8'));
const en = JSON.parse(fs.readFileSync('./src/locale/en/locale.json', 'utf8'));

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
