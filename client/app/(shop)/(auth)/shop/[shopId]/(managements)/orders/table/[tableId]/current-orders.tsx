import {
  Button,
  Divider,
  List,
  Modal,
  Portal,
  Surface,
} from "react-native-paper";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../../../../../../../../stores/store";
import { useGetActiveOrderSessionsQuery } from "../../../../../../../../../stores/apiSlices/orderApi.slice";
import { Shop, Table } from "../../../../../../../../../stores/state.interface";
import { LoaderBasic } from "../../../../../../../../../components/ui/Loader";
import { ScrollView } from "react-native";
import { ActiveOrderSession } from "../../../../../../../../../components/ui/orders/ActiveOrderSession";
import { AppBar } from "../../../../../../../../../components/AppBar";
import { goToTablesForOrderList } from "../../../../../../../../../apis/navigate.service";
import { Redirect, useRouter } from "expo-router";
import { styles } from "../../../../../../../../_layout";
import { useTranslation } from "react-i18next";
import CreateOrder from "../../../../../../../../../components/ui/CreateOrderView";
import { useState } from "react";
import Toast from "react-native-toast-message";
import { CustomerInfoDialog } from "../../../../../../../../../components/ui/orders/CustomerInfoDialog";
import { resetCurrentOrder } from "../../../../../../../../../stores/shop.slice";
import _ from "lodash";

export default function OrderTableCurrentOrderSessionsPage() {
  const router = useRouter();
  const dispatch = useDispatch();
  const { t } = useTranslation();

  const { currentShop, currentTable } = useSelector(
    (state: RootState) => state.shop
  );
  const shop = currentShop as Shop;
  const table = currentTable as Table;

  const {
    data: activeOrderSessions = [],
    isFetching: activeOrderSessionFetching,
  } = useGetActiveOrderSessionsQuery({
    shopId: shop.id,
    tableId: table.id,
  });

  const [customerDialogVisible, setCustomerDialogVisible] = useState(false);
  const [createOrderVisible, setCreateOrderVisible] = useState(false);

  const handleAddProduct = () => {
    setCreateOrderVisible(true);
  };

  const handleAddNewCustomer = () => {
    setCustomerDialogVisible(true);
  };

  const onCustomerInfoConfirmClick = () => {
    setCustomerDialogVisible(false);
    setCreateOrderVisible(true);
  };

  if (activeOrderSessionFetching) {
    return <LoaderBasic />;
  }

  if (!table.allowMultipleOrderSession && !_.isEmpty(activeOrderSessions)) {
    return (
      <Redirect
        href={`/(shop)/(auth)/shop/${shop.id}/(managements)/orders/table/${table.id}/payment/${activeOrderSessions[0].id}`}
      />
    );
  }

  return (
    <>
      <Portal>
        <CustomerInfoDialog
          customerDialogVisible={customerDialogVisible}
          setCustomerDialogVisible={setCustomerDialogVisible}
          onCustomerInfoConfirmClick={onCustomerInfoConfirmClick}
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
            goBack={() => {
              setCreateOrderVisible(false);
              dispatch(resetCurrentOrder());
            }}
          />
        </Modal>
        <Toast />
      </Portal>

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
              <ActiveOrderSession
                key={item.id}
                activeOrderSession={item}
                handleAddProduct={handleAddProduct}
              />
            ))}
          </List.Section>
        </ScrollView>
        <Divider />
        <Button
          mode="contained"
          style={[styles.baseButton, { marginTop: 20 }]}
          onPress={handleAddNewCustomer}
        >
          {t("add_new_customer_order")}
        </Button>
      </Surface>
    </>
  );
}
