import { useEffect, useState } from "react";
import { ScrollView } from "react-native";
import { Button, Checkbox, Dialog } from "react-native-paper";
import { useTranslation } from "react-i18next";
import { DishCategory } from "@stores/state.interface";

const DishCategorySelectionDialog = ({
  visible,
  setVisible,
  dishCategories,
  selectedDishCategories,
  setSelectedDishCategories,
}: {
  visible: boolean;
  setVisible: (_value: boolean) => void;
  dishCategories: DishCategory[];
  selectedDishCategories: string[];
  setSelectedDishCategories: (_value: string[]) => void;
}) => {
  const { t } = useTranslation();
  const [currentSelectedDishCategories, setCurrentSelectedDishCategories] =
    useState<Set<string>>(new Set());

  const handleUnselectAllPress = () => {
    setCurrentSelectedDishCategories(new Set());
  };

  const handleSelectAllPress = () => {
    setCurrentSelectedDishCategories(
      new Set(dishCategories.map((dc) => dc.id)),
    );
  };

  const toggleCategorySelection = (categoryId: string) => {
    setCurrentSelectedDishCategories((prev) => {
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
    setSelectedDishCategories(currentSelectedDishCategories.values().toArray());
    setVisible(false);
  };

  useEffect(() => {
    setCurrentSelectedDishCategories(new Set(selectedDishCategories));
  }, [selectedDishCategories]);

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
                currentSelectedDishCategories.has(category.id)
                  ? "checked"
                  : "unchecked"
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
