import React, { useLayoutEffect, useState } from "react";
import { View, Text, TextInput, TouchableOpacity } from "react-native";
import { useLocalSearchParams, useNavigation, useRouter } from "expo-router";
import _ from "lodash";
import Toast from "react-native-toast-message";
import { ActivityIndicator } from "react-native-paper";
import { useSelector } from "react-redux";
import { Ionicons } from "@expo/vector-icons";
import { RootState } from "../../../../../../stores/store";
import { Shop } from "../../../../../../stores/state.interface";
import { styles } from "../../../../../_layout";
import { createDishCategoryRequest } from "../../../../../../api/api.service";

export default function CreateDishCategoryPage() {
  const { shopId } = useLocalSearchParams();
  const shop = useSelector((state: RootState) =>
    state.shop.shops.find((s) => s.id.toString() === shopId)
  ) as Shop;

  const [loading, setLoading] = useState(false);
  const [name, setName] = useState("table");
  const router = useRouter();
  const navigation = useNavigation();

  const goBack = () =>
    router.navigate({
      pathname: "/shop/[shopId]/menus/categories",
      params: {
        shopId: shop.id,
      },
    });

  useLayoutEffect(() => {
    navigation.setOptions({
      headerLeft: () => (
        <TouchableOpacity onPress={() => goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="black" />
        </TouchableOpacity>
      ),
    });
  }, [navigation]);

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
    <View style={styles.container}>
      <Text style={styles.title}>Create a New Dish Category</Text>

      <TextInput
        style={styles.input}
        placeholder="Dish category name"
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
            onPress={handleCreateDishCategory}
          >
            <Text style={styles.createButtonText}>Create Dish Category</Text>
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
