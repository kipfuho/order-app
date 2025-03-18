import { Ionicons } from "@expo/vector-icons";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { Link, Tabs, useLocalSearchParams, useRouter } from "expo-router";
import { Text, TouchableOpacity } from "react-native";
import { styles } from "../../../../../_layout";
import { SafeAreaView } from "react-native-safe-area-context";
import { RootState } from "../../../../../../stores/store";
import { useSelector } from "react-redux";

export default function TabLayout() {
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
      pathname: "/shop/[shopId]/home",
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
        name="dishes"
        options={{
          title: "Dish",
          tabBarIcon: ({ color }) => (
            <FontAwesome size={28} name="list" color={color} />
          ),
        }}
        initialParams={{ shopId }}
      />
      <Tabs.Screen
        name="categories"
        options={{
          title: "Categories",
          tabBarIcon: ({ color }) => (
            <FontAwesome size={28} name="home" color={color} />
          ),
        }}
        initialParams={{ shopId }}
      />
      <Tabs.Screen
        name="index"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="create-dish"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="create-dish-category"
        options={{
          href: null,
        }}
      />
    </Tabs>
  );
}
