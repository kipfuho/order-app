import React, { useState } from "react";
import { StyleSheet, ScrollView } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
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
import { createDishRequest } from "../../../../../../api/api.service";
import _ from "lodash";

export default function CreateTablePage() {
  const { shopId } = useLocalSearchParams();

  const shop = useSelector((state: RootState) =>
    state.shop.shops.find((s) => s.id.toString() === shopId)
  ) as Shop;
  const dishTypes = useSelector((state: RootState) => state.shop.dishTypes);
  const dishCategories = useSelector(
    (state: RootState) => state.shop.dishCategories
  );
  const units = useSelector((state: RootState) => state.shop.units);
  console.log(units);

  const [loading, setLoading] = useState(false);
  const [name, setName] = useState("");
  const [category, setCategory] = useState(dishCategories[0]);
  const [dishType, setDishType] = useState(dishTypes[0]);
  const [price, setPrice] = useState("");
  const [unit, setUnit] = useState(units[0]);
  const [taxRate, setTaxRate] = useState("");
  const router = useRouter();

  const [isTaxIncludedPrice, setIsTaxIncludedPrice] = useState(false);
  const onToggleSwitch = () => setIsTaxIncludedPrice(!isTaxIncludedPrice);

  const goBack = () => {
    resetField();
    router.navigate({
      pathname: "/shop/[shopId]/menus/dishes",
      params: { shopId: shop.id },
    });
  };

  const resetField = () => {};

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
    try {
      setLoading(true);
      await createDishRequest({
        shopId: shop.id,
        name,
        category,
        dishType,
        price: _.toNumber(price),
        unit,
        taxRate: _.toNumber(taxRate),
        isTaxIncludedPrice,
      });
      goBack();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <AppBar title="Create Dish" goBack={goBack} />
      <Surface style={{ flex: 1 }}>
        <ScrollView style={{ flex: 1, padding: 16 }}>
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
