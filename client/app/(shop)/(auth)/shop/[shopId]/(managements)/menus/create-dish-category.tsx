import React, { useState } from "react";
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
import { ScrollView, View } from "react-native";
import { goToDishCategoryList } from "@apis/navigate.service";
import { useCreateDishCategoryMutation } from "@stores/apiSlices/dishApi.slice";
import { useTranslation } from "react-i18next";
import { styles } from "@/constants/styles";

export default function CreateDishCategoryPage() {
  const router = useRouter();
  const { t } = useTranslation();

  const shop = useSelector(
    (state: RootState) => state.shop.currentShop,
  ) as Shop;
  const [createDishCategory, { isLoading: createDishCategoryLoading }] =
    useCreateDishCategoryMutation();

  const [name, setName] = useState("");
  const [code, setCode] = useState("");

  const resetFields = () => {
    setName("");
    setCode("");
  };

  const handleCreateDishCategory = async () => {
    if (!name.trim()) {
      Toast.show({
        type: "error",
        text1: t("create_failed"),
        text2: `${t("required")} ${_.join(
          _.compact([
            !name.trim() && t("dish_category_name"),
            !code.trim() && t("dish_category_code"),
          ]),
          ",",
        )}`,
      });
      return;
    }

    try {
      await createDishCategory({
        shopId: shop.id,
        name,
        code,
      }).unwrap();

      // Navigate back to table position list
      goToDishCategoryList({ router, shopId: shop.id });
      resetFields();
    } catch (error: any) {
      Toast.show({
        type: "error",
        text1: t("update_failed"),
        text2: error.data?.message,
      });
    }
  };

  return (
    <>
      <AppBar
        title={t("create_dish_category")}
        goBack={() => {
          goToDishCategoryList({ router, shopId: shop.id });
          resetFields();
        }}
      />
      <Surface style={styles.flex}>
        <View style={styles.baseContainer}>
          <ScrollView style={styles.flex}>
            <TextInput
              label={t("dish_category_name")}
              mode="outlined"
              value={name}
              onChangeText={setName}
              style={{ marginBottom: 20 }}
            />
            <TextInput
              label={t("dish_category_code")}
              mode="outlined"
              value={code}
              onChangeText={setCode}
              style={{ marginBottom: 20 }}
            />
          </ScrollView>
        </View>

        <View style={{ marginVertical: 20 }}>
          {createDishCategoryLoading ? (
            <ActivityIndicator size={40} />
          ) : (
            <Button
              mode="contained"
              onPress={handleCreateDishCategory}
              style={[styles.baseButton, { margin: 0 }]}
            >
              {t("create_dish_category")}
            </Button>
          )}
        </View>
      </Surface>
    </>
  );
}
