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
import { RootState } from "../../../../../../stores/store";
import { Shop } from "../../../../../../stores/state.interface";
import { AppBar } from "../../../../../../components/AppBar";
import { ScrollView, StyleSheet } from "react-native";
import { goToDishCategoryList } from "../../../../../../apis/navigate.service";
import { useCreateDishCategoryMutation } from "../../../../../../stores/apiSlices/dishApi.slice";

export default function CreateDishCategoryPage() {
  const router = useRouter();

  const shop = useSelector(
    (state: RootState) => state.shop.currentShop
  ) as Shop;
  const [createDishCategory, { isLoading: createDishCategoryLoading }] =
    useCreateDishCategoryMutation();

  const [name, setName] = useState("category");

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
      await createDishCategory({
        shopId: shop.id,
        name,
      }).unwrap();

      // Navigate back to table position list
      goToDishCategoryList({ router, shopId: shop.id });
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    setName("");
  }, []);

  return (
    <>
      <AppBar
        title="Create Dish Category"
        goBack={() => goToDishCategoryList({ router, shopId: shop.id })}
      />
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

        {createDishCategoryLoading ? (
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
