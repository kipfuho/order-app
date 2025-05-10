import { Dispatch, SetStateAction } from "react";
import { removeImageRequest } from "../../apis/dish.api.service";
import * as ImagePicker from "expo-image-picker";
import { Image } from "expo-image";
import _ from "lodash";
import {
  ActivityIndicator,
  Button,
  IconButton,
  Surface,
} from "react-native-paper";
import { BLURHASH } from "../../constants/common";

export default function UploadImages({
  images,
  allowsMultipleSelection = true,
  setImages,
  uploadImage,
}: {
  images: { uri: string; loading: boolean }[];
  setImages: Dispatch<SetStateAction<{ uri: string; loading: boolean }[]>>;
  allowsMultipleSelection?: boolean;
  uploadImage: (formData: FormData) => Promise<string>;
}) {
  const uploadImageToServer = async (uri: string, index: number) => {
    try {
      const response = await fetch(uri);
      const blob = await response.blob(); // Convert URI to Blob

      let formData = new FormData();
      formData.append("image", blob, `image_${Date.now()}.jpg`); // Properly append file

      // Replace with your server URL
      const imageUrl = await uploadImage(formData);

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
      allowsMultipleSelection,
      quality: 1,
    });

    if (!result.canceled) {
      // nếu chỉ chọn 1 ảnh thì remove ảnh cũ đi
      if (!allowsMultipleSelection && images[0]) {
        removeImageRequest({ url: images[0].uri });
        setImages([]);
      }
      const newImages = result.assets.map((asset) => ({
        uri: asset.uri,
        loading: true, // Mark as loading initially
      }));
      const currentImagesLength = images.length;
      setImages((prev) => {
        return [...prev, ...newImages];
      });

      // Start uploading each image
      newImages.forEach((image, index) =>
        uploadImageToServer(image.uri, index + currentImagesLength)
      );
    }
  };

  const removeImage = (index: number) => {
    const image = _.find(images, (_, i) => i === index);
    setImages(_.filter(images, (_, i) => i !== index));
    removeImageRequest({ url: image!.uri });
  };

  return (
    <>
      <Surface
        style={{
          flex: 1,
          flexDirection: "row",
          flexWrap: "wrap",
          justifyContent: "center",
          gap: 8,
        }}
        mode="flat"
      >
        {images.map((image, index) => {
          if (image.loading) {
            return (
              <ActivityIndicator
                key={index}
                size="large"
                color="blue"
                style={{
                  width: 200,
                  height: 150,
                  alignSelf: "center",
                }}
              />
            );
          }

          return (
            <Surface
              key={index}
              style={{
                position: "relative",
                marginRight: 10,
              }}
              mode="flat"
            >
              <Image
                source={{ uri: image.uri }}
                style={{
                  width: 150,
                  height: 150,
                  borderRadius: allowsMultipleSelection ? 10 : 200,
                }}
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
    </>
  );
}
