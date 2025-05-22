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
import { goToShopDishList } from "../../../../../../../apis/navigate.service";
import { View } from "react-native";
import { useTranslation } from "react-i18next";
import { uploadDishImageRequest } from "../../../../../../../apis/dish.api.service";

export default function CreateDishPage() {
  const router = useRouter();
  const { t } = useTranslation();

  const shop = useSelector(
    (state: RootState) => state.shop.currentShop
  ) as Shop;
  const { data: dishTypes = [], isLoading: dishTypeLoading } =
    useGetDishTypesQuery({ shopId: shop.id });
  const { data: dishCategories = [], isLoading: dishCategoryLoading } =
    useGetDishCategoriesQuery({ shopId: shop.id });
  const { data: units = [], isLoading: unitLoading } = useGetUnitsQuery(
    shop.id
  );
  const [createDish, { isLoading: createDishLoading }] =
    useCreateDishMutation();

  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [category, setCategory] = useState<DishCategory>();
  const [dishType, setDishType] = useState("");
  const [price, setPrice] = useState("");
  const [unit, setUnit] = useState<Unit>();
  const [taxRate, setTaxRate] = useState("");
  const [images, setImages] = useState<{ uri: string; loading: boolean }[]>([]);
  const [isTaxIncludedPrice, setIsTaxIncludedPrice] = useState(false);

  const resetField = () => {
    setName("");
    setCode("");
    setCategory(dishCategories[0]);
    setDishType(dishTypes[0]);
    setPrice("");
    setUnit(units[0]);
    setTaxRate("");
    setImages([]);
  };

  const uploadDishImage = async (formData: FormData) => {
    const imageUrl = await uploadDishImageRequest({
      formData,
      shopId: shop.id,
    });
    return imageUrl;
  };

  const handleCreateDish = async () => {
    if (
      !name.trim() ||
      !code.trim() ||
      !category ||
      !dishType ||
      !unit ||
      !price.trim()
    ) {
      Toast.show({
        type: "error",
        text1: t("create_failed"),
        text2: `${t("required")} ${_.join(
          _.compact([
            !name.trim() && t("dish_name"),
            !code.trim() && t("dish_code"),
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
        code,
        category,
        dishType,
        price: _.toNumber(price),
        unit,
        taxRate: _.toNumber(taxRate),
        isTaxIncludedPrice,
        imageUrls: _.map(images, "uri"),
      }).unwrap();

      resetField();
      goToShopDishList({ router, shopId: shop.id });
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
      <AppBar
        title={t("create_dish")}
        goBack={() => goToShopDishList({ router, shopId: shop.id })}
      />
      <Surface style={{ flex: 1 }}>
        <ScrollView>
          <Surface mode="flat" style={{ flex: 1, gap: 16 }}>
            <UploadImages
              images={images}
              setImages={setImages}
              uploadImage={uploadDishImage}
            />
            {/* General Information Collapsible */}
            <Collapsible title={t("general_information")}>
              <TextInput
                label={t("dish_name")}
                mode="outlined"
                value={name}
                onChangeText={setName}
                style={{ marginBottom: 20 }}
              />
              <TextInput
                label={t("dish_code")}
                mode="outlined"
                value={code}
                onChangeText={setCode}
                style={{ marginBottom: 20 }}
              />

              <DropdownMenu
                item={dishType}
                items={dishTypes}
                label={t("dish_type")}
                setItem={setDishType}
                getItemValue={(item: string) => t(item)}
              />

              <DropdownMenu
                item={category}
                items={dishCategories}
                label={t("dish_category")}
                setItem={setCategory}
                getItemValue={(item: DishCategory) => item?.name}
              />
            </Collapsible>

            {/* Price Collapsible */}
            <Collapsible title={t("price_information")}>
              <TextInput
                label={t("price")}
                mode="outlined"
                value={price}
                onChangeText={(text) => setPrice(text.replace(/[^0-9.]/g, ""))} // Restrict input to numbers & decimal
                keyboardType="numeric" // Shows numeric keyboard
                style={{ marginBottom: 10 }}
              />
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  marginVertical: 20,
                  justifyContent: "space-between",
                }}
              >
                <Text variant="titleMedium" style={{ marginRight: 16 }}>
                  {t("price_include_tax")}
                </Text>
                <Switch
                  value={isTaxIncludedPrice}
                  onValueChange={() =>
                    setIsTaxIncludedPrice(!isTaxIncludedPrice)
                  }
                />
              </View>
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
