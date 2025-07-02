import _ from "lodash";
import { Modal, Portal, Surface } from "react-native-paper";
import { useCallback, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { LoaderBasic } from "@components/ui/Loader";
import { RootState } from "@stores/store";
import { CartItem, Dish, Shop } from "@stores/state.interface";
import { useGetDishCategoriesQuery } from "@stores/apiSlices/dishApi.slice";
import { useTranslation } from "react-i18next";
import FlatListWithoutScroll from "../FlatList/FlatListWithoutScroll";
import { ItemTypeFlatList } from "../FlatList/FlatListUtil";
import DishDetailForCustomer from "../customer/DishDetailForCustomer";

export default function CustomerOrderMenu({ dishes }: { dishes: Dish[] }) {
  const { t } = useTranslation();
  const { shop } = useSelector((state: RootState) => state.customer) as {
    shop: Shop;
    currentCartItem: Record<string, CartItem>;
    currentCartAmount: number;
  };

  const [dishDetailVisible, setDishDetailVisible] = useState(false);
  const [selectedDish, setSelectedDish] = useState<Dish>();

  const { data: dishCategories = [], isLoading: dishCategoryLoading } =
    useGetDishCategoriesQuery({
      shopId: shop.id,
      isCustomerApp: true,
    });

  const { availableDishCategories, dishesByCategory } = useMemo(() => {
    const dishesByCategory = _.groupBy(dishes, "category.id");
    dishesByCategory["all"] = dishes;
    const availableDishCategories = _.concat(
      [{ id: "all", code: "all", name: t("all") }],
      _.filter(dishCategories, (c) => !_.isEmpty(dishesByCategory[c.id])),
    );

    return { availableDishCategories, dishesByCategory };
  }, [dishCategories, dishes, t]);

  const openDishDetail = useCallback((dish: Dish) => {
    setSelectedDish(dish);
    setDishDetailVisible(true);
  }, []);

  if (dishCategoryLoading) {
    return <LoaderBasic />;
  }

  return (
    <>
      <Portal>
        <Modal
          visible={dishDetailVisible}
          onDismiss={() => setDishDetailVisible(false)}
          contentContainerStyle={{
            flex: 1,
          }}
        >
          {selectedDish && (
            <DishDetailForCustomer
              dish={selectedDish}
              setVisible={setDishDetailVisible}
            />
          )}
        </Modal>
      </Portal>
      <Surface style={{ flex: 1, flexDirection: "row" }}>
        <FlatListWithoutScroll
          groups={availableDishCategories}
          itemByGroup={dishesByCategory}
          itemType={ItemTypeFlatList.DISH_CARD_CUSTOMER}
          openMenu={openDishDetail}
        />
      </Surface>
    </>
  );
}
