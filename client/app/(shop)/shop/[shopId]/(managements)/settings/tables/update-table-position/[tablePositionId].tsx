import React, { useLayoutEffect, useState } from "react";
import { View, Text, TextInput, TouchableOpacity } from "react-native";
import {
  Link,
  useLocalSearchParams,
  useNavigation,
  useRouter,
} from "expo-router";
import _ from "lodash";
import Toast from "react-native-toast-message";
import { ActivityIndicator } from "react-native-paper";
import { useSelector } from "react-redux";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { RootState } from "../../../../../../../../stores/store";
import { styles } from "../../../../../../../_layout";
import { updateTablePositionRequest } from "../../../../../../../../api/api.service";

export default function UpdateTablePositionPage() {
  const { shopId } = useLocalSearchParams();
  const shop = useSelector((state: RootState) =>
    state.shop.shops.find((s) => s.id.toString() === shopId)
  );

  if (!shop) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.errorText}>Shop not found</Text>
        <Link href="/" asChild>
          <TouchableOpacity style={styles.backButton}>
            <Text style={styles.backButtonText}>Go Back</Text>
          </TouchableOpacity>
        </Link>
      </SafeAreaView>
    );
  }

  const { tablePositionId } = useLocalSearchParams();
  const tablePosition = useSelector((state: RootState) =>
    state.shop.tablePositions.find((tp) => tp.id === tablePositionId)
  );

  const router = useRouter();

  const goBack = () =>
    router.navigate({
      pathname: "/shop/[shopId]/settings/tables/table-position",
      params: {
        shopId: shop.id,
      },
    });

  if (!tablePosition) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.errorText}>Table position not found</Text>
        <TouchableOpacity style={styles.backButton} onPress={goBack}>
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  const [loading, setLoading] = useState(false);
  const [name, setName] = useState(tablePosition.name);
  const [categories, setCategories] = useState([]);
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
      await updateTablePositionRequest({
        tablePositionId: tablePosition.id,
        shopId: shop.id,
        name,
        categories,
      });

      // Navigate back to table position list
      goBack();

      // Clear input fields
      setName("");
      setCategories([]);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Updare a Table position</Text>

      <TextInput
        style={styles.input}
        placeholder="Table position Name"
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
            <Text style={styles.createButtonText}>Update Table position</Text>
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
