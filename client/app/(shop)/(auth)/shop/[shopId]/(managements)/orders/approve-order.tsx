import _ from "lodash";
import { useRouter } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { ScrollView, View } from "react-native";
import { useSelector } from "react-redux";
import { Button, Modal, Portal, Surface, Text } from "react-native-paper";
import { useTranslation } from "react-i18next";
import Toast from "react-native-toast-message";
import { goToShopHome } from "@apis/navigate.service";
import { AppBar } from "@components/AppBar";
import { RootState } from "@stores/store";
import { Shop, Table } from "@stores/state.interface";
import { useGetUnconfirmedOrderQuery } from "@stores/apiSlices/orderApi.slice";
import { LoaderBasic } from "@components/ui/Loader";
import {
  useGetTablePositionsQuery,
  useGetTablesQuery,
} from "@stores/apiSlices/tableApi.slice";
import TableForApproveCard from "@/components/ui/orders/TableForApproveCard";
import UnconfirmedOrderCard from "@/components/ui/orders/UnconfirmedOrderCard";
import { styles } from "@/constants/styles";
import toastConfig from "@/components/CustomToast";
import { FlashList } from "@shopify/flash-list";

export default function OrderManagementApprovePage() {
  const router = useRouter();
  const { t } = useTranslation();
  const { currentShop } = useSelector((state: RootState) => state.shop);
  const shop = currentShop as Shop;

  const { data: unconfirmedOrders = [], isLoading: unconfirmedOrderLoading } =
    useGetUnconfirmedOrderQuery({ shopId: shop.id });
  const { data: tablePositions = [], isLoading: tablePositionLoading } =
    useGetTablePositionsQuery(shop.id);
  const { data: tables = [], isLoading: tableLoading } = useGetTablesQuery(
    shop.id,
  );

  const { unconfirmedOrderByTable, tablesGroupByPosition, tablePositionById } =
    useMemo(() => {
      const unconfirmedOrderByTable = _.groupBy(unconfirmedOrders, "tableId");
      const availableTables = _.filter(
        tables,
        (t) => !_.isEmpty(unconfirmedOrderByTable[t.id]),
      );
      const tablesGroupByPosition = _.groupBy(availableTables, "position.id");

      const tablePositionById = _.keyBy(tablePositions, "id");
      tablePositionById["ALL"] = {
        id: "ALL",
        name: t("all"),
        code: "all",
        shopId: "",
        dishCategoryIds: [],
      };

      return {
        unconfirmedOrderByTable,
        tablesGroupByPosition,
        tablePositionById,
      };
    }, [t, unconfirmedOrders, tables, tablePositions]);

  const [filteredTables, setFilteredTables] = useState<Record<string, Table[]>>(
    {},
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
    if (
      _.isEmpty(tables) ||
      _.isEmpty(unconfirmedOrders) ||
      _.isEmpty(tablePositions)
    )
      return;

    setFilteredTables(tablesGroupByPosition);
  }, [unconfirmedOrders, tables, tablePositions, tablesGroupByPosition]);

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
                <FlashList
                  data={unconfirmedOrderByTable[selectedTable?.id || ""] || []}
                  keyExtractor={(item) => item.id}
                  renderItem={({ item }) => (
                    <View style={{ marginBottom: 12 }}>
                      <UnconfirmedOrderCard unconfirmedOrder={item} />
                    </View>
                  )}
                  contentContainerStyle={{ padding: 16 }}
                  showsVerticalScrollIndicator={false}
                />
              </ScrollView>
            </Surface>
          </>
        </Modal>
        <Toast config={toastConfig} />
      </Portal>
      <AppBar
        title={t("shop_approve_order")}
        goBack={() => {
          goToShopHome({ router, shopId: shop.id });
        }}
      />
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
                          unconfirmedOrderByTable[table.id],
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
