import React, { useEffect, useMemo, useState } from "react";
import { View } from "react-native";
import {
  Button,
  Portal,
  Searchbar,
  Surface,
  Text,
  TouchableRipple,
} from "react-native-paper";
import { useRouter } from "expo-router";
import { AppBar } from "@components/AppBar";
import { useGetShopsQuery } from "@stores/apiSlices/shopApi.slice";
import { LoaderBasic } from "@components/ui/Loader";
import { goToShopHome, goToCreateShop } from "@apis/navigate.service";
import { useTranslation } from "react-i18next";
import FastImage from "@d11/react-native-fast-image";
import _, { debounce } from "lodash";
import { Shop } from "@stores/state.interface";
import { ConfirmCancelDialog } from "@/components/ui/CancelDialog";
import { logoutRequest } from "@/apis/auth.api.service";
import { useSession } from "@/hooks/useSession";
import { FlashList } from "@shopify/flash-list";
import { styles } from "../../../constants/styles";

export default function ShopsPage() {
  const router = useRouter();
  const { t } = useTranslation();

  const { data: shops = [], isLoading, isFetching } = useGetShopsQuery({});
  const { session } = useSession();

  const [filteredShops, setFilteredShops] = useState<Shop[]>([]);
  const [searchValue, setSearchValue] = useState("");
  const [dialogVisible, setDialogVisible] = useState(false);
  const [logoutLoading, setLogoutLoading] = useState(false);

  const handleSearch = useMemo(
    () =>
      debounce((_searchValue: string) => {
        const searchValueLowerCase = _searchValue.toLowerCase();
        const matchedShops = _.filter(shops, (shop) =>
          _.includes((shop.name || "").toLowerCase(), searchValueLowerCase),
        );

        setFilteredShops(matchedShops);
      }, 200),
    [shops],
  );

  const handleLogout = async () => {
    setLogoutLoading(true);
    await logoutRequest({ refreshToken: session?.tokens?.refresh.token });
    setLogoutLoading(false);
  };

  useEffect(() => {
    handleSearch(searchValue);
  }, [searchValue, isFetching, handleSearch]);

  if (isLoading) {
    return <LoaderBasic />;
  }

  return (
    <>
      <Portal>
        <ConfirmCancelDialog
          title={t("logout_confirm")}
          dialogVisible={dialogVisible}
          setDialogVisible={setDialogVisible}
          isLoading={logoutLoading}
          onCancelClick={() => setDialogVisible(false)}
          onConfirmClick={handleLogout}
        />
      </Portal>
      <AppBar title={t("shop")} goBack={() => setDialogVisible(true)}>
        <Button
          mode="contained-tonal"
          onPress={() => {
            goToCreateShop({ router });
          }}
        >
          {t("create_shop")}
        </Button>
      </AppBar>
      <Surface mode="flat" style={styles.flex}>
        <FlashList
          data={filteredShops}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={{ paddingHorizontal: 12, paddingBottom: 12 }}
          estimatedItemSize={124}
          renderItem={({ item: shop }) => (
            <Surface style={{ borderRadius: 12 }}>
              <TouchableRipple
                onPress={() => goToShopHome({ router, shopId: shop.id })}
                style={{ borderRadius: 12 }}
              >
                <View
                  style={{
                    flexDirection: "row",
                    padding: 12,
                  }}
                >
                  <FastImage
                    source={{
                      uri: shop.imageUrls?.[0],
                    }}
                    // eslint-disable-next-line @typescript-eslint/no-require-imports
                    defaultSource={require("@assets/images/savora.png")}
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
                </View>
              </TouchableRipple>
            </Surface>
          )}
          ListHeaderComponent={
            <Searchbar
              value={searchValue}
              placeholder={t("search")}
              onChangeText={setSearchValue}
              style={{ margin: 12 }}
            />
          }
          ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
        />
      </Surface>
    </>
  );
}
