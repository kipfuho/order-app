import React, { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, FlatList } from "react-native";
import { Link, useLocalSearchParams, useRouter } from "expo-router";
import { useSelector } from "react-redux";
import { ActivityIndicator } from "react-native-paper";
import _ from "lodash";
import { RootState } from "../../../../../../stores/store";
import { styles } from "../../../../../_layout";
import { Shop } from "../../../../../../stores/state.interface";

export default function CategoriesManagementPage() {
  const { shopId } = useLocalSearchParams();
  const shop = useSelector((state: RootState) =>
    state.shop.shops.find((s) => s.id.toString() === shopId)
  ) as Shop;

  // Fetch table positions from Redux store
  const dishCategories = useSelector(
    (state: RootState) => state.shop.dishCategories
  );
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const fetchDishCategories = async () => {
      try {
        setLoading(true);
        // await getTablePositions({
        //   shopId: shop.id,
        // });
      } catch (error) {
        console.error("Error fetching dishCategories:", error);
      } finally {
        setLoading(false);
      }
    };

    if (_.isEmpty(dishCategories)) {
      fetchDishCategories();
    }
  }, []);

  if (loading) {
    return <ActivityIndicator size="large" style={styles.loader} />;
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={dishCategories}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <Link
            href={{
              pathname:
                "/shop/[shopId]/menus/update-dish-category/[dishCategoryId]",
              params: { shopId: shop.id, dishCategoryId: item.id },
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
            pathname: "/shop/[shopId]/menus/create-dish-category",
            params: {
              shopId: shop.id,
            },
          })
        }
      >
        <Text style={styles.createButtonText}>Create Dish Category</Text>
      </TouchableOpacity>
    </View>
  );
}
