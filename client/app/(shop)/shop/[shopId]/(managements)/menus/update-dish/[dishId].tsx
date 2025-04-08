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
import { ScrollView, View } from "react-native";
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
import { useTranslation } from "react-i18next";

export default function UpdateDishPage() {
  const { dishId } = useLocalSearchParams();
  const router = useRouter();
  const { t } = useTranslation();

  const shop = useSelector(
    (state: RootState) => state.shop.currentShop
  ) as Shop;
  const {
    data: dishes = [],
    isLoading: dishLoading,
    isFetching: dishFetching,
  } = useGetDishesQuery(shop.id);
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
        text1: t("update_failed"),
        text2: `${t("required")} ${_.join(
          _.compact([
            !name.trim() && t("dish_name"),
            !category && t("dish_category"),
            !dishType && t("dish_type"),
            !unit && t("unit"),
            !price.trim() && t("price"),
          ]),
          ","
        )}`,
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
    } catch (error: any) {
      Toast.show({
        type: "error",
        text1: t("update_failed"),
        text2: error.data?.message,
      });
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
  }, [dishId, dishFetching]);

  if (dishLoading || dishCategoryLoading || dishTypeLoading || unitLoading) {
    return <LoaderBasic />;
  }

  if (!dish) {
    return (
      <Surface style={{ flex: 1 }}>
        <Text>{t("dish_not_found")}</Text>
        <Button onPress={() => goBackShopDishList({ router, shopId: shop.id })}>
          <Text>{t("go_back")}</Text>
        </Button>
      </Surface>
    );
  }

  return (
    <>
      <AppBar
        title={t("update_dish")}
        goBack={() => goBackShopDishList({ router, shopId: shop.id })}
      />
      <Surface style={{ flex: 1 }}>
        <ScrollView>
          <Surface style={{ flex: 1, boxShadow: "none", gap: 16 }}>
            <UploadImages
              images={images}
              setImages={setImages}
              shopId={shop.id}
            />
            {/* General Information Collapsible */}
            <Collapsible title={t("general_information")}>
              <View style={{ padding: 16 }}>
                <TextInput
                  label={t("dish_name")}
                  mode="outlined"
                  value={name}
                  onChangeText={setName}
                  style={{ marginBottom: 20 }}
                />

                <DropdownMenu
                  item={dishType}
                  items={dishTypes}
                  label={t("dish_type")}
                  setItem={setDishType}
                  getItemValue={(item: string) => item}
                />

                <DropdownMenu
                  item={category}
                  items={dishCategories}
                  label={t("dish_category")}
                  setItem={setCategory}
                  getItemValue={(item: DishCategory) => item?.name}
                />
              </View>
            </Collapsible>

            {/* Price Collapsible */}
            <Collapsible title={t("price_information")}>
              <View style={{ padding: 16 }}>
                <TextInput
                  label={t("price")}
                  mode="outlined"
                  value={price}
                  onChangeText={(text) =>
                    setPrice(text.replace(/[^0-9.]/g, ""))
                  } // Restrict input to numbers & decimal
                  keyboardType="numeric" // Shows numeric keyboard
                  style={{ marginBottom: 10 }}
                />
                <Surface
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    marginBottom: 20,
                    boxShadow: "none",
                  }}
                >
                  <Text style={{ marginRight: 16 }}>
                    {t("price_include_tax")}
                  </Text>
                  <Switch
                    value={isTaxIncludedPrice}
                    onValueChange={onToggleSwitch}
                  />
                </Surface>
                <DropdownMenu
                  item={unit}
                  items={units}
                  label={t("unit")}
                  setItem={setUnit}
                  getItemValue={(item: Unit) => item?.name}
                />
                <TextInput
                  mode="outlined"
                  label={t("tax_rate")}
                  value={taxRate}
                  keyboardType="numeric" // Shows numeric keyboard
                  onChangeText={(text) =>
                    setTaxRate(text.replace(/[^0-9.]/g, ""))
                  } // Restrict input to numbers & decimal
                />
              </View>
            </Collapsible>
          </Surface>
        </ScrollView>
        <View style={{ marginVertical: 20 }}>
          {updateDishLoading ? (
            <ActivityIndicator size={40} />
          ) : (
            <>
              <Button
                mode="contained-tonal"
                onPress={handleUpdateDish}
                style={{ width: 200, alignSelf: "center" }}
              >
                {t("update_dish")}
              </Button>
            </>
          )}
        </View>
      </Surface>
    </>
  );
}
