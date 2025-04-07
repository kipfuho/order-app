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
import { useCreateShopMutation } from "../../stores/apiSlices/shopApi.slice";
import { useTranslation } from "react-i18next";

export default function CreateShopPage() {
  const router = useRouter();
  const { t } = useTranslation();

  const [createNewShop, { isLoading: createShopLoading }] =
    useCreateShopMutation();

  const [name, setName] = useState("");
  const [location, setLocation] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [taxRate, setTaxRate] = useState("");

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
        text1: t("create_failed"),
        text2: `${t("required")} ${_.join([t("shop_name"), t("email")], ",")}`,
      });
      return;
    }

    try {
      await createNewShop({
        email,
        name,
        phone,
        taxRate: _.toNumber(taxRate),
        location,
      }).unwrap();

      goBackShopList({ router });
      resetField();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <>
      <AppBar
        title={t("create_shop")}
        goBack={() => goBackShopList({ router })}
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

          {createShopLoading ? (
            <ActivityIndicator animating={true} size="large" />
          ) : (
            <Button
              mode="contained"
              onPress={handleCreateShop}
              style={styles.baseButton}
            >
              {t("create_shop")}
            </Button>
          )}
        </ScrollView>
      </Surface>
    </>
  );
}
