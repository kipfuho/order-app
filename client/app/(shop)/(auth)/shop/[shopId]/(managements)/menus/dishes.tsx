import React, { useCallback, useEffect, useState } from "react";
import { useRouter } from "expo-router";
import { useSelector } from "react-redux";
import { RootState } from "../../../../../../../stores/store";
import { Dish, Shop } from "../../../../../../../stores/state.interface";
import { AppBar } from "../../../../../../../components/AppBar";
import { Text, Surface, Menu, Portal, Dialog } from "react-native-paper";
import { GestureResponderEvent, Keyboard } from "react-native";
import Toast from "react-native-toast-message";
import {
  useDeleteDishMutation,
  useGetDishCategoriesQuery,
  useGetDishesQuery,
} from "../../../../../../../stores/apiSlices/dishApi.slice";
import { LoaderBasic } from "../../../../../../../components/ui/Loader";
import {
  goBackShopHome,
  goToDishUpdatePage,
} from "../../../../../../../apis/navigate.service";
import _, { debounce } from "lodash";
import { useTranslation } from "react-i18next";
import { ConfirmCancelDialog } from "../../../../../../../components/ui/CancelDialog";
import FlatListWithScroll, {
  ItemTypeFlatList,
} from "../../../../../../../components/FlatListWithScroll";
import { AppBarSearchBox } from "../../../../../../../components/AppBarSearchBox";
import { Gesture, GestureDetector } from "react-native-gesture-handler";

export default function DishesManagementPage() {
  const router = useRouter();
  const { t } = useTranslation();

  const shop = useSelector(
    (state: RootState) => state.shop.currentShop
  ) as Shop;
  const { data: dishes = [], isLoading: dishLoading } = useGetDishesQuery({
    shopId: shop.id,
  });
  const { data: dishCategories = [], isLoading: categoryLoading } =
    useGetDishCategoriesQuery({ shopId: shop.id });
  const [deleteDish, { isLoading: deleteDishLoading }] =
    useDeleteDishMutation();

  const [menuVisible, setMenuVisible] = useState(false);
  const [selectedDish, setSelectedDish] = useState<Dish>();
  const [menuPosition, setMenuPosition] = useState({ x: 0, y: 0 });
  const [dialogVisible, setDialogVisible] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const [searchVisible, setSearchVisible] = useState(false);
  const [filteredDishGroupById, setFilteredDishGroupById] = useState<
    Record<string, Dish[]>
  >({});

  const openMenu = (dish: Dish, event: GestureResponderEvent) => {
    setSelectedDish(dish);
    setMenuPosition({ x: event.nativeEvent.pageX, y: event.nativeEvent.pageY });
    setMenuVisible(true);
  };

  const confirmDelete = async () => {
    try {
      if (!selectedDish) {
        Toast.show({
          type: "error",
          text1: "Delete Failed",
          text2: "Cannot find dish",
        });
        return;
      }
      await deleteDish({
        shopId: shop.id,
        dishId: selectedDish.id,
      }).unwrap();
    } catch (err) {
      console.error(err);
    } finally {
      setDialogVisible(false);
      setMenuVisible(false);
    }
  };

  const goEditDish = () => {
    setMenuVisible(false);
    if (selectedDish) {
      goToDishUpdatePage({ router, shopId: shop.id, dishId: selectedDish.id });
    }
  };

  const gesture = Gesture.Race(
    Gesture.Tap().onStart(() => {
      setSearchVisible(false);
      Keyboard.dismiss();
    }),
    Gesture.Pan().onStart(() => {
      setSearchVisible(false);
      Keyboard.dismiss();
    })
  );

  const debouncedSearchDishes = useCallback(
    debounce((_searchValue: string) => {
      const searchValueLowerCase = _searchValue.toLowerCase();
      const matchedDishes = _.filter(
        dishes,
        (dish) =>
          _.includes((dish.name || "").toLowerCase(), searchValueLowerCase) ||
          _.includes((dish.code || "").toLowerCase(), searchValueLowerCase)
      );

      setFilteredDishGroupById(_.groupBy(matchedDishes, "category.id"));
    }, 200),
    [dishes]
  );

  useEffect(() => {
    debouncedSearchDishes(searchValue);

    return () => {
      debouncedSearchDishes.cancel();
    };
  }, [searchValue, debouncedSearchDishes]);

  if (dishLoading || categoryLoading) {
    return <LoaderBasic />;
  }

  return (
    <>
      <AppBar
        title={t("dishes")}
        goBack={() => goBackShopHome({ router, shopId: shop.id })}
        actions={
          <AppBarSearchBox
            searchValue={searchValue}
            searchVisible={searchVisible}
            setSearchValue={setSearchValue}
            setSearchVisible={setSearchVisible}
          />
        }
      />

      {/* Delete Confirmation Dialog */}
      <Portal>
        <ConfirmCancelDialog
          title={t("delete_confirm")}
          isLoading={deleteDishLoading}
          dialogVisible={dialogVisible}
          setDialogVisible={setDialogVisible}
          onCancelClick={() => {
            setDialogVisible(false);
          }}
          onConfirmClick={confirmDelete}
        >
          <Dialog.Content>
            <Text>
              {t("delete_confirm_detail")} {selectedDish?.name}?
            </Text>
          </Dialog.Content>
        </ConfirmCancelDialog>

        <Menu
          visible={menuVisible}
          onDismiss={() => setMenuVisible(false)}
          anchor={{ x: menuPosition.x, y: menuPosition.y }}
        >
          <Menu.Item
            onPress={goEditDish}
            title={t("edit")}
            leadingIcon="pencil"
          />
          <Menu.Item
            onPress={() => {
              setDialogVisible(true);
              setMenuVisible(false);
            }}
            title={t("delete")}
            leadingIcon="delete"
          />
        </Menu>
        <Toast />
      </Portal>

      <GestureDetector gesture={gesture}>
        <Surface style={{ flex: 1 }}>
          <FlatListWithScroll
            groups={dishCategories}
            itemByGroup={filteredDishGroupById}
            openMenu={openMenu}
            itemType={ItemTypeFlatList.DISH_CARD}
          />
        </Surface>
      </GestureDetector>
    </>
  );
}
