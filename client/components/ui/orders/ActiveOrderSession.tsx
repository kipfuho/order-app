import { Button, Divider, Surface } from "react-native-paper";
import { OrderSession } from "../../../stores/state.interface";
import { View } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { updateCurrentOrderSession } from "../../../stores/shop.slice";
import { useRouter } from "expo-router";
import { goToOrderSessionPayment } from "../../../apis/navigate.service";
import { RootState } from "../../../stores/store";
import { useTranslation } from "react-i18next";
import OrderCustomerInfo from "./OrderCutomerInfo";

export function ActiveOrderSession({
  activeOrderSession,
  handleAddProduct,
}: {
  activeOrderSession: OrderSession;
  handleAddProduct: () => void;
}) {
  const dispatch = useDispatch();
  const router = useRouter();
  const { t } = useTranslation();

  const { currentShop, currentTable } = useSelector(
    (state: RootState) => state.shop
  );

  const onPaymentClick = () => {
    dispatch(updateCurrentOrderSession(activeOrderSession));
    goToOrderSessionPayment({
      router,
      orderSessionId: activeOrderSession.id,
      shopId: currentShop!.id,
      tableId: currentTable!.id,
    });
  };

  const onAddProductClick = () => {
    dispatch(updateCurrentOrderSession(activeOrderSession));
    handleAddProduct();
  };

  return (
    <Surface mode="flat" style={{ gap: 8 }}>
      <OrderCustomerInfo orderSession={activeOrderSession}>
        <View style={{ flexDirection: "row", gap: 8, marginTop: 10 }}>
          <Button mode="contained" style={{ flex: 1 }} onPress={onPaymentClick}>
            {t("payment")}
          </Button>
          <Button
            mode="contained-tonal"
            style={{ flex: 1 }}
            onPress={onAddProductClick}
          >
            {t("add_product")}
          </Button>
        </View>
      </OrderCustomerInfo>
      <Divider />
    </Surface>
  );
}
