import React, { useState } from "react";
import { ScrollView, View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useSelector } from "react-redux";
import { RootState } from "../../../../../../../stores/store";
import { createTableRequest } from "../../../../../../../api/api.service";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  ActivityIndicator,
  Button,
  Menu,
  Text,
  TextInput,
  useTheme,
} from "react-native-paper";
import { Shop } from "../../../../../../../stores/state.interface";
import { AppBar } from "../../../../../../../components/AppBar";
import Toast from "react-native-toast-message";

export default function CreateTablePage() {
  const { shopId } = useLocalSearchParams();
  const theme = useTheme();
  const router = useRouter();

  const shop = useSelector((state: RootState) =>
    state.shop.shops.find((s) => s.id.toString() === shopId)
  ) as Shop;

  const tablePositions = useSelector(
    (state: RootState) => state.shop.tablePositions
  );

  const [loading, setLoading] = useState(false);
  const [name, setName] = useState("table");
  const [tablePosition, setTablePosition] = useState(tablePositions[0]);

  // Menu state for dropdown
  const [menuVisible, setMenuVisible] = useState(false);

  const openMenu = () => setMenuVisible(true);
  const closeMenu = () => setMenuVisible(false);

  const goBack = () =>
    router.navigate({
      pathname: "/shop/[shopId]/settings/tables",
      params: { shopId: shop.id },
    });

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
      goBack();
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

  return (
    <>
      <AppBar title="Create Table" goBack={goBack} />
      <SafeAreaView
        style={{
          flex: 1,
          backgroundColor: theme.colors.background,
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

        {/* Loading or Action Buttons */}
        {loading ? (
          <ActivityIndicator size="large" />
        ) : (
          <>
            <Button
              mode="contained"
              onPress={handleCreateTable}
              style={{ marginBottom: 10 }}
            >
              Create Table
            </Button>
            <Button mode="outlined" onPress={goBack}>
              Cancel
            </Button>
          </>
        )}
      </SafeAreaView>
    </>
  );
}
