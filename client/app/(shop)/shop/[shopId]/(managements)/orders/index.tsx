import { Button, Modal, Portal, Surface, Text } from "react-native-paper";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../../../../../stores/store";
import _ from "lodash";
import { ScrollView } from "react-native";
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
import { updateCurrentTable } from "../../../../../../stores/shop.slice";
import Toast from "react-native-toast-message";
import {
  goBackShopHome,
  goToTableCurrentOrderSessions,
} from "../../../../../../apis/navigate.service";
import { useRouter } from "expo-router";
import { CustomerInfoDialog } from "../../../../../../components/ui/orders/CustomerInfoDialog";

export default function OrderManagementOrderPage() {
  const router = useRouter();
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

  const tablesGroupByPosition = _.groupBy(tablesForOrder, "position");
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

  const onTableClick = (tableForOrder: TableForOrder) => {
    if (tableForOrder.numberOfOrderSession) {
      goToTableCurrentOrderSessions({
        router,
        shopId: shop.id,
        tableId: tableForOrder.id,
      });
    } else {
      const table = _.find(tables, (t) => t.id === tableForOrder.id) as Table;
      dispatch(updateCurrentTable(table));
      setCustomerDialogVisible(true);
    }
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
      <AppBar
        title="Order Management"
        goBack={() => {
          goBackShopHome({ router, shopId: shop.id });
        }}
      />
      {/* Update & Delete Modal */}
      <Portal>
        <CustomerInfoDialog
          customerDialogVisible={customerDialogVisible}
          onCustomerInfoConfirmClick={onCustomerInfoConfirmClick}
          setCustomerDialogVisible={setCustomerDialogVisible}
        />
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
                        onClick={() => onTableClick(table)}
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
