import React, { useState } from "react";
import { View, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import { useSelector } from "react-redux";
import {
  Dialog,
  List,
  Portal,
  Surface,
  Text,
  IconButton,
  useTheme,
  FAB,
} from "react-native-paper"; // Import IconButton for delete button
import { RootState } from "@stores/store";
import { DishCategory, Shop } from "@stores/state.interface";
import { AppBar } from "@components/AppBar";
import {
  useDeleteDishCategoryMutation,
  useGetDishCategoriesQuery,
} from "@stores/apiSlices/dishApi.slice";
import { LoaderBasic } from "@components/ui/Loader";
import {
  goToShopHome,
  goToCreateDishCategory,
  goToUpdateDishCategory,
} from "@apis/navigate.service";
import { useTranslation } from "react-i18next";
import { ConfirmCancelDialog } from "@components/ui/CancelDialog";
import Toast from "react-native-toast-message";

export default function CategoriesManagementPage() {
  const router = useRouter();
  const { t } = useTranslation();
  const theme = useTheme();

  const shop = useSelector(
    (state: RootState) => state.shop.currentShop,
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
    } catch {
      Toast.show({
        type: "error",
        text1: t("delete_failed"),
        text2: t("error_any"),
      });
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
        <Toast />
      </Portal>
      <AppBar
        title={t("dish_category")}
        goBack={() => goToShopHome({ router, shopId: shop.id })}
      />
      <Surface style={{ flex: 1, paddingHorizontal: 16 }}>
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
          <View style={{ height: 60 }} />
        </ScrollView>

        <FAB
          icon="plus"
          label={t("create_dish_category")}
          style={{
            position: "absolute",
            right: 16,
            bottom: 16,
          }}
          onPress={() => goToCreateDishCategory({ router, shopId: shop.id })}
        />
      </Surface>
    </>
  );
}
