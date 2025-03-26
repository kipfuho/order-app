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
  Dish,
  DishCategory,
  Shop,
  Unit,
} from "../../../../../../../stores/state.interface";
import { AppBar } from "../../../../../../../components/AppBar";
import { ScrollView } from "react-native";
import { Collapsible } from "../../../../../../../components/Collapsible";
import { DropdownMenu } from "../../../../../../../components/DropdownMenu";
import { updateDishRequest } from "../../../../../../../apis/dish.api.service";
import UploadImages from "../../../../../../../components/ui/UploadImage";

export default function UpdateDishPage() {
  const { shopId, dishId } = useLocalSearchParams();

  const shop = useSelector((state: RootState) =>
    state.shop.shops.find((s) => s.id.toString() === shopId)
  ) as Shop;
  const dish = useSelector((state: RootState) =>
    state.shop.dishes.find((d) => d.id === dishId)
  ) as Dish;
  const dishTypes = useSelector((state: RootState) => state.shop.dishTypes);
  const dishCategories = useSelector(
    (state: RootState) => state.shop.dishCategories
  );
  const units = useSelector((state: RootState) => state.shop.units);

  const [loading, setLoading] = useState(false);
  const [name, setName] = useState("");
  const [category, setCategory] = useState(dishCategories[0]);
  const [dishType, setDishType] = useState(dishTypes[0]);
  const [price, setPrice] = useState("");
  const [unit, setUnit] = useState(units[0]);
  const [taxRate, setTaxRate] = useState("");
  const [images, setImages] = useState<{ uri: string; loading: boolean }[]>([]);
  const router = useRouter();

  const [isTaxIncludedPrice, setIsTaxIncludedPrice] = useState(false);
  const onToggleSwitch = () => setIsTaxIncludedPrice(!isTaxIncludedPrice);

  const goBack = () =>
    router.navigate({
      pathname: "/shop/[shopId]/menus/dishes",
      params: {
        shopId: shop.id,
      },
    });

  const handleUpdateDish = async () => {
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
      setLoading(true);
      await updateDishRequest({
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
      });

      // Navigate back to table position list
      goBack();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setName(dish.name);
    setCategory(dish.category);
    setDishType(dish.type);
    setPrice(_.toString(dish.price));
    setUnit(dish.unit);
    setTaxRate(_.toString(dish.taxRate));
    setImages(_.map(dish.imageUrls, (url) => ({ uri: url, loading: false })));
  }, [dish]);

  if (!dish) {
    return (
      <Surface style={{ flex: 1 }}>
        <Text>Dish not found</Text>
        <Button onPress={goBack}>
          <Text>Go Back</Text>
        </Button>
      </Surface>
    );
  }

  return (
    <>
      <AppBar title="Update Dish" goBack={goBack} />
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
        {loading ? (
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
