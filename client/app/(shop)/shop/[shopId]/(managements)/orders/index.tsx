import {
  Button,
  Dialog,
  Modal,
  Portal,
  Surface,
  Text,
  TextInput,
} from "react-native-paper";
import { useEffect, useState } from "react";
import { getTablesForOrderRequest } from "../../../../../../apis/order.api.service";
import { useSelector } from "react-redux";
import { RootState } from "../../../../../../stores/store";
import _ from "lodash";
import { ScrollView, View } from "react-native";
import { TableForOrderCard } from "../../../../../../components/ui/menus/TableForOrderCard";
import { AppBar } from "../../../../../../components/AppBar";
import { styles } from "../../../../../_layout";
import { Shop, TableForOrder } from "../../../../../../stores/state.interface";
import { useGetTablePositionsQuery } from "../../../../../../stores/apiSlices/tableApi.slice";
import { useGetTablesForOrderQuery } from "../../../../../../stores/apiSlices/orderApi.slice";
import { LoaderBasic } from "../../../../../../components/ui/Loader";
import CreateOrder from "../../../../../../components/ui/CreateOrderView";

export default function OrderManagementOrderPage() {
  const shop = useSelector(
    (state: RootState) => state.shop.currentShop
  ) as Shop;
  const { data: tablesForOrder = [], isLoading: tableForOrderLoading } =
    useGetTablesForOrderQuery(shop.id);
  const { data: tablePositions = [], isLoading: tablePositionLoading } =
    useGetTablePositionsQuery(shop.id);

  const tablesGroupByPosition = _.groupBy(tablesForOrder, "position.id");
  const tablePositionById = _.keyBy(tablePositions, "id");
  tablePositionById["ALL"] = {
    id: "ALL",
    name: "Tất cả",
    shop: "",
    dishCategories: [],
  };

  const [filteredTables, setFilteredTables] = useState<
    Record<string, TableForOrder[]>
  >({});
  const [selectedPositionId, setSelectedPositionId] = useState("ALL");
  const [customerDialogVisible, setCustomerDialogVisible] = useState(false);
  const [createOrderVisible, setCreateOrderVisible] = useState(false);
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [numberOfCustomer, setNumberOfCustomer] = useState("");
  const [selectedTableId, setTableId] = useState("");

  const setDefaultModalInfo = () => {
    setCustomerName("");
    setCustomerPhone("");
    setNumberOfCustomer("1");
  };

  const setSelectedPosition = (positionId: string) => {
    if (positionId === "ALL") {
      setFilteredTables(tablesGroupByPosition);
    } else {
      setFilteredTables({
        [positionId]: tablesGroupByPosition[positionId] || [],
      });
    }
    setSelectedPositionId(positionId);
  };

  const onTableClick = (tableId: string) => {
    setDefaultModalInfo();
    setCustomerDialogVisible(true);
    setTableId(tableId);
  };

  const onCustomerInfoConfirmClick = () => {
    setCustomerDialogVisible(false);
    setCreateOrderVisible(true);
  };

  useEffect(() => {
    setFilteredTables(tablesGroupByPosition);
  }, [tablesForOrder]);

  if (tableForOrderLoading || tablePositionLoading) {
    return <LoaderBasic />;
  }

  return (
    <>
      {/* Update & Delete Modal */}
      <Portal>
        <Dialog
          visible={customerDialogVisible}
          onDismiss={() => setCustomerDialogVisible(false)}
        >
          <Dialog.Title>Nhập thông tin</Dialog.Title>
          <Dialog.Content>
            <TextInput
              label="Customer Name"
              mode="outlined"
              value={customerName}
              onChangeText={setCustomerName}
            />

            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 10, // Adds spacing between elements (Alternative: use marginRight)
              }}
            >
              <TextInput
                label="Customer Phone"
                mode="outlined"
                value={customerPhone}
                onChangeText={setCustomerPhone}
                style={{ flex: 1, minWidth: 150 }} // Ensures proper width
              />
              <Text>Số người</Text>
              <TextInput
                label="P"
                mode="outlined"
                value={numberOfCustomer}
                onChangeText={(text) =>
                  setNumberOfCustomer(text.replace(/[^0-9.]/g, ""))
                } // Restrict input to numbers & decimal
                style={{ flex: 1, minWidth: 40 }} // Prevents shrinking
              />
            </View>
          </Dialog.Content>
          <Dialog.Actions style={{ justifyContent: "center" }}>
            <Button
              mode="contained"
              onPress={onCustomerInfoConfirmClick}
              style={{ width: 150 }}
            >
              Confirm
            </Button>
          </Dialog.Actions>
        </Dialog>

        <Modal
          visible={createOrderVisible}
          onDismiss={() => setCreateOrderVisible(false)}
          contentContainerStyle={{
            flex: 1,
          }}
        >
          <AppBar
            title="Create order"
            goBack={() => setCreateOrderVisible(false)}
          />
          <CreateOrder setCreateOrderVisible={setCreateOrderVisible} />
        </Modal>
      </Portal>

      <Surface style={{ flex: 1, padding: 16 }}>
        <Surface style={{ height: 50, marginBottom: 10, boxShadow: "none" }}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{
              paddingLeft: 5,
            }}
          >
            <Button
              key="ALL"
              mode={
                selectedPositionId === "ALL" ? "contained" : "contained-tonal"
              }
              onPress={() => setSelectedPosition("ALL")}
              style={{
                width: "auto",
                borderRadius: 10,
                marginRight: 5,
                alignSelf: "center",
              }}
            >
              ALL
            </Button>
            {tablePositions.map((position) => (
              <Button
                key={position.id}
                mode={
                  selectedPositionId === position.id
                    ? "contained"
                    : "contained-tonal"
                }
                onPress={() => setSelectedPosition(position.id)}
                style={{
                  width: "auto",
                  borderRadius: 10,
                  marginRight: 5,
                  alignSelf: "center",
                }}
              >
                {position.name}
              </Button>
            ))}
          </ScrollView>
        </Surface>

        {/* Tables list */}
        <Surface style={{ flex: 1, boxShadow: "none" }}>
          <ScrollView>
            {_.map(filteredTables, (tables, positionId) => {
              return (
                <Surface key={positionId}>
                  <Text variant="titleLarge">
                    {tablePositionById[positionId].name}
                  </Text>
                  <Surface
                    style={{
                      flexDirection: "row",
                      flexWrap: "wrap",
                      boxShadow: "none",
                    }}
                  >
                    {tables.map((table) => (
                      <TableForOrderCard
                        key={table.id}
                        table={table}
                        onClick={onTableClick}
                      />
                    ))}
                  </Surface>
                </Surface>
              );
            })}
          </ScrollView>
        </Surface>
      </Surface>
    </>
  );
}
