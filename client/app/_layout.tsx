import "react-native-get-random-values";
import { useEffect } from "react";
import { Provider as ReduxProvider, useSelector } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import "react-native-reanimated";
import { PaperProvider } from "react-native-paper";
import store, { persistor, RootState } from "@stores/store";
import { Amplify } from "aws-amplify";
import { AmplifyConfig } from "../amplify_outputs";
import Toast from "react-native-toast-message";
import { I18nextProvider, useTranslation } from "react-i18next";
import i18n from "@locales/i18n";
import { darkTheme, lightTheme } from "@constants/theme";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { enGB, registerTranslation } from "react-native-paper-dates";
import { TimeProvider } from "@/hooks/useCurrentTime";

Amplify.configure(AmplifyConfig);

// Prevent splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

// date picker
registerTranslation("en", enGB);
registerTranslation("vi", {
  save: "Lưu",
  selectSingle: "Chọn ngày",
  selectMultiple: "Chọn nhiều ngày",
  selectRange: "Chọn khoảng thời gian",
  notAccordingToDateFormat: (inputFormat) =>
    `Định dạng ngày phải là ${inputFormat}`,
  mustBeHigherThan: (date) => `Phải sau ngày ${date}`,
  mustBeLowerThan: (date) => `Phải trước ngày ${date}`,
  mustBeBetween: (startDate, endDate) =>
    `Phải nằm trong khoảng từ ${startDate} đến ${endDate}`,
  dateIsDisabled: "Ngày này không được phép chọn",
  previous: "Trước",
  next: "Tiếp theo",
  typeInDate: "Nhập ngày",
  pickDateFromCalendar: "Chọn ngày từ lịch",
  close: "Đóng",
  hour: "Giờ",
  minute: "Phút",
});

function ThemeLayout() {
  const { darkMode, locale } = useSelector((state: RootState) => state.setting);
  const theme = darkMode ? darkTheme : lightTheme;
  const { i18n } = useTranslation();

  useEffect(() => {
    i18n.changeLanguage(locale);
  }, [i18n, locale]);

  return (
    <PaperProvider theme={theme}>
      <Stack screenOptions={{ headerShown: false }} />
      <Toast />
    </PaperProvider>
  );
}

export default function RootLayout() {
  useEffect(() => {
    // Hide splash screen once assets are loaded
    SplashScreen.hideAsync();
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ReduxProvider store={store}>
        <PersistGate loading={null} persistor={persistor}>
          <I18nextProvider i18n={i18n}>
            <TimeProvider>
              <ThemeLayout />
            </TimeProvider>
          </I18nextProvider>
        </PersistGate>
      </ReduxProvider>
    </GestureHandlerRootView>
  );
}
