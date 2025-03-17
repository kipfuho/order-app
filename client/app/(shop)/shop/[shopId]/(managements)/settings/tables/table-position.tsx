import React, { useEffect, useLayoutEffect, useState } from "react";
import { View, Text, TouchableOpacity, FlatList } from "react-native";
import {
  Link,
  useLocalSearchParams,
  useNavigation,
  useRouter,
} from "expo-router";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../../../../../../stores/store";
import { SafeAreaView } from "react-native-safe-area-context";
import { styles } from "../../../../../../_layout";
import { ActivityIndicator } from "react-native-paper";
import { getTablePositions } from "../../../../../../../api/api.service";
import { Ionicons } from "@expo/vector-icons";

export default function TablePositionsManagementPage() {
  const { shopId } = useLocalSearchParams();
  const shop = useSelector((state: RootState) =>
    state.shop.shops.find((s) => s.id.toString() === shopId)
  );

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
  const router = useRouter();
  const navigation = useNavigation();

  const goBack = () =>
    router.navigate({
      pathname: "/shop/[shopId]/settings",
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

  // Fetch table positions from Redux store
  const tablePositions = useSelector(
    (state: RootState) => state.shop.tablePositions
  );
  const [loading, setLoading] = useState(true);
  const dispatch = useDispatch();

  useEffect(() => {
    const fetchTablePositions = async () => {
      try {
        await getTablePositions({
          shopId: shop.id,
          dispatch,
        });
      } catch (error) {
        console.error("Error fetching shops:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTablePositions();
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
