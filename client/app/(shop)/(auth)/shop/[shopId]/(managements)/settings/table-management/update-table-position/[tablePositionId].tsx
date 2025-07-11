import _ from "lodash";
import React, { useEffect, useMemo, useState } from "react";
import { useGlobalSearchParams, useRouter } from "expo-router";
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
import { RootState } from "@stores/store";
import { Shop } from "@stores/state.interface";
import { AppBar } from "@components/AppBar";
import { ScrollView, View } from "react-native";
import {
  useGetTablePositionsQuery,
  useUpdateTablePositionMutation,
} from "@stores/apiSlices/tableApi.slice";
import { useGetDishCategoriesQuery } from "@stores/apiSlices/dishApi.slice";
import { LoaderBasic } from "@components/ui/Loader";
import { goToTablePositionList } from "@apis/navigate.service";
import { useTranslation } from "react-i18next";
import DishCategorySelectionDialog from "@components/ui/settings/DishCategorySelectionDialog";
import { styles } from "@/constants/styles";

export default function UpdateTablePositionPage() {
  const { tablePositionId } = useGlobalSearchParams();
  const router = useRouter();
  const { t } = useTranslation();

  const shop = useSelector(
    (state: RootState) => state.shop.currentShop,
  ) as Shop;
  const {
    data: tablePositions = [],
    isLoading: tablePositionLoading,
    isFetching: tablePositionFetching,
  } = useGetTablePositionsQuery(shop.id);
  const { data: dishCategories = [], isLoading: dishCategoryLoading } =
    useGetDishCategoriesQuery({ shopId: shop.id });
  const tablePosition = useMemo(
    () => _.find(tablePositions, (tp) => tp.id === tablePositionId),
    [tablePositions, tablePositionId],
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
          ",",
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
  }, [tablePositionId, tablePosition, tablePositionFetching]);

  if (tablePositionLoading || dishCategoryLoading) {
    return <LoaderBasic />;
  }

  if (!tablePosition) {
    return (
      <Surface style={styles.flex}>
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

      <Surface style={styles.flex}>
        <View style={styles.baseContainer}>
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
                    (cat) => cat.id === categoryId,
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
        </View>

        <View style={{ marginVertical: 20 }}>
          {updateTablePositionLoading ? (
            <ActivityIndicator size={40} />
          ) : (
            <Button
              mode="contained-tonal"
              style={styles.baseButton}
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
