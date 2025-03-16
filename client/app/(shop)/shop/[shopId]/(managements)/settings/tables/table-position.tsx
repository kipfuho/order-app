import React from "react";
import { View, Text, TouchableOpacity, FlatList } from "react-native";
import { Link, useLocalSearchParams, useRouter } from "expo-router";
import { useSelector } from "react-redux";
import { RootState } from "../../../../../../../stores/store";
import { SafeAreaView } from "react-native-safe-area-context";
import { styles } from "../../../../../../_layout";

export default function TablePositionsManagementPage() {
  const { shopId } = useLocalSearchParams();
  const shop = useSelector((state: RootState) =>
    state.shop.shops.find((s) => s.id.toString() === shopId)
  );
  const router = useRouter();

  if (!shop) {
    console.log(shopId);
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

  // Fetch table positions from Redux store
  const tablePositions = useSelector(
    (state: RootState) => state.shop.tablePositions
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Table Positions</Text>

      {/* List of Table Positions */}
      <FlatList
        data={tablePositions}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.item}>
            <Text style={styles.itemText}>{item.name}</Text>
          </View>
        )}
      />

      {/* Create Table Position Button */}
      <TouchableOpacity
        style={styles.createButton}
        onPress={() =>
          router.push({
            pathname: "/shop/[shopId]/settings/tables/create-table-position",
            params: {
              shopId: shop.id,
            },
          })
        }
      >
        <Text style={styles.createButtonText}>Create Table Position</Text>
      </TouchableOpacity>
    </View>
  );
}
