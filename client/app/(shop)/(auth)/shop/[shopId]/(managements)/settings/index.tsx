import { useRouter } from "expo-router";
import { ScrollView, View, useWindowDimensions } from "react-native";
import { useSelector } from "react-redux";
import { RootState } from "@stores/store";
import { Button, Surface, Icon, Text } from "react-native-paper";
import { Shop } from "@stores/state.interface";
import { AppBar } from "@components/AppBar";
import { goToShopHome } from "@apis/navigate.service";
import { useTranslation } from "react-i18next";
import { styles } from "@/constants/styles";

interface Item {
  key: string;
  title: string;
  route: "table-management" | "kitchen-management";
  icon: string;
}

const BUTTONS: Item[] = [
  {
    key: "table",
    title: "table_management",
    route: "table-management",
    icon: "table-furniture",
  },
  // {
  //   key: "kitchen",
  //   title: "kitchen_management",
  //   route: "kitchen-management",
  //   icon: "silverware-fork-knife",
  // },
];

const getButtonSize = (width: number) => {
  if (width > 600) return width / 3 - 30;
  if (width > 380) return width / 2 - 30;
  return width - 30;
};

export default function SettingManagementPage() {
  const router = useRouter();
  const { t } = useTranslation();
  const { width } = useWindowDimensions();
  const buttonSize = getButtonSize(width);

  const shop = useSelector(
    (state: RootState) => state.shop.currentShop,
  ) as Shop;

  return (
    <>
      <AppBar
        title={t("settings")}
        goBack={() => goToShopHome({ router, shopId: shop.id })}
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
                  router.navigate({
                    pathname: `/shop/[shopId]/settings/${item.route}`,
                    params: { shopId: shop.id },
                  })
                }
              >
                <View style={{ flex: 1, gap: 5 }}>
                  <Icon source={item.icon} size={50} />
                  <Text variant="bodyLarge">{t(item.title)}</Text>
                </View>
              </Button>
            ))}
          </View>
        </ScrollView>
      </Surface>
    </>
  );
}
