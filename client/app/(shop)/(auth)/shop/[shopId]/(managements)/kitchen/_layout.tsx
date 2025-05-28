import {
  Stack,
  useLocalSearchParams,
  usePathname,
  useRouter,
} from "expo-router";
import { AppBar } from "../../../../../../../components/AppBar";
import { TouchableOpacity, View } from "react-native";
import { goToShopHome } from "../../../../../../../apis/navigate.service";
import { useTranslation } from "react-i18next";
import { Icon, Menu, Text, useTheme } from "react-native-paper";
import { memo, useEffect, useMemo, useState } from "react";
import { SwipeContext } from "../../../../../../../hooks/useSwipeNavigation";

interface Item {
  title: string;
  route:
    | "cook-by-dish"
    | "cook-by-order"
    | "cook-history"
    | "serving-history"
    | "serving";
}

const BUTTON_WIDTH = 100;
const MENU_BUTTON_WIDTH = 60;

const allRoutes: Item[] = [
  { title: "by_order", route: "cook-by-order" },
  { title: "by_dish", route: "cook-by-dish" },
  { title: "serving", route: "serving" },
  { title: "cook_history", route: "cook-history" },
  { title: "serve_history", route: "serving-history" },
];

const KitchenButton = memo(({ title, route }: Item) => {
  const { shopId } = useLocalSearchParams() as { shopId: string };
  const theme = useTheme();
  const router = useRouter();
  const pathName = usePathname();

  const [selected, setSelected] = useState(false);

  useEffect(() => {
    setSelected(pathName.endsWith(`/kitchen/${route}`));
  }, [pathName]);

  return (
    <TouchableOpacity
      style={{
        backgroundColor: selected
          ? theme.colors.primaryContainer
          : theme.colors.background,
        justifyContent: "center",
        paddingHorizontal: 18,
        width: BUTTON_WIDTH,
      }}
      onPress={() =>
        router.replace({
          pathname: `/shop/[shopId]/kitchen/${route}`,
          params: { shopId },
        })
      }
    >
      <Text
        style={{
          color: selected
            ? theme.colors.onPrimaryContainer
            : theme.colors.onBackground,
          alignSelf: "center",
        }}
      >
        {title}
      </Text>
    </TouchableOpacity>
  );
});

export default function TabLayout() {
  const { shopId } = useLocalSearchParams() as { shopId: string };
  const router = useRouter();
  const { t } = useTranslation();
  const pathName = usePathname();

  const [menuVisible, setMenuVisible] = useState(false);
  const [visibleCount, setVisibleCount] = useState(0);
  const allVisibleRoutes = allRoutes.slice(0, visibleCount);
  const allAdditionalRoutes = allRoutes.slice(visibleCount);

  // Find current route index
  const currentRouteIndex = useMemo(() => {
    const currentIndex = allRoutes.findIndex((route) =>
      pathName.endsWith(`/kitchen/${route.route}`)
    );
    return currentIndex !== -1 ? currentIndex : 0;
  }, [pathName]);

  // Navigation functions
  const navigateToNext = () => {
    if (currentRouteIndex < allRoutes.length - 1) {
      const nextRoute = allRoutes[currentRouteIndex + 1];
      router.replace({
        pathname: `/shop/[shopId]/kitchen/${nextRoute.route}`,
        params: { shopId },
      });
    }
  };

  const navigateToPrevious = () => {
    if (currentRouteIndex > 0) {
      const prevRoute = allRoutes[currentRouteIndex - 1];
      router.replace({
        pathname: `/shop/[shopId]/kitchen/${prevRoute.route}`,
        params: { shopId },
      });
    }
  };

  const swipeContextValue = useMemo(
    () => ({
      navigateToNext,
      navigateToPrevious,
      currentIndex: currentRouteIndex,
      totalPages: allRoutes.length,
    }),
    [currentRouteIndex]
  );

  return (
    <SwipeContext.Provider value={swipeContextValue}>
      <AppBar
        goBack={() => goToShopHome({ router, shopId })}
        actions={
          <View
            style={{ flex: 1, flexDirection: "row", height: "100%" }}
            onLayout={(e) => {
              const width = e.nativeEvent.layout.width;
              const available = width - MENU_BUTTON_WIDTH;
              const count = Math.floor(available / BUTTON_WIDTH);
              setVisibleCount(count);
            }}
          >
            {allVisibleRoutes.map((info, index) => (
              <KitchenButton
                key={index}
                route={info.route}
                title={t(info.title)}
              />
            ))}

            {allAdditionalRoutes.length > 0 && (
              <Menu
                visible={menuVisible}
                onDismiss={() => setMenuVisible(false)}
                anchor={
                  <TouchableOpacity
                    style={{
                      padding: 4,
                      justifyContent: "center",
                      paddingHorizontal: 18,
                      height: "100%",
                      width: MENU_BUTTON_WIDTH,
                    }}
                    onPress={() => setMenuVisible(true)}
                  >
                    <Icon source="dots-horizontal" size={28} />
                  </TouchableOpacity>
                }
              >
                {allAdditionalRoutes.map((info, index) => (
                  <Menu.Item
                    key={index}
                    onPress={() => {
                      router.replace({
                        pathname: `/shop/[shopId]/kitchen/${info.route}`,
                        params: { shopId },
                      });
                      setMenuVisible(false);
                    }}
                    title={t(info.title)}
                  />
                ))}
              </Menu>
            )}
          </View>
        }
      />
      <Stack screenOptions={{ headerShown: false }} />
    </SwipeContext.Provider>
  );
}
