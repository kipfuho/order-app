import { useSelector } from "react-redux";
import { RootState } from "@stores/store";
import { Surface, Text, useTheme } from "react-native-paper";
import { useTranslation } from "react-i18next";
import { Stack } from "expo-router";
import { CustomerAppBar } from "@components/ui/customer/CustomerAppBar";
import { styles } from "@/constants/styles";

export default function CustomerHomeLayout() {
  const { t } = useTranslation();
  const theme = useTheme();

  const { shop, table } = useSelector((state: RootState) => state.customer);

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
