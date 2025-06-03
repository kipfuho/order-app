import { Stack, useLocalSearchParams } from "expo-router";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Surface, Text, useTheme } from "react-native-paper";
import { useTranslation } from "react-i18next";
import { useGetTableQuery } from "@stores/apiSlices/tableApi.slice";
import { RootState } from "@stores/store";
import { LoaderBasic } from "@components/ui/Loader";
import { updateTable } from "@stores/customerSlice";
import { styles } from "@/constants/styles";

export default function TableCurrentOrderLayout() {
  const { shopId, tableId } = useLocalSearchParams() as {
    shopId: string;
    tableId: string;
  };
  const dispatch = useDispatch();
  const theme = useTheme();
  const { t } = useTranslation();

  const currentTable = useSelector((state: RootState) => state.customer.table);
  const {
    data: table,
    isLoading,
    isFetching,
  } = useGetTableQuery({
    shopId,
    tableId,
    isCustomerApp: true,
  });

  useEffect(() => {
    if (!table) return;

    dispatch(updateTable(table));
  }, [isFetching, table, dispatch]);

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
      </Surface>
    );
  }

  if (!currentTable) {
    return <LoaderBasic />;
  }

  return <Stack key={tableId} screenOptions={{ headerShown: false }} />;
}
