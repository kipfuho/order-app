import React from "react";
import { FlatList, ScrollView, TouchableOpacity } from "react-native";
import { Button, List, Surface, Text, useTheme } from "react-native-paper";
import { useRouter } from "expo-router";
import { AppBar } from "../../../components/AppBar";
import { useGetShopsQuery } from "../../../stores/apiSlices/shopApi.slice";
import { LoaderBasic } from "../../../components/ui/Loader";
import { goBackShopHome } from "../../../apis/navigate.service";
import { useTranslation } from "react-i18next";
import { Image } from "expo-image";
import { View } from "react-native";

export default function ShopsPage() {
  const router = useRouter();
  const theme = useTheme(); // Get theme colors
  const { t } = useTranslation();

  const { data: shops = [], isLoading, isError, error } = useGetShopsQuery({});

  if (isLoading) {
    return <LoaderBasic />;
  }

  return (
    <>
      <AppBar title={t("shop")}>
        <Button
          mode="contained-tonal"
          onPress={() => router.push("/create-shop")}
        >
          {t("create_shop")}
        </Button>
      </AppBar>
      <Surface mode="flat" style={{ flex: 1 }}>
        <ScrollView>
          <View style={{ padding: 12, gap: 12 }}>
            <FlatList
              data={shops}
              renderItem={({ item: shop }) => (
                <TouchableOpacity
                  onPress={() => goBackShopHome({ router, shopId: shop.id })}
                  activeOpacity={1}
                >
                  <Surface
                    style={{
                      flexDirection: "row",
                      padding: 12,
                      margin: 4,
                      gap: 12,
                    }}
                  >
                    <Image
                      source={
                        shop.imageUrls?.[0] ||
                        require("@assets/images/savora.png")
                      }
                      style={{
                        width: 100,
                        height: 100,
                        borderRadius: 15,
                      }}
                    />
                    <View style={{ flex: 1, justifyContent: "center" }}>
                      <Text
                        style={{
                          fontSize: 18,
                          textTransform: "capitalize",
                        }}
                      >
                        {shop.name}
                      </Text>
                      <Text
                        style={{
                          fontSize: 14,
                        }}
                      >
                        {shop.location}
                      </Text>
                    </View>
                  </Surface>
                </TouchableOpacity>
              )}
            />
          </View>
        </ScrollView>
      </Surface>
    </>
  );
}
