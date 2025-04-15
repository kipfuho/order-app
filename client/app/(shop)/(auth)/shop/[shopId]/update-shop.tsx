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
import { useSelector } from "react-redux";
import { RootState } from "../../../../../stores/store";
import { Shop } from "../../../../../stores/state.interface";
import { AppBar } from "../../../../../components/AppBar";
import { goBackShopHome } from "../../../../../apis/navigate.service";
import { ScrollView, View } from "react-native";
import { styles } from "../../../../_layout";
import { useUpdateShopMutation } from "../../../../../stores/apiSlices/shopApi.slice";
import { useTranslation } from "react-i18next";

export default function UpdateShopPage() {
  const { t } = useTranslation();
  const router = useRouter();

  const shop = useSelector(
    (state: RootState) => state.shop.currentShop
  ) as Shop;
  const [updateShop, { isLoading: updateShopLoading }] =
    useUpdateShopMutation();

  const [name, setName] = useState(shop.name || "");
  const [location, setLocation] = useState(shop.location || "");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState(shop.email || "");
  const [taxRate, setTaxRate] = useState("");

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
        text1: t("create_failed"),
        text2: `${t("required")}: ${_.join([t("shop_name"), t("email")], ",")}`,
      });
      return;
    }

    try {
      await updateShop({
        email,
        name,
        shopId: shop?.id,
        location,
        phone,
        taxRate: _.toNumber(taxRate),
      }).unwrap();

      goBackShopHome({ router, shopId: shop.id });
      resetField();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <>
      <AppBar
        title={t("update_shop")}
        goBack={() => goBackShopHome({ router, shopId: shop.id })}
      />
      <Surface style={styles.baseContainer}>
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
        <View style={{ marginVertical: 20 }}>
          {updateShopLoading ? (
            <ActivityIndicator size={40} />
          ) : (
            <Button
              mode="contained"
              onPress={handleUpdateShop}
              style={[styles.baseButton, { margin: 0 }]}
            >
              {t("update_shop")}
            </Button>
          )}
        </View>
      </Surface>
    </>
  );
}
