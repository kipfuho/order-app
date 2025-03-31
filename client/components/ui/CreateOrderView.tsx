import { Button, Surface, Text } from "react-native-paper";
import { styles } from "../../app/_layout";
import { SetStateAction, useState } from "react";
import {
  useGetDishCategoriesQuery,
  useGetDishesQuery,
  useGetDishTypesQuery,
} from "../../stores/apiSlices/dishApi.slice";
import { useSelector } from "react-redux";
import { RootState } from "../../stores/store";
import { DishCategory, Shop } from "../../stores/state.interface";
import { LoaderBasic } from "./Loader";
import { ScrollView } from "react-native";

/**
 * wrapped in a modal
 * @returns
 */
export default function CreateOrder({
  setCreateOrderVisible,
}: {
  setCreateOrderVisible: SetStateAction<any>;
}) {
  const shop = useSelector(
    (state: RootState) => state.shop.currentShop
  ) as Shop;
  const { data: dishes = [], isLoading: dishLoading } = useGetDishesQuery(
    shop.id
  );
  const { data: dishCategories = [], isLoading: dishCategoryLoading } =
    useGetDishCategoriesQuery(shop.id);
  const { data: dishTypes = [], isLoading: dishTypeLoading } =
    useGetDishTypesQuery(shop.id);

  const [selectedCategory, setCategory] = useState<string>("");
  const [selectedDishType, setDishType] = useState<string>("ALL");

  if (dishLoading || dishCategoryLoading || dishTypeLoading) {
    return <LoaderBasic />;
  }

  return (
    <Surface style={styles.baseContainer}>
      <Surface style={{ height: 50, marginBottom: 10, boxShadow: "none" }}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{
            paddingLeft: 5,
          }}
        >
          {dishCategories.map((cat) => (
            <Button
              key={cat.id}
              mode={
                selectedCategory === cat.id ? "contained" : "contained-tonal"
              }
              onPress={() =>
                setCategory((prevCat) => (prevCat === cat.id ? "" : cat.id))
              }
              style={{
                width: "auto",
                borderRadius: 10,
                marginRight: 5,
                alignSelf: "center",
              }}
            >
              {cat.name}
            </Button>
          ))}
        </ScrollView>
      </Surface>
      <Button
        mode="contained"
        onPress={() => setCreateOrderVisible(false)}
        style={{ marginTop: 10 }}
      >
        Close
      </Button>
    </Surface>
  );
}
