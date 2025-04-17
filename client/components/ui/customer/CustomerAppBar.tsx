import { ReactNode, useState } from "react";
import { Appbar, Badge, Menu, Modal, Portal, Text } from "react-native-paper";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../../stores/store";
import { setLocale, toggleDarkMode } from "../../../stores/appSetting.slice";
import { View } from "react-native";
import _ from "lodash";
import CartDetail from "./CartDetail";
import Toast from "react-native-toast-message";

export function CustomerAppBar({
  children,
  goBack,
}: {
  children?: ReactNode;
  goBack?: () => void;
}) {
  const dispatch = useDispatch();
  const { shop, table, currentCartItem } = useSelector(
    (state: RootState) => state.customer
  );
  const { darkMode, locale } = useSelector((state: RootState) => state.setting);
  const [menuVisible, setMenuVisible] = useState(false);
  const [cartDetailVisible, setCartDetailVisible] = useState(false);

  const totalCartQuantity = _.sumBy(
    Object.values(currentCartItem) || [],
    "quantity"
  );

  const toggleLocale = (lang: "vi" | "en") => {
    dispatch(setLocale(lang));
    setMenuVisible(false);
  };

  const onThemeClick = () => {
    dispatch(toggleDarkMode());
    // Integrate with your theming system if needed
  };

  return (
    <>
      <Portal>
        <Modal
          visible={cartDetailVisible}
          onDismiss={() => setCartDetailVisible(false)}
          contentContainerStyle={{
            flex: 1,
          }}
        >
          <CartDetail setCartDetailVisible={setCartDetailVisible} />
          <Toast />
        </Modal>
      </Portal>
      <Appbar.Header style={{ height: 60, paddingHorizontal: 8 }}>
        {goBack && <Appbar.BackAction onPress={goBack} size={20} />}
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
        {children}
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
        <View>
          <Appbar.Action
            icon="cart-outline"
            onPress={() => setCartDetailVisible(true)}
          />
          {totalCartQuantity > 0 && (
            <Badge
              style={{
                position: "absolute",
                top: 3,
                right: 3,
                fontSize: 10,
              }}
            >
              {totalCartQuantity}
            </Badge>
          )}
        </View>
      </Appbar.Header>
    </>
  );
}
