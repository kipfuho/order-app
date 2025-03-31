import React, { useState } from "react";
import { ScrollView } from "react-native";
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
import { createTableRequest } from "../../../../../../../apis/table.api.service";
import { useGetTablePositionsQuery } from "../../../../../../../stores/apiSlices/tableApi.slice";
import { LoaderBasic } from "../../../../../../../components/ui/Loader";
import { goToTableList } from "../../../../../../../apis/navigate.service";

export default function CreateTablePage() {
  const router = useRouter();

  const shop = useSelector(
    (state: RootState) => state.shop.currentShop
  ) as Shop;
  const { data: tablePositions = [], isLoading: tablePositionLoading } =
    useGetTablePositionsQuery(shop.id);

  const [loading, setLoading] = useState(false);
  const [name, setName] = useState("table");
  const [tablePosition, setTablePosition] = useState(tablePositions[0]);
  const [menuVisible, setMenuVisible] = useState(false);

  const openMenu = () => setMenuVisible(true);
  const closeMenu = () => setMenuVisible(false);

  const handleCreateTable = async () => {
    if (!name.trim() || !tablePosition) {
      Toast.show({
        type: "error",
        text1: "Create Failed",
        text2: "Please enter a name and select a table position",
      });
      return;
    }

    try {
      setLoading(true);
      await createTableRequest({ shopId: shop.id, name, tablePosition });
      goToTableList({ router, shopId: shop.id });
    } catch (err) {
      Toast.show({
        type: "error",
        text1: "Create Failed",
        text2: "Failed to create table. Please try again.",
      });
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (tablePositionLoading) {
    return <LoaderBasic />;
  }

  return (
    <>
      <AppBar
        title="Create Table"
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
          }}
        >
          <ScrollView>
            {/* Table Name Input */}
            <TextInput
              label="Table Name"
              mode="outlined"
              placeholder="Enter table name"
              value={name}
              onChangeText={setName}
              style={{ marginBottom: 20 }}
            />

            {/* Table Position Dropdown Label */}
            <Text variant="bodyLarge" style={{ marginBottom: 5 }}>
              Select Table Position
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
        {loading ? (
          <ActivityIndicator size="large" />
        ) : (
          <Button
            mode="contained"
            onPress={handleCreateTable}
            style={{ marginBottom: 10, alignSelf: "center", width: 200 }}
          >
            Create Table
          </Button>
        )}
      </Surface>
    </>
  );
}
