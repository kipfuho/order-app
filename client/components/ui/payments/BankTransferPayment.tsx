import { Dispatch, SetStateAction } from "react";
import { useSelector } from "react-redux";
import { Text, TouchableRipple, useTheme } from "react-native-paper";
import { useTranslation } from "react-i18next";
import { getVnPayUrl } from "@apis/order.api.service";
import { RootState } from "@stores/store";

export default function BankTransferPayment({
  paymentMethod,
  setWaitingVisible,
  setPaymentUrl,
}: {
  paymentMethod: string;
  setSelectedPaymentMethod: Dispatch<SetStateAction<string>>;
  setWaitingVisible: Dispatch<SetStateAction<boolean>>;
  setPaymentUrl: Dispatch<SetStateAction<string>>;
}) {
  const theme = useTheme();
  const { t } = useTranslation();

  const { currentShop, currentOrderSession } = useSelector(
    (state: RootState) => state.shop,
  );

  const handleGetVnPayUrl = async () => {
    if (!currentShop || !currentOrderSession) return;

    setPaymentUrl("");
    setWaitingVisible(true);
    const url = await getVnPayUrl({
      shopId: currentShop.id,
      orderSessionId: currentOrderSession.id,
    });

    setPaymentUrl(url);
  };

  return (
    <TouchableRipple
      key={paymentMethod}
      onPress={handleGetVnPayUrl}
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
      <Text style={{ color: theme.colors.onPrimary }}>{t(paymentMethod)}</Text>
    </TouchableRipple>
  );
}
