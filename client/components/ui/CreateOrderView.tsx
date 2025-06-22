import _, { debounce } from "lodash";
import {
  ActivityIndicator,
  Button,
  Icon,
  Surface,
  Text,
} from "react-native-paper";
import { Dispatch, SetStateAction, useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { Keyboard, ScrollView } from "react-native";
import Toast from "react-native-toast-message";
import { useTranslation } from "react-i18next";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import { runOnJS } from "react-native-reanimated";
import {
  useGetDishCategoriesQuery,
  useGetDishesQuery,
  useGetDishTypesQuery,
} from "@stores/apiSlices/dishApi.slice";
import { RootState } from "@stores/store";
import { Dish, DishCategory, Shop } from "@stores/state.interface";
import { LoaderBasic } from "./Loader";
import { useCreateOrderMutation } from "@stores/apiSlices/orderApi.slice";
import { convertPaymentAmount, normalizeVietnamese } from "@constants/utils";
import { ItemTypeFlatList } from "../FlatListWithScroll";
import FlatListWithoutScroll from "../FlatListWithoutScroll";
import { AppBar } from "../AppBar";
import AppBarSearchBox from "../AppBarSearchBox";
import { goToTableCurrentOrderSessions } from "@/apis/navigate.service";
import { useRouter } from "expo-router";

const createDismissGesture = (onDismissSearch: () => void) =>
  Gesture.Tap().onStart(() => {
    runOnJS(onDismissSearch)();
  });

/**
 * wrapped in a modal
 * @returns
 */
export default function CreateOrder({
  setCreateOrderVisible,
  goBack,
  isNewOrder,
}: {
  setCreateOrderVisible: Dispatch<SetStateAction<boolean>>;
  goBack: () => void;
  isNewOrder?: boolean;
}) {
  const { t } = useTranslation();
  const router = useRouter();

  const {
    currentShop,
    currentOrderTotalAmount,
    currentOrder,
    currentTable,
    currentOrderSession,
    dishesByCategory,
  } = useSelector((state: RootState) => state.shop);
  const shop = currentShop as Shop;

  const { data: dishes = [], isLoading: dishLoading } = useGetDishesQuery({
    shopId: shop.id,
  });
  const { data: dishCategories = [], isLoading: dishCategoryLoading } =
    useGetDishCategoriesQuery({ shopId: shop.id });
  const { data: dishTypes = [], isLoading: dishTypeLoading } =
    useGetDishTypesQuery({ shopId: shop.id });
  const [createOrder, { isLoading: createOrderLoading }] =
    useCreateOrderMutation();

  const [selectedDishType, setDishType] = useState<string>("ALL");
  const [searchValue, setSearchValue] = useState("");
  const [searchVisible, setSearchVisible] = useState(false);
  const [applicableCategories, setApplicableCategories] = useState<
    DishCategory[]
  >([]);
  const [filteredDishesByCategory, setFilteredDishesByCategory] = useState<
    Record<string, Dish[]>
  >({});
  const normalizedDishNameByCode = useMemo(() => {
    const map: Record<string, string> = {};
    dishes.forEach((dish) => {
      map[dish.code] = normalizeVietnamese(dish.name.toLowerCase());
    });
    return map;
  }, [dishes]);

  const handleCreateOrder = async () => {
    if (currentOrderTotalAmount === 0) {
      Toast.show({
        type: "error",
        text1: t("create_order_failed"),
        text2: t("error_create_order_empty_dish"),
      });
      return;
    }
    if (!currentTable) {
      Toast.show({
        type: "error",
        text1: t("create_order_failed"),
        text2: t("table_not_found"),
      });
      return;
    }
    await createOrder({
      dishOrders: Object.values(currentOrder),
      shopId: shop.id,
      orderSessionId: currentOrderSession?.id,
      tableId: currentTable.id,
    }).unwrap();
    setCreateOrderVisible(false);
    if (isNewOrder) {
      goToTableCurrentOrderSessions({
        router,
        shopId: shop.id,
        tableId: currentTable.id,
      });
    }
  };

  const debouncedSearchDishes = useMemo(
    () =>
      debounce((_selectedDishType: string, _searchValue: string) => {
        const tableDishes = _.flatMap(
          currentTable?.position.dishCategoryIds,
          (dishCategoryId) => {
            return dishesByCategory[dishCategoryId] || [];
          },
        );
        const searchValueLowerCase = _searchValue.toLowerCase();
        const normalizedFilterText = normalizeVietnamese(searchValueLowerCase);
        const filteredDishes = _.filter(tableDishes, (d) => {
          const _normalizedItemText = normalizedDishNameByCode[d.code] || "";

          if (_selectedDishType !== "ALL") {
            return (
              d.type === _selectedDishType &&
              (_normalizedItemText.includes(normalizedFilterText) ||
                _.includes((d.code || "").toLowerCase(), searchValueLowerCase))
            );
          }
          return (
            _normalizedItemText.includes(normalizedFilterText) ||
            _.includes((d.code || "").toLowerCase(), searchValueLowerCase)
          );
        });

        setFilteredDishesByCategory(_.groupBy(filteredDishes, "category.id"));
        setApplicableCategories(
          dishCategories.filter((dc) =>
            currentTable?.position.dishCategoryIds.includes(dc.id),
          ),
        );
      }, 200),
    [dishCategories, currentTable, dishesByCategory, normalizedDishNameByCode],
  );

  useEffect(() => {
    debouncedSearchDishes(selectedDishType, searchValue);
  }, [selectedDishType, dishLoading, searchValue, debouncedSearchDishes]);

  const onDismissSearch = () => {
    setSearchVisible(false);
    Keyboard.dismiss();
  };

  const gesture = createDismissGesture(onDismissSearch);

  if (dishLoading || dishCategoryLoading || dishTypeLoading) {
    return <LoaderBasic />;
  }

  return (
    <>
      <AppBar
        title={t("create_order")}
        goBack={goBack}
        actions={
          <AppBarSearchBox
            searchValue={searchValue}
            searchVisible={searchVisible}
            setSearchValue={setSearchValue}
            setSearchVisible={setSearchVisible}
          />
        }
      />
      <GestureDetector gesture={gesture}>
        <Surface style={{ flex: 1 }}>
          <Surface mode="flat" style={{ height: 50 }}>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{
                paddingLeft: 5,
              }}
            >
              <Button
                key="ALL"
                mode={
                  selectedDishType === "ALL" ? "contained" : "contained-tonal"
                }
                onPress={() => setDishType("ALL")}
                style={{
                  width: "auto",
                  borderRadius: 0,
                  margin: 0,
                  alignSelf: "center",
                }}
              >
                {t("all")}
              </Button>
              {dishTypes.map((dishType) => (
                <Button
                  key={dishType}
                  mode={
                    selectedDishType === dishType
                      ? "contained"
                      : "contained-tonal"
                  }
                  onPress={() => setDishType(dishType)}
                  style={{
                    width: "auto",
                    borderRadius: 0,
                    margin: 0,
                    alignSelf: "center",
                  }}
                >
                  {dishType}
                </Button>
              ))}
            </ScrollView>
          </Surface>

          <FlatListWithoutScroll
            groups={applicableCategories}
            itemByGroup={filteredDishesByCategory}
            itemType={ItemTypeFlatList.DISH_CARD_ORDER}
          />

          <Surface
            mode="flat"
            style={{
              flexDirection: "row",
              justifyContent: "center",
              alignItems: "center",
              padding: 10,
            }}
          >
            <Icon source="cart-outline" size={40} />
            <Text
              variant="bodyLarge"
              style={{ fontWeight: "bold", marginRight: 20 }}
            >
              {convertPaymentAmount(currentOrderTotalAmount)}
            </Text>
            {createOrderLoading ? (
              <ActivityIndicator />
            ) : (
              <Button
                mode="contained"
                onPress={handleCreateOrder}
                style={{ width: "auto" }}
              >
                {t("create_order")}
              </Button>
            )}
          </Surface>
        </Surface>
      </GestureDetector>
    </>
  );
}
