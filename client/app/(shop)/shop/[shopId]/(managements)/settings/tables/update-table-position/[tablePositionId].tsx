import React, { useEffect, useState } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import _ from "lodash";
import Toast from "react-native-toast-message";
import {
  ActivityIndicator,
  Button,
  Checkbox,
  Dialog,
  Portal,
  Surface,
  Text,
  TextInput,
} from "react-native-paper";
import { useSelector } from "react-redux";
import { RootState } from "../../../../../../../../stores/store";
import { Shop } from "../../../../../../../../stores/state.interface";
import { AppBar } from "../../../../../../../../components/AppBar";
import { ScrollView } from "react-native";
import { updateTablePositionRequest } from "../../../../../../../../apis/table.api.service";
import { useGetTablePositionsQuery } from "../../../../../../../../stores/apiSlices/tableApi.slice";
import { useGetDishCategoriesQuery } from "../../../../../../../../stores/apiSlices/dishApi.slice";
import { LoaderBasic } from "../../../../../../../../components/ui/Loader";
import { goToTablePositionList } from "../../../../../../../../apis/navigate.service";

export default function UpdateTablePositionPage() {
  const { tablePositionId } = useLocalSearchParams();
  const router = useRouter();

  const shop = useSelector(
    (state: RootState) => state.shop.currentShop
  ) as Shop;
  const { data: tablePositions = [], isLoading: tablePositionLoading } =
    useGetTablePositionsQuery(shop.id);
  const { data: dishCategories = [], isLoading: dishCategoryLoading } =
    useGetDishCategoriesQuery(shop.id);
  const tablePosition = _.find(
    tablePositions,
    (tp) => tp.id === tablePositionId
  );

  const [loading, setLoading] = useState(false);
  const [name, setName] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [dialogVisible, setDialogVisible] = useState(false);

  const handleCreateShop = async () => {
    if (!tablePosition) {
      return;
    }

    if (!name.trim()) {
      Toast.show({
        type: "error",
        text1: "Create Failed",
        text2: "Please enter name",
      });
      return;
    }

    try {
      setLoading(true);
      await updateTablePositionRequest({
        tablePositionId: tablePosition.id,
        shopId: shop.id,
        name,
        categories: selectedCategories,
      });

      // Navigate back to table position list
      goToTablePositionList({ router, shopId: shop.id });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!tablePosition) return;

    setName(tablePosition.name);
    setSelectedCategories(tablePosition.dishCategories);
  }, [tablePosition]);

  const toggleCategorySelection = (categoryId: string) => {
    setSelectedCategories((prev) =>
      prev.includes(categoryId)
        ? prev.filter((id) => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  if (tablePositionLoading || dishCategoryLoading) {
    return <LoaderBasic />;
  }

  if (!tablePosition) {
    return (
      <Surface style={{ flex: 1 }}>
        <Text>Table position not found</Text>
        <Button
          onPress={() => goToTablePositionList({ router, shopId: shop.id })}
        >
          <Text>Go Back</Text>
        </Button>
      </Surface>
    );
  }

  return (
    <>
      <AppBar
        title="Update Table Position"
        goBack={() => goToTablePositionList({ router, shopId: shop.id })}
      />
      <Surface style={{ flex: 1 }}>
        <Surface style={{ flex: 1, padding: 16 }}>
          <TextInput
            label="Table Position Name"
            mode="outlined"
            placeholder="Enter table position name"
            value={name}
            onChangeText={setName}
            style={{ marginBottom: 20 }}
          />

          {/* Table Position Selection Label */}
          <Text variant="bodyLarge" style={{ marginBottom: 5 }}>
            Select Table Categories
          </Text>

          {/* Open Dialog Button */}
          <Button mode="outlined" onPress={() => setDialogVisible(true)}>
            {selectedCategories.length > 0
              ? `${selectedCategories.length} Selected`
              : "Select Dish Categories"}
          </Button>

          {/* Selected Categories List */}
          <Surface style={{ marginTop: 10 }}>
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
          </Surface>
        </Surface>

        {/* Dialog for selecting multiple categories */}
        <Portal>
          <Dialog
            visible={dialogVisible}
            onDismiss={() => setDialogVisible(false)}
          >
            <Dialog.Title>Select Dish Categories</Dialog.Title>
            <Dialog.ScrollArea>
              <ScrollView>
                {dishCategories.map((category) => (
                  <Checkbox.Item
                    key={category.id}
                    label={category.name}
                    status={
                      selectedCategories.includes(category.id)
                        ? "checked"
                        : "unchecked"
                    }
                    onPress={() => toggleCategorySelection(category.id)}
                  />
                ))}
              </ScrollView>
            </Dialog.ScrollArea>
            <Dialog.Actions>
              <Button onPress={() => setDialogVisible(false)}>Done</Button>
            </Dialog.Actions>
          </Dialog>
        </Portal>

        {loading ? (
          <ActivityIndicator animating={true} size="large" />
        ) : (
          <Button
            mode="contained-tonal"
            style={{ alignSelf: "center", width: 200, marginBottom: 16 }}
            onPress={handleCreateShop}
          >
            Update Table Position
          </Button>
        )}
      </Surface>
    </>
  );
}
