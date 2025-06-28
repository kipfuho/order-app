import { memo } from "react";
import { useSelector } from "react-redux";
import { ScrollView } from "react-native";
import { Surface } from "react-native-paper";
import { RootState } from "@stores/store";
import { Shop } from "@stores/state.interface";
import { LoaderBasic } from "../Loader";
import { useInfiniteScrollingQuery } from "@/hooks/useInfiniteScrolling";
import { useGetUnservedDishOrdersRequestQuery } from "@/stores/apiSlices/kitchenApi.slice";
import FlatListWithoutScroll from "../FlatList/FlatListWithoutScroll";
import { ItemTypeFlatList } from "../FlatList/FlatListUtil";

const KitchenServing = () => {
  const { currentShop } = useSelector((state: RootState) => state.shop);
  const shop = currentShop as Shop;

  const {
    data: unservedDishOrders = [],
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading: unservedDishOrdersLoading,
  } = useInfiniteScrollingQuery(shop.id, useGetUnservedDishOrdersRequestQuery);

  if (unservedDishOrdersLoading) {
    return <LoaderBasic />;
  }

  return (
    <Surface style={{ flex: 1 }}>
      <ScrollView>
        <FlatListWithoutScroll
          groups={[{ id: "all" }]}
          itemByGroup={{ all: unservedDishOrders }}
          itemType={ItemTypeFlatList.KITCHEN_DISHORDER_SERVING}
          shouldShowGroup={false}
          fetchNextPage={fetchNextPage}
          isFetchingNextPage={isFetchingNextPage}
          hasNextPage={hasNextPage}
        />
      </ScrollView>
    </Surface>
  );
};

export default memo(KitchenServing);
