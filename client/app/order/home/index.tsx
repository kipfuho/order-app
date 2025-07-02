import _, { debounce } from "lodash";
import { Button, Modal, Portal, Surface, Text } from "react-native-paper";
import { Keyboard, ScrollView, useWindowDimensions, View } from "react-native";
import {
  useGetDishesQuery,
  useGetDishTypesQuery,
} from "@stores/apiSlices/dishApi.slice";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@stores/store";
import { CartItem, Dish, Shop, Table } from "@stores/state.interface";
import { LoaderBasic } from "@components/ui/Loader";
import { useTranslation } from "react-i18next";
import CustomerOrderMenu from "@components/ui/orders/CustomerOrderMenu";
import { useEffect, useMemo, useState } from "react";
import { CustomerAppBar } from "@components/ui/customer/CustomerAppBar";
import {
  useGetCartQuery,
  useGetRecommendationDishesQuery,
  useUpdateCartMutation,
} from "@stores/apiSlices/cartApi.slice";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import { runOnJS } from "react-native-reanimated";
import AppBarSearchBox from "@/components/AppBarSearchBox";
import { styles } from "@/constants/styles";
import RecommendDishImageSlider from "@/components/RecommendDishSlider";
import { updateIsUpdateCartDebouncing } from "@/stores/customerSlice";
import { mergeCartItems, normalizeVietnamese } from "@/constants/utils";

const getButtonSize = (width: number) => {
  return width / 2 - 30;
};

const createDismissGesture = (onDismissSearch: () => void) =>
  Gesture.Tap().onStart(() => {
    runOnJS(onDismissSearch)();
  });

const getDishGroupByDishType = (
  dishes: Dish[],
  dishTypes: string[],
  table: Table,
) => {
  const dishesGroupByCategoryId = _.groupBy(dishes, "category.id");
  const tableDishes = _.flatMap(
    table.position.dishCategoryIds,
    (dishCategoryId) => {
      return dishesGroupByCategoryId[dishCategoryId] || [];
    },
  );
  const dishGroupByDishType = _.groupBy(tableDishes, "type");
  dishGroupByDishType["all"] = tableDishes;
  const availableDishTypes = _.filter(
    _.concat(["all"], dishTypes) as string[],
    (type) => !_.isEmpty(dishGroupByDishType[type]),
  );
  return { availableDishTypes, dishGroupByDishType };
};

