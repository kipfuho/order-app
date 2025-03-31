import React from "react";
import { ScrollView } from "react-native";
import { Button, List, Surface, useTheme } from "react-native-paper";
import { Link, useRouter } from "expo-router";
import { AppBar } from "../../components/AppBar";
import { useGetShopsQuery } from "../../stores/apiSlices/shopApi.slice";
import { LoaderBasic } from "../../components/ui/Loader";
import { goBackShopHome } from "../../apis/navigate.service";

export default function ShopsPage() {
  const router = useRouter();
  const theme = useTheme(); // Get theme colors

  const { data: shops = [], isLoading, isError, error } = useGetShopsQuery({});

  if (isLoading) {
    return <LoaderBasic />;
  }

  return (
    <>
      <AppBar title="Shops">
        <Button
          mode="contained-tonal"
          onPress={() => router.replace("/create-shop")}
        >
          Create Shop
        </Button>
      </AppBar>
      <Surface style={{ flex: 1, padding: 16 }}>
        <ScrollView>
          {/* List of Table Positions */}
          <List.Section>
            {shops.map((item) => (
              <List.Item
                key={item.id}
                title={item.name}
                style={{
                  backgroundColor: theme.colors.backdrop,
                  borderRadius: 8,
                  marginBottom: 8,
                }}
                left={(props) => <List.Icon {...props} icon="store" />}
                onPress={() => goBackShopHome({ router, shopId: item.id })}
              />
            ))}
          </List.Section>
        </ScrollView>
      </Surface>
    </>
  );
}
