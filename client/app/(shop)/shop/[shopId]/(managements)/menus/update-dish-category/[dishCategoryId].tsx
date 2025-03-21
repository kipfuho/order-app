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
import { RootState } from "../../../../../../../stores/store";
import { Shop } from "../../../../../../../stores/state.interface";
import { updateDishCategoryRequest } from "../../../../../../../api/api.service";
import { AppBar } from "../../../../../../../components/AppBar";

export default function UpdateDishCategoryPage() {
  const { shopId } = useLocalSearchParams();
  const shop = useSelector((state: RootState) =>
    state.shop.shops.find((s) => s.id.toString() === shopId)
  ) as Shop;

  const { dishCategoryId } = useLocalSearchParams();
  const dishCategory = useSelector((state: RootState) =>
    state.shop.dishCategories.find((dc) => dc.id === dishCategoryId)
  );

  const router = useRouter();

  const goBack = () =>
    router.navigate({
      pathname: "/shop/[shopId]/menus/categories",
      params: {
        shopId: shop.id,
      },
    });

  if (!dishCategory) {
    return (
      <SafeAreaView>
        <Text>Dish Category not found</Text>
        <Button onPress={goBack}>Go Back</Button>
      </SafeAreaView>
    );
  }

  const [loading, setLoading] = useState(false);
  const [name, setName] = useState("");

  // when select different category
  useEffect(() => {
    setName(dishCategory.name);
  }, [dishCategory]);

  const handleUpdateDishCategory = async () => {
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
      await updateDishCategoryRequest({
        dishCategoryId: dishCategory.id,
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
      <AppBar title="Update Dish Category" goBack={goBack} />
      <Surface style={{ flex: 1 }}>
        <Surface style={{ flex: 1, padding: 16 }}>
          <TextInput
            placeholder="Dish Category Name"
            value={name}
            onChangeText={setName}
          />
        </Surface>

        {loading ? (
          <ActivityIndicator animating={true} size="large" />
        ) : (
          <>
            <Button
              mode="contained-tonal"
              style={{ width: 200, alignSelf: "center", marginBottom: 16 }}
              onPress={handleUpdateDishCategory}
            >
              Update Dish Category
            </Button>
          </>
        )}
      </Surface>
    </>
  );
}
