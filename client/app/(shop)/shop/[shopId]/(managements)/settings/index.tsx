import { useLocalSearchParams, useRouter } from "expo-router";
import { StyleSheet, View, useWindowDimensions } from "react-native";
import { useSelector } from "react-redux";
import { RootState } from "../../../../../../stores/store";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme, Button, Text } from "react-native-paper";
import { Shop } from "../../../../../../stores/state.interface";
import { AppBar } from "../../../../../../components/AppBar";

interface Item {
  title: string;
  route: "tables";
}

const BUTTONS: Item[] = [
  { title: "Tables", route: "tables" },
  { title: "Tables", route: "tables" },
  { title: "Tables", route: "tables" },
  { title: "Tables", route: "tables" },
  { title: "Tables", route: "tables" },
  { title: "Tables", route: "tables" },
];

export default function SettingManagementPage() {
  const { shopId } = useLocalSearchParams();
  const shop = useSelector((state: RootState) =>
    state.shop.shops.find((s) => s.id.toString() === shopId)
  ) as Shop;
  const router = useRouter();
  const theme = useTheme();
  const { width } = useWindowDimensions();
  const buttonSize = width / 3 - 30;

  const goBack = () => {
    router.navigate({
      pathname: "/shop/[shopId]/home",
      params: { shopId: shop.id },
    });
  };

  return (
    <>
      <AppBar title="Settings" goBack={goBack} />
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
        {/* Buttons */}
        <View style={styles.buttonGrid}>
          {BUTTONS.map((item) => (
            <Button
              key={item.route}
              mode="contained"
              style={[styles.button, { width: buttonSize, backgroundColor: theme.colors.primary }]}
              labelStyle={{ color: theme.colors.onPrimary }}
              onPress={() =>
                router.push({
                  pathname: `/shop/[shopId]/settings/${item.route}`,
                  params: { shopId: shop.id },
                })
              }
            >
              {item.title}
            </Button>
          ))}
        </View>
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: "center",
  },
  buttonGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    paddingVertical: 10,
  },
  button: {
    margin: 5,
    borderRadius: 8,
  },
});

