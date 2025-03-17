import React, { useLayoutEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  SafeAreaView,
  useWindowDimensions,
} from "react-native";
import {
  Link,
  useLocalSearchParams,
  useNavigation,
  useRouter,
} from "expo-router";
import { useSelector } from "react-redux";
import { RootState } from "../../../../stores/store";
import { deleteShopRequest } from "../../../../api/api.service";
import { Ionicons } from "@expo/vector-icons";

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
  const navigation = useNavigation();

  const [modalVisible, setModalVisible] = useState(false);
  const [confirmModalVisible, setConfirmModalVisible] = useState(false);

  const { width } = useWindowDimensions(); // Dynamically get the current width
  const buttonSize = width / 3 - 20;

  useLayoutEffect(() => {
    navigation.setOptions({
      title: shop?.name || "Shop",
      headerShown: true,
      headerLeft: () => (
        <TouchableOpacity
          onPress={() => router.navigate("/")}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color="black" />
        </TouchableOpacity>
      ),
      headerRight: () => (
        <TouchableOpacity onPress={() => setModalVisible(true)}>
          <Ionicons name="ellipsis-vertical" size={32} color="white" />
        </TouchableOpacity>
      ),
    });
  }, [navigation, shop]);

  if (!shop) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.errorText}>Shop not found</Text>
        <Link href="/" asChild>
          <TouchableOpacity style={styles.backButton}>
            <Text style={styles.backButtonText}>Go Back</Text>
          </TouchableOpacity>
        </Link>
      </SafeAreaView>
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

  const confirmDelete = async () => {
    setConfirmModalVisible(false);
    await deleteShopRequest({ shopId: shop.id });
    router.replace("/");
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>{shop.name}</Text>
      <Text style={styles.details}>Location: {shop.location}</Text>

      <View style={styles.buttonGrid}>
        {BUTTONS.map((item) => (
          <TouchableOpacity
            key={item.route}
            style={[styles.button, { width: buttonSize }]}
            onPress={() =>
              router.push({
                pathname: `/shop/[shopId]/${item.route}`,
                params: { shopId: shop.id },
              })
            }
          >
            <Text style={styles.buttonText}>{item.title}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
        <Text style={styles.backButtonText}>Back</Text>
      </TouchableOpacity>

      {/* Update & Delete Modal */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <TouchableOpacity onPress={handleUpdate} style={styles.modalButton}>
              <Text style={styles.modalText}>Update</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleDelete}
              style={[styles.modalButton, { backgroundColor: "red" }]}
            >
              <Text style={styles.modalText}>Delete</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setModalVisible(false)}
              style={styles.modalCancel}
            >
              <Text style={styles.modalCancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Confirm Delete Modal */}
      <Modal
        visible={confirmModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setConfirmModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalHeader}>Confirm Deletion</Text>
            <Text>Are you sure you want to delete this shop?</Text>
            <TouchableOpacity
              onPress={confirmDelete}
              style={[styles.modalButton, { backgroundColor: "red" }]}
            >
              <Text style={styles.modalText}>Yes, Delete</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setConfirmModalVisible(false)}
              style={styles.modalCancel}
            >
              <Text style={styles.modalCancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: "center",
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 10,
  },
  details: {
    fontSize: 18,
    textAlign: "center",
    marginBottom: 20,
  },
  errorText: {
    color: "red",
    fontSize: 18,
    textAlign: "center",
  },
  buttonGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    paddingVertical: 10,
  },
  button: {
    height: 100,
    margin: 5,
    backgroundColor: "#007bff",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 10,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  backButton: {
    padding: 10,
    backgroundColor: "#007bff",
    borderRadius: 5,
    alignItems: "center",
    alignSelf: "center",
    width: 50,
  },
  backButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 10,
    width: 250,
    alignItems: "center",
  },
  modalHeader: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  modalButton: {
    padding: 15,
    width: "100%",
    alignItems: "center",
    backgroundColor: "#007bff",
    marginVertical: 5,
    borderRadius: 5,
  },
  modalText: {
    color: "#fff",
    fontWeight: "bold",
  },
  modalCancel: {
    marginTop: 10,
  },
  modalCancelText: {
    color: "#007bff",
    fontWeight: "bold",
  },
});
