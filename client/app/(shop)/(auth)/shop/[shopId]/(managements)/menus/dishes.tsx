import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "expo-router";
import { useSelector } from "react-redux";
import { RootState } from "@stores/store";
import { Dish, Shop } from "@stores/state.interface";
import { AppBar } from "@components/AppBar";
import { Text, Surface, Menu, Portal, Dialog, FAB } from "react-native-paper";
import { GestureResponderEvent, Keyboard, View } from "react-native";
import Toast from "react-native-toast-message";
import {
  useDeleteDishMutation,
  useGetDishCategoriesQuery,
  useGetDishesQuery,
} from "@stores/apiSlices/dishApi.slice";
import { LoaderBasic } from "@components/ui/Loader";
import {
  goToShopHome,
  goToCreateDish,
  goToDishUpdatePage,
} from "@apis/navigate.service";
import _, { debounce } from "lodash";
import { useTranslation } from "react-i18next";
import { ConfirmCancelDialog } from "@components/ui/CancelDialog";
import FlatListWithScroll, {
  ItemTypeFlatList,
} from "@components/FlatListWithScroll";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import { runOnJS } from "react-native-reanimated";
import AppBarSearchBox from "@/components/AppBarSearchBox";
import { styles } from "@/constants/styles";
import { PermissionType } from "@/constants/common";
import toastConfig from "@/components/CustomToast";
import { normalizeVietnamese } from "@/constants/utils";

const createDismissGesture = (onDismissSearch: () => void) =>
  Gesture.Tap().onStart(() => {
    runOnJS(onDismissSearch)();
  });

export default function DishesManagementPage() {
  const router = useRouter();
  const { t } = useTranslation();

  const { currentShop, userPermission } = useSelector(
    (state: RootState) => state.shop,
  );
  const shop = currentShop as Shop;
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

  const openMenu = useCallback((dish: Dish, event: GestureResponderEvent) => {
    setSelectedDish(dish);
    setMenuPosition({ x: event.nativeEvent.pageX, y: event.nativeEvent.pageY });
    setMenuVisible(true);
  }, []);

  const confirmDelete = async () => {
    try {
      if (!selectedDish) {
        Toast.show({
          type: "error",
          text1: t("delete_failed"),
          text2: t("dish_not_found"),
        });
        return;
      }
      await deleteDish({
        shopId: shop.id,
        dishId: selectedDish.id,
      }).unwrap();
    } catch {
      Toast.show({
        type: "error",
        text1: t("delete_failed"),
        text2: t("error_any"),
      });
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

  const onDismissSearch = () => {
    setSearchVisible(false);
    Keyboard.dismiss();
  };

  const gesture = createDismissGesture(onDismissSearch);

  const normalizedDishNames = useMemo(() => {
    return dishes.map((dish) => normalizeVietnamese(dish.name.toLowerCase()));
  }, [dishes]);

  const debouncedSearchDishes = useMemo(
    () =>
      debounce((_searchValue: string) => {
        const searchValueLowerCase = _searchValue.toLowerCase();
        const normalizedFilterText = normalizeVietnamese(searchValueLowerCase);
        const matchedDishes = _.filter(dishes, (dish, index) => {
          const _normalizedItemText = normalizedDishNames[index];

          return (
            _normalizedItemText.includes(normalizedFilterText) ||
            _.includes((dish.code || "").toLowerCase(), searchValueLowerCase)
          );
        });

        setFilteredDishGroupById(_.groupBy(matchedDishes, "category.id"));
      }, 200),
    [dishes, normalizedDishNames],
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
        goBack={() => goToShopHome({ router, shopId: shop.id })}
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
        <Toast config={toastConfig} />
      </Portal>

      <GestureDetector gesture={gesture}>
        <Surface style={{ flex: 1 }}>
          <FlatListWithScroll
            groups={dishCategories}
            itemByGroup={filteredDishGroupById}
            openMenu={
              userPermission.has(PermissionType.UPDATE_MENU)
                ? openMenu
                : undefined
            }
            itemType={ItemTypeFlatList.DISH_CARD}
          >
            {userPermission.has(PermissionType.CREATE_MENU) && (
              <View style={{ height: 60 }} />
            )}
          </FlatListWithScroll>
          {userPermission.has(PermissionType.CREATE_MENU) && (
            <FAB
              icon="plus"
              label={t("create_dish")}
              style={styles.baseFAB}
              onPress={() => goToCreateDish({ router, shopId: shop.id })}
            />
          )}
        </Surface>
      </GestureDetector>
    </>
  );
}
