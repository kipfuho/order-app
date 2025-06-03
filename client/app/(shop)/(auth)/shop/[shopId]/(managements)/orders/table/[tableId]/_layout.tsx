import { Stack, useGlobalSearchParams, useRouter } from "expo-router";
import { useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Button, Surface, Text, useTheme } from "react-native-paper";
import { useGetTablesQuery } from "@stores/apiSlices/tableApi.slice";
import { RootState } from "@stores/store";
import { LoaderBasic } from "@components/ui/Loader";
import { updateCurrentTable } from "@stores/shop.slice";
import { goToTablesForOrderList } from "@apis/navigate.service";
import { useTranslation } from "react-i18next";
import { Shop } from "@stores/state.interface";
import { styles } from "@/constants/styles";

export default function TableCurrentOrderLayout() {
  const { tableId } = useGlobalSearchParams() as {
    tableId: string;
  };
  const router = useRouter();
  const dispatch = useDispatch();
  const theme = useTheme();
  const { t } = useTranslation();

  const { currentTable, currentShop } = useSelector(
    (state: RootState) => state.shop,
  );
  const shop = currentShop as Shop;
  const { data: tables = [], isLoading } = useGetTablesQuery(shop.id);
  const table = useMemo(
    () => tables.find((t) => t.id.toString() === tableId),
    [tables, tableId],
  );

  useEffect(() => {
    if (!table) return;

    dispatch(updateCurrentTable(table));
  }, [dispatch, tableId, table, isLoading]);

  if (isLoading) {
    return <LoaderBasic />;
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
        <Button
          mode="contained"
          style={styles.baseButton}
          onPress={() => goToTablesForOrderList({ router, shopId: shop.id })}
        >
          {t("go_back")}
        </Button>
      </Surface>
    );
  }

  if (!currentTable) {
    return <LoaderBasic />;
  }

  return <Stack screenOptions={{ headerShown: false }} />;
}
