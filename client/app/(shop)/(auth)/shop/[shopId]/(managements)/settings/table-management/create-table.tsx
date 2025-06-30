import React, { useState } from "react";
import { ScrollView, View } from "react-native";
import { useRouter } from "expo-router";
import { useSelector } from "react-redux";
import { RootState } from "@stores/store";
import {
  ActivityIndicator,
  Button,
  Checkbox,
  Surface,
  Text,
  TextInput,
} from "react-native-paper";
import { Shop, TablePosition } from "@stores/state.interface";
import { AppBar } from "@components/AppBar";
import Toast from "react-native-toast-message";
import {
  useCreateTableMutation,
  useGetTablePositionsQuery,
} from "@stores/apiSlices/tableApi.slice";
import { LoaderBasic } from "@components/ui/Loader";
import { goToTableList } from "@apis/navigate.service";
import { useTranslation } from "react-i18next";
import _ from "lodash";
import { Collapsible } from "@components/Collapsible";
import { DropdownMenu } from "@components/DropdownMenu";

export default function CreateTablePage() {
  const router = useRouter();
  const { t } = useTranslation();

  const shop = useSelector(
    (state: RootState) => state.shop.currentShop,
  ) as Shop;
  const { data: tablePositions = [], isLoading: tablePositionLoading } =
    useGetTablePositionsQuery(shop.id);
  const [createTable, { isLoading: createTableLoading }] =
    useCreateTableMutation();

  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [tablePosition, setTablePosition] = useState(tablePositions[0]);
  const [allowMultipleOrderSession, setAllowMultipleOrderSession] =
    useState(false);
  const [needApprovalWhenCustomerOrder, setNeedApprovalWhenCustomerOrder] =
    useState(false);

  const handleCreateTable = async () => {
    if (!name.trim() || !tablePosition) {
      Toast.show({
        type: "error",
        text1: t("create_failed"),
        text2: `${t("required")} ${_.join(
          _.compact([
            !name.trim() && t("table_name"),
            !code.trim() && t("table_code"),
            !tablePosition && t("table_position"),
          ]),
          ",",
        )}`,
      });
      return;
    }

    try {
      await createTable({
        shopId: shop.id,
        name,
        code,
        tablePosition,
        allowMultipleOrderSession,
        needApprovalWhenCustomerOrder,
      }).unwrap();
      goToTableList({ router, shopId: shop.id });
    } catch {
      Toast.show({
        type: "error",
        text1: t("create_failed"),
        text2: t("error_any"),
      });
    }
  };

  if (tablePositionLoading) {
    return <LoaderBasic />;
  }

  return (
    <>
      <AppBar
        title={t("create_table")}
        goBack={() => goToTableList({ router, shopId: shop.id })}
      />
      <Surface
        style={{
          flex: 1,
        }}
      >
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

        {/* Loading or Action Buttons */}
        <View style={{ marginVertical: 20 }}>
          {createTableLoading ? (
            <ActivityIndicator size={40} />
          ) : (
            <Button
              mode="contained"
              onPress={handleCreateTable}
              style={{ alignSelf: "center", width: 200 }}
            >
              {t("create_table")}
            </Button>
          )}
        </View>
      </Surface>
    </>
  );
}
