import React, { useState } from "react";
import { ScrollView, View } from "react-native";
import { useRouter } from "expo-router";
import { useSelector } from "react-redux";
import { RootState } from "../../../../../../../../stores/store";
import {
  ActivityIndicator,
  Button,
  Portal,
  Text,
  TextInput,
  Surface,
} from "react-native-paper";
import { Shop } from "../../../../../../../../stores/state.interface";
import { AppBar } from "../../../../../../../../components/AppBar";
import Toast from "react-native-toast-message";
import { useGetDishCategoriesQuery } from "../../../../../../../../stores/apiSlices/dishApi.slice";
import { goToTablePositionList } from "../../../../../../../../apis/navigate.service";
import { LoaderBasic } from "../../../../../../../../components/ui/Loader";
import _ from "lodash";
import { useCreateTablePositionMutation } from "../../../../../../../../stores/apiSlices/tableApi.slice";
import { useTranslation } from "react-i18next";
import DishCategorySelectionDialog from "../../../../../../../../components/ui/settings/DishCategorySelectionDialog";

export default function CreateTablePositionPage() {
  const router = useRouter();
  const { t } = useTranslation();

  const shop = useSelector(
    (state: RootState) => state.shop.currentShop
  ) as Shop;
  const { data: dishCategories = [], isLoading: dishCategoryLoading } =
    useGetDishCategoriesQuery({ shopId: shop.id });
  const [createTablePosition, { isLoading: createTablePositionLoading }] =
    useCreateTablePositionMutation();

  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [dialogVisible, setDialogVisible] = useState(false);

  const handleCreateTablePosition = async () => {
    if (!name.trim() || selectedCategories.length === 0) {
      Toast.show({
        type: "error",
        text1: t("create_failed"),
        text2: `${t("required")} ${_.join(
          [t("table_position_name"), t("dish_category")],
          ","
        )}`,
      });
      return;
    }

    try {
      await createTablePosition({
        shopId: shop.id,
        name,
        code,
        categories: selectedCategories.values().toArray(),
      }).unwrap();

      goToTablePositionList({ router, shopId: shop.id });
    } catch (err) {
      Toast.show({
        type: "error",
        text1: t("create_failed"),
        text2: t("error_any"),
      });
      console.error(err);
    }
  };
  if (dishCategoryLoading) {
    return <LoaderBasic />;
  }

  return (
    <>
      <AppBar
        title={t("create_table_position")}
        goBack={() => goToTablePositionList({ router, shopId: shop.id })}
      />

      {/* Dialog for selecting multiple categories */}
      <Portal>
        <DishCategorySelectionDialog
          visible={dialogVisible}
          setVisible={setDialogVisible}
          dishCategories={dishCategories}
          setDishCategories={setSelectedCategories}
        />
      </Portal>

      <Surface
        style={{
          flex: 1,
        }}
      >
        <Surface
          style={{
            flex: 1,
            padding: 16,
            boxShadow: "none",
          }}
        >
          <ScrollView>
            <TextInput
              label={t("table_position_name")}
              mode="outlined"
              value={name}
              onChangeText={setName}
              style={{ marginBottom: 20 }}
            />
            <TextInput
              label={t("table_position_code")}
              mode="outlined"
              value={code}
              onChangeText={setCode}
              style={{ marginBottom: 20 }}
            />

            <Text variant="bodyLarge" style={{ marginBottom: 5 }}>
              {t("dish_category")}
            </Text>
            <Button mode="outlined" onPress={() => setDialogVisible(true)}>
              {selectedCategories.length > 0
                ? `${selectedCategories.length} ${t("selected")}`
                : t("select")}
            </Button>
            <ScrollView style={{ marginTop: 10 }}>
              {selectedCategories.map((categoryId) => {
                const category = _.find(
                  dishCategories,
                  (cat) => cat.id === categoryId
                );
                return category ? (
                  <Text key={categoryId} style={{ marginVertical: 2 }}>
                    ✅ {category.name}
                  </Text>
                ) : null;
              })}
            </ScrollView>
          </ScrollView>
        </Surface>

        {/* Loading or Action Buttons */}
        <View style={{ marginVertical: 20 }}>
          {createTablePositionLoading ? (
            <ActivityIndicator size={40} />
          ) : (
            <Button
              mode="contained-tonal"
              onPress={handleCreateTablePosition}
              style={{ width: 200, alignSelf: "center" }}
            >
              {t("create_table_position")}
            </Button>
          )}
        </View>
      </Surface>
    </>
  );
}
