import React, { useEffect, useState } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import _ from "lodash";
import Toast from "react-native-toast-message";
import {
  ActivityIndicator,
  Button,
  Portal,
  Surface,
  Text,
  TextInput,
} from "react-native-paper";
import { useSelector } from "react-redux";
import { RootState } from "../../../../../../../../../stores/store";
import { Shop } from "../../../../../../../../../stores/state.interface";
import { AppBar } from "../../../../../../../../../components/AppBar";
import { ScrollView, View } from "react-native";
import {
  useGetTablePositionsQuery,
  useUpdateTablePositionMutation,
} from "../../../../../../../../../stores/apiSlices/tableApi.slice";
import { useGetDishCategoriesQuery } from "../../../../../../../../../stores/apiSlices/dishApi.slice";
import { LoaderBasic } from "../../../../../../../../../components/ui/Loader";
import { goToTablePositionList } from "../../../../../../../../../apis/navigate.service";
import { useTranslation } from "react-i18next";
import DishCategorySelectionDialog from "../../../../../../../../../components/ui/settings/DishCategorySelectionDialog";

export default function UpdateTablePositionPage() {
  const { tablePositionId } = useLocalSearchParams();
  const router = useRouter();
  const { t } = useTranslation();

  const shop = useSelector(
    (state: RootState) => state.shop.currentShop
  ) as Shop;
  const {
    data: tablePositions = [],
    isLoading: tablePositionLoading,
    isFetching: tablePositionFetching,
  } = useGetTablePositionsQuery(shop.id);
  const { data: dishCategories = [], isLoading: dishCategoryLoading } =
    useGetDishCategoriesQuery({ shopId: shop.id });
  const tablePosition = _.find(
    tablePositions,
    (tp) => tp.id === tablePositionId
  );
  const [updateTablePosition, { isLoading: updateTablePositionLoading }] =
    useUpdateTablePositionMutation();

  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [dialogVisible, setDialogVisible] = useState(false);

  const handleCreateShop = async () => {
    if (!tablePosition) {
      return;
    }

    if (!name.trim() || selectedCategories.length === 0) {
      Toast.show({
        type: "error",
        text1: t("update_failed"),
        text2: `${t("required")} ${_.join(
          _.compact([
            !name.trim() && t("table_position_name"),
            _.isEmpty(selectedCategories) && t("dish_category"),
          ]),
          ","
        )}`,
      });
      return;
    }

    try {
      await updateTablePosition({
        tablePositionId: tablePosition.id,
        shopId: shop.id,
        name,
        code,
        categories: selectedCategories.values().toArray(),
      }).unwrap();

      // Navigate back to table position list
      goToTablePositionList({ router, shopId: shop.id });
    } catch (error: any) {
      Toast.show({
        type: "error",
        text1: t("update_failed"),
        text2: error.data?.message,
      });
    }
  };

  useEffect(() => {
    if (!tablePosition) return;

    setName(tablePosition.name);
    setCode(tablePosition.code || "");
    setSelectedCategories(tablePosition.dishCategoryIds);
  }, [tablePositionId, tablePositionFetching]);

  if (tablePositionLoading || dishCategoryLoading) {
    return <LoaderBasic />;
  }

  if (!tablePosition) {
    return (
      <Surface style={{ flex: 1 }}>
        <Text>{t("table_position_not_found")}</Text>
        <Button
          onPress={() => goToTablePositionList({ router, shopId: shop.id })}
        >
          <Text>{t("go_back")}</Text>
        </Button>
      </Surface>
    );
  }

  return (
    <>
      <AppBar
        title={t("update_table_position")}
        goBack={() => goToTablePositionList({ router, shopId: shop.id })}
      />

      {/* Dialog for selecting multiple categories */}
      <Portal>
        <DishCategorySelectionDialog
          visible={dialogVisible}
          setVisible={setDialogVisible}
          dishCategories={dishCategories}
          selectedDishCategories={selectedCategories}
          setSelectedDishCategories={setSelectedCategories}
        />
      </Portal>

      <Surface style={{ flex: 1 }}>
        <Surface style={{ flex: 1, padding: 16, boxShadow: "none" }}>
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
            <View style={{ marginTop: 10 }}>
              {selectedCategories
                .values()
                .toArray()
                .map((categoryId) => {
                  const category = _.find(
                    dishCategories,
                    (cat) => cat.id === categoryId
                  );
                  if (category) {
                    return (
                      <Text key={categoryId} style={{ marginVertical: 2 }}>
                        ✅ {category.name}
                      </Text>
                    );
                  }
                })}
            </View>
          </ScrollView>
        </Surface>

        <View style={{ marginVertical: 20 }}>
          {updateTablePositionLoading ? (
            <ActivityIndicator size={40} />
          ) : (
            <Button
              mode="contained-tonal"
              style={{ alignSelf: "center", width: 200 }}
              onPress={handleCreateShop}
            >
              {t("update_table_position")}
            </Button>
          )}
        </View>
      </Surface>
    </>
  );
}
