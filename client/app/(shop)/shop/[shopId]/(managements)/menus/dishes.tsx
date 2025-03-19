import React, { useRef } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useSelector } from "react-redux";
import { RootState } from "../../../../../../stores/store";
import { Shop } from "../../../../../../stores/state.interface";
import { styles } from "../../../../../_layout";
import { DishCard } from "../../../../../../components/ui/menus/DishCard";

export default function DishesManagementPage() {
  const { shopId } = useLocalSearchParams();
  const router = useRouter();

  // Sample dishes
  const dishes = [
    { id: "1", name: "Pizza", category: "Italian" },
    { id: "2", name: "Pasta", category: "Italian" },
    { id: "2", name: "Pasta", category: "Italian" },
    { id: "2", name: "Pasta", category: "Italian" },
    { id: "2", name: "Pasta", category: "Italian" },
    { id: "2", name: "Pasta", category: "Italian" },
    { id: "2", name: "Pasta", category: "Italian" },
    { id: "2", name: "Pasta", category: "Italian" },
    { id: "2", name: "Pasta", category: "Italian" },
    { id: "2", name: "Pasta", category: "Italian" },
    { id: "2", name: "Pasta", category: "Italian" },
    { id: "2", name: "Pasta", category: "Italian" },
    { id: "2", name: "Pasta", category: "Italian" },
    { id: "2", name: "Pasta", category: "Italian" },
    { id: "2", name: "Pasta", category: "Italian" },
    { id: "2", name: "Pasta", category: "Italian" },
    { id: "2", name: "Pasta", category: "Italian" },
    { id: "2", name: "Pasta", category: "Italian" },
    { id: "2", name: "Pasta", category: "Italian" },
    { id: "2", name: "Pasta", category: "Italian" },
    { id: "2", name: "Pasta", category: "Italian" },
    { id: "2", name: "Pasta", category: "Italian" },
    { id: "2", name: "Pasta", category: "Italian" },
    { id: "2", name: "Pasta", category: "Italian" },
    { id: "2", name: "Pasta", category: "Italian" },
    { id: "2", name: "Pasta", category: "Italian" },
    { id: "2", name: "Pasta", category: "Italian" },
    { id: "2", name: "Pasta", category: "Italian" },
    { id: "2", name: "Pasta", category: "Italian" },
    { id: "3", name: "Sushi", category: "Japanese" },
    { id: "4", name: "Ramen", category: "Japanese" },
    { id: "4", name: "Ramen", category: "Japanese" },
    { id: "4", name: "Ramen", category: "Japanese" },
    { id: "4", name: "Ramen", category: "Japanese" },
    { id: "4", name: "Ramen", category: "Japanese" },
    { id: "4", name: "Ramen", category: "Japanese" },
    { id: "4", name: "Ramen", category: "Japanese" },
    { id: "4", name: "Ramen", category: "Japanese" },
    { id: "4", name: "Ramen", category: "Japanese" },
    { id: "4", name: "Ramen", category: "Japanese" },
    { id: "4", name: "Ramen", category: "Japanese" },
    { id: "4", name: "Ramen", category: "Japanese" },
    { id: "4", name: "Ramen", category: "Japanese" },
    { id: "4", name: "Ramen", category: "Japanese" },
    { id: "4", name: "Ramen", category: "Japanese" },
    { id: "5", name: "Burger", category: "American" },
    { id: "5", name: "Burger", category: "American" },
    { id: "5", name: "Burger", category: "American" },
    { id: "5", name: "Burger", category: "American" },
    { id: "5", name: "Burger", category: "American" },
    { id: "5", name: "Burger", category: "American" },
    { id: "5", name: "Burger", category: "American" },
    { id: "5", name: "Burger", category: "American" },
    { id: "5", name: "Burger", category: "American" },
    { id: "5", name: "Burger", category: "American" },
    { id: "5", name: "Burger", category: "American" },
    { id: "5", name: "Burger", category: "American" },
    { id: "5", name: "Burger", category: "American" },
    { id: "5", name: "Burger", category: "American" },
    { id: "5", name: "Burger", category: "American" },
    { id: "5", name: "Burger", category: "American" },
    { id: "5", name: "Burger", category: "American" },
    { id: "5", name: "Burger", category: "American" },
    { id: "5", name: "Burger", category: "American" },
    { id: "5", name: "Burger", category: "American" },
    { id: "5", name: "Burger", category: "American" },
    { id: "5", name: "Burger", category: "American" },
    { id: "5", name: "Burger", category: "American" },
    { id: "5", name: "Burger", category: "American" },
    { id: "5", name: "Burger", category: "American" },
    { id: "5", name: "Burger", category: "American" },
    { id: "5", name: "Burger", category: "American" },
  ];

  // Get shop from Redux
  const shop = useSelector((state: RootState) =>
    state.shop.shops.find((s) => s.id.toString() === shopId)
  ) as Shop;

  // Group dishes by category
  const groupByCategory = (dishes) => {
    return dishes.reduce((acc, dish) => {
      if (!acc[dish.category]) {
        acc[dish.category] = [];
      }
      acc[dish.category].push(dish);
      return acc;
    }, {});
  };

  const groupedDishes = groupByCategory(dishes);
  const categories = Object.keys(groupedDishes);

  // Create refs for each category
  const categoryRefs = useRef({});

  const scrollToCategory = (category) => {
    if (categoryRefs.current[category]) {
      categoryRefs.current[category].scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        {/* Left Sidebar for Categories */}
        <View style={styles.sidebar}>
          <FlatList
            data={categories}
            keyExtractor={(category) => category}
            renderItem={({ item: category }) => (
              <TouchableOpacity
                style={styles.categoryButton}
                onPress={() => scrollToCategory(category)}
              >
                <Text style={styles.categoryButtonText}>{category}</Text>
              </TouchableOpacity>
            )}
          />
        </View>

        {/* Right Section for Dishes */}
        <View style={styles.dishList}>
          <ScrollView>
            {categories.map((category) => (
              <View
                key={category}
                ref={(el) => (categoryRefs.current[category] = el)}
                style={styles.categoryContainer}
              >
                <Text style={styles.categoryTitle}>{category}</Text>
                {groupedDishes[category].map((dish) => (
                  <DishCard key={dish.id} dish={dish} />
                ))}
              </View>
            ))}
          </ScrollView>
          {/* Create Dish Button */}
          <TouchableOpacity
            style={styles.createButton}
            onPress={() =>
              router.push({
                pathname: "/shop/[shopId]/menus/create-dish",
                params: { shopId: shop.id },
              })
            }
          >
            <Text style={styles.createButtonText}>Create Dish</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}
