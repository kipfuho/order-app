import React, { useLayoutEffect, useState } from "react";
import { StyleSheet, ScrollView } from "react-native";
import { useLocalSearchParams, useNavigation, useRouter } from "expo-router";
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
  useTheme,
  ActivityIndicator,
  Surface,
} from "react-native-paper";
import { Ionicons } from "@expo/vector-icons";
import Toast from "react-native-toast-message";
import { Collapsible } from "../../../../../../components/Collapsible";
import { AppBar } from "../../../../../../components/AppBar";
import { DropdownMenu } from "../../../../../../components/DropdownMenu";

export default function CreateTablePage() {
  const { shopId } = useLocalSearchParams();
  const theme = useTheme();
  const shop = useSelector((state: RootState) =>
    state.shop.shops.find((s) => s.id.toString() === shopId)
  ) as Shop;

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
  const router = useRouter();
  const navigation = useNavigation();

  const goBack = () =>
    router.navigate({
      pathname: "/shop/[shopId]/menus/dishes",
      params: { shopId: shop.id },
    });

  useLayoutEffect(() => {
    navigation.setOptions({
      headerLeft: () => (
        <Button
          mode="text"
          onPress={goBack}
          icon={() => (
            <Ionicons
              name="arrow-back"
              size={24}
              color={theme.colors.primary}
            />
          )}
        >
          Back
        </Button>
      ),
    });
  }, [navigation]);

  const handleCreateDish = async () => {
    if (!name.trim() || !category) {
      Toast.show({
        type: "error",
        text1: "Create Failed",
        text2: "Please enter name and dish category",
      });
      return;
    }
    try {
      setLoading(true);
      // TODO: Implement API request to create a dish
      goBack();
      setName("");
      setCategory(dishCategories[0]);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <AppBar title="Create Dish" goBack={goBack} />
      <Surface style={[styles.container]}>
        <ScrollView style={{ flex: 1 }}>
          {/* General Information Collapsible */}
          <Collapsible title="General Information">
            <TextInput
              mode="outlined"
              label="Dish Name"
              value={name}
              onChangeText={setName}
              style={styles.input}
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
              mode="outlined"
              label="Price"
              value={price}
              style={styles.input}
              keyboardType="numeric" // Shows numeric keyboard
              onChangeText={(text) => setPrice(text.replace(/[^0-9.]/g, ""))} // Restrict input to numbers & decimal
            />
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
              value={taxRate}
              style={styles.input}
              keyboardType="numeric" // Shows numeric keyboard
              onChangeText={(text) => setTaxRate(text.replace(/[^0-9.]/g, ""))} // Restrict input to numbers & decimal
            />
          </Collapsible>
        </ScrollView>
        {loading ? (
          <ActivityIndicator
            animating={true}
            size="large"
            style={styles.loader}
          />
        ) : (
          <>
            <Button
              mode="contained"
              onPress={handleCreateDish}
              style={styles.createButton}
            >
              Create Dish
            </Button>
          </>
        )}
      </Surface>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingBottom: 16,
    justifyContent: "center",
  },
  input: {
    marginBottom: 16,
  },
  createButton: {
    marginTop: 16,
    width: 200,
    alignSelf: "center",
  },
  cancelButton: {
    marginTop: 8,
  },
  loader: {
    marginVertical: 16,
  },
});
