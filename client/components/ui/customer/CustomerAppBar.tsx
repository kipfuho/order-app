import _ from "lodash";
import { ReactNode, useState } from "react";
import {
  Appbar,
  Badge,
  Divider,
  Icon,
  Menu,
  Modal,
  Portal,
  Text,
  TouchableRipple,
  useTheme,
} from "react-native-paper";
import { View } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import Toast from "react-native-toast-message";
import { RootState } from "@stores/store";
import { setLocale, toggleDarkMode } from "@stores/appSetting.slice";
import CartDetail from "./CartDetail";
import CartCheckoutHistory from "./CartCheckoutHistory";
import { useUpdateCartMutation } from "@/stores/apiSlices/cartApi.slice";
import { mergeCartItems } from "@/constants/utils";
import toastConfig from "@/components/CustomToast";

export function CustomerAppBar({
  children,
  goBack,
}: {
  children?: ReactNode;
  goBack?: () => void;
}) {
  const theme = useTheme();
  const { t } = useTranslation();
  const dispatch = useDispatch();

  const { shop, table, currentCartItem, isUpdateCartDebouncing } = useSelector(
    (state: RootState) => state.customer,
  );
  const { darkMode, locale } = useSelector((state: RootState) => state.setting);
  const [updateCart, { isLoading: updateCartLoading }] =
    useUpdateCartMutation();

  const [menuVisible, setMenuVisible] = useState(false);
  const [cartDetailVisible, setCartDetailVisible] = useState(false);
  const [checkoutHistoryVisible, setCheckoutHistoryVisible] = useState(false);

  const totalCartQuantity = _.sumBy(
    Object.values(currentCartItem) || [],
    "quantity",
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
          <CartDetail
            setCartDetailVisible={setCartDetailVisible}
            isLoading={updateCartLoading}
          />
        </Modal>
        <Modal
          visible={checkoutHistoryVisible}
          onDismiss={() => setCheckoutHistoryVisible(false)}
          contentContainerStyle={{
            flex: 1,
          }}
        >
          <CartCheckoutHistory setVisible={setCheckoutHistoryVisible} />
        </Modal>
        <Toast config={toastConfig} />
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
      </Appbar.Header>
      <Divider />
      <View
        style={{
          flexDirection: "row",
          backgroundColor: theme.colors.background,
        }}
      >
        <TouchableRipple
          style={{
            flex: 1,
            flexDirection: "row",
            justifyContent: "center",
            alignItems: "center",
            padding: 10,
          }}
          onPress={() => {
            if (isUpdateCartDebouncing) {
              updateCart({
                shopId: shop!.id,
                cartItems: mergeCartItems(currentCartItem),
              });
            }
            setCheckoutHistoryVisible(false);
            setCartDetailVisible(true);
          }}
        >
          <View
            style={{
              flexDirection: "row",
              justifyContent: "center",
              alignItems: "center",
              gap: 8,
            }}
          >
            <View>
              <Icon source="cart-outline" size={28} />
              {totalCartQuantity > 0 && (
                <Badge
                  style={{
                    position: "absolute",
                    top: -7,
                    right: -7,
                    fontSize: 10,
                  }}
                >
                  {totalCartQuantity}
                </Badge>
              )}
            </View>
            <Text variant="titleMedium">{t("cart_items")}</Text>
          </View>
        </TouchableRipple>
        <TouchableRipple
          style={{
            flex: 1,
            flexDirection: "row",
            justifyContent: "center",
            alignItems: "center",
            padding: 10,
          }}
          onPress={() => {
            setCartDetailVisible(false);
            setCheckoutHistoryVisible(true);
          }}
        >
          <View
            style={{
              flexDirection: "row",
              justifyContent: "center",
              alignItems: "center",
              gap: 8,
            }}
          >
            <Icon source="history" size={28} />
            <Text variant="titleMedium">{t("history")}</Text>
          </View>
        </TouchableRipple>
      </View>
    </>
  );
}
