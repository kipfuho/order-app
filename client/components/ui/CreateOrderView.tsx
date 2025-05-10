import {
  ActivityIndicator,
  Button,
  Icon,
  Surface,
  Text,
} from "react-native-paper";
import { styles } from "../../app/_layout";
import {
  Dispatch,
  SetStateAction,
  useCallback,
  useEffect,
  useState,
} from "react";
import {
  useGetDishCategoriesQuery,
  useGetDishesQuery,
  useGetDishTypesQuery,
} from "../../stores/apiSlices/dishApi.slice";
import { useSelector } from "react-redux";
import { RootState } from "../../stores/store";
import { Dish, Shop } from "../../stores/state.interface";
import { LoaderBasic } from "./Loader";
import { Keyboard, ScrollView } from "react-native";
import _, { debounce } from "lodash";
import Toast from "react-native-toast-message";
import { useCreateOrderMutation } from "../../stores/apiSlices/orderApi.slice";
import { convertPaymentAmount } from "../../constants/utils";
import { useTranslation } from "react-i18next";
import { ItemTypeFlatList } from "../FlatListWithScroll";
import FlatListWithoutScroll from "../FlatListWithoutScroll";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import { AppBar } from "../AppBar";
import { AppBarSearchBox } from "../AppBarSearchBox";

/**
 * wrapped in a modal
 * @returns
 */
export default function CreateOrder({
  setCreateOrderVisible,
  goBack,
}: {
  setCreateOrderVisible: Dispatch<SetStateAction<boolean>>;
  goBack: () => void;
}) {
  const { t } = useTranslation();

  const {
    currentShop,
    currentOrderTotalAmount,
    currentOrder,
    currentTable,
    currentOrderSession,
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
  const [filteredDishesByCategory, setFilteredDishesByCategory] = useState<
    Record<string, Dish[]>
  >({});

  const handleCreateOrder = async () => {
    if (currentOrderTotalAmount === 0) {
      Toast.show({
        type: "error",
        text1: "Create order Failed",
        text2: "Please select at least one dish",
      });
      return;
    }
    if (!currentTable) {
      Toast.show({
        type: "error",
        text1: "Create order Failed",
        text2: "Cannot find table",
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
  };

  const debouncedSearchDishes = useCallback(
    debounce((_selectedDishType: string, _searchValue: string) => {
      const filteredDishes = _.filter(dishes, (d) => {
        if (_selectedDishType !== "ALL") {
          return (
            d.type === _selectedDishType &&
            (_.includes(d.name, _searchValue) ||
              _.includes(d.code, _searchValue))
          );
        }
        return (
          _.includes(d.name, _searchValue) || _.includes(d.code, _searchValue)
        );
      });

      setFilteredDishesByCategory(_.groupBy(filteredDishes, "category.id"));
    }, 200),
    [dishes]
  );

  useEffect(() => {
    debouncedSearchDishes(selectedDishType, searchValue);
  }, [selectedDishType, dishLoading, searchValue, debouncedSearchDishes]);

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
        <Surface style={styles.baseContainer}>
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
            groups={dishCategories}
            itemByGroup={filteredDishesByCategory}
            itemType={ItemTypeFlatList.DISH_CARD_ORDER}
          />

          <Surface
            style={{
              flexDirection: "row",
              justifyContent: "center",
              alignItems: "center",
              padding: 10,
              boxShadow: "none",
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
