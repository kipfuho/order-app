import React, { useRef, useState } from "react";
import { useRouter } from "expo-router";
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
import { deleteDishRequest } from "../../../../../../apis/dish.api.service";
import Toast from "react-native-toast-message";
import {
  useGetDishCategoriesQuery,
  useGetDishesQuery,
} from "../../../../../../stores/apiSlices/dishApi.slice";
import { LoaderBasic } from "../../../../../../components/ui/Loader";
import {
  goBackShopHome,
  goToCreateDish,
  goToDishUpdatePage,
} from "../../../../../../apis/navigate.service";
import _ from "lodash";

export default function DishesManagementPage() {
  const router = useRouter();
  const theme = useTheme();

  const shop = useSelector(
    (state: RootState) => state.shop.currentShop
  ) as Shop;
  const { data: dishes, isLoading: dishLoading } = useGetDishesQuery(shop.id);
  const { data: dishCategories = [], isLoading: categoryLoading } =
    useGetDishCategoriesQuery(shop.id);
  const dishesGroupByCategoryId = _.groupBy(dishes, "category.id");

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

  const goEditDish = () => {
    setMenuVisible(false);
    if (selectedDish) {
      goToDishUpdatePage({ router, shopId: shop.id, dishId: selectedDish.id });
    }
  };

  if (dishLoading || categoryLoading) {
    return <LoaderBasic />;
  }

  return (
    <>
      <AppBar
        title="Dishes"
        goBack={() => goBackShopHome({ router, shopId: shop.id })}
      />
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
              {dishCategories.map((category) => (
                <Button
                  key={category.id}
                  mode="contained-tonal"
                  onPress={() => scrollToCategory(category.id)}
                  style={styles.categoryButton}
                  labelStyle={{
                    color: theme.colors.onSurface,
                    marginHorizontal: 0,
                  }}
                >
                  {category.name}
                </Button>
              ))}
            </ScrollView>
          </Surface>

          {/* Right Section for Dishes */}
          <Surface style={{ flex: 1 }}>
            <ScrollView ref={scrollViewRef} style={styles.dishList}>
              {dishCategories.map((category) => (
                <View
                  key={category.id}
                  ref={(el) => (categoryRefs.current[category.id] = el)}
                  style={styles.categoryContainer}
                >
                  <Text variant="titleMedium" style={styles.categoryTitle}>
                    {category.name}
                  </Text>
                  <Surface
                    style={{
                      flexDirection: "row",
                      flexWrap: "wrap",
                      boxShadow: "0 0 0",
                    }}
                  >
                    {_.get(dishesGroupByCategoryId, category.id, []).map(
                      (dish) => (
                        <DishCard
                          key={dish.id}
                          dish={dish}
                          openMenu={openMenu}
                        />
                      )
                    )}
                  </Surface>
                </View>
              ))}
            </ScrollView>

            {/* Create Dish Button */}
            <Button
              mode="contained-tonal"
              onPress={() => goToCreateDish({ router, shopId: shop.id })}
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
