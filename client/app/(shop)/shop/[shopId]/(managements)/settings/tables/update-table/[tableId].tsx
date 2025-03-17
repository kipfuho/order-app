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
import { updateTableRequest } from "../../../../../../../../api/api.service";

export default function UpdateTablePage() {
  const { shopId } = useLocalSearchParams();
  const shop = useSelector((state: RootState) =>
    state.shop.shops.find((s) => s.id.toString() === shopId)
  );
  const { tableId } = useLocalSearchParams();
  const table = useSelector((state: RootState) =>
    state.shop.tables.find((t) => t.id === tableId)
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

  const router = useRouter();

  const goBack = () =>
    router.navigate({
      pathname: "/shop/[shopId]/settings/tables",
      params: {
        shopId: shop.id,
      },
    });

  if (!table) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.errorText}>Table not found</Text>
        <TouchableOpacity style={styles.backButton} onPress={goBack}>
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }
  const tablePositions = useSelector(
    (state: RootState) => state.shop.tablePositions
  );
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState(table.name);
  const [tablePosition, setTablePosition] = useState(tablePositions[0]);
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
    if (!name.trim() || !tablePosition) {
      Toast.show({
        type: "error",
        text1: "Create Failed",
        text2: "Please enter name and table position",
      });
      return;
    }

    try {
      setLoading(true);
      await updateTableRequest({
        tableId: table.id,
        shopId: shop.id,
        name,
        tablePosition,
      });

      // Navigate back to table position list
      goBack();

      // Clear input fields
      setName("");
      setTablePosition(tablePositions[0]);
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
