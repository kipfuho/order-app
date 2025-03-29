import React, { useCallback, useState } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import _ from "lodash";
import Toast from "react-native-toast-message";
import {
  ActivityIndicator,
  Button,
  Surface,
  TextInput,
} from "react-native-paper";
import { updateShopRequest } from "../../../../apis/api.service";
import { useSelector } from "react-redux";
import { RootState } from "../../../../stores/store";
import { Shop } from "../../../../stores/state.interface";
import { AppBar } from "../../../../components/AppBar";
import { goBackShopMenu } from "../../../../apis/navigate.service";
import { ScrollView } from "react-native";
import { styles } from "../../../_layout";

export default function UpdateShopPage() {
  const { shopId } = useLocalSearchParams(); // Get shop ID from URL
  const shop = useSelector((state: RootState) =>
    state.shop.shops.find((s) => s.id.toString() === shopId)
  ) as Shop;

  const [loading, setLoading] = useState(false);
  const [name, setName] = useState(shop.name || "");
  const [location, setLocation] = useState(shop.location || "");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState(shop.email || "");
  const [taxRate, setTaxRate] = useState("");
  const router = useRouter();

  const resetField = useCallback(async () => {
    setName("");
    setLocation("");
    setPhone("");
    setEmail("");
    setTaxRate("");
  }, []);

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

      goBackShopMenu({ router, shopId: shop.id });
      resetField();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <AppBar
        title="Update shop"
        goBack={() => goBackShopMenu({ router, shopId: shop.id })}
      />
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
            <ActivityIndicator
              animating={true}
              size="large"
              style={styles.baseLoader}
            />
          ) : (
            <Button
              mode="contained"
              onPress={handleUpdateShop}
              style={styles.baseButton}
            >
              Update Shop
            </Button>
          )}
        </ScrollView>
      </Surface>
    </>
  );
}
