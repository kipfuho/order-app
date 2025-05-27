import { Surface } from "react-native-paper";
import { useGetUnservedDishOrdersRequestQuery } from "../../../../../../../../stores/apiSlices/kitchenApi.slice";
import { useSelector } from "react-redux";
import { RootState } from "../../../../../../../../stores/store";
import { Shop } from "../../../../../../../../stores/state.interface";
import { LoaderBasic } from "../../../../../../../../components/ui/Loader";
import _ from "lodash";
import { ScrollView } from "react-native";
import FlatListWithoutScroll from "../../../../../../../../components/FlatListWithoutScroll";
import { ItemTypeFlatList } from "../../../../../../../../components/FlatListWithScroll";
import { SwipeablePage } from "../../../../../../../../components/SwipeablePage";

export default function KitchenServing() {
  const { currentShop } = useSelector((state: RootState) => state.shop);
  const shop = currentShop as Shop;

  const {
    data: unservedDishOrders = [],
    isLoading: unservedDishOrdersLoading,
    isFetching: unservedDishOrdersFetching,
  } = useGetUnservedDishOrdersRequestQuery(shop.id);

  if (unservedDishOrdersLoading) {
    return <LoaderBasic />;
  }

  return (
    <SwipeablePage>
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
    </SwipeablePage>
  );
}
