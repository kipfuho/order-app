import { Dispatch, ReactNode, SetStateAction } from "react";
import { ActivityIndicator, Button, Dialog } from "react-native-paper";
import { useTranslation } from "react-i18next";
import { View } from "react-native";

export function ConfirmCancelDialog({
  title,
  isLoading,
  children,
  dialogVisible,
  setDialogVisible,
  onConfirmClick,
  onCancelClick,
}: {
  title: string;
  isLoading: boolean;
  children?: ReactNode;
  dialogVisible: boolean;
  setDialogVisible: Dispatch<SetStateAction<boolean>>;
  onConfirmClick: () => void;
  onCancelClick: () => void;
}) {
  const { t } = useTranslation();

  return (
    <Dialog
      visible={dialogVisible}
      onDismiss={() => setDialogVisible(false)}
      style={{ width: "80%", maxWidth: 500, alignSelf: "center" }}
    >
      <Dialog.Title>{title}</Dialog.Title>
      {children}
      <Dialog.Actions style={{ justifyContent: "center" }}>
        {isLoading ? (
          <ActivityIndicator />
        ) : (
          <View style={{ flexDirection: "row", gap: 8 }}>
            <Button
              mode="contained"
              onPress={onConfirmClick}
              style={{ borderRadius: 10 }}
            >
              {t("confirm")}
            </Button>
            <Button
              mode="contained-tonal"
              onPress={onCancelClick}
              style={{ borderRadius: 10 }}
            >
              {t("cancel")}
            </Button>
          </View>
        )}
      </Dialog.Actions>
    </Dialog>
  );
}
