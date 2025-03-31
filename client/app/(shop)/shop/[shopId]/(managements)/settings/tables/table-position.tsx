import React from "react";
import { ScrollView } from "react-native";
import { Link, useRouter } from "expo-router";
import { useSelector } from "react-redux";
import { RootState } from "../../../../../../../stores/store";
import { Button, List, useTheme } from "react-native-paper";
import _ from "lodash";
import { Shop } from "../../../../../../../stores/state.interface";
import { AppBar } from "../../../../../../../components/AppBar";
import { SafeAreaView } from "react-native-safe-area-context";
import { useGetTablePositionsQuery } from "../../../../../../../stores/apiSlices/tableApi.slice";
import { LoaderBasic } from "../../../../../../../components/ui/Loader";

export default function TablePositionsManagementPage() {
  const shop = useSelector(
    (state: RootState) => state.shop.currentShop
  ) as Shop;
  const router = useRouter();
  const theme = useTheme();

  const goBack = () =>
    router.replace({
      pathname: "/shop/[shopId]/settings",
      params: { shopId: shop.id },
    });

  const { data: tablePositions = [], isLoading: tablePositionLoading } =
    useGetTablePositionsQuery(shop.id);

  if (tablePositionLoading) {
    return <LoaderBasic />;
  }

  return (
    <>
      <AppBar title="Table Positions" goBack={goBack} />
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
              <Link
                key={item.id}
                href={{
                  pathname:
                    "/shop/[shopId]/settings/tables/update-table-position/[tablePositionId]",
                  params: { shopId: shop.id, tablePositionId: item.id },
                }}
                replace
              >
                <List.Item
                  title={item.name}
                  titleStyle={{ color: theme.colors.onSurface }}
                  style={{
                    backgroundColor: theme.colors.surface,
                    borderRadius: 8,
                    marginBottom: 8,
                  }}
                  left={(props) => <List.Icon {...props} icon="table" />}
                />
              </Link>
            ))}
          </List.Section>
        </ScrollView>

        {/* Create Table Position Button */}
        <Button
          mode="contained"
          onPress={() =>
            router.replace({
              pathname: "/shop/[shopId]/settings/tables/create-table-position",
              params: { shopId: shop.id },
            })
          }
          style={{ marginTop: 20 }}
        >
          Create Table Position
        </Button>
      </SafeAreaView>
    </>
  );
}
