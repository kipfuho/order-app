import React, { useCallback, useEffect, useState } from "react";
import { TouchableOpacity } from "react-native";
import { Button, Searchbar, Surface, Text } from "react-native-paper";
import { useRouter } from "expo-router";
import { AppBar } from "../../../components/AppBar";
import { useGetShopsQuery } from "../../../stores/apiSlices/shopApi.slice";
import { LoaderBasic } from "../../../components/ui/Loader";
import { goToShopHome, goToCreateShop } from "../../../apis/navigate.service";
import { useTranslation } from "react-i18next";
import { Image } from "expo-image";
import { View } from "react-native";
import _, { debounce } from "lodash";
import { Shop } from "../../../stores/state.interface";
import { LegendList } from "@legendapp/list";
import { BLURHASH } from "../../../constants/common";

export default function ShopsPage() {
  const router = useRouter();
  const { t } = useTranslation();

  const { data: shops = [], isLoading, isFetching } = useGetShopsQuery({});

  const [filteredShops, setFilteredShops] = useState<Shop[]>([]);
  const [searchValue, setSearchValue] = useState("");

  const handleSearch = useCallback(
    debounce((_searchValue: string) => {
      const searchValueLowerCase = _searchValue.toLowerCase();
      const matchedShops = _.filter(shops, (shop) =>
        _.includes((shop.name || "").toLowerCase(), searchValueLowerCase)
      );

      setFilteredShops(matchedShops);
    }, 200),
    [shops]
  );

  useEffect(() => {
    handleSearch(searchValue);
  }, [searchValue, isFetching]);

  if (isLoading) {
    return <LoaderBasic />;
  }

  return (
    <>
      <AppBar title={t("shop")}>
        <Button
          mode="contained-tonal"
          onPress={() => goToCreateShop({ router })}
        >
          {t("create_shop")}
        </Button>
      </AppBar>
      <Surface mode="flat" style={{ flex: 1 }}>
        <LegendList
          data={filteredShops}
          keyExtractor={(item) => item.id.toString()}
          ListHeaderComponent={
            <Searchbar
              value={searchValue}
              placeholder={t("search")}
              onChangeText={setSearchValue}
              style={{ margin: 12 }}
            />
          }
          contentContainerStyle={{ paddingHorizontal: 12, paddingBottom: 12 }}
          ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
          renderItem={({ item: shop }) => (
            <TouchableOpacity
              onPress={() => goToShopHome({ router, shopId: shop.id })}
              activeOpacity={1}
            >
              <Surface
                style={{
                  flexDirection: "row",
                  padding: 12,
                  borderRadius: 12,
                }}
              >
                <Image
                  source={
                    shop.imageUrls?.[0] || require("@assets/images/savora.png")
                  }
                  placeholder={{ blurhash: BLURHASH }}
                  style={{
                    width: 100,
                    height: 100,
                    borderRadius: 15,
                  }}
                />
                <View
                  style={{
                    flex: 1,
                    justifyContent: "center",
                    gap: 8,
                    marginLeft: 8,
                  }}
                >
                  <Text
                    style={{
                      fontSize: 24,
                      textTransform: "capitalize",
                    }}
                    numberOfLines={2}
                  >
                    {shop.name}
                  </Text>
                  <Text
                    style={{
                      fontSize: 16,
                    }}
                    numberOfLines={2}
                  >
                    {shop.location}
                  </Text>
                </View>
              </Surface>
            </TouchableOpacity>
          )}
        />
      </Surface>
    </>
  );
}
