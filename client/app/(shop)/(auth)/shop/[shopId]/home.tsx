import React, { useMemo, useState } from "react";
import { View, ScrollView, useWindowDimensions } from "react-native";
import {
  Button,
  Dialog,
  Portal,
  Text,
  useTheme,
  Appbar,
  Surface,
  Icon,
  Card,
  TouchableRipple,
} from "react-native-paper";
import { useRouter } from "expo-router";
import { useSelector } from "react-redux";
import { RootState } from "@stores/store";
import { AppBar } from "@components/AppBar";
import { Shop } from "@stores/state.interface";
import { goToShopList, goToUpdateShop } from "@apis/navigate.service";
import { useDeleteShopMutation } from "@stores/apiSlices/shopApi.slice";
import { LoaderBasic } from "@components/ui/Loader";
import { useTranslation } from "react-i18next";
import { CrossPlatformImage } from "@/components/CrossPlatformImage";
import { PermissionType } from "@constants/common";
import { styles } from "@/constants/styles";

interface Item {
  title: string;
  route: "orders" | "menus" | "settings" | "analytics" | "staffs" | "kitchen";
  icon?: string;
}

const buttonDefinitions: { permission: string; item: Item }[] = [
  {
    permission: PermissionType.VIEW_ORDER,
    item: { title: "orders", route: "orders", icon: "food" },
  },
  {
    permission: PermissionType.VIEW_MENU,
    item: { title: "menus", route: "menus", icon: "menu" },
  },
  {
    permission: PermissionType.VIEW_KITCHEN,
    item: { title: "kitchen", route: "kitchen", icon: "silverware-fork-knife" },
  },
  {
    permission: PermissionType.VIEW_SHOP,
    item: { title: "settings", route: "settings", icon: "cog" },
  },
  {
    permission: PermissionType.VIEW_REPORT,
    item: { title: "analytics", route: "analytics", icon: "google-analytics" },
  },
  {
    permission: PermissionType.VIEW_EMPLOYEE,
    item: { title: "staffs", route: "staffs", icon: "account-group" },
  },
];

const getAvailableButtons = (permissions: Set<string>): Item[] => {
  return buttonDefinitions
    .filter(({ permission }) => permissions.has(permission))
    .map(({ item }) => item);
};

const getButtonSize = (width: number) => {
  if (width > 600) return (width - 52) / 3; // 32 padding, 20 gap
  if (width > 380) return (width - 42) / 2; // 32 padding, 10 gap
  return width - 30;
};

export default function ShopPage() {
  const router = useRouter();
  const theme = useTheme();
  const { t } = useTranslation();

  const { currentShop, userPermission } = useSelector(
    (state: RootState) => state.shop,
  );
  const shop = currentShop as Shop;
  const [deleteShop, { isLoading: deleteShopLoading }] =
    useDeleteShopMutation();

  const [modalVisible, setModalVisible] = useState(false);
  const [confirmModalVisible, setConfirmModalVisible] = useState(false);

  const { width } = useWindowDimensions();
  const buttonSize = getButtonSize(width);
  const availableButtons = useMemo(() => {
    return getAvailableButtons(userPermission);
  }, [userPermission]);

  const handleUpdate = () => {
    setModalVisible(false);
    goToUpdateShop({ router, shopId: shop.id });
  };

  const handleDelete = () => {
    setModalVisible(false);
    setConfirmModalVisible(true);
  };

  const confirmDelete = async () => {
    await deleteShop(shop.id).unwrap();
    setConfirmModalVisible(false);
    goToShopList({ router });
  };

  return (
    <>
      <AppBar title={shop.name} goBack={() => goToShopList({ router })}>
        {userPermission.has(PermissionType.UPDATE_SHOP) && (
          <Appbar.Action
            icon="dots-vertical"
            onPress={() => setModalVisible(true)}
          />
        )}
      </AppBar>
      <Surface style={styles.baseContainer}>
        <ScrollView>
          {/* Shop Image with Fallback */}
          <View
            style={{ alignItems: "center", marginTop: 50, marginBottom: 10 }}
          >
            {/* Rectangle Background using Surface */}
            <Surface
              style={{
                width: "100%",
                alignItems: "center",
                elevation: 4,
                borderRadius: 10,
                backgroundColor: theme.colors.tertiaryContainer,
                paddingVertical: 10,
              }}
            >
              {/* Floating Image using Card */}
              <Card
                style={{
                  position: "absolute",
                  top: -50, // Moves the image above the rectangle
                  borderRadius: 50,
                  elevation: 5, // Shadow effect
                }}
              >
                <CrossPlatformImage
                  source={{
                    uri: shop.imageUrls?.[0],
                  }}
                  // eslint-disable-next-line @typescript-eslint/no-require-imports
                  defaultSource={require("@assets/images/savora.png")}
                  style={{
                    width: 100,
                    height: 100,
                    borderRadius: 100,
                  }}
                />
              </Card>

              {/* Spacer for Image Overlap */}
              <View style={{ height: 50 }} />

              {/* Shop Name */}
              <Text variant="titleLarge" style={{ color: theme.colors.error }}>
                {shop.name}
              </Text>

              {/* Shop Location */}
              <Text
                variant="bodyMedium"
                style={{ textAlign: "center", marginTop: 4 }}
              >
                {shop.email}
              </Text>
            </Surface>
          </View>

          <Surface mode="flat" style={styles.baseGrid}>
            {availableButtons.map((item) => (
              <TouchableRipple
                key={item.route}
                onPress={() =>
                  router.replace({
                    pathname: `/shop/[shopId]/${item.route}`,
                    params: { shopId: shop.id },
                  })
                }
                style={{
                  width: buttonSize,
                  minHeight: 120,
                  borderRadius: 10,
                  backgroundColor: theme.colors.primaryContainer,
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <View
                  style={{
                    gap: 5,
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Icon source={item.icon} size={50} />
                  <Text variant="bodyLarge">{t(item.title)}</Text>
                </View>
              </TouchableRipple>
            ))}
          </Surface>
        </ScrollView>
      </Surface>

      {/* Update & Delete Modal */}
      <Portal>
        <Dialog visible={modalVisible} onDismiss={() => setModalVisible(false)}>
          <Dialog.Title>{t("settings")}</Dialog.Title>
          <Dialog.Content style={{ gap: 10 }}>
            <Button mode="contained" onPress={handleUpdate}>
              {t("update_shop")}
            </Button>
            <Button mode="elevated" onPress={handleDelete}>
              {t("delete_shop")}
            </Button>
          </Dialog.Content>
          <Dialog.Actions>
            <Button
              mode="contained-tonal"
              onPress={() => setModalVisible(false)}
            >
              {t("cancel")}
            </Button>
          </Dialog.Actions>
        </Dialog>

        {/* Confirm Delete Modal */}
        <Dialog
          visible={confirmModalVisible || deleteShopLoading}
          onDismiss={() => setConfirmModalVisible(false)}
        >
          <Dialog.Title>{t("delete_shop")}</Dialog.Title>
          <Dialog.Content>
            <Text>{t("delete_shop_confirmation")}</Text>
          </Dialog.Content>
          <Dialog.Actions>
            {deleteShopLoading ? (
              <LoaderBasic />
            ) : (
              <>
                <Button onPress={confirmDelete} textColor={theme.colors.error}>
                  {t("confirm")}
                </Button>
                <Button onPress={() => setConfirmModalVisible(false)}>
                  {t("cancel")}
                </Button>
              </>
            )}
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </>
  );
}
