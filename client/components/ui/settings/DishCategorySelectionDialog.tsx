import { useTranslation } from "react-i18next";
import { ScrollView } from "react-native";
import { Button, Checkbox, Dialog } from "react-native-paper";
import { DishCategory } from "../../../stores/state.interface";
import { useState } from "react";

const DishCategorySelectionDialog = ({
  visible,
  setVisible,
  dishCategories,
  setDishCategories,
}: {
  visible: boolean;
  setVisible: (_value: boolean) => void;
  dishCategories: DishCategory[];
  setDishCategories: (_value: string[]) => void;
}) => {
  const { t } = useTranslation();
  const [selectedCategories, setSelectedCategories] = useState<Set<string>>(
    new Set()
  );

  const handleUnselectAllPress = () => {
    setSelectedCategories(new Set());
  };

  const handleSelectAllPress = () => {
    setSelectedCategories(new Set(dishCategories.map((dc) => dc.id)));
  };

  const toggleCategorySelection = (categoryId: string) => {
    setSelectedCategories((prev) => {
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
    setDishCategories(selectedCategories.values().toArray());
    setVisible(false);
  };

  return (
    <Dialog
      visible={visible}
      style={{ maxHeight: "80%" }}
      onDismiss={() => setVisible(false)}
    >
      <Dialog.Title>{t("dish_category")}</Dialog.Title>
      <Dialog.ScrollArea>
        <ScrollView>
          {dishCategories.map((category) => (
            <Checkbox.Item
              key={category.id}
              label={category.name}
              status={
                selectedCategories.has(category.id) ? "checked" : "unchecked"
              }
              onPress={() => toggleCategorySelection(category.id)}
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

export default DishCategorySelectionDialog;
