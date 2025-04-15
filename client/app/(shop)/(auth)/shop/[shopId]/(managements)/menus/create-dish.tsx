import React, { useState } from "react";
import { ScrollView } from "react-native";
import { useRouter } from "expo-router";
import { useSelector } from "react-redux";
import { RootState } from "../../../../../../../stores/store";
import {
  DishCategory,
  Shop,
  Unit,
} from "../../../../../../../stores/state.interface";
import {
  Button,
  TextInput,
  ActivityIndicator,
  Surface,
  Switch,
  Text,
} from "react-native-paper";
import Toast from "react-native-toast-message";
import { Collapsible } from "../../../../../../../components/Collapsible";
import { AppBar } from "../../../../../../../components/AppBar";
import { DropdownMenu } from "../../../../../../../components/DropdownMenu";
import _ from "lodash";
import UploadImages from "../../../../../../../components/ui/UploadImage";
import {
  useCreateDishMutation,
  useGetDishCategoriesQuery,
  useGetDishTypesQuery,
  useGetUnitsQuery,
} from "../../../../../../../stores/apiSlices/dishApi.slice";
import { LoaderBasic } from "../../../../../../../components/ui/Loader";
import { goBackShopDishList } from "../../../../../../../apis/navigate.service";
import { View } from "react-native";
import { useTranslation } from "react-i18next";

export default function CreateDishPage() {
  const router = useRouter();
  const { t } = useTranslation();

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
        text1: t("create_failed"),
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
    if (_.some(images, (image) => image.loading)) {
      Toast.show({
        type: "error",
        text1: t("create_failed"),
        text2: t("image_uploading_error"),
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
    } catch (error: any) {
      Toast.show({
        type: "error",
        text1: t("update_failed"),
        text2: error.data?.message,
      });
    }
  };

  if (dishTypeLoading || dishCategoryLoading || unitLoading) {
    return <LoaderBasic />;
  }

  return (
    <>
      <AppBar title={t("create_dish")} goBack={goBack} />
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
                    onValueChange={() =>
                      setIsTaxIncludedPrice(!isTaxIncludedPrice)
                    }
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
          {createDishLoading ? (
            <ActivityIndicator size={40} />
          ) : (
            <>
              <Button
                mode="contained-tonal"
                onPress={handleCreateDish}
                style={{ width: 200, alignSelf: "center" }}
              >
                {t("create_dish")}
              </Button>
            </>
          )}
        </View>
      </Surface>
    </>
  );
}
