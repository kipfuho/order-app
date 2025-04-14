import {
  Button,
  Surface,
  Text,
  TouchableRipple,
  useTheme,
} from "react-native-paper";
import { SetStateAction, useState } from "react";
import { useSelector } from "react-redux";
import { ScrollView, View } from "react-native";
import _ from "lodash";
import { LoaderBasic } from "../../../components/ui/Loader";
import { RootState } from "../../../stores/store";
import { Dish, DishCategory, Shop } from "../../../stores/state.interface";
import { useGetDishCategoriesQuery } from "../../../stores/apiSlices/dishApi.slice";
import { styles } from "../../../app/_layout";
import { DishCardForCustomer } from "../menus/DishCardForCustomer";
import { useTranslation } from "react-i18next";

const getDishByCategory = (dishes: Dish[], categories: DishCategory[]) => {
  const dishesByCategory = _.groupBy(dishes, "category.id");
  dishesByCategory["all"] = dishes;
  const availableDishCategories = _.filter(
    _.concat([{ id: "all", name: "all" }], categories) as DishCategory[],
    (c) => !_.isEmpty(dishesByCategory[c.id])
  );
  return { availableDishCategories, dishesByCategory };
};

export default function CustomerOrderMenu({ dishes }: { dishes: Dish[] }) {
  const { t } = useTranslation();
  const theme = useTheme();

  const { shop } = useSelector((state: RootState) => state.customer) as {
    shop: Shop;
  };

  const { data: dishCategories = [], isLoading: dishCategoryLoading } =
    useGetDishCategoriesQuery(shop.id);
  const { availableDishCategories, dishesByCategory } = getDishByCategory(
    dishes,
    dishCategories
  );

  const [selectedCategory, setCategory] = useState<string>("all");

  if (dishCategoryLoading) {
    return <LoaderBasic />;
  }

  return (
    <Surface style={{ flex: 1, flexDirection: "row" }}>
      <Surface style={{ boxShadow: "none", width: "25%" }}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{
            flex: 1,
            flexDirection: "column",
            width: "25%",
          }}
        >
          {availableDishCategories.map((cat) => (
            <TouchableRipple
              key={cat.id}
              onPress={() =>
                setCategory((prevCat) => (prevCat === cat.id ? "" : cat.id))
              }
              style={{
                borderRadius: 0,
                backgroundColor:
                  cat.id === selectedCategory
                    ? theme.colors.primaryContainer
                    : theme.colors.background,
                paddingVertical: 15,
                paddingHorizontal: 5,
                alignItems: "center",
              }}
            >
              <Text
                style={{
                  color:
                    cat.id === selectedCategory
                      ? theme.colors.onPrimaryContainer
                      : theme.colors.onBackground,
                }}
              >
                {cat.id === "all" ? t(cat.name) : cat.name}
              </Text>
            </TouchableRipple>
          ))}
        </ScrollView>
      </Surface>
      <Surface style={{ flex: 1, boxShadow: "none" }}>
        <ScrollView>
          <View
            style={{
              flex: 1,
              flexDirection: "row",
              flexWrap: "wrap",
              boxShadow: "0 0 0",
              justifyContent: "center",
            }}
          >
            {dishesByCategory[selectedCategory].map((d) => (
              <DishCardForCustomer key={d.id} dish={d} />
            ))}
          </View>
        </ScrollView>
      </Surface>
    </Surface>
  );
}
