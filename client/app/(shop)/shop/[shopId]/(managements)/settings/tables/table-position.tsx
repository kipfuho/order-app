import React, { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, FlatList } from "react-native";
import { Link, useLocalSearchParams, useRouter } from "expo-router";
import { useSelector } from "react-redux";
import { RootState } from "../../../../../../../stores/store";
import { SafeAreaView } from "react-native-safe-area-context";
import { styles } from "../../../../../../_layout";
import { ActivityIndicator } from "react-native-paper";
import { getTablePositions } from "../../../../../../../api/api.service";
import _ from "lodash";

export default function TablePositionsManagementPage() {
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
  const tablePositions = useSelector(
    (state: RootState) => state.shop.tablePositions
  );
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const fetchTablePositions = async () => {
      try {
        setLoading(true);
        await getTablePositions({
          shopId: shop.id,
        });
      } catch (error) {
        console.error("Error fetching shops:", error);
      } finally {
        setLoading(false);
      }
    };

    if (_.isEmpty(tablePositions)) {
      fetchTablePositions();
    }
  }, []);

  if (loading) {
    return <ActivityIndicator size="large" style={styles.loader} />;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Table Positions</Text>

      {/* List of Table Positions */}
      <FlatList
        data={tablePositions}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <Link
            href={{
              pathname:
                "/shop/[shopId]/settings/tables/update-table-position/[tablePositionId]",
              params: { shopId: shop.id, tablePositionId: item.id },
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
