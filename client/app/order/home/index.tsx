import { Button, Modal, Portal, Surface, Text } from "react-native-paper";
import { styles } from "../../_layout";
import { ScrollView, useWindowDimensions, View } from "react-native";
import {
  useGetDishesQuery,
  useGetDishTypesQuery,
} from "../../../stores/apiSlices/dishApi.slice";
import { useSelector } from "react-redux";
import { RootState } from "../../../stores/store";
import { Dish, Shop } from "../../../stores/state.interface";
import { LoaderBasic } from "../../../components/ui/Loader";
import _ from "lodash";
import { useTranslation } from "react-i18next";
import ImageSlider from "../../../components/ImageSlider";
import CustomerOrderMenu from "../../../components/ui/orders/CustomerOrderMenu";
import { useState } from "react";
import { CustomerAppBar } from "../../../components/ui/customer/CustomerAppBar";
import { useGetCartQuery } from "../../../stores/apiSlices/cartApi.slice";

const getButtonSize = (width: number) => {
  return width / 2 - 30;
};

const getDishGroupByDishType = (dishes: Dish[], dishTypes: string[]) => {
  const dishGroupByDishType = _.groupBy(dishes, "type");
  dishGroupByDishType["all"] = dishes;
  const availableDishTypes = _.filter(
    _.concat(["all"], dishTypes) as string[],
    (type) => !_.isEmpty(dishGroupByDishType[type])
  );
  return { availableDishTypes, dishGroupByDishType };
};

export default function CustomerHomePage() {
  const { t } = useTranslation();
  const { width } = useWindowDimensions();
  const buttonSize = getButtonSize(width);

  const { shop } = useSelector((state: RootState) => state.customer) as {
    shop: Shop;
  };

  const { data: dishes = [], isLoading: dishLoading } = useGetDishesQuery(
    shop.id
  );
  const { data: dishTypes = [], isLoading: dishTypeLoading } =
    useGetDishTypesQuery(shop.id);
  const { isLoading: cartLoading } = useGetCartQuery(shop.id);

  const { availableDishTypes, dishGroupByDishType } = getDishGroupByDishType(
    dishes,
    dishTypes
  );

  const [selectedDishType, setSelectedDishType] = useState("all");
  const [menuVisible, setMenuVisible] = useState(false);

  if (dishLoading || dishTypeLoading || cartLoading) {
    return <LoaderBasic />;
  }

  return (
    <>
      <Portal>
        <Modal
          visible={menuVisible}
          onDismiss={() => setMenuVisible(false)}
          contentContainerStyle={{
            flex: 1,
          }}
        >
          <CustomerAppBar goBack={() => setMenuVisible(false)} />
          <CustomerOrderMenu dishes={dishGroupByDishType[selectedDishType]} />
        </Modal>
      </Portal>
      <Surface style={styles.baseContainer}>
        <ScrollView>
          <ImageSlider
            images={[
              "https://picsum.photos/700",
              "https://picsum.photos/700",
              "https://picsum.photos/700",
              "https://picsum.photos/700",
              "https://picsum.photos/700",
            ]}
          />
          <Surface style={styles.baseGrid}>
            {availableDishTypes.map((dishType) => (
              <Button
                key={dishType}
                mode="contained-tonal"
                onPress={() => {
                  setSelectedDishType(dishType);
                  setMenuVisible(true);
                }}
                style={{
                  borderRadius: 10,
                }}
                contentStyle={{
                  height: 100,
                  width: buttonSize,
                }}
              >
                <View
                  style={{
                    flex: 1,
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <Text variant="bodyLarge">{t(dishType)}</Text>
                  <Text variant="bodySmall">
                    ({_.size(dishGroupByDishType[dishType])})
                  </Text>
                </View>
              </Button>
            ))}
          </Surface>
        </ScrollView>
      </Surface>
    </>
  );
}
