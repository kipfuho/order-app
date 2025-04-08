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
import { ScrollView, View } from "react-native";
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
      <Surface style={{ flex: 1 }}>
        <Surface style={[styles.baseContainer, { boxShadow: "none" }]}>
          <ScrollView>
            <TextInput
              mode="outlined"
              label={t("shop_name")}
              value={name}
              onChangeText={setName}
            />

            <TextInput
              mode="outlined"
              label={t("email")}
              value={email}
              onChangeText={setEmail}
            />

            <TextInput
              mode="outlined"
              label={t("phone")}
              value={phone}
              onChangeText={setPhone}
            />

            <TextInput
              mode="outlined"
              label={t("location")}
              value={location}
              onChangeText={setLocation}
            />

            <TextInput
              mode="outlined"
              label={t("tax_rate")}
              value={taxRate}
              keyboardType="numeric" // Shows numeric keyboard
              onChangeText={(text) => setTaxRate(text.replace(/[^0-9.]/g, ""))} // Restrict input to numbers & decimal
            />
          </ScrollView>
        </Surface>
        <View style={{ marginVertical: 20 }}>
          {createShopLoading ? (
            <ActivityIndicator size={40} />
          ) : (
            <Button
              mode="contained"
              onPress={handleCreateShop}
              style={[styles.baseButton, { margin: 0 }]}
            >
              {t("create_shop")}
            </Button>
          )}
        </View>
      </Surface>
    </>
  );
}
