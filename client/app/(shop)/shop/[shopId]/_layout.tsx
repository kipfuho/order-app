import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Button, Surface, Text, useTheme } from "react-native-paper";
import { styles } from "../../../_layout";
import { connectAppSyncForShop } from "../../../../apis/aws.service";
import { useGetShopsQuery } from "../../../../stores/apiSlices/shopApi.slice";
import { updateCurrentShop } from "../../../../stores/shop.slice";
import { RootState } from "../../../../stores/store";
import { LoaderBasic } from "../../../../components/ui/Loader";
import { goBackShopList } from "../../../../apis/navigate.service";

export default function AppLayout() {
  const { shopId } = useLocalSearchParams() as { shopId: string };
  const router = useRouter();
  const dispatch = useDispatch();
  const theme = useTheme();

  const { data: shops = [], isLoading } = useGetShopsQuery({});
  const shop = shops.find((s) => s.id.toString() === shopId);
  const currentShop = useSelector((state: RootState) => state.shop.currentShop);

  useEffect(() => {
    if (!shop) return;

    dispatch(updateCurrentShop(shop));
    connectAppSyncForShop({ shopId: shop.id });
  }, [shopId, shop]);

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
        <Button
          mode="contained"
          style={styles.baseButton}
          onPress={() => goBackShopList({ router })}
        >
          Go Back
        </Button>
      </Surface>
    );
  }

  if (!currentShop) {
    return <LoaderBasic />;
  }

  return <Stack key={shopId} screenOptions={{ headerShown: false }} />;
}
