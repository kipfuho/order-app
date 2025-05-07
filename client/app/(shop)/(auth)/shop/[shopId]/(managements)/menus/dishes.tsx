import React, { useRef, useState } from "react";
import { useRouter } from "expo-router";
import { useSelector } from "react-redux";
import { RootState } from "../../../../../../../stores/store";
import {
  Dish,
  DishCategory,
  Shop,
} from "../../../../../../../stores/state.interface";
import { DishCard } from "../../../../../../../components/ui/menus/DishCard";
import { AppBar } from "../../../../../../../components/AppBar";
import {
  useTheme,
  Button,
  Text,
  Surface,
  Menu,
  Portal,
  Dialog,
  ActivityIndicator,
  TouchableRipple,
} from "react-native-paper";
import {
  GestureResponderEvent,
  ScrollView,
  StyleSheet,
  useWindowDimensions,
  View,
} from "react-native";
import { deleteDishRequest } from "../../../../../../../apis/dish.api.service";
import Toast from "react-native-toast-message";
import {
  useGetDishCategoriesQuery,
  useGetDishesQuery,
} from "../../../../../../../stores/apiSlices/dishApi.slice";
import { LoaderBasic } from "../../../../../../../components/ui/Loader";
import {
  goBackShopHome,
  goToCreateDish,
  goToDishUpdatePage,
} from "../../../../../../../apis/navigate.service";
import _ from "lodash";
import { useTranslation } from "react-i18next";

function CategoryList({
  dishCategories = [],
  scrollToCategory,
}: {
  dishCategories: DishCategory[];
  scrollToCategory: (id: string) => void;
}) {
  const theme = useTheme();
  const { width } = useWindowDimensions();

  if (width < 600) {
    return (
      <Surface
        style={{
          backgroundColor: theme.colors.background,
        }}
      >
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{
            flex: 1,
            flexDirection: "column",
            width: "25%",
          }}
        >
          <View
            style={{
              flexDirection: "row", // layout items in a row
              gap: 8, // spacing between items (RN 0.71+ supports `gap`)
              paddingVertical: 8,
            }}
          >
            {dishCategories.map((category) => (
              <TouchableRipple
                key={category.id}
                onPress={() => scrollToCategory(category.id)}
                style={{
                  backgroundColor: theme.colors.primaryContainer,
                  paddingVertical: 12,
                  paddingHorizontal: 16,
                  borderRadius: 4,
                }}
              >
                <Text
                  variant="bodyMedium"
                  style={{
                    flexWrap: "wrap",
                    maxWidth: 200, // optional: to allow wrapping in long labels
                  }}
                >
                  {category.name}
                </Text>
              </TouchableRipple>
            ))}
          </View>
        </ScrollView>
      </Surface>
    );
  }

  return (
    <Surface
      style={[styles.sidebar, { backgroundColor: theme.colors.background }]}
    >
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={{ gap: 1 }}>
          {dishCategories.map((category) => {
            return (
              <TouchableRipple
                key={category.id}
                onPress={() => scrollToCategory(category.id)}
                style={{
                  backgroundColor: theme.colors.primaryContainer,
                  paddingVertical: 12,
                  paddingHorizontal: 8,
                  borderRadius: 4,
                }}
              >
                <Text
                  variant="bodyMedium"
                  style={{
                    flexWrap: "wrap",
                  }}
                >
                  {category.name}
                </Text>
              </TouchableRipple>
            );
          })}
        </View>
      </ScrollView>
    </Surface>
  );
}

export default function DishesManagementPage() {
  const router = useRouter();
  const { t } = useTranslation();
  const { width } = useWindowDimensions();
  const [dishCardContainerWidth, setDishCardContainerWidth] =
    React.useState<number>();

  const shop = useSelector(
    (state: RootState) => state.shop.currentShop
  ) as Shop;
  const { data: dishes, isLoading: dishLoading } = useGetDishesQuery({
    shopId: shop.id,
  });
  const { data: dishCategories = [], isLoading: categoryLoading } =
    useGetDishCategoriesQuery({ shopId: shop.id });
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
        <Toast />
      </Portal>

      <Surface style={{ flex: 1 }}>
        <Surface
          style={{ flex: 1, flexDirection: width >= 600 ? "row" : "column" }}
        >
          {/* Left Sidebar for Categories */}
          <CategoryList
            dishCategories={dishCategories}
            scrollToCategory={scrollToCategory}
          />

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
                      boxShadow: "none",
                      gap: 10,
                    }}
                    onLayout={(event) => {
                      const { width } = event.nativeEvent.layout;
                      setDishCardContainerWidth(width);
                    }}
                  >
                    {_.get(dishesGroupByCategoryId, category.id, []).map(
                      (dish) => (
                        <DishCard
                          key={dish.id}
                          dish={dish}
                          openMenu={openMenu}
                          containerWidth={dishCardContainerWidth}
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
              {t("create_dish")}
            </Button>
          </Surface>
        </Surface>
      </Surface>
    </>
  );
}

const styles = StyleSheet.create({
  sidebar: {
    width: 120,
  },
  categoryButton: {
    padding: 0,
    borderRadius: 0,
  },
  dishList: {
    flex: 1,
  },
  categoryContainer: {
    marginBottom: 12,
    padding: 8,
  },
  categoryTitle: {
    marginBottom: 8,
  },
  createButton: {
    marginVertical: 10,
    alignSelf: "center",
  },
});
