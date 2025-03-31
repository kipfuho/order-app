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
import { updateTableRequest } from "../../../../../../../../apis/table.api.service";
import {
  useGetTablePositionsQuery,
  useGetTablesQuery,
  useUpdateTableMutation,
} from "../../../../../../../../stores/apiSlices/tableApi.slice";
import { goToTableList } from "../../../../../../../../apis/navigate.service";
import { LoaderBasic } from "../../../../../../../../components/ui/Loader";

export default function UpdateTablePage() {
  const { tableId } = useLocalSearchParams();
  const router = useRouter();

  const shop = useSelector(
    (state: RootState) => state.shop.currentShop
  ) as Shop;
  const { data: tables = [], isLoading: tableLoading } = useGetTablesQuery(
    shop.id
  );
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
  }, [table]);

  const handleUpdateTable = async () => {
    if (!table) {
      return;
    }

    if (!name.trim() || !tablePosition) {
      Toast.show({
        type: "error",
        text1: "Create Failed",
        text2: "Please enter name and table position",
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
    } catch (err) {
      console.error(err);
    }
  };

  if (tableLoading || tablePositionLoading) {
    return <LoaderBasic />;
  }

  if (!table) {
    return (
      <Surface style={{ flex: 1 }}>
        <Text>Table not found</Text>
        <Button
          mode="contained"
          onPress={() => goToTableList({ router, shopId: shop.id })}
        >
          Go Back
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
        <Surface style={{ flex: 1, padding: 16 }}>
          <TextInput
            label="Table Name"
            mode="outlined"
            placeholder="Enter table name"
            value={name}
            onChangeText={setName}
            style={{ marginBottom: 20 }}
          />
          <DropdownMenu
            label="Table Position"
            item={tablePosition}
            setItem={setTablePosition}
            items={tablePositions}
            getItemValue={(tp: TablePosition) => tp?.name}
          />
        </Surface>

        {updateTableLoading ? (
          <ActivityIndicator animating={true} size="large" />
        ) : (
          <>
            <Button
              mode="contained-tonal"
              style={{ alignSelf: "center", marginBottom: 20, width: 200 }}
              onPress={handleUpdateTable}
            >
              Update Table
            </Button>
          </>
        )}
      </Surface>
    </>
  );
}
