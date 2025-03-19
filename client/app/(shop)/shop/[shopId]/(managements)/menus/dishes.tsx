import React, { useRef } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useSelector } from "react-redux";
import { RootState } from "../../../../../../stores/store";
import { Dish, Shop } from "../../../../../../stores/state.interface";
import { DishCard } from "../../../../../../components/ui/menus/DishCard";
import { AppBar } from "../../../../../../components/AppBar";
import { useTheme, Button, Text, Surface } from "react-native-paper";
import { findNodeHandle, ScrollView, StyleSheet, View } from "react-native";

export default function DishesManagementPage() {
  const { shopId } = useLocalSearchParams();
  const router = useRouter();
  const theme = useTheme();

  // Get shop from Redux
  const shop = useSelector((state: RootState) =>
    state.shop.shops.find((s) => s.id.toString() === shopId)
  ) as Shop;

  // Get shop dishes from Redux
  const dishes = useSelector((state: RootState) => state.shop.dishes);

  // Group dishes by category
  const groupByCategory = (dishes: Dish[]): Record<string, Dish[]> => {
    return dishes.reduce<Record<string, Dish[]>>((acc, dish) => {
      if (!acc[dish.category]) {
        acc[dish.category] = [];
      }
      acc[dish.category].push(dish);
      return acc;
    }, {});
  };

  const groupedDishes = groupByCategory(dishes);
  const categories = Object.keys(groupedDishes);

  // Create refs
  const scrollViewRef = useRef<ScrollView | null>(null);
  const categoryRefs = useRef<Record<string, View | null>>({});

  // Function to scroll to category
  const scrollToCategory = (category: string) => {
    const ref = categoryRefs.current[category];

    if (ref && scrollViewRef.current) {
      ref.measure((x, y) => {
        scrollViewRef.current?.scrollTo({ y, animated: true });
      });
    }
  };

  const goBack = () =>
    router.navigate({
      pathname: "/shop/[shopId]/home",
      params: { shopId: shop.id },
    });

  return (
    <>
      <AppBar title="Dishes" goBack={goBack} />
      <Surface style={{ flex: 1, padding: 16 }}>
        <Surface style={styles.content}>
          {/* Left Sidebar for Categories */}
          <Surface
            style={[styles.sidebar, { backgroundColor: theme.colors.backdrop }]}
          >
            <ScrollView showsVerticalScrollIndicator={false}>
              {categories.map((category) => (
                <Button
                  key={category}
                  mode="contained-tonal"
                  onPress={() => scrollToCategory(category)}
                  style={styles.categoryButton}
                  labelStyle={{ color: theme.colors.onSurface }}
                >
                  {category}
                </Button>
              ))}
            </ScrollView>
          </Surface>

          {/* Right Section for Dishes */}
          <Surface style={{ flex: 1 }}>
            <ScrollView ref={scrollViewRef} style={styles.dishList}>
              {categories.map((category) => (
                <View
                  key={category}
                  ref={(el) => (categoryRefs.current[category] = el)}
                  style={styles.categoryContainer}
                >
                  <Text variant="titleMedium" style={styles.categoryTitle}>
                    {category}
                  </Text>
                  {groupedDishes[category].map((dish) => (
                    <DishCard key={dish.id} dish={dish} />
                  ))}
                </View>
              ))}
            </ScrollView>

            {/* Create Dish Button */}
            <Button
              mode="contained-tonal"
              onPress={() =>
                router.push({
                  pathname: "/shop/[shopId]/menus/create-dish",
                  params: { shopId: shop.id },
                })
              }
              style={styles.createButton}
            >
              Create Dish
            </Button>
          </Surface>
        </Surface>
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
