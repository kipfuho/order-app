import { Surface, Text, TouchableRipple, useTheme } from "react-native-paper";
import { PaymentMethod } from "../../../constants/paymentMethod";
import { ScrollView } from "react-native";

export default function PaymentMethodPage() {
  const theme = useTheme();

  const paymentMethods = Object.values(PaymentMethod);

  return (
    <Surface style={{ flex: 1, padding: 12, borderRadius: 10 }}>
      <ScrollView style={{ flex: 1 }}>
        <Surface style={{ flex: 1, gap: 12 }}>
          {paymentMethods.map((paymentMethod) => (
            <TouchableRipple
              key={paymentMethod}
              onPress={() => {}}
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
  );
}
