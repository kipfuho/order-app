import { SetStateAction, useState } from "react";
import { Button, Menu, Text } from "react-native-paper";

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
  setItem: SetStateAction<any>;
  getItemValue: (item: any) => string;
}) => {
  // Menu state for dropdown
  const [menuVisible, setMenuVisible] = useState(false);

  const openMenu = () => setMenuVisible(true);
  const closeMenu = () => setMenuVisible(false);
  return (
    <>
      {/* Dish Category Dropdown Label */}
      <Text variant="bodyLarge" style={{ marginBottom: 5 }}>
        Select {label}
      </Text>
      {/* Dish Category Dropdown */}
      <Menu
        visible={menuVisible}
        onDismiss={closeMenu}
        anchor={
          <Button
            mode="outlined"
            onPress={openMenu}
            style={{ marginBottom: 20, borderRadius: 5 }}
          >
            {getItemValue(item) || `Select ${label}`}
          </Button>
        }
      >
        {items.map((item, idx) => (
          <Menu.Item
            key={idx}
            onPress={() => {
              setItem(item);
              closeMenu();
            }}
            title={getItemValue(item)}
          />
        ))}
      </Menu>
    </>
  );
};
