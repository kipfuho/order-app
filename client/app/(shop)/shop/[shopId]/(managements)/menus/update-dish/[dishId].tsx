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
import { Shop } from "../../../../../../../stores/state.interface";
import { styles } from "../../../../../../_layout";
import { updateDishRequest } from "../../../../../../../api/api.service";

export default function UpdateDishPage() {
  const { shopId } = useLocalSearchParams();
  const shop = useSelector((state: RootState) =>
    state.shop.shops.find((s) => s.id.toString() === shopId)
  ) as Shop;
  const { dishId } = useLocalSearchParams();
  const dish = useSelector((state: RootState) =>
    state.shop.dishes.find((d) => d.id === dishId)
  );

  const router = useRouter();

  const goBack = () =>
    router.navigate({
      pathname: "/shop/[shopId]/settings/tables",
      params: {
        shopId: shop.id,
      },
    });

  if (!dish) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.errorText}>Dish not found</Text>
        <TouchableOpacity style={styles.backButton} onPress={goBack}>
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }
  const dishCategories = useSelector(
    (state: RootState) => state.shop.dishCategories
  );
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState(dish.name);
  const [dishCategory, setDishCategory] = useState(dishCategories[0]);
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
    if (!name.trim() || !dishCategory) {
      Toast.show({
        type: "error",
        text1: "Create Failed",
        text2: "Please enter name and table position",
      });
      return;
    }

    try {
      setLoading(true);
      await updateDishRequest({
        dishId: dish.id,
        shopId: shop.id,
        name,
        dishCategory,
      });

      // Navigate back to table position list
      goBack();

      // Clear input fields
      setName("");
      setDishCategory(dishCategories[0]);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Update a Table</Text>

      <TextInput
        style={styles.input}
        placeholder="Table Name"
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
            <Text style={styles.createButtonText}>Update Table</Text>
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
