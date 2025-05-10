import { Surface } from "react-native-paper";
import { useCallback, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
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
import {
  useGetCartQuery,
  useUpdateCartMutation,
} from "../../../stores/apiSlices/cartApi.slice";
import { mergeCartItems } from "../../../constants/utils";
import FlatListWithoutScroll from "../../FlatListWithoutScroll";
import { ItemTypeFlatList } from "../../FlatListWithScroll";
import { t } from "i18next";
import { updateIsUpdateCartDebouncing } from "../../../stores/customerSlice";

const getDishByCategory = (dishes: Dish[], categories: DishCategory[]) => {
  const dishesByCategory = _.groupBy(dishes, "category.id");
  dishesByCategory["all"] = dishes;
  const availableDishCategories = _.concat(
    [{ id: "all", name: t("all") }],
    _.filter(categories, (c) => !_.isEmpty(dishesByCategory[c.id]))
  );
  return { availableDishCategories, dishesByCategory };
};

export default function CustomerOrderMenu({ dishes }: { dishes: Dish[] }) {
  const dispatch = useDispatch();

  const { shop, currentCartItem, currentCartAmount } = useSelector(
    (state: RootState) => state.customer
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
    dishCategories
  );
  const {
    data: cart,
    isLoading: cartLoading,
    isFetching: cartFetching,
  } = useGetCartQuery(shop.id);

  const [updateCart, { isLoading: updateCartLoading }] =
    useUpdateCartMutation();

  const debouncedUpdateCart = useCallback(
    debounce(
      ({ shopId, cartItems }: { shopId: string; cartItems: CartItem[] }) => {
        dispatch(updateIsUpdateCartDebouncing(false));
        if (!updateCartLoading) {
          updateCart({ cartItems, shopId });
        }
      },
      1000
    ),
    [updateCart]
  );

  useEffect(() => {
    if (cartFetching) {
      return;
    }
    // const mergedCartItems = mergeCartItems(currentCartItem);
    // const cartItems = cart?.cartItems || [];

    // const sameItems =
    //   mergedCartItems.length === cartItems.length &&
    //   mergedCartItems.every((item, i) => {
    //     const other = cartItems[i];
    //     return item.dishId === other.dishId && item.quantity === other.quantity;
    //   });

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
  }, [currentCartItem, cartFetching]);

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
