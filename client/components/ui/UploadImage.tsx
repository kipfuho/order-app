import _ from "lodash";
import { Dispatch, SetStateAction } from "react";
import * as ImagePicker from "expo-image-picker";
import { Image } from "expo-image";
import {
  ActivityIndicator,
  Button,
  IconButton,
  Surface,
} from "react-native-paper";
import { useTranslation } from "react-i18next";
import { BLURHASH } from "@constants/common";
import { removeImageRequest } from "@apis/dish.api.service";
import Toast from "react-native-toast-message";
import { Platform } from "react-native";
import { base64ToBlob } from "../../constants/utils";

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
  const { t } = useTranslation();

  const uploadImageToServer = async (uri: string, index: number) => {
    try {
      const formData = new FormData();
      if (Platform.OS === "web") {
        // Extract base64 from data URI
        const base64 = uri.split(",")[1];
        const blob = base64ToBlob(base64, "image/jpeg");
        formData.append("image", blob, `image_${Date.now()}.jpg`);
      } else {
        // Native platforms (Android/iOS)
        formData.append("image", {
          uri,
          name: `image_${Date.now()}.jpg`,
          type: "image/jpeg",
        } as any);
      }

      // Replace with your server URL
      const imageUrl = await uploadImage(formData);

      if (imageUrl) {
        setImages((prev) =>
          prev.map((img, i) =>
            i === index ? { loading: false, uri: imageUrl } : img,
          ),
        );
      } else {
        throw new Error("Upload failed, no URL returned.");
      }
    } catch {
      setImages((prev) => _.filter(prev, (_, i) => i !== index));
      Toast.show({
        type: "error",
        text1: t("error"),
        text2: t("failed_to_upload_image"),
      });
    }
  };

  const pickImages = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: "images",
      allowsMultipleSelection,
      quality: 1,
    });

    if (!result.canceled) {
      // nếu chỉ chọn 1 ảnh thì remove ảnh cũ đi
      if (!allowsMultipleSelection && images[0]) {
        await removeImageRequest({ url: images[0].uri });
      }
      const newImages = result.assets.map((asset) => ({
        uri: asset.uri,
        loading: true, // Mark as loading initially
      }));
      const currentImagesLength = allowsMultipleSelection ? images.length : 0;
      if (!allowsMultipleSelection && images[0]) {
        setImages(newImages);
      } else {
        setImages((prev) => {
          return [...prev, ...newImages];
        });
      }

      // Start uploading each image
      newImages.forEach((image, index) =>
        uploadImageToServer(image.uri, index + currentImagesLength),
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
                allowDownscaling // Allow image downscaling
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
        {t("upload_image")}
      </Button>
    </>
  );
}
