import React from "react";
import { ScrollView } from "react-native";
import { useRouter } from "expo-router";
import { useSelector } from "react-redux";
import { RootState } from "../../../../../../../stores/store";
import { Button, useTheme, List, Surface } from "react-native-paper";
import _ from "lodash";
import { Shop } from "../../../../../../../stores/state.interface";
import { AppBar } from "../../../../../../../components/AppBar";
import { useGetTablesQuery } from "../../../../../../../stores/apiSlices/tableApi.slice";
import {
  goBackShopSetting,
  goToCreateTable,
  goToUpdateTable,
} from "../../../../../../../apis/navigate.service";
import { useTranslation } from "react-i18next";
import { LoaderBasic } from "../../../../../../../components/ui/Loader";

export default function TablesManagementPage() {
  const router = useRouter();
  const theme = useTheme();
  const { t } = useTranslation();

  const shop = useSelector(
    (state: RootState) => state.shop.currentShop
  ) as Shop;
  const { data: tables = [], isLoading: tableLoading } = useGetTablesQuery(
    shop.id
  );

  if (tableLoading) {
    return <LoaderBasic />;
  }

  return (
    <>
      <AppBar
        title={t("table")}
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
            {tables.map((item) => (
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
                  goToUpdateTable({ router, shopId: shop.id, tableId: item.id })
                }
              />
            ))}
          </List.Section>
        </ScrollView>

        <Button
          mode="contained"
          onPress={() => goToCreateTable({ router, shopId: shop.id })}
          style={{ marginTop: 16 }}
        >
          {t("create_table")}
        </Button>
      </Surface>
    </>
  );
}
