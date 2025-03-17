import React, { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, FlatList } from "react-native";
import { Link, useLocalSearchParams, useRouter } from "expo-router";
import { useSelector } from "react-redux";
import { RootState } from "../../../../../../../stores/store";
import { SafeAreaView } from "react-native-safe-area-context";
import { styles } from "../../../../../../_layout";
import { ActivityIndicator } from "react-native-paper";
import { getTables } from "../../../../../../../api/api.service";
import _ from "lodash";

export default function TablesManagementPage() {
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

  // Fetch table positions from Redux store
  const tables = useSelector((state: RootState) => state.shop.tables);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const fetchTables = async () => {
      try {
        setLoading(true);
        await getTables({
          shopId: shop.id,
        });
      } catch (error) {
        console.error("Error fetching tables:", error);
      } finally {
        setLoading(false);
      }
    };

    if (_.isEmpty(tables)) {
      fetchTables();
    }
  }, []);

  if (loading) {
    return <ActivityIndicator size="large" style={styles.loader} />;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Tables</Text>

      {/* List of Table Positions */}
      <FlatList
        data={tables}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <Link
            href={{
              pathname: "/shop/[shopId]/settings/tables/update-table/[tableId]",
              params: { shopId: shop.id, tableId: item.id },
            }}
            asChild
          >
            <TouchableOpacity style={styles.item}>
              <Text style={styles.itemText}>{item.name}</Text>
            </TouchableOpacity>
          </Link>
        )}
      />

      {/* Create Table Position Button */}
      <TouchableOpacity
        style={styles.createButton}
        onPress={() =>
          router.push({
            pathname: "/shop/[shopId]/settings/tables/create-table",
            params: {
              shopId: shop.id,
            },
          })
        }
      >
        <Text style={styles.createButtonText}>Create Table</Text>
      </TouchableOpacity>
    </View>
  );
}
