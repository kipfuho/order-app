import { ReactNode, useState } from "react";
import { Appbar, Menu, Text } from "react-native-paper";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../stores/store";
import { setLocale, toggleDarkMode } from "../stores/appSetting.slice";
import { View } from "react-native";

export function CustomerAppBar({ children }: { children?: ReactNode }) {
  const dispatch = useDispatch();
  const { shop, table } = useSelector((state: RootState) => state.customer);
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
      <Appbar.Content
        title={
          <View>
            <Text variant="titleMedium" numberOfLines={1}>
              {shop?.name}
            </Text>
            {table?.name && (
              <Text
                variant="bodySmall"
                style={{ opacity: 0.7 }}
                numberOfLines={1}
              >
                {table.name}
              </Text>
            )}
          </View>
        }
      />
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
