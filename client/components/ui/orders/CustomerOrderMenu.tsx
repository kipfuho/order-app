import { Surface, Text, TouchableRipple, useTheme } from "react-native-paper";
import { useCallback, useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { ScrollView, View } from "react-native";
import _, { debounce } from "lodash";
import { LoaderBasic } from "../../../components/ui/Loader";
import { RootState } from "../../../stores/store";
import {
  CartItem,
  Dish,
  DishCategory,
  Shop,
} from "../../../stores/state.interface";
import { useGetDishCategoriesQuery } from "../../../stores/apiSlices/dishApi.slice";
import { DishCardForCustomer } from "../menus/DishCardForCustomer";
import { useTranslation } from "react-i18next";
import {
  useGetCartQuery,
  useUpdateCartMutation,
} from "../../../stores/apiSlices/cartApi.slice";

const getDishByCategory = (dishes: Dish[], categories: DishCategory[]) => {
  const dishesByCategory = _.groupBy(dishes, "category.id");
  dishesByCategory["all"] = dishes;
  const availableDishCategories = _.filter(
    _.concat([{ id: "all", name: "all" }], categories) as DishCategory[],
    (c) => !_.isEmpty(dishesByCategory[c.id])
  );
  return { availableDishCategories, dishesByCategory };
};

export default function CustomerOrderMenu({ dishes }: { dishes: Dish[] }) {
  const { t } = useTranslation();
  const theme = useTheme();

  const { shop, currentCartItem } = useSelector(
    (state: RootState) => state.customer
  ) as { shop: Shop; currentCartItem: Record<string, CartItem> };

  const { data: dishCategories = [], isLoading: dishCategoryLoading } =
    useGetDishCategoriesQuery(shop.id);
  const { availableDishCategories, dishesByCategory } = getDishByCategory(
    dishes,
    dishCategories
  );
  const {
    data: cart,
    isLoading: cartLoading,
    isFetching: cartFetching,
  } = useGetCartQuery(shop.id);

  const [updateCart, { isLoading: updateCartLoading }] =
    useUpdateCartMutation();
  const [selectedCategory, setCategory] = useState<string>("all");

  const debouncedUpdateCart = useCallback(
    debounce(
      ({ shopId, cartItems }: { shopId: string; cartItems: CartItem[] }) => {
        if (!updateCartLoading) {
          updateCart({ cartItems, shopId });
        }
      },
      2000
    ), // 2s delay
    [updateCart]
  );

  useEffect(() => {
    if (cartFetching) {
      return;
    }
    const currentCartItems = Object.values(currentCartItem);
    const cartItems = cart?.cartItems || [];

    const sameItems =
      currentCartItems.length === cartItems.length &&
      currentCartItems.every((item, i) => {
        const other = cartItems[i];
        return item.dish === other.dish && item.quantity === other.quantity;
      });
    if (!sameItems)
      debouncedUpdateCart({
        shopId: shop.id,
        cartItems: Object.values(currentCartItem),
      });
  }, [currentCartItem, cartFetching]);

  if (dishCategoryLoading || cartLoading) {
    return <LoaderBasic />;
  }

  return (
    <Surface style={{ flex: 1, flexDirection: "row" }}>
      <Surface style={{ boxShadow: "none", width: "25%" }}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{
            flex: 1,
            flexDirection: "column",
            width: "25%",
          }}
        >
          {availableDishCategories.map((cat) => (
            <TouchableRipple
              key={cat.id}
              onPress={() =>
                setCategory((prevCat) => (prevCat === cat.id ? "" : cat.id))
              }
              style={{
                borderRadius: 0,
                backgroundColor:
                  cat.id === selectedCategory
                    ? theme.colors.primaryContainer
                    : theme.colors.background,
                paddingVertical: 15,
                paddingHorizontal: 5,
                alignItems: "center",
              }}
            >
              <Text
                style={{
                  color:
                    cat.id === selectedCategory
                      ? theme.colors.onPrimaryContainer
                      : theme.colors.onBackground,
                }}
              >
                {cat.id === "all" ? t(cat.name) : cat.name}
              </Text>
            </TouchableRipple>
          ))}
        </ScrollView>
      </Surface>
      <Surface style={{ flex: 1, boxShadow: "none" }}>
        <ScrollView>
          <View
            style={{
              flex: 1,
              flexDirection: "row",
              flexWrap: "wrap",
              boxShadow: "0 0 0",
              justifyContent: "center",
            }}
          >
            {dishesByCategory[selectedCategory].map((d) => (
              <DishCardForCustomer key={d.id} dish={d} />
            ))}
          </View>
        </ScrollView>
      </Surface>
    </Surface>
  );
}
