import { Surface } from "react-native-paper";
import { useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import _, { debounce } from "lodash";
import { LoaderBasic } from "@components/ui/Loader";
import { RootState } from "@stores/store";
import { CartItem, Dish, DishCategory, Shop } from "@stores/state.interface";
import { useGetDishCategoriesQuery } from "@stores/apiSlices/dishApi.slice";
import {
  useGetCartQuery,
  useUpdateCartMutation,
} from "@stores/apiSlices/cartApi.slice";
import { mergeCartItems } from "@constants/utils";
import { ItemTypeFlatList } from "@/components/FlatListWithScroll";
import { updateIsUpdateCartDebouncing } from "@stores/customerSlice";
import FlatListWithoutScroll from "@/components/FlatListWithoutScroll";
import { useTranslation } from "react-i18next";

const getDishByCategory = (
  dishes: Dish[],
  categories: DishCategory[],
  t: any,
) => {
  const dishesByCategory = _.groupBy(dishes, "category.id");
  dishesByCategory["all"] = dishes;
  const availableDishCategories = _.concat(
    [{ id: "all", code: "all", name: t("all") }],
    _.filter(categories, (c) => !_.isEmpty(dishesByCategory[c.id])),
  );
  return { availableDishCategories, dishesByCategory };
};

export default function CustomerOrderMenu({ dishes }: { dishes: Dish[] }) {
  const dispatch = useDispatch();
  const { t } = useTranslation();

  const { shop, currentCartItem, currentCartAmount } = useSelector(
    (state: RootState) => state.customer,
  ) as {
    shop: Shop;
    currentCartItem: Record<string, CartItem>;
    currentCartAmount: number;
  };
  const cartItemsGroupByDish = _.groupBy(currentCartItem, "dishId");

  const { data: dishCategories = [], isLoading: dishCategoryLoading } =
    useGetDishCategoriesQuery({
      shopId: shop.id,
      isCustomerApp: true,
    });
  const { availableDishCategories, dishesByCategory } = getDishByCategory(
    dishes,
    dishCategories,
    t,
  );
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
          dispatch(updateIsUpdateCartDebouncing(false));
          updateCart({ cartItems, shopId });
        },
        1000,
      ),
    [dispatch, updateCart],
  );

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

  if (dishCategoryLoading || cartLoading) {
    return <LoaderBasic />;
  }

  return (
    <Surface style={{ flex: 1, flexDirection: "row" }}>
      <FlatListWithoutScroll
        groups={availableDishCategories}
        itemByGroup={dishesByCategory}
        itemType={ItemTypeFlatList.DISH_CARD_CUSTOMER}
        additionalDatas={{ cartItemsGroupByDish }}
      />
    </Surface>
  );
}
