import { normalizeVietnamese } from "@/constants/utils";
import { Dispatch, SetStateAction, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { View, ScrollView } from "react-native";
import {
  Button,
  Dialog,
  Portal,
  Text,
  TextInput,
  List,
} from "react-native-paper";

export const DropdownMenu = ({
  label,
  item,
  items,
  setItem,
  getItemValue,
}: {
  label: string;
  item: any;
  items: any[];
  setItem: Dispatch<SetStateAction<any>>;
  getItemValue: (item: any) => string;
}) => {
  const { t } = useTranslation();
  const [dialogVisible, setDialogVisible] = useState(false);
  const [filterText, setFilterText] = useState("");

  const openDialog = () => setDialogVisible(true);
  const closeDialog = () => {
    setDialogVisible(false);
    setFilterText("");
  };

  const normalizedItemTexts = useMemo(() => {
    return items.map((i) => normalizeVietnamese(getItemValue(i).toLowerCase()));
  }, [getItemValue, items]);

  const filteredItems = useMemo(() => {
    const normalizedFilterText = normalizeVietnamese(filterText.toLowerCase());
    return items.filter((_, index) => {
      const _normalizedItemText = normalizedItemTexts[index];
      return _normalizedItemText.includes(normalizedFilterText);
    });
  }, [items, normalizedItemTexts, filterText]);

  return (
    <>
      <Text variant="bodyLarge" style={{ marginBottom: 5 }}>
        {t("select")} {label}
      </Text>
      <Button
        mode="outlined"
        onPress={openDialog}
        style={{ marginBottom: 20, borderRadius: 5, minHeight: 30 }}
      >
        {getItemValue(item) || `${t("select")} ${label}`}
      </Button>

      <Portal>
        <Dialog
          visible={dialogVisible}
          style={{
            width: "70%",
            maxWidth: 600,
            height: "70%",
            justifyContent: "center",
            alignSelf: "center",
          }}
          onDismiss={closeDialog}
        >
          <Dialog.Title>
            {t("select")} {label}
          </Dialog.Title>
          <View style={{ padding: 16, flex: 1 }}>
            <TextInput
              placeholder={t("search")}
              value={filterText}
              onChangeText={setFilterText}
              mode="outlined"
              dense
              style={{ marginBottom: 10 }}
            />

            <ScrollView style={{ flex: 1 }}>
              {filteredItems.length > 0 ? (
                filteredItems.map((i, idx) => (
                  <List.Item
                    key={idx}
                    title={getItemValue(i)}
                    titleNumberOfLines={2}
                    onPress={() => {
                      setItem(i);
                      closeDialog();
                    }}
                  />
                ))
              ) : (
                <Text>{t("no_results")}</Text>
              )}
            </ScrollView>
          </View>
          <Button onPress={closeDialog}>{t("cancel")}</Button>
        </Dialog>
      </Portal>
    </>
  );
};
