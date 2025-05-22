import React from "react";
import { ScrollView, View } from "react-native";
import { useRouter } from "expo-router";
import { useSelector } from "react-redux";
import { RootState } from "../../../../../../../../stores/store";
import { Button, List, Surface } from "react-native-paper";
import _ from "lodash";
import { Shop } from "../../../../../../../../stores/state.interface";
import { AppBar } from "../../../../../../../../components/AppBar";
import { useGetKitchensQuery } from "../../../../../../../../stores/apiSlices/kitchenApi.slice";
import {
  goToShopSetting,
  goToCreateKitchen,
  goToUpdateKitchen,
} from "../../../../../../../../apis/navigate.service";
import { useTranslation } from "react-i18next";
import { LoaderBasic } from "../../../../../../../../components/ui/Loader";

export default function KitchensManagementPage() {
  const router = useRouter();
  const { t } = useTranslation();

  const shop = useSelector(
    (state: RootState) => state.shop.currentShop
  ) as Shop;
  const { data: kitchens = [], isLoading: kitchenLoading } =
    useGetKitchensQuery({ shopId: shop.id });

  if (kitchenLoading) {
    return <LoaderBasic />;
  }

  return (
    <>
      <AppBar
        title={t("kitchen")}
        goBack={() => goToShopSetting({ router, shopId: shop.id })}
      />

      <Surface
        style={{
          flex: 1,
          padding: 16,
        }}
      >
        <ScrollView>
          {/* List of Kitchen Positions */}
          <List.Section>
            {kitchens.map((kitchen) => {
              return (
                <List.Item
                  key={kitchen.id}
                  title={kitchen.name}
                  left={(props) => <List.Icon {...props} icon="stove" />}
                  onPress={() =>
                    goToUpdateKitchen({
                      router,
                      shopId: shop.id,
                      kitchenId: kitchen.id,
                    })
                  }
                />
              );
            })}
          </List.Section>
        </ScrollView>

        <Button
          mode="contained"
          onPress={() => goToCreateKitchen({ router, shopId: shop.id })}
          style={{ marginTop: 16 }}
        >
          {t("create_kitchen")}
        </Button>
      </Surface>
    </>
  );
}
