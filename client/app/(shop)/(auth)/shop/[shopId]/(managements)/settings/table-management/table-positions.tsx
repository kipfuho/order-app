import React from "react";
import { ScrollView } from "react-native";
import { useRouter } from "expo-router";
import { useSelector } from "react-redux";
import { RootState } from "../../../../../../../../stores/store";
import { FAB, List, Surface } from "react-native-paper";
import _ from "lodash";
import { Shop } from "../../../../../../../../stores/state.interface";
import { AppBar } from "../../../../../../../../components/AppBar";
import { useGetTablePositionsQuery } from "../../../../../../../../stores/apiSlices/tableApi.slice";
import { LoaderBasic } from "../../../../../../../../components/ui/Loader";
import {
  goBackShopSetting,
  goToCreateTablePosition,
  goToUpdateTablePosition,
} from "../../../../../../../../apis/navigate.service";
import { useTranslation } from "react-i18next";
import { View } from "react-native";

export default function TablePositionsManagementPage() {
  const router = useRouter();
  const { t } = useTranslation();

  const shop = useSelector(
    (state: RootState) => state.shop.currentShop
  ) as Shop;

  const { data: tablePositions = [], isLoading: tablePositionLoading } =
    useGetTablePositionsQuery(shop.id);

  if (tablePositionLoading) {
    return <LoaderBasic />;
  }

  return (
    <>
      <AppBar
        title={t("table_position")}
        goBack={() => goBackShopSetting({ router, shopId: shop.id })}
      />
      <Surface
        style={{
          flex: 1,
          paddingHorizontal: 16,
        }}
      >
        <ScrollView>
          {/* List of Table Positions */}
          <List.Section>
            {tablePositions.map((item) => (
              <List.Item
                key={item.id}
                title={item.name}
                style={{
                  borderRadius: 8,
                  marginBottom: 8,
                }}
                left={(props) => <List.Icon {...props} icon="layers" />}
                onPress={() =>
                  goToUpdateTablePosition({
                    router,
                    shopId: shop.id,
                    tablePositionId: item.id,
                  })
                }
              />
            ))}
          </List.Section>
          <View style={{ height: 60 }} />
        </ScrollView>

        <FAB
          icon="plus"
          label={t("create_table_position")}
          style={{
            position: "absolute",
            right: 16,
            bottom: 16,
          }}
          onPress={() => goToCreateTablePosition({ router, shopId: shop.id })}
        />
      </Surface>
    </>
  );
}
