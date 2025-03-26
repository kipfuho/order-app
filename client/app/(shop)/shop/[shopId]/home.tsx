import React, { useEffect, useState } from "react";
import { View, StyleSheet, useWindowDimensions } from "react-native";
import {
  Button,
  Dialog,
  Portal,
  Text,
  useTheme,
  Appbar,
} from "react-native-paper";
import { Link, useLocalSearchParams, useRouter } from "expo-router";
import { useSelector } from "react-redux";
import { RootState } from "../../../../stores/store";
import {
  createDefaultUnitsRequest,
  deleteShopRequest,
  getTablePositions,
  getTables,
} from "../../../../apis/api.service";
import { AppBar } from "../../../../components/AppBar";
import {
  getDishCategoriesRequest,
  getDishTypesRequest,
} from "../../../../apis/dish.api.service";

interface Item {
  title: string;
  route: "orders" | "menus" | "customers" | "settings" | "analytics" | "staffs";
}

const BUTTONS: Item[] = [
  { title: "Orders", route: "orders" },
  { title: "Menus", route: "menus" },
  { title: "Customers", route: "customers" },
  { title: "Settings", route: "settings" },
  { title: "Analytics", route: "analytics" },
  { title: "Staff", route: "staffs" },
];

export default function ShopPage() {
  const { shopId } = useLocalSearchParams();
  const shop = useSelector((state: RootState) =>
    state.shop.shops.find((s) => s.id.toString() === shopId)
  );
  const router = useRouter();
  const theme = useTheme(); // Get theme colors

  const [modalVisible, setModalVisible] = useState(false);
  const [confirmModalVisible, setConfirmModalVisible] = useState(false);

  const { width } = useWindowDimensions();
  const buttonSize = width / 3 - 30;

  useEffect(() => {
    if (shop) {
      // prefetch some data
      const fetchShopDatas = async () => {
        await getDishCategoriesRequest({ shopId: shop.id });
        await getTables({ shopId: shop.id });
        await getTablePositions({ shopId: shop.id });
        await getDishTypesRequest({ shopId: shop.id });
      };

      fetchShopDatas();
    }
  }, [shop]);

  if (!shop) {
    return (
      <View
        style={[styles.container, { backgroundColor: theme.colors.background }]}
      >
        <Text variant="headlineMedium" style={{ color: theme.colors.error }}>
          Shop not found
        </Text>
        <Link href="/" asChild>
          <Button mode="contained">Go Back</Button>
        </Link>
      </View>
    );
  }

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

  const goBack = () => {
    router.navigate("/");
  };

  return (
    <>
      <AppBar title={shop.name} goBack={goBack}>
        <Appbar.Action
          icon="dots-vertical"
          onPress={() => setModalVisible(true)}
        />
      </AppBar>
      <View
        style={[styles.container, { backgroundColor: theme.colors.background }]}
      >
        <Text
          variant="headlineLarge"
          style={{ color: theme.colors.onBackground, textAlign: "center" }}
        >
          {shop.name}
        </Text>
        <Text
          variant="bodyLarge"
          style={{ color: theme.colors.onBackground, textAlign: "center" }}
        >
          Location: {shop.location}
        </Text>

        <View style={styles.buttonGrid}>
          {BUTTONS.map((item) => (
            <Button
              key={item.route}
              mode="contained"
              style={[styles.button, { width: buttonSize }]}
              onPress={() =>
                router.push({
                  pathname: `/shop/[shopId]/${item.route}`,
                  params: { shopId: shop.id },
                })
              }
            >
              {item.title}
            </Button>
          ))}
        </View>

        <Button mode="text" onPress={() => router.back()}>
          Back
        </Button>

        {/* Update & Delete Modal */}
        <Portal>
          <Dialog
            visible={modalVisible}
            onDismiss={() => setModalVisible(false)}
          >
            <Dialog.Title>Actions</Dialog.Title>
            <Dialog.Content>
              <Button
                mode="contained"
                onPress={handleUpdate}
                style={styles.modalButton}
              >
                Update
              </Button>
              <Button
                mode="contained"
                onPress={handleDelete}
                style={[
                  styles.modalButton,
                  { backgroundColor: theme.colors.error },
                ]}
              >
                Delete
              </Button>
              <Button
                mode="contained"
                onPress={handleCreateDefaultUnits}
                style={[
                  styles.modalButton,
                  { backgroundColor: theme.colors.tertiary },
                ]}
              >
                Create Default Units
              </Button>
            </Dialog.Content>
            <Dialog.Actions>
              <Button onPress={() => setModalVisible(false)}>Cancel</Button>
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
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: "center",
  },
  buttonGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    paddingVertical: 10,
  },
  button: {
    margin: 5,
    borderRadius: 5,
  },
  modalButton: {
    marginVertical: 5,
  },
});
