import {
  Button,
  Dialog,
  Modal,
  Portal,
  Surface,
  Text,
  TextInput,
} from "react-native-paper";
import { useCallback, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../../../../../stores/store";
import _, { debounce } from "lodash";
import { ScrollView, View } from "react-native";
import { TableForOrderCard } from "../../../../../../components/ui/menus/TableForOrderCard";
import { AppBar } from "../../../../../../components/AppBar";
import {
  Shop,
  Table,
  TableForOrder,
} from "../../../../../../stores/state.interface";
import {
  useGetTablePositionsQuery,
  useGetTablesQuery,
} from "../../../../../../stores/apiSlices/tableApi.slice";
import { useGetTablesForOrderQuery } from "../../../../../../stores/apiSlices/orderApi.slice";
import { LoaderBasic } from "../../../../../../components/ui/Loader";
import CreateOrder from "../../../../../../components/ui/CreateOrderView";
import {
  updateCurrentCustomerInfo,
  updateCurrentTable,
} from "../../../../../../stores/shop.slice";
import Toast from "react-native-toast-message";

export default function OrderManagementOrderPage() {
  const dispatch = useDispatch();
  const { currentShop } = useSelector((state: RootState) => state.shop);
  const shop = currentShop as Shop;

  const { data: tablesForOrder = [], isLoading: tableForOrderLoading } =
    useGetTablesForOrderQuery(shop.id);
  const { data: tablePositions = [], isLoading: tablePositionLoading } =
    useGetTablePositionsQuery(shop.id);
  const { data: tables = [], isLoading: tableLoading } = useGetTablesQuery(
    shop.id
  );

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
  const [numberOfCustomer, setNumberOfCustomer] = useState("1");

  const debouncedUpdateCustomerInfo = useCallback(
    debounce(
      ({
        customerName,
        customerPhone,
        numberOfCustomer,
      }: {
        customerName: string;
        customerPhone: string;
        numberOfCustomer: string;
      }) => {
        dispatch(
          updateCurrentCustomerInfo({
            customerName,
            customerPhone,
            numberOfCustomer: _.toNumber(numberOfCustomer),
          })
        );
      },
      300
    ), // 300ms delay
    [dispatch]
  );

  const setDefaultModalInfo = () => {
    setCustomerName("");
    setCustomerPhone("");
    setNumberOfCustomer("1");
    dispatch(
      updateCurrentCustomerInfo({
        customerName: "",
        customerPhone: "",
        numberOfCustomer: 1,
      })
    );
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
    const table = _.find(tables, (t) => t.id === tableId) as Table;
    dispatch(updateCurrentTable(table));
    setDefaultModalInfo();
    setCustomerDialogVisible(true);
  };

  const onCustomerInfoConfirmClick = () => {
    setCustomerDialogVisible(false);
    setCreateOrderVisible(true);
  };

  useEffect(() => {
    setFilteredTables(tablesGroupByPosition);
  }, [tableForOrderLoading]);

  if (tableForOrderLoading || tablePositionLoading || tableLoading) {
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
              onChangeText={(text) => {
                setCustomerName(text);
                debouncedUpdateCustomerInfo({
                  customerName: text,
                  customerPhone,
                  numberOfCustomer,
                });
              }}
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
                onChangeText={(text) => {
                  const enteredCustomerPhone = text.replace(/[^0-9.]/g, "");
                  setCustomerPhone(enteredCustomerPhone);
                  debouncedUpdateCustomerInfo({
                    customerName,
                    customerPhone: enteredCustomerPhone,
                    numberOfCustomer,
                  });
                }}
                style={{ flex: 1, minWidth: 150 }} // Ensures proper width
              />
              <Text>Số người</Text>
              <TextInput
                label="P"
                mode="outlined"
                keyboardType="numeric"
                value={numberOfCustomer}
                onChangeText={(text) => {
                  const enteredNumberOfCustomer = text.replace(/[^0-9.]/g, "");
                  setNumberOfCustomer(enteredNumberOfCustomer);
                  debouncedUpdateCustomerInfo({
                    customerName,
                    customerPhone,
                    numberOfCustomer: enteredNumberOfCustomer,
                  });
                }} // Restrict input to numbers & decimal
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
        <Toast />
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
                <Surface key={positionId} style={{ boxShadow: "none" }}>
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
                        onClick={() => onTableClick(table.id)}
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
