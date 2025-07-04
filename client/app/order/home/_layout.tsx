import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@stores/store";
import { Surface, Text, useTheme } from "react-native-paper";
import { useTranslation } from "react-i18next";
import { Stack } from "expo-router";
import { CustomerAppBar } from "@components/ui/customer/CustomerAppBar";
import { styles } from "@/constants/styles";
import { useEffect } from "react";
import {
  AppSyncChannelType,
  connectAppSyncForShopForCustomer,
  connectAppSyncForSingleCustomer,
} from "@/apis/aws.service";
import { closeAppSyncChannel } from "@/stores/awsSlice";
import { useCustomerSession } from "@/hooks/useCustomerSession";

export default function CustomerHomeLayout() {
  const { t } = useTranslation();
  const theme = useTheme();
  const dispatch = useDispatch();
  const { session } = useCustomerSession();
  const { shop, table } = useSelector((state: RootState) => state.customer);

  useEffect(() => {
    if (!shop) {
      return;
    }

    connectAppSyncForShopForCustomer({ shopId: shop.id });
    connectAppSyncForSingleCustomer({ customerId: session?.id as string });

    return () => {
      dispatch(closeAppSyncChannel({ type: AppSyncChannelType.CUSTOMER }));
      dispatch(
        closeAppSyncChannel({ type: AppSyncChannelType.SINGLE_CUSTOMER }),
      );
    };
  }, [dispatch, shop, session]);

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

  if (!table) {
    return (
      <Surface style={styles.baseContainer}>
        <Text
          variant="displayMedium"
          style={{ color: theme.colors.error, alignSelf: "center" }}
        >
          {t("table_not_found")}
        </Text>
      </Surface>
    );
  }

  return (
    <>
      <CustomerAppBar />
      <Stack screenOptions={{ headerShown: false }} />
    </>
  );
}
