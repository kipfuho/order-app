import React, { useLayoutEffect, useState } from "react";
import { View, Text, TextInput, TouchableOpacity } from "react-native";
import { useLocalSearchParams, useNavigation, useRouter } from "expo-router";
import _ from "lodash";
import Toast from "react-native-toast-message";
import { ActivityIndicator } from "react-native-paper";
import { useSelector } from "react-redux";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { RootState } from "../../../../../../../stores/store";
import { styles } from "../../../../../../_layout";
import { Shop } from "../../../../../../../stores/state.interface";
import { updateDishCategoryRequest } from "../../../../../../../api/api.service";

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
      <SafeAreaView style={styles.container}>
        <Text style={styles.errorText}>Dish Category not found</Text>
        <TouchableOpacity style={styles.backButton} onPress={goBack}>
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  const [loading, setLoading] = useState(false);
  const [name, setName] = useState(dishCategory.name);
  const navigation = useNavigation();

  useLayoutEffect(() => {
    navigation.setOptions({
      headerLeft: () => (
        <TouchableOpacity onPress={() => goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="black" />
        </TouchableOpacity>
      ),
    });
  }, [navigation]);

  const handleCreateShop = async () => {
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
    <View style={styles.container}>
      <Text style={styles.title}>Updare a Dish Category</Text>

      <TextInput
        style={styles.input}
        placeholder="Dish Category Name"
        value={name}
        onChangeText={setName}
      />

      {loading ? (
        <ActivityIndicator
          animating={true}
          size="large"
          style={styles.loader}
        />
      ) : (
        <>
          <TouchableOpacity
            style={styles.createButton}
            onPress={handleCreateShop}
          >
            <Text style={styles.createButtonText}>Update Dish Category</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.cancelButton}
            onPress={() => goBack()}
          >
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
        </>
      )}
    </View>
  );
}
