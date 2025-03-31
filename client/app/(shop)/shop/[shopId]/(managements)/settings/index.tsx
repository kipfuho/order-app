import { useRouter } from "expo-router";
import { ScrollView, View, useWindowDimensions } from "react-native";
import { useSelector } from "react-redux";
import { RootState } from "../../../../../../stores/store";
import { Button, Surface, Icon, Text } from "react-native-paper";
import { Shop } from "../../../../../../stores/state.interface";
import { AppBar } from "../../../../../../components/AppBar";
import { styles } from "../../../../../_layout";
import { goBackShopHome } from "../../../../../../apis/navigate.service";

interface Item {
  key: string;
  title: string;
  route: "tables";
  icon: string;
}

const BUTTONS: Item[] = [
  { key: "table1", title: "Tables", route: "tables", icon: "table-furniture" },
  { key: "table2", title: "Tables", route: "tables", icon: "table-furniture" },
  { key: "table3", title: "Tables", route: "tables", icon: "table-furniture" },
  { key: "table4", title: "Tables", route: "tables", icon: "table-furniture" },
  { key: "table5", title: "Tables", route: "tables", icon: "table-furniture" },
  { key: "table6", title: "Tables", route: "tables", icon: "table-furniture" },
];

const getButtonSize = (width: number) => {
  if (width > 600) return width / 3 - 30;
  if (width > 380) return width / 2 - 30;
  return width - 30;
};

export default function SettingManagementPage() {
  const shop = useSelector(
    (state: RootState) => state.shop.currentShop
  ) as Shop;
  const router = useRouter();

  const { width } = useWindowDimensions();
  const buttonSize = getButtonSize(width);

  return (
    <>
      <AppBar
        title="Settings"
        goBack={() => goBackShopHome({ router, shopId: shop.id })}
      />
      <Surface style={styles.baseContainer}>
        <ScrollView>
          {/* Buttons */}
          <View style={styles.baseGrid}>
            {BUTTONS.map((item) => (
              <Button
                key={item.key}
                mode="contained-tonal"
                style={{ width: buttonSize, height: 100, borderRadius: 10 }}
                onPress={() =>
                  router.replace({
                    pathname: `/shop/[shopId]/settings/${item.route}`,
                    params: { shopId: shop.id },
                  })
                }
              >
                <View style={{ flex: 1, gap: 5 }}>
                  <Icon source={item.icon} size={50} />
                  <Text variant="bodyLarge">{item.title}</Text>
                </View>
              </Button>
            ))}
          </View>
        </ScrollView>
      </Surface>
    </>
  );
}
