import React, { useEffect, useState } from "react";
import { ScrollView } from "react-native";
import { Link, useLocalSearchParams, useRouter } from "expo-router";
import { useSelector } from "react-redux";
import { RootState } from "../../../../../../../stores/store";
import { ActivityIndicator, Button, useTheme, List } from "react-native-paper";
import { getTables } from "../../../../../../../api/api.service";
import _ from "lodash";
import { Shop } from "../../../../../../../stores/state.interface";
import { AppBar } from "../../../../../../../components/AppBar";
import { SafeAreaView } from "react-native-safe-area-context";

export default function TablesManagementPage() {
  const { shopId } = useLocalSearchParams();
  const theme = useTheme();
  const shop = useSelector((state: RootState) =>
    state.shop.shops.find((s) => s.id.toString() === shopId)
  ) as Shop;
  const tables = useSelector((state: RootState) => state.shop.tables);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const goBack = () =>
    router.navigate({
      pathname: "/shop/[shopId]/settings",
      params: { shopId: shop.id },
    });

  useEffect(() => {
    const fetchTables = async () => {
      try {
        setLoading(true);
        await getTables({ shopId: shop.id });
      } catch (error) {
        console.error("Error fetching tables:", error);
      } finally {
        setLoading(false);
      }
    };

    if (_.isEmpty(tables)) {
      fetchTables();
    }
  }, []);

  if (loading) {
    return <ActivityIndicator size="large" style={{ marginTop: 20 }} />;
  }

  return (
    <>
      <AppBar title="Tables" goBack={goBack} />

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
              <Link
                key={item.id}
                href={{
                  pathname:
                    "/shop/[shopId]/settings/tables/update-table/[tableId]",
                  params: { shopId: shop.id, tableId: item.id },
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

        <Button
          mode="contained"
          onPress={() =>
            router.push({
              pathname: "/shop/[shopId]/settings/tables/create-table",
              params: { shopId: shop.id },
            })
          }
          style={{ marginTop: 16 }}
        >
          Create Table
        </Button>
      </SafeAreaView>
    </>
  );
}
