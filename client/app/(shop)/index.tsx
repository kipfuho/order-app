import React from "react";
import { ScrollView } from "react-native";
import { Button, List, Surface, useTheme } from "react-native-paper";
import { useRouter } from "expo-router";
import { AppBar } from "../../components/AppBar";
import { useGetShopsQuery } from "../../stores/apiSlices/shopApi.slice";
import { LoaderBasic } from "../../components/ui/Loader";
import { goBackShopHome } from "../../apis/navigate.service";
import { useTranslation } from "react-i18next";

export default function ShopsPage() {
  const router = useRouter();
  const theme = useTheme(); // Get theme colors
  const { t } = useTranslation();

  const { data: shops = [], isLoading, isError, error } = useGetShopsQuery({});

  if (isLoading) {
    return <LoaderBasic />;
  }

  return (
    <>
      <AppBar title={t("shop")}>
        <Button
          mode="contained-tonal"
          onPress={() => router.replace("/create-shop")}
        >
          {t("create_shop")}
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
                  backgroundColor: theme.colors.secondaryContainer,
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
