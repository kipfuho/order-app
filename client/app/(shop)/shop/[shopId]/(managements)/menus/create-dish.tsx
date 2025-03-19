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
import { Collapsible } from "../../../../../../components/Collapsible";

export default function CreateTablePage() {
  const { shopId } = useLocalSearchParams();
  const shop = useSelector((state: RootState) =>
    state.shop.shops.find((s) => s.id.toString() === shopId)
  ) as Shop;

  const dishCategories = useSelector(
    (state: RootState) => state.shop.dishCategories
  );
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState("dish");
  const [category, setCategory] = useState(dishCategories[0]);
  const router = useRouter();
  const navigation = useNavigation();

  const goBack = () =>
    router.navigate({
      pathname: "/shop/[shopId]/menus/dishes",
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

  const handleCreateDish = async () => {
    if (!name.trim() || !category) {
      Toast.show({
        type: "error",
        text1: "Create Failed",
        text2: "Please enter name and dish category",
      });
      return;
    }

    try {
      setLoading(true);
      //   await createTableRequest({
      //     shopId: shop.id,
      //     name,
      //     tablePosition,
      //   });

      // Navigate back to table position list
      goBack();

      // Clear input fields
      setName("");
      setCategory(dishCategories[0]);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Create a New Dish</Text>

      <Collapsible title="General Infomation">
        <TextInput
          style={styles.input}
          placeholder="Dish Name"
          value={name}
          onChangeText={setName}
        />
      </Collapsible>
      <Collapsible title="Price">abc</Collapsible>

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
            onPress={handleCreateDish}
          >
            <Text style={styles.createButtonText}>Create Dish</Text>
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
