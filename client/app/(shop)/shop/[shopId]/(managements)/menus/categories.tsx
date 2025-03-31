import React from "react";
import { StyleSheet, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import { useSelector } from "react-redux";
import { Button, List, Surface, useTheme } from "react-native-paper";
import _ from "lodash";
import { RootState } from "../../../../../../stores/store";
import { Shop } from "../../../../../../stores/state.interface";
import { AppBar } from "../../../../../../components/AppBar";
import { useGetDishCategoriesQuery } from "../../../../../../stores/apiSlices/dishApi.slice";
import { LoaderBasic } from "../../../../../../components/ui/Loader";
import {
  goBackShopHome,
  goToCreateDishCategory,
  goToUpdateDishCategory,
} from "../../../../../../apis/navigate.service";

export default function CategoriesManagementPage() {
  const router = useRouter();
  const theme = useTheme();

  const shop = useSelector(
    (state: RootState) => state.shop.currentShop
  ) as Shop;
  const { data: dishCategories = [], isLoading: dishCategoryLoading } =
    useGetDishCategoriesQuery(shop.id);

  if (dishCategoryLoading) {
    return <LoaderBasic />;
  }

  return (
    <>
      <AppBar
        title="Dish Categories"
        goBack={() => goBackShopHome({ router, shopId: shop.id })}
      />
      <Surface style={{ flex: 1, padding: 16 }}>
        <ScrollView>
          {/* List of Table Positions */}
          <List.Section>
            {dishCategories.map((item) => (
              <List.Item
                key={item.id}
                title={item.name}
                style={{
                  backgroundColor: theme.colors.backdrop,
                  borderRadius: 8,
                  marginBottom: 8,
                }}
                left={(props) => <List.Icon {...props} icon="table" />}
                onPress={() =>
                  goToUpdateDishCategory({
                    router,
                    shopId: shop.id,
                    dishCategoryId: item.id,
                  })
                }
              />
            ))}
          </List.Section>
        </ScrollView>

        {/* Create Table Position Button */}
        <Button
          mode="contained"
          style={styles.createButton}
          onPress={() => goToCreateDishCategory({ router, shopId: shop.id })}
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
