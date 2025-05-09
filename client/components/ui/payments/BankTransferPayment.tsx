import { Dispatch, SetStateAction } from "react";
import { Text, TouchableRipple, useTheme } from "react-native-paper";
import { getVnPayUrl } from "../../../apis/order.api.service";
import { useSelector } from "react-redux";
import { RootState } from "../../../stores/store";
import { useTranslation } from "react-i18next";

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
    (state: RootState) => state.shop
  );

  const handleGetVnPayUrl = async () => {
    if (!currentShop || !currentOrderSession) return;

    const url = await getVnPayUrl({
      shopId: currentShop.id,
      orderSessionId: currentOrderSession.id,
    });

    setPaymentUrl(url);
    setWaitingVisible(true);
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
