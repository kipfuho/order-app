import React, { useLayoutEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Dimensions,
  Modal,
  Alert,
} from "react-native";
import {
  Link,
  useLocalSearchParams,
  useNavigation,
  useRouter,
} from "expo-router";
import { useSelector } from "react-redux";
import { RootState } from "../../../../stores/store";
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
  const { shopId } = useLocalSearchParams(); // Get shop ID from URL
  const shop = useSelector((state: RootState) =>
    state.shop.shops.find((s) => s.id.toString() === shopId)
  );
  const router = useRouter();
  const navigation = useNavigation();

  if (!shop) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Shop not found</Text>

        {/* Wrap the Link inside a TouchableOpacity or View with styles */}
        <Link href="/" asChild>
          <TouchableOpacity style={styles.backButton}>
            <Text style={styles.backButtonText}>Go Back</Text>
          </TouchableOpacity>
        </Link>
      </View>
    );
  }

  const [modalVisible, setModalVisible] = useState(false);

  useLayoutEffect(() => {
    navigation.setOptions({
      title: shop?.name || "Shop",
      headerRight: () => (
        <TouchableOpacity onPress={() => setModalVisible(true)}>
          <Ionicons name="ellipsis-vertical" size={32} color="white" />
        </TouchableOpacity>
      ),
    });
  }, [navigation, shop]);

  const handleUpdate = () => {
    setModalVisible(false);
    router.push({
      pathname: "/shop/[shopId]/update-shop",
      params: {
        shopId,
      },
    }); // Navigate to update page
  };

  const [confirmModalVisible, setConfirmModalVisible] = useState(false);

  const handleDelete = () => {
    setModalVisible(false); // Close options modal
    setConfirmModalVisible(true); // Open confirmation modal
  };

  const confirmDelete = () => {
    setConfirmModalVisible(false);
    deleteShop();
  };

  const deleteShop = () => {
    router.replace("/"); // Redirect to home
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{shop.name}</Text>
      <Text style={styles.details}>Location: {shop.location}</Text>

      <FlatList
        data={BUTTONS}
        keyExtractor={(item) => item.route}
        numColumns={getNumColumns()}
        contentContainerStyle={styles.buttonGrid}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.button}
            onPress={() => {
              router.push({
                pathname: `/shop/[shopId]/${item.route}`,
                params: {
                  shopId: shop.id,
                },
              });
            }}
          >
            <Text style={styles.buttonText}>{item.title}</Text>
          </TouchableOpacity>
        )}
      />

      <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
        <Text style={styles.backButtonText}>Back</Text>
      </TouchableOpacity>

      {/* Modal for Update & Delete */}
      <Modal
        visible={modalVisible}
        transparent={true}
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

      <Modal
        visible={confirmModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setConfirmModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text
              style={{ fontSize: 18, fontWeight: "bold", marginBottom: 10 }}
            >
              Confirm Deletion
            </Text>
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
    </View>
  );
}

// Get number of columns dynamically based on screen width
const getNumColumns = () => {
  const screenWidth = Dimensions.get("window").width;
  return screenWidth > 600 ? 4 : 3; // 4 per row on tablets, 3 per row on mobile
};

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
  details: { fontSize: 18, textAlign: "center", marginBottom: 20 },
  errorText: { color: "red", fontSize: 18, textAlign: "center" },

  buttonGrid: {
    alignItems: "center",
    paddingVertical: 10,
  },
  button: {
    flex: 1,
    margin: 5,
    backgroundColor: "#007bff",
    paddingVertical: 15,
    alignItems: "center",
    borderRadius: 10,
    minWidth: 100, // Minimum button size
  },
  buttonText: { color: "#fff", fontWeight: "bold", fontSize: 16 },

  backButton: {
    marginTop: 20,
    padding: 10,
    backgroundColor: "#007bff",
    borderRadius: 5,
    alignItems: "center",
    alignSelf: "center",
    width: 150,
  },
  backButtonText: { color: "#fff", fontWeight: "bold" },

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
  modalButton: {
    padding: 15,
    width: "100%",
    alignItems: "center",
    backgroundColor: "#007bff",
    marginVertical: 5,
    borderRadius: 5,
  },
  modalText: { color: "#fff", fontWeight: "bold" },
  modalCancel: { marginTop: 10 },
  modalCancelText: { color: "#007bff", fontWeight: "bold" },
});
