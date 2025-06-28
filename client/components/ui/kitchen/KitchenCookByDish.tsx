import _ from "lodash";
import { memo } from "react";
import { useSelector } from "react-redux";
import { Surface } from "react-native-paper";
import { RootState } from "@stores/store";
import { Shop } from "@stores/state.interface";
import { LoaderBasic } from "../Loader";
import { useInfiniteScrollingQuery } from "@/hooks/useInfiniteScrolling";
import { useGetUncookedDishOrdersQuery } from "@/stores/apiSlices/kitchenApi.slice";
import FlatListWithoutScroll from "../FlatList/FlatListWithoutScroll";
import { ItemTypeFlatList } from "../FlatList/FlatListUtil";

const KitchenCookByDish = () => {
  const { currentShop } = useSelector((state: RootState) => state.shop);
  const shop = currentShop as Shop;

  const {
    data: uncookedDishOrders = [],
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading: uncookedDishOrdersLoading,
  } = useInfiniteScrollingQuery(shop.id, useGetUncookedDishOrdersQuery);

  const uncookedDishOrderGroupByDish = _.groupBy(uncookedDishOrders, "dishId");

  if (uncookedDishOrdersLoading) {
    return <LoaderBasic />;
  }

  return (
    <Surface style={{ flex: 1 }}>
      <FlatListWithoutScroll
        groups={[{ id: "all" }]}
        itemByGroup={{ all: Object.values(uncookedDishOrderGroupByDish) }}
        itemType={ItemTypeFlatList.KITCHEN_DISHORDER_BYDISH}
        shouldShowGroup={false}
        fetchNextPage={fetchNextPage}
        isFetchingNextPage={isFetchingNextPage}
        hasNextPage={hasNextPage}
      />
    </Surface>
  );
};

export default memo(KitchenCookByDish);
