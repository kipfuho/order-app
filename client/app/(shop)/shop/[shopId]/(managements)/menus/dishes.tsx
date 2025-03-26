import React, { useEffect, useRef, useState } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useSelector } from "react-redux";
import { RootState } from "../../../../../../stores/store";
import { Dish, Shop } from "../../../../../../stores/state.interface";
import { DishCard } from "../../../../../../components/ui/menus/DishCard";
import { AppBar } from "../../../../../../components/AppBar";
import {
  useTheme,
  Button,
  Text,
  Surface,
  Menu,
  Portal,
  Dialog,
  ActivityIndicator,
} from "react-native-paper";
import {
  GestureResponderEvent,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import {
  deleteDishRequest,
  getDishesRequest,
} from "../../../../../../apis/dish.api.service";
import Toast from "react-native-toast-message";

// Group dishes by category
const groupByCategory = (dishes: Dish[]): Record<string, Dish[]> => {
  return dishes.reduce<Record<string, Dish[]>>((acc, dish) => {
    if (!acc[dish.category?.name]) {
      acc[dish.category?.name] = [];
    }
    acc[dish.category?.name].push(dish);
    return acc;
  }, {});
};

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

  const [loading, setLoading] = useState(false);
  const [menuVisible, setMenuVisible] = useState(false);
  const [selectedDish, setSelectedDish] = useState<Dish>();
  const [menuPosition, setMenuPosition] = useState({ x: 0, y: 0 });
  const [dialogVisible, setDialogVisible] = useState(false);

  const openMenu = (dish: Dish, event: GestureResponderEvent) => {
    setSelectedDish(dish);
    setMenuPosition({ x: event.nativeEvent.pageX, y: event.nativeEvent.pageY });
    setMenuVisible(true);
  };

  const confirmDelete = async () => {
    try {
      setLoading(true);
      if (!selectedDish) {
        Toast.show({
          type: "error",
          text1: "Delete Failed",
          text2: "Cannot find dish",
        });
        return;
      }
      await deleteDishRequest({
        shopId: shop.id,
        dishId: selectedDish.id,
      });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
      setDialogVisible(false);
      setMenuVisible(false);
    }
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

  const goEditDish = () => {
    setMenuVisible(false);
    if (selectedDish) {
      router.navigate({
        pathname: "/shop/[shopId]/menus/update-dish/[dishId]",
        params: {
          shopId: shop.id,
          dishId: selectedDish.id,
        },
      });
    }
  };

  useEffect(() => {
    const fetchDishes = async () => {
      await getDishesRequest({
        shopId: shop.id,
      });
    };

    fetchDishes();
  }, [shopId]);

  return (
    <>
      <AppBar title="Dishes" goBack={goBack} />
      <Menu
        visible={menuVisible}
        onDismiss={() => setMenuVisible(false)}
        anchor={{ x: menuPosition.x, y: menuPosition.y }}
      >
        <Menu.Item onPress={goEditDish} title="Edit" leadingIcon="pencil" />
        <Menu.Item
          onPress={() => {
            setDialogVisible(true);
            setMenuVisible(false);
          }}
          title="Delete"
          leadingIcon="delete"
        />
      </Menu>
      {/* Delete Confirmation Dialog */}
      <Portal>
        <Dialog
          visible={dialogVisible}
          style={{ width: "60%", alignSelf: "center" }}
          onDismiss={() => setDialogVisible(false || loading)}
        >
          <Dialog.Title>Confirm Delete</Dialog.Title>
          <Dialog.Content>
            <Text>Are you sure you want to delete {selectedDish?.name}?</Text>
          </Dialog.Content>
          <Dialog.Actions>
            {loading ? (
              <ActivityIndicator />
            ) : (
              <>
                <Button
                  mode="contained"
                  onPress={() => setDialogVisible(false)}
                >
                  Cancel
                </Button>
                <Button
                  mode="contained-tonal"
                  onPress={confirmDelete}
                  textColor="red"
                >
                  Delete
                </Button>
              </>
            )}
          </Dialog.Actions>
        </Dialog>
      </Portal>
      <Surface style={{ flex: 1 }}>
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
                  labelStyle={{
                    color: theme.colors.onSurface,
                    marginHorizontal: 0,
                  }}
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
                  <Surface
                    style={{
                      flexDirection: "row",
                      flexWrap: "wrap",
                      boxShadow: "0 0 0",
                    }}
                  >
                    {groupedDishes[category].map((dish) => (
                      <DishCard key={dish.id} dish={dish} openMenu={openMenu} />
                    ))}
                  </Surface>
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
    marginBottom: 12,
  },
  categoryTitle: {
    marginBottom: 8,
  },
  createButton: {
    marginTop: 16,
    alignSelf: "center",
  },
});
