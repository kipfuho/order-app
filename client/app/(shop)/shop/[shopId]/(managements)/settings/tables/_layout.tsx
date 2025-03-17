import FontAwesome from "@expo/vector-icons/FontAwesome";
import { Link, Tabs, useLocalSearchParams, useRouter } from "expo-router";
import { useSelector } from "react-redux";
import { RootState } from "../../../../../../../stores/store";
import { SafeAreaView } from "react-native-safe-area-context";
import { Text, TouchableOpacity } from "react-native";
import { styles } from "../../../../../../_layout";
import { Ionicons } from "@expo/vector-icons";

export default function TablesTabLayout() {
  const { shopId } = useLocalSearchParams();
  const shop = useSelector((state: RootState) =>
    state.shop.shops.find((s) => s.id.toString() === shopId)
  );

  if (!shop) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.errorText}>Shop not found</Text>
        <Link href="/" asChild>
          <TouchableOpacity style={styles.backButton}>
            <Text style={styles.backButtonText}>Go Back</Text>
          </TouchableOpacity>
        </Link>
      </SafeAreaView>
    );
  }

  const router = useRouter();
  const goBack = () =>
    router.navigate({
      pathname: "/shop/[shopId]/settings",
      params: {
        shopId: shop.id,
      },
    });

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: "blue",
        lazy: true,
        headerLeft: () => (
          <TouchableOpacity onPress={() => goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="black" />
          </TouchableOpacity>
        ),
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Bàn",
          tabBarIcon: ({ color }) => (
            <FontAwesome size={28} name="list" color={color} />
          ),
          href: {
            pathname: "/shop/[shopId]/settings/tables",
            params: {
              shopId: shop.id,
            },
          },
        }}
      />
      <Tabs.Screen
        name="table-position"
        options={{
          title: "Khu vực",
          tabBarIcon: ({ color }) => (
            <FontAwesome size={28} name="home" color={color} />
          ),
          href: {
            pathname: "/shop/[shopId]/settings/tables/table-position",
            params: {
              shopId: shop.id,
            },
          },
        }}
      />
      <Tabs.Screen
        name="create-table-position"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="create-table"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="update-table/[tableId]"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="update-table-position/[tablePositionId]"
        options={{
          href: null,
        }}
      />
    </Tabs>
  );
}
