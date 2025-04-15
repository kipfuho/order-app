import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Button, Surface, Text, useTheme } from "react-native-paper";
import { useGetTablesQuery } from "../../../../../../../../../stores/apiSlices/tableApi.slice";
import { RootState } from "../../../../../../../../../stores/store";
import { LoaderBasic } from "../../../../../../../../../components/ui/Loader";
import { updateCurrentTable } from "../../../../../../../../../stores/shop.slice";
import { connectAppSyncForTable } from "../../../../../../../../../apis/aws.service";
import { styles } from "../../../../../../../../_layout";
import { goToTablesForOrderList } from "../../../../../../../../../apis/navigate.service";
import { useTranslation } from "react-i18next";

export default function TableCurrentOrderLayout() {
  const { shopId, tableId } = useLocalSearchParams() as {
    shopId: string;
    tableId: string;
  };
  const router = useRouter();
  const dispatch = useDispatch();
  const theme = useTheme();
  const { t } = useTranslation();

  const { currentTable } = useSelector((state: RootState) => state.shop);
  const { data: tables = [], isLoading } = useGetTablesQuery(shopId);
  const table = tables.find((t) => t.id.toString() === tableId);

  useEffect(() => {
    if (!table) return;

    dispatch(updateCurrentTable(table));
    connectAppSyncForTable({ tableId: table.id });
  }, [tableId, isLoading]);

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
          onPress={() => goToTablesForOrderList({ router, shopId })}
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
