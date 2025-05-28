import { ReactNode, useState } from "react";
import { Appbar, Menu } from "react-native-paper";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@stores/store";
import { setLocale, toggleDarkMode } from "@stores/appSetting.slice";

export function AppBar({
  title,
  goBack,
  actions,
  children,
}: {
  title?: string;
  goBack?: () => void;
  actions?: ReactNode;
  children?: ReactNode;
}) {
  const dispatch = useDispatch();
  const { darkMode, locale } = useSelector((state: RootState) => state.setting);
  const [menuVisible, setMenuVisible] = useState(false);

  const toggleLocale = (lang: "vi" | "en") => {
    dispatch(setLocale(lang));
    setMenuVisible(false);
  };

  const onThemeClick = () => {
    dispatch(toggleDarkMode());
    // Integrate with your theming system if needed
  };

  return (
    <Appbar.Header style={{ height: 60, paddingHorizontal: 8 }}>
      {goBack && <Appbar.BackAction onPress={goBack} size={20} />}
      {title && <Appbar.Content title={title} titleStyle={{ fontSize: 16 }} />}
      {actions}
      <Menu
        visible={menuVisible}
        onDismiss={() => setMenuVisible(false)}
        anchor={
          <Appbar.Action
            icon="earth"
            onPress={() => setMenuVisible(true)}
            accessibilityLabel="Language"
          />
        }
      >
        <Menu.Item
          onPress={() => toggleLocale("vi")}
          title="Tiếng Việt"
          leadingIcon={locale === "vi" ? "check" : undefined}
        />
        <Menu.Item
          onPress={() => toggleLocale("en")}
          title="English"
          leadingIcon={locale === "en" ? "check" : undefined}
        />
      </Menu>
      <Appbar.Action
        icon={darkMode ? "weather-sunny" : "weather-night"}
        onPress={onThemeClick}
      />
      {children}
    </Appbar.Header>
  );
}
