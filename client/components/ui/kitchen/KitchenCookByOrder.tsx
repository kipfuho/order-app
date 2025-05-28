import _ from "lodash";
import { memo } from "react";
import { useSelector } from "react-redux";
import { Surface } from "react-native-paper";
import { RootState } from "@stores/store";
import { Shop } from "@stores/state.interface";
import { useGetUncookedDishOrdersQuery } from "@stores/apiSlices/kitchenApi.slice";
import { LoaderBasic } from "../Loader";
import FlatListWithoutScroll from "@/components/FlatListWithoutScroll";
import { ItemTypeFlatList } from "@/components/FlatListWithScroll";

const KitchenCookByOrder = () => {
  const { currentShop } = useSelector((state: RootState) => state.shop);
  const shop = currentShop as Shop;

  const { data: uncookedDishOrders, isLoading: uncookedDishOrdersLoading } =
    useGetUncookedDishOrdersQuery(shop.id);

  const uncookedDishOrderGroupByOrderSession = _.groupBy(
    uncookedDishOrders,
    "orderSessionId",
  );

  if (uncookedDishOrdersLoading) {
    return <LoaderBasic />;
  }

  return (
    <Surface style={{ flex: 1 }}>
      <FlatListWithoutScroll
        groups={Object.keys(uncookedDishOrderGroupByOrderSession).map((id) => ({
          id,
        }))}
        itemByGroup={uncookedDishOrderGroupByOrderSession}
        itemType={ItemTypeFlatList.KITCHEN_DISHORDER_BYORDER}
        shouldShowGroup={false}
      />
    </Surface>
  );
};

export default memo(KitchenCookByOrder);
