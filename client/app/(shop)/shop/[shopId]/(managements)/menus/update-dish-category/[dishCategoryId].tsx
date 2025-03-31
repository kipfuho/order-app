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
import { AppBar } from "../../../../../../../components/AppBar";
import { useGetDishCategoriesQuery } from "../../../../../../../stores/apiSlices/dishApi.slice";
import { goToDishCategoryList } from "../../../../../../../apis/navigate.service";
import { LoaderBasic } from "../../../../../../../components/ui/Loader";
import { updateDishCategoryRequest } from "../../../../../../../apis/dish.api.service";

export default function UpdateDishCategoryPage() {
  const { dishCategoryId } = useLocalSearchParams();
  const router = useRouter();

  const shop = useSelector(
    (state: RootState) => state.shop.currentShop
  ) as Shop;
  const { data: dishCategories, isLoading } = useGetDishCategoriesQuery(
    shop.id
  );
  const dishCategory = _.find(dishCategories, (dc) => dc.id === dishCategoryId);

  const [loading, setLoading] = useState(false);
  const [name, setName] = useState("");

  // when select different category
  useEffect(() => {
    if (!dishCategory) return;

    setName(dishCategory.name);
  }, [dishCategory]);

  const handleUpdateDishCategory = async () => {
    if (!dishCategory) {
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
      await updateDishCategoryRequest({
        dishCategoryId: dishCategory.id,
        shopId: shop.id,
        name,
      });

      // Navigate back to table position list
      goToDishCategoryList({ router, shopId: shop.id });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (isLoading) {
    return <LoaderBasic />;
  }

  if (!dishCategory) {
    return (
      <SafeAreaView>
        <Text>Dish Category not found</Text>
        <Button
          onPress={() => goToDishCategoryList({ router, shopId: shop.id })}
        >
          Go Back
        </Button>
      </SafeAreaView>
    );
  }

  return (
    <>
      <AppBar
        title="Update Dish Category"
        goBack={() => goToDishCategoryList({ router, shopId: shop.id })}
      />
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
