import React, { useState } from "react";
import { ScrollView, View } from "react-native";
import { useRouter } from "expo-router";
import { useSelector } from "react-redux";
import { RootState } from "../../../../../../../stores/store";
import {
  ActivityIndicator,
  Button,
  Menu,
  Surface,
  Text,
  TextInput,
} from "react-native-paper";
import { Shop } from "../../../../../../../stores/state.interface";
import { AppBar } from "../../../../../../../components/AppBar";
import Toast from "react-native-toast-message";
import {
  useCreateTableMutation,
  useGetTablePositionsQuery,
} from "../../../../../../../stores/apiSlices/tableApi.slice";
import { LoaderBasic } from "../../../../../../../components/ui/Loader";
import { goToTableList } from "../../../../../../../apis/navigate.service";
import { useTranslation } from "react-i18next";
import _ from "lodash";

export default function CreateTablePage() {
  const router = useRouter();
  const { t } = useTranslation();

  const shop = useSelector(
    (state: RootState) => state.shop.currentShop
  ) as Shop;
  const { data: tablePositions = [], isLoading: tablePositionLoading } =
    useGetTablePositionsQuery(shop.id);
  const [createTable, { isLoading: createTableLoading }] =
    useCreateTableMutation();

  const [name, setName] = useState("table");
  const [tablePosition, setTablePosition] = useState(tablePositions[0]);
  const [menuVisible, setMenuVisible] = useState(false);

  const openMenu = () => setMenuVisible(true);
  const closeMenu = () => setMenuVisible(false);

  const handleCreateTable = async () => {
    if (!name.trim() || !tablePosition) {
      Toast.show({
        type: "error",
        text1: t("create_failed"),
        text2: `${t("required")} ${_.join(
          [t("table_name"), t("table_position")],
          ","
        )}`,
      });
      return;
    }

    try {
      await createTable({ shopId: shop.id, name, tablePosition }).unwrap();
      goToTableList({ router, shopId: shop.id });
    } catch (err) {
      Toast.show({
        type: "error",
        text1: t("create_failed"),
        text2: t("error_any"),
      });
      console.error(err);
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
        <Surface
          style={{
            flex: 1,
            padding: 16,
            boxShadow: "none",
          }}
        >
          <ScrollView>
            {/* Table Name Input */}
            <TextInput
              label={t("table_name")}
              mode="outlined"
              value={name}
              onChangeText={setName}
              style={{ marginBottom: 20 }}
            />

            {/* Table Position Dropdown Label */}
            <Text variant="bodyLarge" style={{ marginBottom: 5 }}>
              {t("table_position")}
            </Text>
            {/* Table Position Dropdown */}
            <Menu
              visible={menuVisible}
              onDismiss={closeMenu}
              anchor={
                <Button
                  mode="outlined"
                  onPress={openMenu}
                  style={{ marginBottom: 20 }}
                >
                  {tablePosition?.name || "Select Table Position"}
                </Button>
              }
            >
              {tablePositions.map((position) => (
                <Menu.Item
                  key={position.id}
                  onPress={() => {
                    setTablePosition(position);
                    closeMenu();
                  }}
                  title={position.name}
                />
              ))}
            </Menu>
          </ScrollView>
        </Surface>

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
