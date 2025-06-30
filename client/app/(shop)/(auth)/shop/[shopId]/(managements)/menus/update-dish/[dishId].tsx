import React, { useEffect, useMemo, useState } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import _ from "lodash";
import Toast from "react-native-toast-message";
import {
  ActivityIndicator,
  Button,
  IconButton,
  Surface,
  Switch,
  Text,
  TextInput,
} from "react-native-paper";
import { useSelector } from "react-redux";
import { RootState } from "@stores/store";
import { DishCategory, Shop, Unit } from "@stores/state.interface";
import { AppBar } from "@components/AppBar";
import { ScrollView, View } from "react-native";
import { Collapsible } from "@components/Collapsible";
import { DropdownMenu } from "@components/DropdownMenu";
import UploadImages from "@components/ui/UploadImage";
import {
  useGetDishCategoriesQuery,
  useGetDishesQuery,
  useGetDishTypesQuery,
  useGetUnitsQuery,
  useUpdateDishMutation,
} from "@stores/apiSlices/dishApi.slice";
import { LoaderBasic } from "@components/ui/Loader";
import { goToShopDishList } from "@apis/navigate.service";
import { useTranslation } from "react-i18next";
import { uploadDishImageRequest } from "@apis/dish.api.service";

export default function UpdateDishPage() {
  const { dishId } = useLocalSearchParams();
  const router = useRouter();
  const { t } = useTranslation();

  const shop = useSelector(
    (state: RootState) => state.shop.currentShop,
  ) as Shop;
  const {
    data: dishes = [],
    isLoading: dishLoading,
    isFetching: dishFetching,
  } = useGetDishesQuery({ shopId: shop.id });
  const { data: dishTypes = [], isLoading: dishTypeLoading } =
    useGetDishTypesQuery({ shopId: shop.id });
  const { data: dishCategories = [], isLoading: dishCategoryLoading } =
    useGetDishCategoriesQuery({ shopId: shop.id });
  const { data: units = [], isLoading: unitLoading } = useGetUnitsQuery(
    shop.id,
  );
  const dish = useMemo(
    () => _.find(dishes, (d) => d.id === dishId),
    [dishes, dishId],
  );
  const [updateDish, { isLoading: updateDishLoading }] =
    useUpdateDishMutation();

  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [category, setCategory] = useState(dishCategories[0]);
  const [dishType, setDishType] = useState(dishTypes[0]);
  const [price, setPrice] = useState("");
  const [unit, setUnit] = useState(units[0]);
  const [taxRate, setTaxRate] = useState("");
  const [images, setImages] = useState<{ uri: string; loading: boolean }[]>([]);
  const [isTaxIncludedPrice, setIsTaxIncludedPrice] = useState(false);
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");

  const uploadDishImage = async (formData: FormData) => {
    const imageUrl = await uploadDishImageRequest({
      formData,
      shopId: shop.id,
    });
    return imageUrl;
  };

  const handleUpdateDish = async () => {
    if (!dish) {
      return;
    }

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
        text1: t("update_failed"),
        text2: `${t("required")} ${_.join(
          _.compact([
            !name.trim() && t("dish_name"),
            !code.trim() && t("dish_code"),
            !category && t("dish_category"),
            !dishType && t("dish_type"),
            !unit && t("unit"),
            !price.trim() && t("price"),
          ]),
          ",",
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
      await updateDish({
        shopId: shop.id,
        dishId: dish.id,
        name,
        code,
        category,
        dishType,
        price: parseFloat(price),
        unit,
        taxRate: parseFloat(taxRate),
        isTaxIncludedPrice,
        imageUrls: _.map(images, "uri"),
        tags,
      }).unwrap();

      // Navigate back to table position list
      goToShopDishList({ router, shopId: shop.id });
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
    setCode(dish.code);
    setCategory(dish.category);
    setDishType(dish.type);
    setPrice(_.toString(dish.price));
    setUnit(dish.unit);
    setTaxRate(_.toString(dish.taxRate));
    setImages(_.map(dish.imageUrls, (url) => ({ uri: url, loading: false })));
    setTags(dish.tags);
  }, [dishId, dish, dishFetching]);

  if (dishLoading || dishCategoryLoading || dishTypeLoading || unitLoading) {
    return <LoaderBasic />;
  }

  if (!dish) {
    return (
      <Surface style={{ flex: 1 }}>
        <Text>{t("dish_not_found")}</Text>
        <Button onPress={() => goToShopDishList({ router, shopId: shop.id })}>
          <Text>{t("go_back")}</Text>
        </Button>
      </Surface>
    );
  }

  return (
    <>
      <AppBar
        title={t("update_dish")}
        goBack={() => goToShopDishList({ router, shopId: shop.id })}
      />
      <Surface style={{ flex: 1 }}>
        <ScrollView>
          <View style={{ flex: 1, gap: 16 }}>
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

              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  marginBottom: 10,
                }}
              >
                <TextInput
                  label={t("add_tag")}
                  value={tagInput}
                  onChangeText={setTagInput}
                  onSubmitEditing={() => {
                    const trimmed = tagInput.trim();
                    if (trimmed && !tags.includes(trimmed)) {
                      setTags([...tags, trimmed]);
                    }
                    setTagInput("");
                  }}
                  returnKeyType="done"
                  mode="outlined"
                  style={{ flex: 1, marginBottom: 10 }}
                />
                <IconButton
                  onPress={() => {
                    const trimmed = tagInput.trim();
                    if (trimmed && !tags.includes(trimmed)) {
                      setTags([...tags, trimmed]);
                      setTagInput("");
                    }
                  }}
                  disabled={!tagInput.trim()}
                  mode="contained"
                  icon="plus"
                />
              </View>

              <View
                style={{
                  flexDirection: "row",
                  flexWrap: "wrap",
                  gap: 8,
                  marginBottom: 20,
                }}
              >
                {tags.map((tag) => (
                  <Button
                    key={tag}
                    mode="outlined"
                    compact
                    onPress={() => setTags(tags.filter((t) => t !== tag))}
                  >
                    {tag} ✕
                  </Button>
                ))}
              </View>
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
          </View>
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
