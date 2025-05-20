import React, { useEffect, useState } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import _ from "lodash";
import Toast from "react-native-toast-message";
import {
  ActivityIndicator,
  Button,
  Surface,
  Text,
  TextInput,
} from "react-native-paper";
import { useSelector } from "react-redux";
import { SafeAreaView } from "react-native-safe-area-context";
import { RootState } from "../../../../../../../../stores/store";
import { Shop } from "../../../../../../../../stores/state.interface";
import { AppBar } from "../../../../../../../../components/AppBar";
import {
  useGetDishCategoriesQuery,
  useUpdateDishCategoryMutation,
} from "../../../../../../../../stores/apiSlices/dishApi.slice";
import { goToDishCategoryList } from "../../../../../../../../apis/navigate.service";
import { LoaderBasic } from "../../../../../../../../components/ui/Loader";
import { ScrollView, View } from "react-native";
import { useTranslation } from "react-i18next";

export default function UpdateDishCategoryPage() {
  const { dishCategoryId } = useLocalSearchParams();
  const router = useRouter();
  const { t } = useTranslation();

  const shop = useSelector(
    (state: RootState) => state.shop.currentShop
  ) as Shop;
  const {
    data: dishCategories,
    isLoading: dishCategoryLoading,
    isFetching: dishCategoryFetching,
  } = useGetDishCategoriesQuery({ shopId: shop.id });
  const dishCategory = _.find(dishCategories, (dc) => dc.id === dishCategoryId);
  const [updateDishCategory, { isLoading: updateDishCategoryLoading }] =
    useUpdateDishCategoryMutation();

  const [name, setName] = useState("");
  const [code, setCode] = useState("");

  // when select different category
  useEffect(() => {
    if (!dishCategory) return;

    setName(dishCategory.name);
  }, [dishCategoryId, dishCategoryFetching]);

  const handleUpdateDishCategory = async () => {
    if (!dishCategory) {
      return;
    }

    if (!name.trim()) {
      Toast.show({
        type: "error",
        text1: t("update_failed"),
        text2: `${t("required")} ${_.join(
          _.compact([
            !name.trim() && t("dish_category_name"),
            !code.trim() && t("dish_category_code"),
          ]),
          ","
        )}`,
      });
      return;
    }

    try {
      await updateDishCategory({
        dishCategoryId: dishCategory.id,
        shopId: shop.id,
        name,
        code,
      }).unwrap();

      // Navigate back to table position list
      goToDishCategoryList({ router, shopId: shop.id });
    } catch (error: any) {
      Toast.show({
        type: "error",
        text1: t("update_failed"),
        text2: error.data?.message,
      });
    }
  };

  if (dishCategoryLoading) {
    return <LoaderBasic />;
  }

  if (!dishCategory) {
    return (
      <SafeAreaView>
        <Text>{t("dish_category_not_found")}</Text>
        <Button
          onPress={() => goToDishCategoryList({ router, shopId: shop.id })}
        >
          {t("loading")}
        </Button>
      </SafeAreaView>
    );
  }

  return (
    <>
      <AppBar
        title={t("update_dish_category")}
        goBack={() => goToDishCategoryList({ router, shopId: shop.id })}
      />
      <Surface style={{ flex: 1 }}>
        <Surface style={{ flex: 1, padding: 16, boxShadow: "none" }}>
          <ScrollView>
            <TextInput
              mode="outlined"
              label={t("dish_category_name")}
              value={name}
              onChangeText={setName}
            />
            <TextInput
              mode="outlined"
              label={t("dish_category_code")}
              value={code}
              onChangeText={setCode}
            />
          </ScrollView>
        </Surface>

        <View style={{ marginVertical: 20 }}>
          {updateDishCategoryLoading ? (
            <ActivityIndicator size={40} />
          ) : (
            <>
              <Button
                mode="contained-tonal"
                style={{ width: 200, alignSelf: "center" }}
                onPress={handleUpdateDishCategory}
              >
                {t("update_dish_category")}
              </Button>
            </>
          )}
        </View>
      </Surface>
    </>
  );
}
