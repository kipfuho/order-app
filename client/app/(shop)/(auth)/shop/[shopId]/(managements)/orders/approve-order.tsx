import { useRouter } from "expo-router";
import { goBackShopHome } from "../../../../../../../apis/navigate.service";
import { AppBar } from "../../../../../../../components/AppBar";
import { Button, Modal, Portal, Surface, Text } from "react-native-paper";
import { useSelector } from "react-redux";
import { RootState } from "../../../../../../../stores/store";
import { Shop, Table } from "../../../../../../../stores/state.interface";
import { useTranslation } from "react-i18next";
import { useGetUnconfirmedOrderQuery } from "../../../../../../../stores/apiSlices/orderApi.slice";
import { LoaderBasic } from "../../../../../../../components/ui/Loader";
import {
  useGetTablePositionsQuery,
  useGetTablesQuery,
} from "../../../../../../../stores/apiSlices/tableApi.slice";
import { ScrollView } from "react-native";
import { useEffect, useState } from "react";
import _ from "lodash";
import { TableForApproveCard } from "../../../../../../../components/ui/orders/TableForApproveCard";
import { UnconfirmedOrderCard } from "../../../../../../../components/ui/orders/UnconfirmedOrderCard";
import Toast from "react-native-toast-message";
import { LegendList } from "@legendapp/list";

export default function OrderManagementApprovePage() {
  const router = useRouter();
  const { t } = useTranslation();
  const { currentShop } = useSelector((state: RootState) => state.shop);
  const shop = currentShop as Shop;

  const {
    data: unconfirmedOrders = [],
    isLoading: unconfirmedOrderLoading,
    isFetching: unconfirmedOrderFetching,
  } = useGetUnconfirmedOrderQuery({ shopId: shop.id });
  const { data: tablePositions = [], isLoading: tablePositionLoading } =
    useGetTablePositionsQuery(shop.id);
  const {
    data: tables = [],
    isLoading: tableLoading,
    isFetching: tableFetching,
  } = useGetTablesQuery(shop.id);

  const unconfirmedOrderByTable = _.groupBy(unconfirmedOrders, "table");
  const availableTables = _.filter(
    tables,
    (t) => !_.isEmpty(unconfirmedOrderByTable[t.id])
  );
  const tablesGroupByPosition = _.groupBy(availableTables, "position.id");
  const tablePositionById = _.keyBy(tablePositions, "id");
  tablePositionById["ALL"] = {
    id: "ALL",
    name: t("all"),
    shop: "",
    dishCategoryIds: [],
  };

  const [filteredTables, setFilteredTables] = useState<Record<string, Table[]>>(
    {}
  );
  const [selectedPositionId, setSelectedPositionId] = useState("ALL");
  const [selectedTable, setSelectedTable] = useState<Table>();
  const [modalVisible, setModalVisible] = useState(false);

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
    const _table = _.find(tables, (t) => t.id === tableId);
    if (!_table) {
      return;
    }
    setSelectedTable(_table);
    setModalVisible(true);
  };

  useEffect(() => {
    if (_.isEmpty(tables)) return;

    setFilteredTables(tablesGroupByPosition);
  }, [tableFetching, unconfirmedOrderFetching]);

  if (unconfirmedOrderLoading || tablePositionLoading || tableLoading) {
    return <LoaderBasic />;
  }

  return (
    <>
      <Portal>
        <Modal
          visible={modalVisible}
          onDismiss={() => setModalVisible(false)}
          contentContainerStyle={{ flex: 1 }}
        >
          <>
            <AppBar
              title={selectedTable?.name || ""}
              goBack={() => setModalVisible(false)}
            />
            <Surface mode="flat" style={{ flex: 1 }}>
              <ScrollView>
                <LegendList
                  data={unconfirmedOrderByTable[selectedTable?.id || ""] || []}
                  keyExtractor={(item) => item.id}
                  renderItem={({ item }) => (
                    <UnconfirmedOrderCard unconfirmedOrder={item} />
                  )}
                  contentContainerStyle={{ gap: 12, padding: 16 }}
                  showsVerticalScrollIndicator={false}
                />
              </ScrollView>
            </Surface>
          </>
        </Modal>
        <Toast />
      </Portal>
      <AppBar
        title={t("shop_approve_order")}
        goBack={() => {
          goBackShopHome({ router, shopId: shop.id });
        }}
      />
      <Surface style={{ flex: 1, padding: 16 }}>
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
            {tablePositions.map((position) => {
              if (_.isEmpty(filteredTables[position.id])) {
                return;
              }

              return (
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
              );
            })}
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
                      <TableForApproveCard
                        key={table.id}
                        table={table}
                        unconfirmedOrderCount={_.size(
                          unconfirmedOrderByTable[table.id]
                        )}
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
