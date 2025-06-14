import React, { useState } from "react";
import {
  Modal,
  Text,
  Button,
  RadioButton,
  TextInput,
  Surface,
  useTheme,
  ActivityIndicator,
} from "react-native-paper";
import { View, StyleSheet } from "react-native";
import { useTranslation } from "react-i18next";
import { DiscountValueType } from "@constants/common";
import { SymbolSwitch } from "@/components/SymbolSwitch";

export default function DiscountModal({
  title,
  visible,
  onDismiss,
  onApply,
  isLoading,
}: {
  title?: string;
  visible: boolean;
  onDismiss: () => void;
  onApply: (data: any) => void;
  isLoading: boolean;
}) {
  const theme = useTheme();
  const { t } = useTranslation();
  const [discountAfterTax, setDiscountAfterTax] = useState(false);
  const [discountValue, setDiscountValue] = useState("");
  const [reason, setReason] = useState("");
  const [isPercent, setIsPercent] = useState(true);

  return (
    <Modal
      visible={visible}
      onDismiss={onDismiss}
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        padding: 16,
      }}
    >
      <Surface
        mode="flat"
        style={{
          padding: 16,
          borderRadius: 12,
        }}
      >
        <Text style={styles.title}>{title || t("discount_directly")}</Text>

        <Text style={styles.label}>{t("discount_type")}</Text>
        <View style={styles.radioRow}>
          <RadioButton
            value="before"
            status={discountAfterTax ? "unchecked" : "checked"}
            onPress={() => setDiscountAfterTax(false)}
          />
          <Text style={styles.radioLabel}>{t("before_tax")}</Text>
          <RadioButton
            value="after"
            status={discountAfterTax ? "checked" : "unchecked"}
            onPress={() => setDiscountAfterTax(true)}
          />
          <Text style={styles.radioLabel}>{t("after_tax")}</Text>
        </View>

        <View style={styles.inputRow}>
          <TextInput
            mode="outlined"
            placeholder={isPercent ? t("percentage") : t("amount")}
            value={discountValue}
            onChangeText={setDiscountValue}
            style={styles.input}
          />
          <SymbolSwitch
            value={isPercent}
            onChange={setIsPercent}
            activeColor={theme.colors.primary}
            inactiveColor={theme.colors.secondary}
          />
        </View>

        <TextInput
          mode="outlined"
          placeholder={t("reason")}
          value={reason}
          onChangeText={setReason}
          style={styles.input}
        />

        <View style={{ marginVertical: 20 }}>
          {isLoading ? (
            <ActivityIndicator size={40} />
          ) : (
            <Button
              mode="contained"
              onPress={() =>
                onApply({
                  discountAfterTax,
                  discountReason: reason,
                  discountValue,
                  discountType: isPercent
                    ? DiscountValueType.PERCENTAGE
                    : DiscountValueType.ABSOLUTE,
                })
              }
              style={styles.button}
            >
              {t("apply")}
            </Button>
          )}
        </View>
      </Surface>
    </Modal>
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: 18,
    textAlign: "center",
    marginBottom: 12,
  },
  label: {
    fontWeight: "bold",
    marginBottom: 4,
  },
  radioRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  radioLabel: {
    marginRight: 16,
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  input: {
    flex: 1,
    marginRight: 8,
  },
  button: {
    marginTop: 16,
    borderRadius: 10,
    paddingVertical: 6,
  },
});
