import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import { createShopRequest } from "../../apis/api.service";
import _ from "lodash";
import Toast from "react-native-toast-message";
import { styles } from "../_layout";
import { ActivityIndicator } from "react-native-paper";

export default function CreateShopPage() {
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState("shop");
  const [location, setLocation] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("ctcakip@gmail.com");
  const [taxRate, setTaxRate] = useState("");
  const router = useRouter();

  const handleCreateShop = async () => {
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
      await createShopRequest({
        email,
        name,
        phone,
        taxRate: _.toNumber(taxRate),
        location,
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
      <Text style={styles.title}>Create a New Shop</Text>

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
            onPress={handleCreateShop}
          >
            <Text style={styles.createButtonText}>Create Shop</Text>
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
