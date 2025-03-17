import FontAwesome from "@expo/vector-icons/FontAwesome";
import { Link, Tabs, useLocalSearchParams } from "expo-router";
import { useSelector } from "react-redux";
import { RootState } from "../../../../../../../stores/store";
import { SafeAreaView } from "react-native-safe-area-context";
import { Text, TouchableOpacity } from "react-native";
import { styles } from "../../../../../../_layout";

export default function TablesTabLayout() {
  const { shopId } = useLocalSearchParams();
  const shop = useSelector((state: RootState) =>
    state.shop.shops.find((s) => s.id.toString() === shopId)
  );

  if (!shop) {
    console.log(shopId);
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

  return (
    <Tabs screenOptions={{ tabBarActiveTintColor: "blue" }}>
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
    </Tabs>
  );
}
