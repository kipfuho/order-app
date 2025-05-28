import { memo } from "react";
import { useSelector } from "react-redux";
import { ScrollView } from "react-native";
import { Surface } from "react-native-paper";
import { RootState } from "@stores/store";
import { Shop } from "@stores/state.interface";
import { useGetUnservedDishOrdersRequestQuery } from "@stores/apiSlices/kitchenApi.slice";
import { LoaderBasic } from "../Loader";
import FlatListWithoutScroll from "@/components/FlatListWithoutScroll";
import { ItemTypeFlatList } from "@/components/FlatListWithScroll";

const KitchenServing = () => {
  const { currentShop } = useSelector((state: RootState) => state.shop);
  const shop = currentShop as Shop;

  const {
    data: unservedDishOrders = [],
    isLoading: unservedDishOrdersLoading,
  } = useGetUnservedDishOrdersRequestQuery(shop.id);

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
        />
      </ScrollView>
    </Surface>
  );
};

export default memo(KitchenServing);
