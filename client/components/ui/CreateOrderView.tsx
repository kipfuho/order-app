import {
  ActivityIndicator,
  Button,
  Icon,
  Surface,
  Text,
} from "react-native-paper";
import { styles } from "../../app/_layout";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import {
  useGetDishCategoriesQuery,
  useGetDishesQuery,
  useGetDishTypesQuery,
} from "../../stores/apiSlices/dishApi.slice";
import { useSelector } from "react-redux";
import { RootState } from "../../stores/store";
import { Dish, Shop } from "../../stores/state.interface";
import { LoaderBasic } from "./Loader";
import { ScrollView } from "react-native";
import _ from "lodash";
import Toast from "react-native-toast-message";
import { useCreateOrderMutation } from "../../stores/apiSlices/orderApi.slice";
import { convertPaymentAmount } from "../../constants/utils";
import { useTranslation } from "react-i18next";
import { ItemTypeFlatList } from "../FlatListWithScroll";
import FlatListWithoutScroll from "../FlatListWithoutScroll";

/**
 * wrapped in a modal
 * @returns
 */
export default function CreateOrder({
  setCreateOrderVisible,
}: {
  setCreateOrderVisible: Dispatch<SetStateAction<boolean>>;
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

  useEffect(() => {
    const filteredDishes = _.filter(dishes, (d) => {
      if (selectedDishType !== "ALL") {
        return d.type === selectedDishType;
      }
      return true;
    });

    setFilteredDishesByCategory(_.groupBy(filteredDishes, "category.id"));
  }, [selectedDishType, dishLoading]);

  if (dishLoading || dishCategoryLoading || dishTypeLoading) {
    return <LoaderBasic />;
  }

  return (
    <>
      <Surface style={styles.baseContainer}>
        <Surface style={{ height: 50, boxShadow: "none" }}>
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
    </>
  );
}
