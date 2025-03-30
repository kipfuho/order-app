import { Link, Stack, useLocalSearchParams } from "expo-router";
import { useCallback, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Button, Surface, Text, useTheme } from "react-native-paper";
import {
  getDishCategoriesRequest,
  getDishesRequest,
  getDishTypesRequest,
} from "../../../../apis/dish.api.service";
import { styles } from "../../../_layout";
import {
  getTablePositionsRequest,
  getTablesRequest,
} from "../../../../apis/api.service";
import { connectAppSyncForShop } from "../../../../apis/aws.service";
import { useGetShopsQuery } from "../../../../stores/apiSlices/shopApi.slice";
import _ from "lodash";
import { updateCurrentShop } from "../../../../stores/shop.slice";
import { RootState } from "../../../../stores/store";
import { LoaderBasic } from "../../../../components/ui/Loader";

export default function AppLayout() {
  const { shopId } = useLocalSearchParams() as { shopId: string };
  const { data: shops, isLoading } = useGetShopsQuery({});
  const shop = _.find(shops, (s) => s.id.toString() === shopId);
  const currentShop = useSelector((state: RootState) => state.shop2.shop);

  const dispatch = useDispatch();
  const theme = useTheme();

  const handleShopChange = useCallback(async () => {
    if (!shop) return;

    try {
      dispatch(updateCurrentShop(shop));
      await Promise.all([
        getTablesRequest({ shopId: shop.id }),
        getTablePositionsRequest({ shopId: shop.id }),
        getDishesRequest({ shopId: shop.id }),
        getDishCategoriesRequest({ shopId: shop.id }),
        getDishTypesRequest({ shopId: shop.id }),
        connectAppSyncForShop({ shopId: shop.id }),
      ]);
    } catch (error) {
      console.error("Error fetching shop data:", error);
    }
  }, [shop]);

  useEffect(() => {
    handleShopChange();
  }, [handleShopChange]);

  if (isLoading) {
    return <LoaderBasic />;
  }

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

  if (!currentShop) {
    return <LoaderBasic />;
  }

  return <Stack screenOptions={{ headerShown: false }} />;
}
