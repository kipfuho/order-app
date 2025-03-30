import React, { useCallback, useState } from "react";
import { useRouter } from "expo-router";
import _ from "lodash";
import Toast from "react-native-toast-message";
import {
  ActivityIndicator,
  Button,
  Surface,
  TextInput,
} from "react-native-paper";
import { AppBar } from "../../components/AppBar";
import { styles } from "../_layout";
import { ScrollView } from "react-native";
import { goBackShopList } from "../../apis/navigate.service";
import { createShopRequest } from "../../apis/shop.api.service";

export default function CreateShopPage() {
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState("");
  const [location, setLocation] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [taxRate, setTaxRate] = useState("");
  const router = useRouter();

  const resetField = useCallback(async () => {
    setName("");
    setLocation("");
    setPhone("");
    setEmail("");
    setTaxRate("");
  }, []);

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

      goBackShopList({ router });
      resetField();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <AppBar title="Create Shop" goBack={() => goBackShopList({ router })} />
      <Surface style={styles.baseContainer}>
        <ScrollView>
          <TextInput
            mode="outlined"
            label="Shop Name"
            value={name}
            onChangeText={setName}
          />

          <TextInput
            mode="outlined"
            label="Email"
            value={email}
            onChangeText={setEmail}
          />

          <TextInput
            mode="outlined"
            label="Phone"
            value={phone}
            onChangeText={setPhone}
          />

          <TextInput
            mode="outlined"
            label="Location"
            value={location}
            onChangeText={setLocation}
          />

          <TextInput
            mode="outlined"
            label="Tax Rate"
            value={taxRate}
            keyboardType="numeric" // Shows numeric keyboard
            onChangeText={(text) => setTaxRate(text.replace(/[^0-9.]/g, ""))} // Restrict input to numbers & decimal
          />

          {loading ? (
            <ActivityIndicator animating={true} size="large" />
          ) : (
            <Button
              mode="contained"
              onPress={handleCreateShop}
              style={styles.baseButton}
            >
              Create Shop
            </Button>
          )}
        </ScrollView>
      </Surface>
    </>
  );
}
