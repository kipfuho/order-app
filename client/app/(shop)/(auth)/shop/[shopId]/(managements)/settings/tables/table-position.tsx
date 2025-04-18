import React from "react";
import { ScrollView } from "react-native";
import { useRouter } from "expo-router";
import { useSelector } from "react-redux";
import { RootState } from "../../../../../../../../stores/store";
import { Button, List, Surface, useTheme } from "react-native-paper";
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

export default function TablePositionsManagementPage() {
  const router = useRouter();
  const theme = useTheme();
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
          padding: 16,
        }}
      >
        <ScrollView>
          {/* List of Table Positions */}
          <List.Section>
            {tablePositions.map((item) => (
              <List.Item
                title={item.name}
                titleStyle={{ color: theme.colors.onSecondaryContainer }}
                style={{
                  backgroundColor: theme.colors.secondaryContainer,
                  borderRadius: 8,
                  marginBottom: 8,
                }}
                left={(props) => <List.Icon {...props} icon="table" />}
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
        </ScrollView>

        {/* Create Table Position Button */}
        <Button
          mode="contained"
          onPress={() => goToCreateTablePosition({ router, shopId: shop.id })}
          style={{ marginTop: 20 }}
        >
          {t("table_position")}
        </Button>
      </Surface>
    </>
  );
}
