import React from "react";
import { ScrollView } from "react-native";
import { useRouter } from "expo-router";
import { useSelector } from "react-redux";
import { RootState } from "@stores/store";
import { FAB, List, Surface } from "react-native-paper";
import { Shop } from "@stores/state.interface";
import { AppBar } from "@components/AppBar";
import { useGetKitchensQuery } from "@stores/apiSlices/kitchenApi.slice";
import {
  goToShopSetting,
  goToCreateKitchen,
  goToUpdateKitchen,
} from "@apis/navigate.service";
import { useTranslation } from "react-i18next";
import { LoaderBasic } from "@components/ui/Loader";
import { styles } from "@/constants/styles";

export default function KitchensManagementPage() {
  const router = useRouter();
  const { t } = useTranslation();

  const shop = useSelector(
    (state: RootState) => state.shop.currentShop,
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

      <Surface style={styles.baseContainer}>
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

        <FAB
          icon="plus"
          label={t("create_kitchen")}
          style={styles.baseFAB}
          onPress={() => goToCreateKitchen({ router, shopId: shop.id })}
        />
      </Surface>
    </>
  );
}
