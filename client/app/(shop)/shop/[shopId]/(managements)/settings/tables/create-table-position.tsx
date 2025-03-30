import React, { useState } from "react";
import { ScrollView } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useSelector } from "react-redux";
import { RootState } from "../../../../../../../stores/store";
import {
  ActivityIndicator,
  Button,
  Dialog,
  Checkbox,
  Portal,
  Text,
  TextInput,
  Surface,
} from "react-native-paper";
import { Shop } from "../../../../../../../stores/state.interface";
import { AppBar } from "../../../../../../../components/AppBar";
import Toast from "react-native-toast-message";
import { createTablePositionRequest } from "../../../../../../../apis/table.api.service";

export default function CreateTablePositionPage() {
  const { shopId } = useLocalSearchParams();
  const router = useRouter();

  const shop = useSelector((state: RootState) =>
    state.shop.shops.find((s) => s.id.toString() === shopId)
  ) as Shop;

  const dishCategories = useSelector(
    (state: RootState) => state.shop.dishCategories
  );

  const [loading, setLoading] = useState(false);
  const [name, setName] = useState("table position");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [dialogVisible, setDialogVisible] = useState(false);

  const goBack = () =>
    router.navigate({
      pathname: "/shop/[shopId]/settings/tables/table-position",
      params: { shopId: shop.id },
    });

  const handleCreateTablePosition = async () => {
    if (!name.trim() || selectedCategories.length === 0) {
      Toast.show({
        type: "error",
        text1: "Create Failed",
        text2: "Please enter a name and select at least one dish category",
      });
      return;
    }

    try {
      setLoading(true);
      await createTablePositionRequest({
        shopId: shop.id,
        name,
        categories: selectedCategories,
      });
      goBack();
    } catch (err) {
      Toast.show({
        type: "error",
        text1: "Create Failed",
        text2: "Failed to create table. Please try again.",
      });
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const toggleCategorySelection = (categoryId: string) => {
    setSelectedCategories((prev) =>
      prev.includes(categoryId)
        ? prev.filter((id) => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  return (
    <>
      <AppBar title="Create Table Position" goBack={goBack} />
      <Surface
        style={{
          flex: 1,
        }}
      >
        <Surface
          style={{
            flex: 1,
            padding: 16,
          }}
        >
          <ScrollView>
            {/* Table Name Input */}
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
                const category = dishCategories.find(
                  (cat) => cat.id === categoryId
                );
                return category ? (
                  <Text key={categoryId} style={{ marginVertical: 2 }}>
                    ✅ {category.name}
                  </Text>
                ) : null;
              })}
            </Surface>
          </ScrollView>
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

        {/* Loading or Action Buttons */}
        {loading ? (
          <ActivityIndicator size="large" />
        ) : (
          <Button
            mode="contained-tonal"
            onPress={handleCreateTablePosition}
            style={{ marginTop: 20, width: 200, alignSelf: "center" }}
          >
            Create Table Position
          </Button>
        )}
      </Surface>
    </>
  );
}
