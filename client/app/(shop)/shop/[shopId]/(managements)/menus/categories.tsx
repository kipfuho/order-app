import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  ScrollView,
} from "react-native";
import { Link, useLocalSearchParams, useRouter } from "expo-router";
import { useSelector } from "react-redux";
import { ActivityIndicator, Button, Surface } from "react-native-paper";
import _ from "lodash";
import { RootState } from "../../../../../../stores/store";
import { Shop } from "../../../../../../stores/state.interface";
import { AppBar } from "../../../../../../components/AppBar";

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
    return <ActivityIndicator size="large" />;
  }

  const goBack = () =>
    router.navigate({
      pathname: "/shop/[shopId]/home",
      params: { shopId: shop.id },
    });

  return (
    <>
      <AppBar title="Dish Categories" goBack={goBack} />
      <Surface style={{ flex: 1 }}>
        <ScrollView style={{ flex: 1 }}>
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
                <TouchableOpacity>
                  <Text>{item.name}</Text>
                </TouchableOpacity>
              </Link>
            )}
          />
        </ScrollView>

        {/* Create Table Position Button */}
        <Button
          mode="contained"
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
          Create Dish Category
        </Button>
      </Surface>
    </>
  );
}

const styles = StyleSheet.create({
  content: {
    flexDirection: "row",
    flex: 1,
  },
  sidebar: {
    width: 120,
    paddingRight: 8,
  },
  categoryButton: {
    padding: 0,
    borderRadius: 0,
    marginBottom: 1,
  },
  dishList: {
    flex: 1,
  },
  categoryContainer: {
    marginBottom: 24,
  },
  categoryTitle: {
    marginBottom: 8,
  },
  createButton: {
    marginTop: 16,
    alignSelf: "center",
  },
});
