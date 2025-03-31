import React, { useEffect, useState } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import _ from "lodash";
import Toast from "react-native-toast-message";
import {
  ActivityIndicator,
  Button,
  Surface,
  Switch,
  Text,
  TextInput,
} from "react-native-paper";
import { useSelector } from "react-redux";
import { RootState } from "../../../../../../../stores/store";
import {
  DishCategory,
  Shop,
  Unit,
} from "../../../../../../../stores/state.interface";
import { AppBar } from "../../../../../../../components/AppBar";
import { ScrollView } from "react-native";
import { Collapsible } from "../../../../../../../components/Collapsible";
import { DropdownMenu } from "../../../../../../../components/DropdownMenu";
import UploadImages from "../../../../../../../components/ui/UploadImage";
import {
  useGetDishCategoriesQuery,
  useGetDishesQuery,
  useGetDishTypesQuery,
  useGetUnitsQuery,
  useUpdateDishMutation,
} from "../../../../../../../stores/apiSlices/dishApi.slice";
import { LoaderBasic } from "../../../../../../../components/ui/Loader";
import { goBackShopDishList } from "../../../../../../../apis/navigate.service";

export default function UpdateDishPage() {
  const { dishId } = useLocalSearchParams();
  const router = useRouter();

  const shop = useSelector(
    (state: RootState) => state.shop.currentShop
  ) as Shop;
  const { data: dishes = [], isLoading: dishLoading } = useGetDishesQuery(
    shop.id
  );
  const { data: dishTypes = [], isLoading: dishTypeLoading } =
    useGetDishTypesQuery(shop.id);
  const { data: dishCategories = [], isLoading: dishCategoryLoading } =
    useGetDishCategoriesQuery(shop.id);
  const { data: units = [], isLoading: unitLoading } = useGetUnitsQuery(
    shop.id
  );
  const dish = _.find(dishes, (d) => d.id === dishId);
  const [updateDish, { isLoading: updateDishLoading }] =
    useUpdateDishMutation();

  const [name, setName] = useState("");
  const [category, setCategory] = useState(dishCategories[0]);
  const [dishType, setDishType] = useState(dishTypes[0]);
  const [price, setPrice] = useState("");
  const [unit, setUnit] = useState(units[0]);
  const [taxRate, setTaxRate] = useState("");
  const [images, setImages] = useState<{ uri: string; loading: boolean }[]>([]);

  const [isTaxIncludedPrice, setIsTaxIncludedPrice] = useState(false);
  const onToggleSwitch = () => setIsTaxIncludedPrice(!isTaxIncludedPrice);

  const handleUpdateDish = async () => {
    if (!dish) {
      return;
    }

    if (!name.trim() || !category || !dishType || !unit || !price.trim()) {
      Toast.show({
        type: "error",
        text1: "Create Failed",
        text2:
          "Please enter name and category and dish type and unit and price",
      });
      return;
    }

    try {
      await updateDish({
        shopId: shop.id,
        dishId: dish.id,
        name,
        category,
        dishType,
        price: parseFloat(price),
        unit,
        taxRate: parseFloat(taxRate),
        isTaxIncludedPrice,
        imageUrls: _.map(images, "uri"),
      }).unwrap();

      // Navigate back to table position list
      goBackShopDishList({ router, shopId: shop.id });
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (!dish) {
      return;
    }

    setName(dish.name);
    setCategory(dish.category);
    setDishType(dish.type);
    setPrice(_.toString(dish.price));
    setUnit(dish.unit);
    setTaxRate(_.toString(dish.taxRate));
    setImages(_.map(dish.imageUrls, (url) => ({ uri: url, loading: false })));
  }, [dish]);

  if (dishLoading || dishCategoryLoading || dishTypeLoading || unitLoading) {
    return <LoaderBasic />;
  }

  if (!dish) {
    return (
      <Surface style={{ flex: 1 }}>
        <Text>Dish not found</Text>
        <Button onPress={() => goBackShopDishList({ router, shopId: shop.id })}>
          <Text>Go Back</Text>
        </Button>
      </Surface>
    );
  }

  return (
    <>
      <AppBar
        title="Update Dish"
        goBack={() => goBackShopDishList({ router, shopId: shop.id })}
      />
      <Surface style={{ flex: 1 }}>
        <ScrollView style={{ flex: 1, padding: 16 }}>
          <UploadImages
            images={images}
            setImages={setImages}
            shopId={shop.id}
          />
          {/* General Information Collapsible */}
          <Collapsible title="General Information">
            <TextInput
              label="Dish Name"
              mode="outlined"
              placeholder="Enter dish name"
              value={name}
              onChangeText={setName}
              style={{ marginBottom: 20 }}
            />

            <DropdownMenu
              item={dishType}
              items={dishTypes}
              label="Dish Type"
              setItem={setDishType}
              getItemValue={(item: string) => item}
            />

            <DropdownMenu
              item={category}
              items={dishCategories}
              label="Dish Category"
              setItem={setCategory}
              getItemValue={(item: DishCategory) => item?.name}
            />
          </Collapsible>

          {/* Price Collapsible */}
          <Collapsible title="Price Information">
            <TextInput
              label="Price"
              mode="outlined"
              placeholder="Enter price"
              value={price}
              onChangeText={(text) => setPrice(text.replace(/[^0-9.]/g, ""))} // Restrict input to numbers & decimal
              keyboardType="numeric" // Shows numeric keyboard
              style={{ marginBottom: 10 }}
            />
            <Surface
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginBottom: 20,
              }}
            >
              <Text style={{ marginRight: 16 }}>Price include tax</Text>
              <Switch
                value={isTaxIncludedPrice}
                onValueChange={onToggleSwitch}
              />
            </Surface>
            <DropdownMenu
              item={unit}
              items={units}
              label="Unit"
              setItem={setUnit}
              getItemValue={(item: Unit) => item?.name}
            />
            <TextInput
              mode="outlined"
              label="Tax Rate"
              placeholder="Enter tax rate"
              value={taxRate}
              keyboardType="numeric" // Shows numeric keyboard
              onChangeText={(text) => setTaxRate(text.replace(/[^0-9.]/g, ""))} // Restrict input to numbers & decimal
            />
          </Collapsible>
        </ScrollView>
        {updateDishLoading ? (
          <ActivityIndicator animating={true} size="large" />
        ) : (
          <>
            <Button
              mode="contained-tonal"
              onPress={handleUpdateDish}
              style={{ width: 200, alignSelf: "center", marginBottom: 20 }}
            >
              Update Dish
            </Button>
          </>
        )}
      </Surface>
    </>
  );
}
