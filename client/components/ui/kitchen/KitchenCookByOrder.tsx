import _ from "lodash";
import { memo } from "react";
import { useSelector } from "react-redux";
import { Surface } from "react-native-paper";
import { RootState } from "@stores/store";
import { Shop } from "@stores/state.interface";
import { LoaderBasic } from "../Loader";
import FlatListWithoutScroll from "@/components/FlatListWithoutScroll";
import { ItemTypeFlatList } from "@/components/FlatListWithScroll";
import { useInfiniteScrollingQuery } from "@/hooks/useInfiniteScrolling";
import { useGetUncookedDishOrdersQuery } from "@/stores/apiSlices/kitchenApi.slice";

const KitchenCookByOrder = () => {
  const { currentShop } = useSelector((state: RootState) => state.shop);
  const shop = currentShop as Shop;

  const {
    data: uncookedDishOrders = [],
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading: uncookedDishOrdersLoading,
  } = useInfiniteScrollingQuery(shop.id, useGetUncookedDishOrdersQuery);

  const uncookedDishOrderGroupByOrder = _.groupBy(
    uncookedDishOrders,
    "orderId",
  );

  if (uncookedDishOrdersLoading) {
    return <LoaderBasic />;
  }

  return (
    <Surface style={{ flex: 1 }}>
      <FlatListWithoutScroll
        groups={Object.keys(uncookedDishOrderGroupByOrder).map((id) => ({
          id,
        }))}
        itemByGroup={uncookedDishOrderGroupByOrder}
        itemType={ItemTypeFlatList.KITCHEN_DISHORDER_BYORDER}
        shouldShowGroup={false}
        fetchNextPage={fetchNextPage}
        isFetchingNextPage={isFetchingNextPage}
        hasNextPage={hasNextPage}
      />
    </Surface>
  );
};

export default memo(KitchenCookByOrder);
