import React from "react";
import { ScrollView } from "react-native";
import { useRouter } from "expo-router";
import { useSelector } from "react-redux";
import { RootState } from "../../../../../../../stores/store";
import { ActivityIndicator, Button, useTheme, List } from "react-native-paper";
import _ from "lodash";
import { Shop } from "../../../../../../../stores/state.interface";
import { AppBar } from "../../../../../../../components/AppBar";
import { SafeAreaView } from "react-native-safe-area-context";
import { useGetTablesQuery } from "../../../../../../../stores/apiSlices/tableApi.slice";
import {
  goBackShopSetting,
  goToCreateTable,
  goToUpdateTable,
} from "../../../../../../../apis/navigate.service";

export default function TablesManagementPage() {
  const router = useRouter();
  const theme = useTheme();

  const shop = useSelector(
    (state: RootState) => state.shop.currentShop
  ) as Shop;
  const { data: tables = [], isLoading: tableLoading } = useGetTablesQuery(
    shop.id
  );

  if (tableLoading) {
    return <ActivityIndicator size="large" style={{ marginTop: 20 }} />;
  }

  return (
    <>
      <AppBar
        title="Tables"
        goBack={() => goBackShopSetting({ router, shopId: shop.id })}
      />

      <SafeAreaView
        style={{
          flex: 1,
          padding: 16,
          backgroundColor: theme.colors.background,
        }}
      >
        <ScrollView>
          {/* List of Table Positions */}
          <List.Section>
            {tables.map((item) => (
              <List.Item
                title={item.name}
                titleStyle={{ color: theme.colors.onSurface }}
                style={{
                  backgroundColor: theme.colors.surface,
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
          Create Table
        </Button>
      </SafeAreaView>
    </>
  );
}
