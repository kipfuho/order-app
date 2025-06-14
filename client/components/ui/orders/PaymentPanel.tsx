import _ from "lodash";
import {
  Modal,
  Portal,
  Surface,
  Text,
  TextInput,
  useTheme,
} from "react-native-paper";
import { ScrollView, View } from "react-native";
import { useState } from "react";
import { useRouter } from "expo-router";
import { useDispatch, useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import QRCode from "react-native-qrcode-svg";
import Toast from "react-native-toast-message";
import { usePayOrderSessionMutation } from "@stores/apiSlices/orderApi.slice";
import { RootState } from "@stores/store";
import { OrderSession, Shop } from "@stores/state.interface";
import { ConfirmCancelDialog } from "../CancelDialog";
import { resetCurrentTable } from "@stores/shop.slice";
import { goToOrderSessionDetail } from "@apis/navigate.service";
import { PaymentComponentMap, PaymentMethod } from "@constants/paymentMethod";
import { convertPaymentAmount } from "@constants/utils";
import VNPay from "@assets/svg/VNPAY.svg";
import toastConfig from "@/components/CustomToast";

export default function PaymentMethodPage() {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const router = useRouter();
  const theme = useTheme();

  const { currentOrderSession, currentShop } = useSelector(
    (state: RootState) => state.shop,
  );
  const shop = currentShop as Shop;
  const orderSession = currentOrderSession as OrderSession;
  const paymentMethods = Object.values(PaymentMethod);

  const [payOrderSession, { isLoading: payOrderSessionLoading }] =
    usePayOrderSessionMutation();

  const [paymentDialogVisible, setPaymentDialogVisible] = useState(false);
  const [watingVisible, setWaitingVisible] = useState(false);
  const [paymentUrl, setPaymentUrl] = useState("");
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState("");
  const [customPaymentAmount, setCustomPaymentAmount] = useState("");

  const handlePayOrderSession = async () => {
    try {
      await payOrderSession({
        orderSessionId: orderSession.id,
        customerPaidAmount: _.toNumber(customPaymentAmount),
        paymentDetails: [
          {
            paymentMethod: selectedPaymentMethod as PaymentMethod,
            paymentAmount:
              _.toNumber(customPaymentAmount) || orderSession.paymentAmount,
          },
        ],
        shopId: shop.id,
      }).unwrap();

      setPaymentDialogVisible(false);
      dispatch(resetCurrentTable());
      goToOrderSessionDetail({
        router,
        shopId: shop.id,
        orderSessionId: orderSession.id,
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
          title={`${t("confirm")} ${t("payment")} ${t(selectedPaymentMethod)}`}
          isLoading={payOrderSessionLoading}
          dialogVisible={paymentDialogVisible}
          setDialogVisible={setPaymentDialogVisible}
          onCancelClick={() => {
            setPaymentDialogVisible(false);
          }}
          onConfirmClick={handlePayOrderSession}
        >
          <View style={{ padding: 16, gap: 12 }}>
            {selectedPaymentMethod === PaymentMethod.CASH && (
              <>
                <TextInput
                  mode="outlined"
                  label={t("customer_paid_amount")}
                  value={customPaymentAmount}
                  keyboardType="numeric" // Shows numeric keyboard
                  onChangeText={(text) =>
                    setCustomPaymentAmount(text.replace(/[^0-9.]/g, ""))
                  }
                />
                {_.toNumber(customPaymentAmount) - orderSession.paymentAmount >
                  0 && (
                  <Text style={{ fontSize: 16 }}>
                    {t("customer_return_amount")}:{" "}
                    {convertPaymentAmount(
                      _.toNumber(customPaymentAmount) -
                        orderSession.paymentAmount,
                    )}
                  </Text>
                )}
              </>
            )}
            <Text style={{ fontSize: 16 }}>
              {t("total")}: {convertPaymentAmount(orderSession.paymentAmount)}
            </Text>
          </View>
        </ConfirmCancelDialog>

        <Modal
          visible={watingVisible}
          onDismiss={() => setWaitingVisible(false)}
          style={{
            alignItems: "center",
            justifyContent: "center",
          }}
          contentContainerStyle={{
            boxShadow: "none",
          }}
        >
          <Surface
            style={{
              padding: 24,
              borderRadius: 15,
              alignItems: "center",
              backgroundColor: "#fff",
              elevation: 4,
            }}
          >
            <Text
              style={{ marginBottom: 16, fontSize: 18, textAlign: "center" }}
            >
              {t("please_scan_qr_to_pay")}
            </Text>
            <VNPay scale={0.4} />
            <View
              style={{
                borderWidth: 1,
                borderColor: theme.colors.onBackground,
                padding: 8,
                borderRadius: 10,
                marginBottom: 8,
              }}
            >
              {paymentUrl ? (
                <QRCode value={paymentUrl} size={200} />
              ) : (
                <Text>{t("creating_qr_code")}</Text>
              )}
            </View>
          </Surface>
        </Modal>
        <Toast config={toastConfig} />
      </Portal>
      <Surface
        mode="flat"
        style={{ flex: 1, maxWidth: 250, padding: 12, borderRadius: 10 }}
      >
        <Text style={{ fontSize: 18, marginBottom: 12 }}>
          {t("payment_at_counter")}
        </Text>
        <ScrollView style={{ flex: 1 }}>
          <Surface mode="flat" style={{ flex: 1, gap: 12 }}>
            {paymentMethods.map((paymentMethod) =>
              PaymentComponentMap[paymentMethod]({
                paymentMethod,
                setPaymentDialogVisible,
                setSelectedPaymentMethod,
                setWaitingVisible,
                setPaymentUrl,
              }),
            )}
          </Surface>
        </ScrollView>
      </Surface>
    </>
  );
}
