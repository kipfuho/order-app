import { Link, Stack, useLocalSearchParams } from "expo-router";
import { useCallback, useEffect } from "react";
import { RootState } from "../../../../stores/store";
import { useSelector } from "react-redux";
import { Button, Surface, Text, useTheme } from "react-native-paper";
import {
  getDishCategoriesRequest,
  getDishesRequest,
  getDishTypesRequest,
} from "../../../../apis/dish.api.service";
import { getTablePositions, getTables } from "../../../../apis/api.service";
import { styles } from "../../../_layout";

export default function AppLayout() {
  const { shopId } = useLocalSearchParams() as { shopId: string };
  const shop = useSelector((state: RootState) =>
    state.shop.shops.find((s) => s.id.toString() === shopId)
  );

  const theme = useTheme();

  const fetchShopData = useCallback(async () => {
    if (!shop) return;

    try {
      await Promise.all([
        getTables({ shopId: shop.id }),
        getTablePositions({ shopId: shop.id }),
        getDishesRequest({ shopId: shop.id }),
        getDishCategoriesRequest({ shopId: shop.id }),
        getDishTypesRequest({ shopId: shop.id }),
      ]);
    } catch (error) {
      console.error("Error fetching shop data:", error);
    }
  }, [shop]);

  useEffect(() => {
    fetchShopData();
  }, [fetchShopData]);

  if (!shop) {
    return (
      <Surface style={styles.baseContainer}>
        <Text
          variant="displayMedium"
          style={{ color: theme.colors.error, alignSelf: "center" }}
        >
          Shop not found
        </Text>
        <Link href="/" asChild>
          <Button mode="contained" style={styles.baseButton}>
            Go Back
          </Button>
        </Link>
      </Surface>
    );
  }

  return <Stack screenOptions={{ headerShown: false }} />;
}
