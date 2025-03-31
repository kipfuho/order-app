import { Link, Stack, useLocalSearchParams } from "expo-router";
import { useCallback, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Button, Surface, Text, useTheme } from "react-native-paper";
import { styles } from "../../../_layout";
import { connectAppSyncForShop } from "../../../../apis/aws.service";
import { useGetShopsQuery } from "../../../../stores/apiSlices/shopApi.slice";
import _ from "lodash";
import { updateCurrentShop } from "../../../../stores/shop.slice";
import { RootState } from "../../../../stores/store";
import { LoaderBasic } from "../../../../components/ui/Loader";

export default function AppLayout() {
  const { shopId } = useLocalSearchParams() as { shopId: string };
  const { data: shops = [], isLoading } = useGetShopsQuery({});
  const shop = shops.find((s) => s.id.toString() === shopId);
  const currentShop = useSelector((state: RootState) => state.shop.currentShop);

  const dispatch = useDispatch();
  const theme = useTheme();

  const handleShopChange = useCallback(async () => {
    if (!shop) return;

    try {
      dispatch(updateCurrentShop(shop));
      connectAppSyncForShop({ shopId: shop.id });
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
