import React, { useEffect, useState } from "react";
import { useGlobalSearchParams, useRouter } from "expo-router";
import _ from "lodash";
import Toast from "react-native-toast-message";
import {
  ActivityIndicator,
  Button,
  Checkbox,
  Surface,
  Text,
  TextInput,
} from "react-native-paper";
import { useSelector } from "react-redux";
import { RootState } from "@stores/store";
import { Shop, TablePosition } from "@stores/state.interface";
import { AppBar } from "@components/AppBar";
import { DropdownMenu } from "@components/DropdownMenu";
import {
  useGetTablePositionsQuery,
  useGetTablesQuery,
  useUpdateTableMutation,
} from "@stores/apiSlices/tableApi.slice";
import { goToTableList } from "@apis/navigate.service";
import { LoaderBasic } from "@components/ui/Loader";
import { ScrollView, View } from "react-native";
import { useTranslation } from "react-i18next";
import { Collapsible } from "@components/Collapsible";

export default function UpdateTablePage() {
  const { tableId } = useGlobalSearchParams();
  const router = useRouter();
  const { t } = useTranslation();

  const shop = useSelector(
    (state: RootState) => state.shop.currentShop,
  ) as Shop;
  const {
    data: tables = [],
    isLoading: tableLoading,
    isFetching: tableFetching,
  } = useGetTablesQuery(shop.id);
  const { data: tablePositions = [], isLoading: tablePositionLoading } =
    useGetTablePositionsQuery(shop.id);
  const [updateTable, { isLoading: updateTableLoading }] =
    useUpdateTableMutation();
  const table = _.find(tables, (t) => t.id === tableId);

  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [tablePosition, setTablePosition] = useState<TablePosition>();
  const [allowMultipleOrderSession, setAllowMultipleOrderSession] =
    useState(false);
  const [needApprovalWhenCustomerOrder, setNeedApprovalWhenCustomerOrder] =
    useState(false);

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
          ",",
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
        allowMultipleOrderSession,
        needApprovalWhenCustomerOrder,
      }).unwrap();

      // Navigate back to table position list
      goToTableList({ router, shopId: shop.id });
    } catch (error: any) {
      Toast.show({
        type: "error",
        text1: t("update_failed"),
        text2: error.data?.message,
      });
    }
  };

  useEffect(() => {
    if (!table) return;

    setName(table.name);
    setCode(table.code);
    setTablePosition(table.position);
    setAllowMultipleOrderSession(table.allowMultipleOrderSession);
    setNeedApprovalWhenCustomerOrder(table.needApprovalWhenCustomerOrder);
  }, [tableId, tableFetching, table]);

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
        title={t("update_table")}
        goBack={() => goToTableList({ router, shopId: shop.id })}
      />
      <Surface style={{ flex: 1 }}>
        <View
          style={{
            flex: 1,
          }}
        >
          <ScrollView>
            <Collapsible title={t("general_information")}>
              {/* Table Name Input */}
              <TextInput
                label={t("table_name")}
                mode="outlined"
                value={name}
                onChangeText={setName}
                style={{ marginBottom: 20 }}
              />
              <TextInput
                label={t("table_code")}
                mode="outlined"
                value={code}
                onChangeText={setCode}
                style={{ marginBottom: 20 }}
              />

              {/* Table Position Dropdown */}
              <DropdownMenu
                label={t("table_position")}
                item={tablePosition}
                setItem={setTablePosition}
                items={tablePositions}
                getItemValue={(tp: TablePosition) => tp?.name}
              />
            </Collapsible>
            <Collapsible title={t("additional_settings")}>
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <Text>{t("allow_multiple_order_session")}</Text>
                <Checkbox
                  status={allowMultipleOrderSession ? "checked" : "unchecked"}
                  onPress={() => {
                    setAllowMultipleOrderSession((prev) => !prev);
                  }}
                />
              </View>
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <Text>{t("need_approval_when_customer_order")}</Text>
                <Checkbox
                  status={
                    needApprovalWhenCustomerOrder ? "checked" : "unchecked"
                  }
                  onPress={() => {
                    setNeedApprovalWhenCustomerOrder((prev) => !prev);
                  }}
                />
              </View>
            </Collapsible>
          </ScrollView>
        </View>

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
