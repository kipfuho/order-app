import React, { useLayoutEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from "react-native";
import {
  Link,
  useLocalSearchParams,
  useNavigation,
  useRouter,
} from "expo-router";
import _ from "lodash";
import Toast from "react-native-toast-message";
import { ActivityIndicator } from "react-native-paper";
import { styles } from "../../../_layout";
import { updateShopRequest } from "../../../../api/api.service";
import { useSelector } from "react-redux";
import { RootState } from "../../../../stores/store";
import { Shop } from "../../../../stores/state.interface";
import { Ionicons } from "@expo/vector-icons";

export default function UpdateShopPage() {
  const { shopId } = useLocalSearchParams(); // Get shop ID from URL
  const shop = useSelector((state: RootState) =>
    state.shop.shops.find((s) => s.id.toString() === shopId)
  ) as Shop;

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

  const [loading, setLoading] = useState(false);
  const [name, setName] = useState(shop.name || "");
  const [location, setLocation] = useState(shop.location || "");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState(shop.email || "");
  const [taxRate, setTaxRate] = useState("");
  const router = useRouter();
  const navigation = useNavigation();

  useLayoutEffect(() => {
    navigation.setOptions({
      title: shop?.name || "Shop",
      headerShown: true,
      headerLeft: () => (
        <TouchableOpacity
          onPress={() =>
            router.navigate({
              pathname: "/shop/[shopId]",
              params: { shopId: shop.id },
            })
          }
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color="black" />
        </TouchableOpacity>
      ),
    });
  }, [navigation, shop]);

  const handleUpdateShop = async () => {
    if (!name.trim() || !email.trim()) {
      Toast.show({
        type: "error",
        text1: "Create Failed",
        text2: "Please enter both shop name and email",
      });
      return;
    }

    try {
      setLoading(true);

      await updateShopRequest({
        email,
        name,
        shopId: shop?.id,
        location,
        phone,
        taxRate: _.toNumber(taxRate),
      });

      // Navigate back to shops list
      router.push("/");

      // Clear input fields
      setName("");
      setLocation("");
      setPhone("");
      setEmail("");
      setTaxRate("");
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Update a Shop</Text>

      <TextInput
        style={styles.input}
        placeholder="Shop Name"
        value={name}
        onChangeText={setName}
      />

      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
      />

      <TextInput
        style={styles.input}
        placeholder="Phone"
        value={phone}
        onChangeText={setPhone}
      />

      <TextInput
        style={styles.input}
        placeholder="Location"
        value={location}
        onChangeText={setLocation}
      />

      <TextInput
        style={styles.input}
        placeholder="Tax Rate"
        value={taxRate}
        keyboardType="numeric" // Shows numeric keyboard
        onChangeText={(text) => setTaxRate(text.replace(/[^0-9.]/g, ""))} // Restrict input to numbers & decimal
      />

      {loading ? (
        <ActivityIndicator
          animating={true}
          size="large"
          style={styles.loader}
        />
      ) : (
        <>
          <TouchableOpacity
            style={styles.createButton}
            onPress={handleUpdateShop}
          >
            <Text style={styles.createButtonText}>Update Shop</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.cancelButton}
            onPress={() => router.back()}
          >
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
        </>
      )}
    </View>
  );
}
