import _ from "lodash";
import { useEffect, useMemo, useState } from "react";
import { ScrollView } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { Button, Modal, Portal, Surface, Text } from "react-native-paper";
import { useTranslation } from "react-i18next";
import { useRouter } from "expo-router";
import Toast from "react-native-toast-message";
import { RootState } from "@stores/store";
import { AppBar } from "@components/AppBar";
import { Shop, Table, TableForOrder } from "@stores/state.interface";
import {
  useGetTablePositionsQuery,
  useGetTablesQuery,
} from "@stores/apiSlices/tableApi.slice";
import { useGetTablesForOrderQuery } from "@stores/apiSlices/orderApi.slice";
import { LoaderBasic } from "@components/ui/Loader";
import CreateOrder from "@components/ui/CreateOrderView";
import { updateCurrentTable } from "@stores/shop.slice";
import {
  goToShopHome,
  goToTableCurrentOrderSessions,
} from "@apis/navigate.service";
import { CustomerInfoDialog } from "@components/ui/orders/CustomerInfoDialog";
import TableForOrderCard from "@/components/ui/orders/TableForOrderCard";
import { styles } from "@/constants/styles";

export default function OrderManagementOrderPage() {
  const router = useRouter();
  const dispatch = useDispatch();
  const { t } = useTranslation();

  const { currentShop } = useSelector((state: RootState) => state.shop);
  const shop = currentShop as Shop;

  const { data: tablesForOrder = [], isLoading: tableForOrderLoading } =
    useGetTablesForOrderQuery(shop.id);
  const { data: tablePositions = [], isLoading: tablePositionLoading } =
    useGetTablePositionsQuery(shop.id);
  const { data: tables = [], isLoading: tableLoading } = useGetTablesQuery(
    shop.id,
  );

  const { tablesGroupByPosition, tablePositionById } = useMemo(() => {
    const tablesGroupByPosition = _.groupBy(tablesForOrder, "position");
    const tablePositionById = _.keyBy(tablePositions, "id");
    tablePositionById["ALL"] = {
      id: "ALL",
      name: t("all"),
      code: "all",
      shopId: "",
      dishCategoryIds: [],
    };
    return { tablesGroupByPosition, tablePositionById };
  }, [t, tablePositions, tablesForOrder]);

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
    const table = _.find(tables, (t) => t.id === tableForOrder.id) as Table;
    dispatch(updateCurrentTable(table));
    if (tableForOrder.numberOfOrderSession) {
      goToTableCurrentOrderSessions({
        router,
        shopId: shop.id,
        tableId: tableForOrder.id,
      });
    } else {
      setCustomerDialogVisible(true);
    }
  };

  const onCustomerInfoConfirmClick = () => {
    setCustomerDialogVisible(false);
    setCreateOrderVisible(true);
  };

  useEffect(() => {
    if (_.isEmpty(tablesForOrder)) return;

    setFilteredTables(tablesGroupByPosition);
  }, [tablesForOrder, tablesGroupByPosition]);

  if (tableForOrderLoading || tablePositionLoading || tableLoading) {
    return <LoaderBasic />;
  }

  return (
    <>
      <AppBar
        title={t("order_management")}
        goBack={() => {
          goToShopHome({ router, shopId: shop.id });
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
          <CreateOrder
            setCreateOrderVisible={setCreateOrderVisible}
            goBack={() => setCreateOrderVisible(false)}
            isNewOrder={true}
          />
        </Modal>
        <Toast />
      </Portal>

      <Surface style={styles.baseContainer}>
        <Surface mode="flat" style={{ height: 50, marginBottom: 10 }}>
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
              {t("all")}
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
        <Surface mode="flat" style={{ flex: 1 }}>
          <ScrollView>
            {_.map(filteredTables, (tables, positionId) => {
              return (
                <Surface mode="flat" key={positionId}>
                  <Text variant="titleLarge">
                    {tablePositionById[positionId]?.name}
                  </Text>
                  <Surface
                    mode="flat"
                    style={{
                      flexDirection: "row",
                      flexWrap: "wrap",
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
