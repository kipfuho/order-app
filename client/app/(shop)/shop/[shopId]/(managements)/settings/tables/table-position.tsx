import React from "react";
import { ScrollView } from "react-native";
import { useRouter } from "expo-router";
import { useSelector } from "react-redux";
import { RootState } from "../../../../../../../stores/store";
import { Button, List, useTheme } from "react-native-paper";
import _ from "lodash";
import { Shop } from "../../../../../../../stores/state.interface";
import { AppBar } from "../../../../../../../components/AppBar";
import { SafeAreaView } from "react-native-safe-area-context";
import { useGetTablePositionsQuery } from "../../../../../../../stores/apiSlices/tableApi.slice";
import { LoaderBasic } from "../../../../../../../components/ui/Loader";
import {
  goBackShopSetting,
  goToCreateTablePosition,
  goToUpdateTablePosition,
} from "../../../../../../../apis/navigate.service";

export default function TablePositionsManagementPage() {
  const router = useRouter();
  const theme = useTheme();

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
        title="Table Positions"
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
            {tablePositions.map((item) => (
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
          Create Table Position
        </Button>
      </SafeAreaView>
    </>
  );
}
