import {
  Portal,
  Surface,
  Text,
  TextInput,
  TouchableRipple,
  useTheme,
} from "react-native-paper";
import { PaymentMethod } from "../../../constants/paymentMethod";
import { ScrollView, View } from "react-native";
import { usePayOrderSessionMutation } from "../../../stores/apiSlices/orderApi.slice";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../../stores/store";
import { OrderSession, Shop } from "../../../stores/state.interface";
import Toast from "react-native-toast-message";
import { ConfirmCancelDialog } from "../CancelDialog";
import { useTranslation } from "react-i18next";
import { useState } from "react";
import { resetCurrentTable } from "../../../stores/shop.slice";
import { goToTablesForOrderList } from "../../../apis/navigate.service";
import { useRouter } from "expo-router";

export default function PaymentMethodPage() {
  const theme = useTheme();
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const router = useRouter();

  const { currentOrderSession, currentShop } = useSelector(
    (state: RootState) => state.shop
  );
  const shop = currentShop as Shop;
  const orderSession = currentOrderSession as OrderSession;
  const paymentMethods = Object.values(PaymentMethod);

  const [payOrderSession, { isLoading: payOrderSessionLoading }] =
    usePayOrderSessionMutation();

  const [paymentDialogVisible, setPaymentDialogVisible] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState("");

  const handlePayOrderSession = async () => {
    try {
      await payOrderSession({
        orderSessionId: orderSession.id,
        paymentDetails: [
          { paymentMethod: selectedPaymentMethod as PaymentMethod },
        ],
        shopId: shop.id,
      }).unwrap();

      setPaymentDialogVisible(false);
      dispatch(resetCurrentTable());
      goToTablesForOrderList({
        router,
        shopId: shop.id,
      });
    } catch (error: any) {
      Toast.show({
        type: "error",
        text1: t("error"),
        text2: error.data?.message,
      });
      return;
    }
  };

  return (
    <>
      <Portal>
        <ConfirmCancelDialog
          title={`${t("confirm")} ${t("payment")} ${selectedPaymentMethod}`}
          isLoading={payOrderSessionLoading}
          dialogVisible={paymentDialogVisible}
          setDialogVisible={setPaymentDialogVisible}
          onCancelClick={() => {
            setPaymentDialogVisible(false);
          }}
          onConfirmClick={handlePayOrderSession}
        />
        <Toast />
      </Portal>
      <Surface style={{ flex: 1, padding: 12, borderRadius: 10 }}>
        <ScrollView style={{ flex: 1 }}>
          <Surface style={{ flex: 1, gap: 12 }}>
            {paymentMethods.map((paymentMethod) => (
              <TouchableRipple
                key={paymentMethod}
                onPress={() => {
                  setSelectedPaymentMethod(paymentMethod);
                  setPaymentDialogVisible(true);
                }}
                style={{
                  flex: 1,
                  borderRadius: 4,
                  backgroundColor: theme.colors.primary,
                  paddingVertical: 12,
                  paddingHorizontal: 8,
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <Text style={{ color: theme.colors.onPrimary }}>
                  {paymentMethod}
                </Text>
              </TouchableRipple>
            ))}
          </Surface>
        </ScrollView>
      </Surface>
    </>
  );
}
