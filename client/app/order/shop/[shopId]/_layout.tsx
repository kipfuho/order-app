import { Stack, useLocalSearchParams } from "expo-router";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Surface, Text, useTheme } from "react-native-paper";
import { styles } from "../../../_layout";
import {
  AppSyncChannelType,
  connectAppSyncForShopForCustomer,
} from "../../../../apis/aws.service";
import { useGetShopQuery } from "../../../../stores/apiSlices/shopApi.slice";
import { RootState } from "../../../../stores/store";
import { LoaderBasic } from "../../../../components/ui/Loader";
import { useTranslation } from "react-i18next";
import { updateShop } from "../../../../stores/customerSlice";
import { closeAppSyncChannel } from "../../../../stores/awsSlice";

export default function AppLayout() {
  const { shopId } = useLocalSearchParams() as { shopId: string };
  const dispatch = useDispatch();
  const theme = useTheme();
  const { t } = useTranslation();

  const {
    data: shop,
    isLoading,
    isFetching,
  } = useGetShopQuery({ shopId, isCustomerApp: true });
  const currentShop = useSelector((state: RootState) => state.customer.shop);

  useEffect(() => {
    if (!shop) return;

    dispatch(updateShop(shop));
    connectAppSyncForShopForCustomer({ shopId: shop.id });

    return () => {
      dispatch(closeAppSyncChannel({ type: AppSyncChannelType.CUSTOMER }));
    };
  }, [shopId, isFetching]);

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
          {t("shop_not_found")}
        </Text>
      </Surface>
    );
  }

  if (!currentShop) {
    return <LoaderBasic />;
  }

  return <Stack screenOptions={{ headerShown: false }} />;
}
