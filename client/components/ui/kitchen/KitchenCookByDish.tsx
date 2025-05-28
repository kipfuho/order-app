import _ from "lodash";
import { memo } from "react";
import { useSelector } from "react-redux";
import { Surface } from "react-native-paper";
import { RootState } from "@stores/store";
import { Shop } from "@stores/state.interface";
import { useGetUncookedDishOrdersQuery } from "@/stores/apiSlices/kitchenApi.slice";
import FlatListWithoutScroll from "@/components/FlatListWithoutScroll";
import { ItemTypeFlatList } from "@/components/FlatListWithScroll";
import { LoaderBasic } from "../Loader";

const KitchenCookByDish = () => {
  const { currentShop } = useSelector((state: RootState) => state.shop);
  const shop = currentShop as Shop;

  const { data: uncookedDishOrders, isLoading: uncookedDishOrdersLoading } =
    useGetUncookedDishOrdersQuery(shop.id);

  const uncookedDishOrderGroupByDish = _.groupBy(uncookedDishOrders, "dish");

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
      />
    </Surface>
  );
};

export default memo(KitchenCookByDish);