export default function CustomerHomePage() {
  const { t } = useTranslation();
  const { width } = useWindowDimensions();
  const buttonSize = getButtonSize(width);
  const dispatch = useDispatch();

  const customerState = useSelector((state: RootState) => state.customer);
  const { shop, table } = customerState as {
    shop: Shop;
    table: Table;
  };
  const { currentCartItem, currentCartAmount } = customerState;

  const { data: dishes = [], isLoading: dishLoading } = useGetDishesQuery({
    shopId: shop.id,
    isCustomerApp: true,
  });
  const { data: dishTypes = [], isLoading: dishTypeLoading } =
    useGetDishTypesQuery({
      shopId: shop.id,
      isCustomerApp: true,
    });
  const {
    data: recommendationDishes = [],
    isLoading: recommendationDishLoading,
  } = useGetRecommendationDishesQuery(shop.id);
  const {
    data: cart,
    isLoading: cartLoading,
    isFetching: cartFetching,
  } = useGetCartQuery(shop.id);

  const [updateCart, { isLoading: updateCartLoading }] =
    useUpdateCartMutation();

  const debouncedUpdateCart = useMemo(
    () =>
      debounce(
        ({ shopId, cartItems }: { shopId: string; cartItems: CartItem[] }) => {
          updateCart({ cartItems, shopId });
        },
        1000,
      ),
    [updateCart],
  );

  const { availableDishTypes, dishGroupByDishType } = getDishGroupByDishType(
    dishes,
    dishTypes,
    table,
  );

  const [selectedDishType, setSelectedDishType] = useState("all");
  const [menuVisible, setMenuVisible] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const [normalizedSearchValue, setNormalizedSearchValue] = useState("");
  const [searchVisible, setSearchVisible] = useState(false);
  const normalizedDishNameByCode = useMemo(() => {
    const map: Record<string, string> = {};
    dishes.forEach((dish) => {
      map[dish.code] = normalizeVietnamese(dish.name.toLowerCase());
    });
    return map;
  }, [dishes]);

  const onDismissSearch = () => {
    setSearchVisible(false);
    Keyboard.dismiss();
  };

  const gesture = createDismissGesture(onDismissSearch);

  const handleClickRecommendDish = (dish: Dish) => {
    setSearchValue(dish.name);
    setNormalizedSearchValue(normalizeVietnamese(dish.name.toLowerCase()));
    setSearchVisible(true);
    setMenuVisible(true);
  };

  const handleSearchTextChange = (value: string) => {
    setSearchValue(value);
    setNormalizedSearchValue(normalizeVietnamese(value.toLowerCase()));
  };

  useEffect(() => {
    if (cartFetching || updateCartLoading) {
      return;
    }

    const isSameCart =
      currentCartAmount === cart?.totalAmount &&
      Object.values(currentCartItem).length === cart?.cartItems?.length;
    if (!isSameCart) {
      dispatch(updateIsUpdateCartDebouncing(true));
      debouncedUpdateCart({
        shopId: shop.id,
        cartItems: mergeCartItems(currentCartItem),
      });
    }
  }, [
    currentCartItem,
    cartFetching,
    updateCartLoading,
    cart,
    currentCartAmount,
    debouncedUpdateCart,
    dispatch,
    shop,
  ]);

  if (dishLoading || dishTypeLoading || cartLoading) {
    return <LoaderBasic />;
  }

  return (
    <>
      <Portal>
        <Modal
          visible={menuVisible}
          onDismiss={() => setMenuVisible(false)}
          contentContainerStyle={{
            flex: 1,
          }}
        >
          <View style={styles.flex}>
            <CustomerAppBar goBack={() => setMenuVisible(false)}>
              <AppBarSearchBox
                searchValue={searchValue}
                searchVisible={searchVisible}
                setSearchValue={handleSearchTextChange}
                setSearchVisible={setSearchVisible}
              />
            </CustomerAppBar>
            <GestureDetector gesture={gesture}>
              <CustomerOrderMenu
                dishes={
                  searchValue
                    ? _.filter(
                        dishGroupByDishType[selectedDishType],
                        (dish) => {
                          const _normalizedDishText =
                            normalizedDishNameByCode[dish.code] || "";

                          return _normalizedDishText.startsWith(
                            normalizedSearchValue,
                          );
                        },
                      )
                    : dishGroupByDishType[selectedDishType]
                }
              />
            </GestureDetector>
          </View>
        </Modal>
      </Portal>
      <Surface style={styles.baseContainer}>
        <ScrollView>
          <RecommendDishImageSlider
            dishes={recommendationDishes}
            isLoading={recommendationDishLoading}
            onDishPress={handleClickRecommendDish}
          />
          <View style={styles.baseGrid}>
            {availableDishTypes.map((dishType) => (
              <Button
                key={dishType}
                mode="contained-tonal"
                onPress={() => {
                  setSelectedDishType(dishType);
                  setMenuVisible(true);
                }}
                style={{
                  borderRadius: 10,
                }}
                contentStyle={{
                  height: 100,
                  width: buttonSize,
                }}
              >
                <View
                  style={{
                    flex: 1,
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <Text variant="bodyLarge">{t(dishType)}</Text>
                  <Text variant="bodySmall">
                    ({_.size(dishGroupByDishType[dishType])})
                  </Text>
                </View>
              </Button>
            ))}
          </View>
        </ScrollView>
      </Surface>
    </>
  );
}
