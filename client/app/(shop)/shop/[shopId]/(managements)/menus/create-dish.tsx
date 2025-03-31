import React, { useState } from "react";
import { ScrollView } from "react-native";
import { useRouter } from "expo-router";
import { useSelector } from "react-redux";
import { RootState } from "../../../../../../stores/store";
import {
  DishCategory,
  Shop,
  Unit,
} from "../../../../../../stores/state.interface";
import {
  Button,
  TextInput,
  ActivityIndicator,
  Surface,
  Switch,
  Text,
} from "react-native-paper";
import Toast from "react-native-toast-message";
import { Collapsible } from "../../../../../../components/Collapsible";
import { AppBar } from "../../../../../../components/AppBar";
import { DropdownMenu } from "../../../../../../components/DropdownMenu";
import _ from "lodash";
import UploadImages from "../../../../../../components/ui/UploadImage";
import {
  useCreateDishMutation,
  useGetDishCategoriesQuery,
  useGetDishTypesQuery,
  useGetUnitsQuery,
} from "../../../../../../stores/apiSlices/dishApi.slice";
import { LoaderBasic } from "../../../../../../components/ui/Loader";
import { goBackShopDishList } from "../../../../../../apis/navigate.service";

export default function CreateDishPage() {
  const router = useRouter();

  const shop = useSelector(
    (state: RootState) => state.shop.currentShop
  ) as Shop;
  const { data: dishTypes = [], isLoading: dishTypeLoading } =
    useGetDishTypesQuery(shop.id);
  const { data: dishCategories = [], isLoading: dishCategoryLoading } =
    useGetDishCategoriesQuery(shop.id);
  const { data: units = [], isLoading: unitLoading } = useGetUnitsQuery(
    shop.id
  );
  const [createDish, { isLoading: createDishLoading }] =
    useCreateDishMutation();

  const [name, setName] = useState("");
  const [category, setCategory] = useState<DishCategory>();
  const [dishType, setDishType] = useState("");
  const [price, setPrice] = useState("");
  const [unit, setUnit] = useState<Unit>();
  const [taxRate, setTaxRate] = useState("");
  const [images, setImages] = useState<{ uri: string; loading: boolean }[]>([]);
  const [isTaxIncludedPrice, setIsTaxIncludedPrice] = useState(false);

  const goBack = () => {
    resetField();
    goBackShopDishList({ router, shopId: shop.id });
  };

  const resetField = () => {
    setName("");
    setCategory(dishCategories[0]);
    setDishType(dishTypes[0]);
    setPrice("");
    setUnit(units[0]);
    setTaxRate("");
    setImages([]);
  };

  const handleCreateDish = async () => {
    if (!name.trim() || !category || !dishType || !unit || !price.trim()) {
      Toast.show({
        type: "error",
        text1: "Create Failed",
        text2:
          "Please enter name and category and dish type and unit and price",
      });
      return;
    }
    if (_.some(images, (image) => image.loading)) {
      Toast.show({
        type: "error",
        text1: "Create Failed",
        text2: "Please wait for images to be uploaded",
      });
      return;
    }
    try {
      await createDish({
        shopId: shop.id,
        name,
        category,
        dishType,
        price: _.toNumber(price),
        unit,
        taxRate: _.toNumber(taxRate),
        isTaxIncludedPrice,
        imageUrls: _.map(images, "uri"),
      }).unwrap();
      goBack();
    } catch (err) {
      console.error(err);
    }
  };

  if (dishTypeLoading || dishCategoryLoading || unitLoading) {
    return <LoaderBasic />;
  }

  return (
    <>
      <AppBar title="Create Dish" goBack={goBack} />
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
                onValueChange={() => setIsTaxIncludedPrice(!isTaxIncludedPrice)}
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
        {createDishLoading ? (
          <ActivityIndicator animating={true} size="large" />
        ) : (
          <>
            <Button
              mode="contained-tonal"
              onPress={handleCreateDish}
              style={{ width: 200, alignSelf: "center", marginBottom: 20 }}
            >
              Create Dish
            </Button>
          </>
        )}
      </Surface>
    </>
  );
}
