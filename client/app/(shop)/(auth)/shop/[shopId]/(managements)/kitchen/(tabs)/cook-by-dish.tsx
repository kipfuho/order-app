import { Surface } from "react-native-paper";
import { useGetUncookedDishOrdersQuery } from "../../../../../../../../stores/apiSlices/kitchenApi.slice";
import { useSelector } from "react-redux";
import { RootState } from "../../../../../../../../stores/store";
import { Shop } from "../../../../../../../../stores/state.interface";
import { LoaderBasic } from "../../../../../../../../components/ui/Loader";
import _ from "lodash";
import { ScrollView } from "react-native";
import FlatListWithoutScroll from "../../../../../../../../components/FlatListWithoutScroll";
import { ItemTypeFlatList } from "../../../../../../../../components/FlatListWithScroll";

export default function CookByDish() {
  const { currentShop } = useSelector((state: RootState) => state.shop);
  const shop = currentShop as Shop;

  const {
    data: uncookedDishOrders,
    isLoading: uncookedDishOrdersLoading,
    isFetching: uncookedDishOrdersFetching,
  } = useGetUncookedDishOrdersQuery(shop.id);

  const uncookedDishOrderGroupByDish = _.groupBy(uncookedDishOrders, "dish");

  if (uncookedDishOrdersLoading) {
    return <LoaderBasic />;
  }

  return (
    <Surface style={{ flex: 1 }}>
      <ScrollView>
        <FlatListWithoutScroll
          groups={[{ id: "all" }]}
          itemByGroup={{ all: Object.values(uncookedDishOrderGroupByDish) }}
          itemType={ItemTypeFlatList.KITCHEN_DISHORDER_BYDISH}
          shouldShowGroup={false}
        />
      </ScrollView>
    </Surface>
  );
}
