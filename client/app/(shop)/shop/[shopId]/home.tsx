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
import { useLocalSearchParams, useRouter } from "expo-router";
import { useSelector } from "react-redux";
import { RootState } from "../../../../stores/store";
import {
  createDefaultUnitsRequest,
  deleteShopRequest,
} from "../../../../apis/api.service";
import { AppBar } from "../../../../components/AppBar";
import { Shop } from "../../../../stores/state.interface";
import { goBackShopList } from "../../../../apis/navigate.service";
import { View } from "react-native";
import { styles } from "../../../_layout";

interface Item {
  title: string;
  route: "orders" | "menus" | "customers" | "settings" | "analytics" | "staffs";
  icon?: string;
}

const BUTTONS: Item[] = [
  {
    title: "Orders",
    route: "orders",
    icon: "food",
  },
  {
    title: "Menus",
    route: "menus",
    icon: "menu",
  },
  {
    title: "Customers",
    route: "customers",
    icon: "face-agent",
  },
  {
    title: "Settings",
    route: "settings",
    icon: "cog",
  },
  {
    title: "Analytics",
    route: "analytics",
    icon: "google-analytics",
  },
  {
    title: "Staff",
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
  const shop = useSelector((state: RootState) => state.shop2.shop) as Shop;
  const router = useRouter();
  const theme = useTheme(); // Get theme colors

  const [modalVisible, setModalVisible] = useState(false);
  const [confirmModalVisible, setConfirmModalVisible] = useState(false);

  const { width } = useWindowDimensions();
  const buttonSize = getButtonSize(width);

  const handleUpdate = () => {
    setModalVisible(false);
    router.push({
      pathname: "/shop/[shopId]/update-shop",
      params: { shopId: shop.id },
    });
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
    setConfirmModalVisible(false);
    await deleteShopRequest({ shopId: shop.id });
    router.replace("/");
  };

  return (
    <>
      <AppBar title={shop.name} goBack={() => goBackShopList({ router })}>
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
                backgroundColor: theme.colors.backdrop,
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
                <Card.Cover
                  source={{
                    uri: shop.imageUrls?.[0] ?? "https://picsum.photos/700",
                  }}
                  style={{
                    width: 100,
                    height: 100,
                    borderRadius: 100,
                  }}
                  resizeMode="cover"
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

          <Surface style={styles.baseGrid}>
            {BUTTONS.map((item) => (
              <Button
                key={item.route}
                mode="contained-tonal"
                onPress={() =>
                  router.push({
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
                <View style={{ flex: 1, gap: 5 }}>
                  <Icon source={item.icon} size={50} />
                  <Text variant="bodyLarge">{item.title}</Text>
                </View>
              </Button>
            ))}
          </Surface>
        </ScrollView>
      </Surface>

      {/* Update & Delete Modal */}
      <Portal>
        <Dialog visible={modalVisible} onDismiss={() => setModalVisible(false)}>
          <Dialog.Title>Actions</Dialog.Title>
          <Dialog.Content style={{ gap: 10 }}>
            <Button mode="contained" onPress={handleUpdate}>
              Update
            </Button>
            <Button mode="elevated" onPress={handleDelete}>
              Delete
            </Button>
            {/* TODO: Remove this */}
            <Button mode="outlined" onPress={handleCreateDefaultUnits}>
              Create Default Units
            </Button>
          </Dialog.Content>
          <Dialog.Actions>
            <Button
              mode="contained-tonal"
              onPress={() => setModalVisible(false)}
            >
              Cancel
            </Button>
          </Dialog.Actions>
        </Dialog>

        {/* Confirm Delete Modal */}
        <Dialog
          visible={confirmModalVisible}
          onDismiss={() => setConfirmModalVisible(false)}
        >
          <Dialog.Title>Confirm Deletion</Dialog.Title>
          <Dialog.Content>
            <Text>Are you sure you want to delete this shop?</Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={confirmDelete} textColor={theme.colors.error}>
              Yes, Delete
            </Button>
            <Button onPress={() => setConfirmModalVisible(false)}>
              Cancel
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </>
  );
}
