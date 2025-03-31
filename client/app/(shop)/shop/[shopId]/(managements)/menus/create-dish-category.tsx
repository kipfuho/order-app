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
import { RootState } from "../../../../../../stores/store";
import { Shop } from "../../../../../../stores/state.interface";
import { AppBar } from "../../../../../../components/AppBar";
import { ScrollView, StyleSheet } from "react-native";
import { createDishCategoryRequest } from "../../../../../../apis/dish.api.service";

export default function CreateDishCategoryPage() {
  const shop = useSelector(
    (state: RootState) => state.shop.currentShop
  ) as Shop;

  const [loading, setLoading] = useState(false);
  const [name, setName] = useState("category");
  const router = useRouter();

  const goBack = () =>
    router.replace({
      pathname: "/shop/[shopId]/menus/categories",
      params: {
        shopId: shop.id,
      },
    });

  const handleCreateDishCategory = async () => {
    if (!name.trim()) {
      Toast.show({
        type: "error",
        text1: "Create Failed",
        text2: "Please enter name and dish category",
      });
      return;
    }

    try {
      setLoading(true);
      await createDishCategoryRequest({
        shopId: shop.id,
        name,
      });

      // Navigate back to table position list
      goBack();

      // Clear input fields
      setName("");
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <AppBar title="Create Dish Category" goBack={goBack} />
      <Surface style={{ flex: 1, padding: 16 }}>
        <ScrollView style={{ flex: 1 }}>
          <TextInput
            label="Dish Category Name"
            mode="outlined"
            placeholder="Enter dish category name"
            value={name}
            onChangeText={setName}
            style={{ marginBottom: 20 }}
          />
        </ScrollView>

        {loading ? (
          <ActivityIndicator animating={true} size="large" />
        ) : (
          <Button
            mode="contained"
            onPress={handleCreateDishCategory}
            style={styles.createButton}
          >
            Create Dish Category
          </Button>
        )}
      </Surface>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingBottom: 16,
    justifyContent: "center",
  },
  input: {
    marginBottom: 16,
  },
  createButton: {
    marginTop: 16,
    width: 200,
    alignSelf: "center",
  },
  cancelButton: {
    marginTop: 8,
  },
  loader: {
    marginVertical: 16,
  },
});
