import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import * as Localization from "expo-localization";

import en from "./en.json";
import vi from "./vi.json";

const resources = {
  en: { translation: en },
  vi: { translation: vi },
};

const fallbackLng = "en";

i18n.use(initReactI18next).init({
  resources,
  lng: Localization.getLocales()[0].languageTag,
  fallbackLng,
  compatibilityJSON: "v4",
  interpolation: {
    escapeValue: false, // React already escapes by default
  },
});

export default i18n;
