import { useTranslation } from "react-i18next";
import { ScrollView } from "react-native";
import { Button, Checkbox, Dialog } from "react-native-paper";
import { Table } from "../../../stores/state.interface";
import { useEffect, useState } from "react";

const TableSelectionDialog = ({
  visible,
  setVisible,
  tables,
  selectedTables,
  setSelectedTables,
}: {
  visible: boolean;
  setVisible: (_value: boolean) => void;
  tables: Table[];
  selectedTables: string[];
  setSelectedTables: (_value: string[]) => void;
}) => {
  const { t } = useTranslation();
  const [currentSelectedTables, setCurrentSelectedTables] = useState<
    Set<string>
  >(new Set());

  const handleUnselectAllPress = () => {
    setCurrentSelectedTables(new Set());
  };

  const handleSelectAllPress = () => {
    setCurrentSelectedTables(new Set(tables.map((item) => item.id)));
  };

  const toggleCategorySelection = (categoryId: string) => {
    setCurrentSelectedTables((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(categoryId)) {
        newSet.delete(categoryId);
      } else {
        newSet.add(categoryId);
      }

      return newSet;
    });
  };

  const handleConfirmPress = () => {
    setSelectedTables(currentSelectedTables.values().toArray());
    setVisible(false);
  };

  useEffect(() => {
    setCurrentSelectedTables(new Set(selectedTables));
  }, [selectedTables]);

  return (
    <Dialog
      visible={visible}
      style={{ maxHeight: "80%" }}
      onDismiss={() => setVisible(false)}
    >
      <Dialog.Title>{t("dish_category")}</Dialog.Title>
      <Dialog.ScrollArea>
        <ScrollView>
          {tables.map((item) => (
            <Checkbox.Item
              key={item.id}
              label={item.name}
              status={
                currentSelectedTables.has(item.id) ? "checked" : "unchecked"
              }
              onPress={() => toggleCategorySelection(item.id)}
            />
          ))}
        </ScrollView>
      </Dialog.ScrollArea>
      <Dialog.Actions style={{ flexWrap: "wrap", gap: 8 }}>
        <Button mode="contained-tonal" onPress={handleUnselectAllPress}>
          {t("unselect_all")}
        </Button>
        <Button mode="contained-tonal" onPress={handleSelectAllPress}>
          {t("select_all")}
        </Button>
        <Button mode="contained" onPress={handleConfirmPress}>
          {t("confirm")}
        </Button>
      </Dialog.Actions>
    </Dialog>
  );
};

export default TableSelectionDialog;
