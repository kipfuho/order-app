import { useRouter } from "expo-router";
import { ScrollView, View, useWindowDimensions } from "react-native";
import { useSelector } from "react-redux";
import { RootState } from "@stores/store";
import {
  Surface,
  Icon,
  Text,
  TouchableRipple,
  useTheme,
} from "react-native-paper";
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
  const theme = useTheme();
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
              <TouchableRipple
                key={item.key}
                onPress={() =>
                  router.replace({
                    pathname: `/shop/[shopId]/settings/${item.route}`,
                    params: { shopId: shop.id },
                  })
                }
                style={{
                  width: buttonSize,
                  minHeight: 120,
                  borderRadius: 10,
                  backgroundColor: theme.colors.primaryContainer,
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <View
                  style={{
                    gap: 5,
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Icon source={item.icon} size={50} />
                  <Text variant="bodyLarge">{t(item.title)}</Text>
                </View>
              </TouchableRipple>
            ))}
          </View>
        </ScrollView>
      </Surface>
    </>
  );
}
