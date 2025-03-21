import React, { useEffect, useState } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import _ from "lodash";
import Toast from "react-native-toast-message";
import {
  ActivityIndicator,
  Button,
  Divider,
  Menu,
  Surface,
  Text,
  TextInput,
} from "react-native-paper";
import { useSelector } from "react-redux";
import { RootState } from "../../../../../../../../stores/store";
import { updateTableRequest } from "../../../../../../../../api/api.service";
import {
  Shop,
  TablePosition,
} from "../../../../../../../../stores/state.interface";
import { AppBar } from "../../../../../../../../components/AppBar";
import { DropdownMenu } from "../../../../../../../../components/DropdownMenu";

export default function UpdateTablePage() {
  const { shopId } = useLocalSearchParams();
  const shop = useSelector((state: RootState) =>
    state.shop.shops.find((s) => s.id.toString() === shopId)
  ) as Shop;
  const { tableId } = useLocalSearchParams();
  const table = useSelector((state: RootState) =>
    state.shop.tables.find((t) => t.id === tableId)
  );

  const router = useRouter();

  const goBack = () =>
    router.navigate({
      pathname: "/shop/[shopId]/settings/tables",
      params: {
        shopId: shop.id,
      },
    });

  if (!table) {
    return (
      <Surface style={{ flex: 1 }}>
        <Text>Table not found</Text>
        <Button mode="contained" onPress={goBack}>
          Go Back
        </Button>
      </Surface>
    );
  }

  const tablePositions = useSelector(
    (state: RootState) => state.shop.tablePositions
  );
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState("");
  const [tablePosition, setTablePosition] = useState<TablePosition>();

  useEffect(() => {
    setName(table.name);
    setTablePosition(table.position);
  }, [table]);

  const handleUpdateTable = async () => {
    if (!name.trim() || !tablePosition) {
      Toast.show({
        type: "error",
        text1: "Create Failed",
        text2: "Please enter name and table position",
      });
      return;
    }

    try {
      setLoading(true);
      await updateTableRequest({
        tableId: table.id,
        shopId: shop.id,
        name,
        tablePosition,
      });

      // Navigate back to table position list
      goBack();

      // Clear input fields
      setName("");
      setTablePosition(undefined);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <AppBar title="Update Table" goBack={goBack} />
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

        {loading ? (
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
