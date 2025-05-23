import { Dispatch, SetStateAction } from "react";
import { useTranslation } from "react-i18next";
import { Text, TouchableRipple, useTheme } from "react-native-paper";

export default function GeneralPayment({
  paymentMethod,
  setSelectedPaymentMethod,
  setPaymentDialogVisible,
}: {
  paymentMethod: string;
  setSelectedPaymentMethod: Dispatch<SetStateAction<string>>;
  setPaymentDialogVisible: Dispatch<SetStateAction<boolean>>;
}) {
  const theme = useTheme();
  const { t } = useTranslation();

  return (
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
      <Text style={{ color: theme.colors.onPrimary }}>{t(paymentMethod)}</Text>
    </TouchableRipple>
  );
}
