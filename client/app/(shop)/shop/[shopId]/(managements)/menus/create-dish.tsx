import React, { useState } from "react";
import { ScrollView } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useSelector } from "react-redux";
import * as ImagePicker from "expo-image-picker";
import { Image } from "expo-image";
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
  IconButton,
} from "react-native-paper";
import Toast from "react-native-toast-message";
import { Collapsible } from "../../../../../../components/Collapsible";
import { AppBar } from "../../../../../../components/AppBar";
import { DropdownMenu } from "../../../../../../components/DropdownMenu";
import _ from "lodash";
import { BLURHASH } from "../../../../../../constants/common";
import {
  createDishRequest,
  removeImageRequest,
  uploadImageRequest,
} from "../../../../../../apis/dish.api.service";

export default function CreateDishPage() {
  const { shopId } = useLocalSearchParams();

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
  const [images, setImages] = useState<{ uri: string; loading: boolean }[]>([]);
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

  const resetField = () => {
    setName("");
    setCategory(dishCategories[0]);
    setDishType(dishTypes[0]);
    setPrice("");
    setUnit(units[0]);
    setTaxRate("");
    setImages([]);
  };

  const uploadImageToServer = async (uri: string, index: number) => {
    try {
      const response = await fetch(uri);
      const blob = await response.blob(); // Convert URI to Blob

      let formData = new FormData();
      formData.append("image", blob, `image_${Date.now()}.jpg`); // Properly append file

      // Replace with your server URL
      const imageUrl = await uploadImageRequest({
        shopId: shop.id,
        formData,
      });

      console.log(imageUrl);

      if (imageUrl) {
        setImages((prev) =>
          prev.map((img, i) =>
            i === index ? { loading: false, uri: imageUrl } : img
          )
        );
      } else {
        throw new Error("Upload failed, no URL returned.");
      }
    } catch (error) {
      console.error("Error uploading image:", error);
      // Optionally, you can remove the failed image or show an error state
      setImages((prev) => prev.filter((_, i) => i !== index));
    }
  };

  const pickImages = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: "images",
      allowsMultipleSelection: true,
      quality: 1,
    });

    if (!result.canceled) {
      const newImages = result.assets.map((asset) => ({
        uri: asset.uri,
        loading: true, // Mark as loading initially
      }));
      setImages((prev) => [...prev, ...newImages]);

      // Start uploading each image
      newImages.forEach((image, index) =>
        uploadImageToServer(image.uri, index)
      );
    }
  };

  const removeImage = (index: number) => {
    const image = _.find(images, (_, i) => i === index);
    setImages(_.filter(images, (_, i) => i !== index));
    removeImageRequest({ shopId: shop.id, url: image!.uri });
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
          <Surface style={{ flex: 1, flexDirection: "row", flexWrap: "wrap" }}>
            {images.map((image, index) => {
              if (image.loading) {
                <ActivityIndicator
                  size="small"
                  color="blue"
                  style={{ position: "absolute", top: 50, left: 90, zIndex: 1 }}
                />;
              }

              return (
                <Surface
                  key={index}
                  style={{
                    position: "relative",
                    marginRight: 10,
                  }}
                >
                  <Image
                    source={{ uri: image.uri }}
                    style={{ width: 200, height: 150, borderRadius: 10 }}
                    placeholder={{ blurhash: BLURHASH }}
                    contentFit="cover"
                    transition={1000}
                  />
                  <IconButton
                    mode="contained"
                    icon="close-circle"
                    size={20}
                    onPress={() => removeImage(index)}
                    style={{
                      position: "absolute",
                      margin: 0,
                      padding: 0,
                      top: 5,
                      right: 5,
                      width: 24,
                      height: 24,
                    }}
                  />
                </Surface>
              );
            })}
          </Surface>
          <Button
            mode="contained-tonal"
            onPress={pickImages}
            style={{ marginVertical: 10, width: 200, alignSelf: "center" }}
          >
            {"Upload Images (< 5MB)"}
          </Button>
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
