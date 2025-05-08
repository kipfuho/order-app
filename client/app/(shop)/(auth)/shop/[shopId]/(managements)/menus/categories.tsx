import React, { useState } from "react";
import { StyleSheet, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import { useSelector } from "react-redux";
import {
  Button,
  Dialog,
  List,
  Portal,
  Surface,
  Text,
  IconButton,
  useTheme,
} from "react-native-paper"; // Import IconButton for delete button
import _ from "lodash";
import { RootState } from "../../../../../../../stores/store";
import {
  DishCategory,
  Shop,
} from "../../../../../../../stores/state.interface";
import { AppBar } from "../../../../../../../components/AppBar";
import {
  useDeleteDishCategoryMutation,
  useGetDishCategoriesQuery,
} from "../../../../../../../stores/apiSlices/dishApi.slice";
import { LoaderBasic } from "../../../../../../../components/ui/Loader";
import {
  goBackShopHome,
  goToCreateDishCategory,
  goToUpdateDishCategory,
} from "../../../../../../../apis/navigate.service";
import { useTranslation } from "react-i18next";
import { ConfirmCancelDialog } from "../../../../../../../components/ui/CancelDialog";
import Toast from "react-native-toast-message";

export default function CategoriesManagementPage() {
  const router = useRouter();
  const { t } = useTranslation();
  const theme = useTheme();

  const shop = useSelector(
    (state: RootState) => state.shop.currentShop
  ) as Shop;
  const { data: dishCategories = [], isLoading: dishCategoryLoading } =
    useGetDishCategoriesQuery({ shopId: shop.id });
  const [deleteDishCategory, { isLoading: deleteDishCategoryLoading }] =
    useDeleteDishCategoryMutation();

  const [dialogVisible, setDialogVisible] = useState(false);
  const [selectedDishCategory, setSelectedDishCategory] =
    useState<DishCategory>();

  const confirmDelete = async () => {
    try {
      if (!selectedDishCategory) {
        Toast.show({
          type: "error",
          text1: "Delete Failed",
          text2: "Cannot find dish category",
        });
        return;
      }
      await deleteDishCategory({
        shopId: shop.id,
        dishCategoryId: selectedDishCategory.id,
      }).unwrap();
    } catch (err) {
      console.error(err);
    } finally {
      setDialogVisible(false);
    }
  };

  if (dishCategoryLoading) {
    return <LoaderBasic />;
  }

  return (
    <>
      <Portal>
        <ConfirmCancelDialog
          title={t("delete_confirm")}
          isLoading={deleteDishCategoryLoading}
          dialogVisible={dialogVisible}
          setDialogVisible={setDialogVisible}
          onCancelClick={() => {
            setDialogVisible(false);
          }}
          onConfirmClick={confirmDelete}
        >
          <Dialog.Content>
            <Text>
              {t("delete_confirm_detail")} {selectedDishCategory?.name}?
            </Text>
          </Dialog.Content>
        </ConfirmCancelDialog>
      </Portal>
      <AppBar
        title={t("dish_category")}
        goBack={() => goBackShopHome({ router, shopId: shop.id })}
      />
      <Surface style={{ flex: 1, padding: 16 }}>
        <ScrollView>
          {/* List of Dish Categories */}
          <List.Section>
            {dishCategories.map((item) => (
              <List.Item
                key={item.id}
                title={item.name}
                style={{
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
                right={() => (
                  <IconButton
                    icon="delete"
                    iconColor={theme.colors.error}
                    onPress={() => {
                      setSelectedDishCategory(item); // Set selected item for deletion
                      setDialogVisible(true); // Show delete confirmation dialog
                    }}
                  />
                )}
              />
            ))}
          </List.Section>
        </ScrollView>

        {/* Create Dish Category Button */}
        <Button
          mode="contained"
          style={styles.createButton}
          onPress={() => goToCreateDishCategory({ router, shopId: shop.id })}
        >
          {t("create_dish_category")}
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
