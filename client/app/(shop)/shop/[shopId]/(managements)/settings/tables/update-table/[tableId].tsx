import React, { useEffect, useState } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import _ from "lodash";
import Toast from "react-native-toast-message";
import {
  ActivityIndicator,
  Button,
  Surface,
  Text,
  TextInput,
} from "react-native-paper";
import { useSelector } from "react-redux";
import { RootState } from "../../../../../../../../stores/store";
import {
  Shop,
  TablePosition,
} from "../../../../../../../../stores/state.interface";
import { AppBar } from "../../../../../../../../components/AppBar";
import { DropdownMenu } from "../../../../../../../../components/DropdownMenu";
import {
  useGetTablePositionsQuery,
  useGetTablesQuery,
  useUpdateTableMutation,
} from "../../../../../../../../stores/apiSlices/tableApi.slice";
import { goToTableList } from "../../../../../../../../apis/navigate.service";
import { LoaderBasic } from "../../../../../../../../components/ui/Loader";
import { View } from "react-native";
import { useTranslation } from "react-i18next";

export default function UpdateTablePage() {
  const { tableId } = useLocalSearchParams();
  const router = useRouter();
  const { t } = useTranslation();

  const shop = useSelector(
    (state: RootState) => state.shop.currentShop
  ) as Shop;
  const {
    data: tables = [],
    isLoading: tableLoading,
    isFetching: tableFetching,
  } = useGetTablesQuery(shop.id);
  const { data: tablePositions = [], isLoading: tablePositionLoading } =
    useGetTablePositionsQuery(shop.id);
  const table = _.find(tables, (t) => t.id === tableId);
  const [updateTable, { isLoading: updateTableLoading }] =
    useUpdateTableMutation();

  const [name, setName] = useState("");
  const [tablePosition, setTablePosition] = useState<TablePosition>();

  useEffect(() => {
    if (!table) return;

    setName(table.name);
    setTablePosition(table.position);
  }, [tableId, tableFetching]);

  const handleUpdateTable = async () => {
    if (!table) {
      return;
    }

    if (!name.trim() || !tablePosition) {
      Toast.show({
        type: "error",
        text1: t("update_failed"),
        text2: `${t("required")} ${_.join(
          _.compact([
            !name.trim() && t("table_name"),
            !tablePosition && t("table_position"),
          ]),
          ","
        )}`,
      });
      return;
    }

    try {
      await updateTable({
        tableId: table.id,
        shopId: shop.id,
        name,
        tablePosition,
      }).unwrap();

      // Navigate back to table position list
      goToTableList({ router, shopId: shop.id });

      // Clear input fields
      setName("");
      setTablePosition(undefined);
    } catch (error: any) {
      Toast.show({
        type: "error",
        text1: t("update_failed"),
        text2: error.data?.message,
      });
    }
  };

  if (tableLoading || tablePositionLoading) {
    return <LoaderBasic />;
  }

  if (!table) {
    return (
      <Surface style={{ flex: 1 }}>
        <Text>{t("table_not_found")}</Text>
        <Button
          mode="contained"
          onPress={() => goToTableList({ router, shopId: shop.id })}
        >
          {t("go_back")}
        </Button>
      </Surface>
    );
  }

  return (
    <>
      <AppBar
        title="Update Table"
        goBack={() => goToTableList({ router, shopId: shop.id })}
      />
      <Surface style={{ flex: 1 }}>
        <Surface style={{ flex: 1, padding: 16, boxShadow: "none" }}>
          <TextInput
            label={t("table_name")}
            mode="outlined"
            value={name}
            onChangeText={setName}
            style={{ marginBottom: 20 }}
          />
          <DropdownMenu
            label={t("table_position")}
            item={tablePosition}
            setItem={setTablePosition}
            items={tablePositions}
            getItemValue={(tp: TablePosition) => tp?.name}
          />
        </Surface>

        <View style={{ marginVertical: 20 }}>
          {updateTableLoading ? (
            <ActivityIndicator size={40} />
          ) : (
            <>
              <Button
                mode="contained-tonal"
                style={{ alignSelf: "center", width: 200 }}
                onPress={handleUpdateTable}
              >
                {t("update_table")}
              </Button>
            </>
          )}
        </View>
      </Surface>
    </>
  );
}
