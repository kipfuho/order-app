import { ReactNode, SetStateAction } from "react";
import { Button, Dialog } from "react-native-paper";
import { useTranslation } from "react-i18next";
import { LoaderBasic } from "./Loader";
import { View } from "react-native";

export function ConfirmCancelDialog({
  title,
  isLoading,
  children,
  cancelDialogVisible,
  setCancelDialogVisible,
  onConfirmClick,
  onCancelClick,
}: {
  title: string;
  isLoading: boolean;
  children?: ReactNode;
  cancelDialogVisible: boolean;
  setCancelDialogVisible: SetStateAction<any>;
  onConfirmClick: () => void;
  onCancelClick: () => void;
}) {
  const { t } = useTranslation();

  return (
    <Dialog
      visible={cancelDialogVisible}
      onDismiss={() => setCancelDialogVisible(false)}
    >
      <Dialog.Title>{title}</Dialog.Title>
      {children}
      <Dialog.Actions style={{ justifyContent: "center" }}>
        {isLoading ? (
          <LoaderBasic />
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
