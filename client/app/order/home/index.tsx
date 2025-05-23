import { Button, Modal, Portal, Surface, Text } from "react-native-paper";
import { styles } from "../../_layout";
import { Keyboard, ScrollView, useWindowDimensions, View } from "react-native";
import {
  useGetDishesQuery,
  useGetDishTypesQuery,
} from "../../../stores/apiSlices/dishApi.slice";
import { useSelector } from "react-redux";
import { RootState } from "../../../stores/store";
import { Dish, Shop, Table } from "../../../stores/state.interface";
import { LoaderBasic } from "../../../components/ui/Loader";
import _ from "lodash";
import { useTranslation } from "react-i18next";
import ImageSlider from "../../../components/ImageSlider";
import CustomerOrderMenu from "../../../components/ui/orders/CustomerOrderMenu";
import { useEffect, useState } from "react";
import { CustomerAppBar } from "../../../components/ui/customer/CustomerAppBar";
import {
  useGetCartQuery,
  useGetRecommendationDishesQuery,
} from "../../../stores/apiSlices/cartApi.slice";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import { AppBarSearchBox } from "../../../components/AppBarSearchBox";
import { runOnJS } from "react-native-reanimated";

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
  table: Table
) => {
  const dishesGroupByCategoryId = _.groupBy(dishes, "category.id");
  const tableDishes = _.flatMap(
    table.position.dishCategoryIds,
    (dishCategoryId) => {
      return dishesGroupByCategoryId[dishCategoryId] || [];
    }
  );
  const dishGroupByDishType = _.groupBy(tableDishes, "type");
  dishGroupByDishType["all"] = tableDishes;
  const availableDishTypes = _.filter(
    _.concat(["all"], dishTypes) as string[],
    (type) => !_.isEmpty(dishGroupByDishType[type])
  );
  return { availableDishTypes, dishGroupByDishType };
};

export default function CustomerHomePage() {
  const { t } = useTranslation();
  const { width } = useWindowDimensions();
  const buttonSize = getButtonSize(width);

  const { shop, table } = useSelector((state: RootState) => state.customer) as {
    shop: Shop;
    table: Table;
  };

  const { data: dishes = [], isLoading: dishLoading } = useGetDishesQuery({
    shopId: shop.id,
    isCustomerApp: true,
  });
  const { data: dishTypes = [], isLoading: dishTypeLoading } =
    useGetDishTypesQuery({
      shopId: shop.id,
      isCustomerApp: true,
    });
  const { data: recommendationDishes, isLoading: recommendationDishLoading } =
    useGetRecommendationDishesQuery(shop.id);
  const { isLoading: cartLoading } = useGetCartQuery(shop.id);

  const { availableDishTypes, dishGroupByDishType } = getDishGroupByDishType(
    dishes,
    dishTypes,
    table
  );

  const [selectedDishType, setSelectedDishType] = useState("all");
  const [menuVisible, setMenuVisible] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const [searchVisible, setSearchVisible] = useState(false);

  const onDismissSearch = () => {
    setSearchVisible(false);
    Keyboard.dismiss();
  };

  const gesture = createDismissGesture(onDismissSearch);

  useEffect(() => {
    console.log(recommendationDishes);
  }, [recommendationDishLoading]);

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
          <GestureDetector gesture={gesture}>
            <View style={{ flex: 1 }}>
              <CustomerAppBar goBack={() => setMenuVisible(false)}>
                <AppBarSearchBox
                  searchValue={searchValue}
                  searchVisible={searchVisible}
                  setSearchValue={setSearchValue}
                  setSearchVisible={setSearchVisible}
                />
              </CustomerAppBar>
              <CustomerOrderMenu
                dishes={
                  searchValue
                    ? _.filter(dishGroupByDishType[selectedDishType], (dish) =>
                        _.includes(dish.name, searchValue)
                      )
                    : dishGroupByDishType[selectedDishType]
                }
              />
            </View>
          </GestureDetector>
        </Modal>
      </Portal>
      <Surface style={styles.baseContainer}>
        <ScrollView>
          <ImageSlider
            images={[
              "https://picsum.photos/700",
              "https://picsum.photos/700",
              "https://picsum.photos/700",
              "https://picsum.photos/700",
              "https://picsum.photos/700",
            ]}
          />
          <Surface mode="flat" style={styles.baseGrid}>
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
          </Surface>
        </ScrollView>
      </Surface>
    </>
  );
}
