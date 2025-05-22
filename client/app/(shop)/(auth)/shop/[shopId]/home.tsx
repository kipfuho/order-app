import React, { useState } from "react";
import { ScrollView, useWindowDimensions } from "react-native";
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
} from "react-native-paper";
import { useRouter } from "expo-router";
import { useSelector } from "react-redux";
import { RootState } from "../../../../../stores/store";
import { AppBar } from "../../../../../components/AppBar";
import { Shop } from "../../../../../stores/state.interface";
import {
  goToShopList,
  goToUpdateShop,
} from "../../../../../apis/navigate.service";
import { View } from "react-native";
import { styles } from "../../../../_layout";
import { createDefaultUnitsRequest } from "../../../../../apis/dish.api.service";
import { useDeleteShopMutation } from "../../../../../stores/apiSlices/shopApi.slice";
import { LoaderBasic } from "../../../../../components/ui/Loader";
import { useTranslation } from "react-i18next";
import { Image } from "expo-image";
import { BLURHASH } from "../../../../../constants/common";

interface Item {
  title: string;
  route: "orders" | "menus" | "settings" | "analytics" | "staffs" | "kitchen";
  icon?: string;
}

const BUTTONS: Item[] = [
  {
    title: "orders",
    route: "orders",
    icon: "food",
  },
  {
    title: "menus",
    route: "menus",
    icon: "menu",
  },
  {
    title: "kitchen",
    route: "kitchen",
    icon: "silverware-fork-knife",
  },
  {
    title: "settings",
    route: "settings",
    icon: "cog",
  },
  {
    title: "analytics",
    route: "analytics",
    icon: "google-analytics",
  },
  {
    title: "staffs",
    route: "staffs",
    icon: "account-group",
  },
];

const getButtonSize = (width: number) => {
  if (width > 600) return width / 3 - 30;
  if (width > 380) return width / 2 - 30;
  return width - 30;
};

export default function ShopPage() {
  const router = useRouter();
  const theme = useTheme();
  const { t } = useTranslation();

  const shop = useSelector(
    (state: RootState) => state.shop.currentShop
  ) as Shop;
  const [deleteShop, { isLoading: deleteShopLoading }] =
    useDeleteShopMutation();

  const [modalVisible, setModalVisible] = useState(false);
  const [confirmModalVisible, setConfirmModalVisible] = useState(false);

  const { width } = useWindowDimensions();
  const buttonSize = getButtonSize(width);

  const handleUpdate = () => {
    setModalVisible(false);
    goToUpdateShop({ router, shopId: shop.id });
  };

  const handleDelete = () => {
    setModalVisible(false);
    setConfirmModalVisible(true);
  };

  const handleCreateDefaultUnits = async () => {
    setModalVisible(false);
    await createDefaultUnitsRequest({ shopId: shop.id });
  };

  const confirmDelete = async () => {
    await deleteShop(shop.id).unwrap();
    setConfirmModalVisible(false);
    goToShopList({ router });
  };

  return (
    <>
      <AppBar title={shop.name} goBack={() => goToShopList({ router })}>
        <Appbar.Action
          icon="dots-vertical"
          onPress={() => setModalVisible(true)}
        />
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
                <Image
                  source={
                    shop.imageUrls?.[0] || require("@assets/images/savora.png")
                  }
                  placeholder={{ blurhash: BLURHASH }}
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
            {BUTTONS.map((item) => (
              <Button
                key={item.route}
                mode="contained-tonal"
                onPress={() =>
                  router.navigate({
                    pathname: `/shop/[shopId]/${item.route}`,
                    params: { shopId: shop.id },
                  })
                }
                style={{
                  width: buttonSize,
                  height: 100,
                  borderRadius: 10,
                }}
              >
                <View style={{ flex: 1, gap: 5, alignItems: "center" }}>
                  <Icon source={item.icon} size={50} />
                  <Text variant="bodyLarge">{t(item.title)}</Text>
                </View>
              </Button>
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
