import {
  Appbar,
  Button,
  Modal,
  Portal,
  Searchbar,
  Surface,
  Text,
} from "react-native-paper";
import { styles } from "../../_layout";
import {
  Keyboard,
  Pressable,
  ScrollView,
  useWindowDimensions,
  View,
} from "react-native";
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
import { Gesture, GestureDetector } from "react-native-gesture-handler";

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

  const { data: dishes = [], isLoading: dishLoading } = useGetDishesQuery({
    shopId: shop.id,
    isCustomerApp: true,
  });
  const { data: dishTypes = [], isLoading: dishTypeLoading } =
    useGetDishTypesQuery({
      shopId: shop.id,
      isCustomerApp: true,
    });
  const { isLoading: cartLoading } = useGetCartQuery(shop.id);

  const { availableDishTypes, dishGroupByDishType } = getDishGroupByDishType(
    dishes,
    dishTypes
  );

  const [selectedDishType, setSelectedDishType] = useState("all");
  const [menuVisible, setMenuVisible] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const [searchVisible, setSearchVisible] = useState(false);

  const gesture = Gesture.Race(
    Gesture.Tap().onStart(() => {
      setSearchVisible(false);
      Keyboard.dismiss();
    }),
    Gesture.Pan().onStart(() => {
      setSearchVisible(false);
      Keyboard.dismiss();
    })
  );

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
          <GestureDetector gesture={gesture}>
            <View style={{ flex: 1 }}>
              <CustomerAppBar goBack={() => setMenuVisible(false)}>
                <Appbar.Action
                  icon="magnify"
                  onPress={() => setSearchVisible((a) => !a)}
                />
                {searchVisible && (
                  <Pressable
                    style={{
                      position: "absolute",
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      padding: 8,
                      zIndex: 10,
                    }}
                    onPress={() => {
                      setSearchVisible(true);
                    }}
                  >
                    <Searchbar
                      placeholder={t("search_dish")}
                      value={searchValue}
                      onChangeText={setSearchValue}
                      autoFocus
                      inputStyle={{
                        padding: 0,
                        minHeight: "auto",
                      }}
                      style={{
                        padding: 0,
                        height: 46,
                        alignContent: "center",
                      }}
                    />
                  </Pressable>
                )}
              </CustomerAppBar>
              <CustomerOrderMenu
                dishes={
                  searchValue
                    ? _.filter(dishGroupByDishType[selectedDishType], (dish) =>
                        _.includes(dish.name, searchValue)
                      )
                    : dishGroupByDishType[selectedDishType]
                }
              />
            </View>
          </GestureDetector>
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
