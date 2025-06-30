import { useEffect, useMemo, useState } from "react";
import { ScrollView, View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useSelector } from "react-redux";
import { RootState } from "@stores/store";
import {
  ActivityIndicator,
  Button,
  Portal,
  Text,
  TextInput,
  Surface,
} from "react-native-paper";
import { Shop } from "@stores/state.interface";
import { AppBar } from "@components/AppBar";
import Toast from "react-native-toast-message";
import { goToKitchenList } from "@apis/navigate.service";
import { LoaderBasic } from "@components/ui/Loader";
import _ from "lodash";
import {
  useGetKitchensQuery,
  useUpdateKitchenMutation,
} from "@stores/apiSlices/kitchenApi.slice";
import { useTranslation } from "react-i18next";
import DishCategorySelectionDialog from "@components/ui/settings/DishCategorySelectionDialog";
import { useGetTablesQuery } from "@stores/apiSlices/tableApi.slice";
import { useGetDishCategoriesQuery } from "@stores/apiSlices/dishApi.slice";
import TableSelectionDialog from "@components/ui/settings/TableSelectionDialog";
import { styles } from "@/constants/styles";

export default function UpdateKitchenPage() {
  const { kitchenId } = useLocalSearchParams() as { kitchenId: string };
  const router = useRouter();
  const { t } = useTranslation();

  const shop = useSelector(
    (state: RootState) => state.shop.currentShop,
  ) as Shop;
  const {
    data: kitchens = [],
    isLoading: kitchenLoading,
    isFetching: kitchenFetching,
  } = useGetKitchensQuery({ shopId: shop.id });
  const { data: tables = [], isLoading: tableLoading } = useGetTablesQuery(
    shop.id,
  );
  const { data: dishCategories = [], isLoading: dishCategoryLoading } =
    useGetDishCategoriesQuery({ shopId: shop.id });
  const [updateKitchen, { isLoading: updateKitchenLoading }] =
    useUpdateKitchenMutation();
  const kitchen = useMemo(
    () => _.find(kitchens, (kc) => kc.id === kitchenId),
    [kitchens, kitchenId],
  );

  const [name, setName] = useState("");
  const [selectedTables, setSelectedTables] = useState<string[]>([]);
  const [selectedDishCategories, setSelectedDishCategories] = useState<
    string[]
  >([]);
  const [tableDialogVisible, setTableDialogVisible] = useState(false);
  const [dishCategoryDialogVisible, setDishCategoryDialogVisible] =
    useState(false);

  const handleUpdateKitchen = async () => {
    if (
      !name.trim() ||
      selectedTables.length === 0 ||
      selectedDishCategories.length === 0
    ) {
      Toast.show({
        type: "error",
        text1: t("update_failed"),
        text2: `${t("required")} ${_.join(
          [t("kitchen_position_name"), t("table"), t("dish_category")],
          ",",
        )}`,
      });
      return;
    }

    try {
      await updateKitchen({
        kitchenId,
        shopId: shop.id,
        name,
        dishCategories: selectedDishCategories,
        tables: selectedTables,
      }).unwrap();

      goToKitchenList({ router, shopId: shop.id });
    } catch {
      Toast.show({
        type: "error",
        text1: t("update_failed"),
        text2: t("error_any"),
      });
    }
  };

  useEffect(() => {
    if (!kitchen) return;

    setName(kitchen.name);
  }, [kitchenId, kitchen, kitchenFetching]);

  if (kitchenLoading || tableLoading || dishCategoryLoading) {
    return <LoaderBasic />;
  }

  if (!kitchen) {
    return (
      <Surface style={styles.flex}>
        <Text>{t("kitchen_not_found")}</Text>
        <Button
          mode="contained"
          onPress={() => goToKitchenList({ router, shopId: shop.id })}
        >
          {t("go_back")}
        </Button>
      </Surface>
    );
  }

  return (
    <>
      <AppBar
        title={t("update_kitchen_position")}
        goBack={() => goToKitchenList({ router, shopId: shop.id })}
      />

      {/* Dialog for selecting multiple categories */}
      <Portal>
        <TableSelectionDialog
          visible={tableDialogVisible}
          setVisible={setTableDialogVisible}
          tables={tables}
          selectedTables={selectedTables}
          setSelectedTables={setSelectedTables}
        />
        <DishCategorySelectionDialog
          visible={dishCategoryDialogVisible}
          setVisible={setDishCategoryDialogVisible}
          dishCategories={dishCategories}
          selectedDishCategories={selectedDishCategories}
          setSelectedDishCategories={setSelectedDishCategories}
        />
      </Portal>

      <Surface
        style={{
          flex: 1,
        }}
      >
        <View style={styles.baseContainer}>
          <ScrollView>
            <TextInput
              label={t("kitchen_position_name")}
              mode="outlined"
              value={name}
              onChangeText={setName}
              style={{ marginBottom: 20 }}
            />

            <Text variant="bodyLarge" style={{ marginBottom: 5 }}>
              {t("table")}
            </Text>
            <Button mode="outlined" onPress={() => setTableDialogVisible(true)}>
              {selectedTables.length > 0
                ? `${selectedTables.length} ${t("selected")}`
                : t("select")}
            </Button>
            <View style={{ marginTop: 10, marginBottom: 20 }}>
              {selectedTables.map((tableId) => {
                const table = _.find(tables, (item) => item.id === tableId);
                if (table) {
                  return (
                    <Text key={tableId} style={{ marginVertical: 2 }}>
                      ✅ {table.name}
                    </Text>
                  );
                }
              })}
            </View>

            <Text variant="bodyLarge" style={{ marginBottom: 5 }}>
              {t("dish_category")}
            </Text>
            <Button
              mode="outlined"
              onPress={() => setDishCategoryDialogVisible(true)}
            >
              {selectedDishCategories.length > 0
                ? `${selectedDishCategories.length} ${t("selected")}`
                : t("select")}
            </Button>
            <View style={{ marginTop: 10 }}>
              {selectedDishCategories.map((categoryId) => {
                const category = _.find(
                  dishCategories,
                  (cat) => cat.id === categoryId,
                );
                return category ? (
                  <Text key={categoryId} style={{ marginVertical: 2 }}>
                    ✅ {category.name}
                  </Text>
                ) : null;
              })}
            </View>
          </ScrollView>
        </View>

        {/* Loading or Action Buttons */}
        <View style={{ marginVertical: 20 }}>
          {updateKitchenLoading ? (
            <ActivityIndicator size={40} />
          ) : (
            <Button
              mode="contained-tonal"
              onPress={handleUpdateKitchen}
              style={styles.baseButton}
            >
              {t("update_kitchen_position")}
            </Button>
          )}
        </View>
      </Surface>
    </>
  );
}
