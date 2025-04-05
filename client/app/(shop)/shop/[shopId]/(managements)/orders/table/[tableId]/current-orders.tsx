import { Button, Divider, List, Surface, Text } from "react-native-paper";
import { useSelector } from "react-redux";
import { RootState } from "../../../../../../../../stores/store";
import { useGetActiveOrderSessionsQuery } from "../../../../../../../../stores/apiSlices/orderApi.slice";
import { Shop, Table } from "../../../../../../../../stores/state.interface";
import { LoaderBasic } from "../../../../../../../../components/ui/Loader";
import { ScrollView } from "react-native";
import { ActiveOrderSession } from "../../../../../../../../components/ui/orders/ActiveOrderSession";
import { AppBar } from "../../../../../../../../components/AppBar";
import { goToTablesForOrderList } from "../../../../../../../../apis/navigate.service";
import { useRouter } from "expo-router";
import { styles } from "../../../../../../../_layout";

export default function OrderTableCurrentOrderSessionsPage() {
  const router = useRouter();
  const { currentShop, currentTable } = useSelector(
    (state: RootState) => state.shop
  );
  const shop = currentShop as Shop;
  const table = currentTable as Table;

  const {
    data: activeOrderSessions = [],
    isLoading: activeOrderSessionLoading,
  } = useGetActiveOrderSessionsQuery({
    shopId: shop.id,
    tableId: table.id,
  });

  if (activeOrderSessionLoading) {
    return <LoaderBasic />;
  }

  return (
    <>
      <AppBar
        title={table.name}
        goBack={() => {
          goToTablesForOrderList({ router, shopId: shop.id });
        }}
      />
      <Surface style={{ flex: 1, padding: 16 }}>
        <ScrollView>
          {/* List of Table Positions */}
          <List.Section style={{ gap: 40 }}>
            {activeOrderSessions.map((item) => (
              <ActiveOrderSession key={item.id} activeOrderSession={item} />
            ))}
          </List.Section>
        </ScrollView>
        <Divider />
        <Button mode="contained" style={[styles.baseButton, { marginTop: 20 }]}>
          Thêm lượt khách
        </Button>
      </Surface>
    </>
  );
}
