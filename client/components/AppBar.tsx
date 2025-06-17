import { ReactNode, useState } from "react";
import { Appbar, Menu, Divider, Text } from "react-native-paper";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@stores/store";
import { setLocale, toggleDarkMode } from "@stores/appSetting.slice";
import { reloadAppAsync } from "expo";

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
    setMenuVisible(false);
  };

  const onReloadClick = () => {
    reloadAppAsync();
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
          <Appbar.Action icon="cog" onPress={() => setMenuVisible(true)} />
        }
      >
        <Menu.Item
          onPress={onReloadClick}
          title={"Reload"}
          leadingIcon={"reload"}
        />
        <Divider />
        <Menu.Item
          onPress={onThemeClick}
          title={darkMode ? "Light mode" : "Dark mode"}
          leadingIcon={darkMode ? "weather-sunny" : "weather-night"}
        />
        <Divider />
        <Menu.Item title="Language" disabled />
        <Menu.Item
          onPress={() => toggleLocale("vi")}
          title="Tiếng Việt"
          leadingIcon={() => <Text style={{ fontSize: 18 }}>🇻🇳</Text>}
          trailingIcon={locale === "vi" ? "check" : undefined}
        />
        <Menu.Item
          onPress={() => toggleLocale("en")}
          title="English"
          leadingIcon={() => <Text style={{ fontSize: 18 }}>🇺🇸</Text>}
          trailingIcon={locale === "en" ? "check" : undefined}
        />
      </Menu>

      {children}
    </Appbar.Header>
  );
}
