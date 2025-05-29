import React, { useEffect, useState } from "react";
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
import { RootState } from "@stores/store";
import { Shop } from "@stores/state.interface";
import { AppBar } from "@components/AppBar";
import { goToShopHome } from "@apis/navigate.service";
import { ScrollView, View } from "react-native";
import { useUpdateShopMutation } from "@stores/apiSlices/shopApi.slice";
import { useTranslation } from "react-i18next";
import UploadImages from "@components/ui/UploadImage";
import { uploadImageRequest } from "@apis/shop.api.service";
import { styles } from "@/constants/styles";

export default function UpdateShopPage() {
  const { t } = useTranslation();
  const router = useRouter();

  const shop = useSelector(
    (state: RootState) => state.shop.currentShop,
  ) as Shop;
  const [updateShop, { isLoading: updateShopLoading }] =
    useUpdateShopMutation();

  const [name, setName] = useState<string>();
  const [location, setLocation] = useState<string>();
  const [phone, setPhone] = useState<string>();
  const [email, setEmail] = useState<string>();
  const [taxRate, setTaxRate] = useState<string>();
  const [images, setImages] = useState<{ uri: string; loading: boolean }[]>([]);

  const uploadImage = async (formData: FormData) => {
    const imageUrl = await uploadImageRequest({ formData });
    return imageUrl;
  };

  const handleUpdateShop = async () => {
    if (!name || !email || !name.trim() || !email.trim()) {
      Toast.show({
        type: "error",
        text1: t("create_failed"),
        text2: `${t("required")}: ${_.join([t("shop_name"), t("email")], ",")}`,
      });
      return;
    }

    if (_.some(images, (image) => image.loading)) {
      Toast.show({
        type: "error",
        text1: t("create_failed"),
        text2: t("image_uploading_error"),
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
        imageUrls: _.map(images, "uri"),
      }).unwrap();

      goToShopHome({ router, shopId: shop.id });
    } catch {
      Toast.show({
        type: "error",
        text1: t("update_failed"),
        text2: t("error_any"),
      });
    }
  };

  useEffect(() => {
    if (!shop) {
      return;
    }

    setName(shop.name);
    setLocation(shop.location);
    setPhone(shop.phone);
    setEmail(shop.email);
    setTaxRate(shop.taxRate?.toString());
    setImages(_.map(shop.imageUrls, (url) => ({ uri: url, loading: false })));
  }, [shop]);

  return (
    <>
      <AppBar
        title={t("update_shop")}
        goBack={() => goToShopHome({ router, shopId: shop.id })}
      />
      <Surface style={styles.baseContainer}>
        <ScrollView>
          <UploadImages
            images={images}
            setImages={setImages}
            uploadImage={uploadImage}
            allowsMultipleSelection={false}
          />

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
            keyboardType="numeric" // Shows numeric keyboard
            onChangeText={(text) => setPhone(text.replace(/[^0-9.]/g, ""))}
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
