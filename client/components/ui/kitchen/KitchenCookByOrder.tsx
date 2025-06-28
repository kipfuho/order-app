import _ from "lodash";
import { memo, useMemo } from "react";
import { useSelector } from "react-redux";
import { Surface } from "react-native-paper";
import { RootState } from "@stores/store";
import { Shop } from "@stores/state.interface";
import { LoaderBasic } from "../Loader";
import { useInfiniteScrollingQuery } from "@/hooks/useInfiniteScrolling";
import { useGetUncookedDishOrdersQuery } from "@/stores/apiSlices/kitchenApi.slice";
import FlatListWithoutScroll from "../FlatList/FlatListWithoutScroll";
import { ItemTypeFlatList } from "../FlatList/FlatListUtil";

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

  const uncookedDishOrdersByOrder = useMemo(() => {
    const uncookedDishOrderGroupByOrder = _.groupBy(
      uncookedDishOrders,
      "orderId",
    );
    return _.flatMap(uncookedDishOrderGroupByOrder, (groups) => groups);
  }, [uncookedDishOrders]);

  if (uncookedDishOrdersLoading) {
    return <LoaderBasic />;
  }

  return (
    <Surface style={{ flex: 1 }}>
      <FlatListWithoutScroll
        groups={[{ id: "all" }]}
        itemByGroup={{ all: uncookedDishOrdersByOrder }}
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
