import React, { useEffect, useState } from "react";
import { ScrollView } from "react-native";
import { Link, useLocalSearchParams, useRouter } from "expo-router";
import { useSelector } from "react-redux";
import { RootState } from "../../../../../../../stores/store";
import { ActivityIndicator, Button, List, useTheme } from "react-native-paper";
import _ from "lodash";
import { Shop } from "../../../../../../../stores/state.interface";
import { AppBar } from "../../../../../../../components/AppBar";
import { SafeAreaView } from "react-native-safe-area-context";
import { getTablePositionsRequest } from "../../../../../../../apis/table.api.service";

export default function TablePositionsManagementPage() {
  const { shopId } = useLocalSearchParams();
  const shop = useSelector((state: RootState) =>
    state.shop.shops.find((s) => s.id.toString() === shopId)
  ) as Shop;
  const router = useRouter();
  const theme = useTheme();

  const goBack = () =>
    router.navigate({
      pathname: "/shop/[shopId]/settings",
      params: { shopId: shop.id },
    });

  const tablePositions = useSelector(
    (state: RootState) => state.shop.tablePositions
  );
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchTablePositions = async () => {
      try {
        setLoading(true);
        await getTablePositionsRequest({ shopId: shop.id });
      } catch (error) {
        console.error("Error fetching table positions:", error);
      } finally {
        setLoading(false);
      }
    };

    if (_.isEmpty(tablePositions)) {
      fetchTablePositions();
    }
  }, []);

  if (loading) {
    return (
      <ActivityIndicator
        size="large"
        style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
      />
    );
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
                asChild
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
            router.push({
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
