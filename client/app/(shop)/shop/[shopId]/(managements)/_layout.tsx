import { Link, Stack, useLocalSearchParams, useRouter } from "expo-router";
import { useSelector } from "react-redux";
import { SafeAreaView } from "react-native-safe-area-context";
import { Text, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { RootState } from "../../../../../stores/store";
import { styles } from "../../../../_layout";

export default function ShopLayout() {
  const { shopId } = useLocalSearchParams();
  const shop = useSelector((state: RootState) =>
    state.shop.shops.find((s) => s.id.toString() === shopId)
  );
  const router = useRouter();

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

  const goBack = () => {
    router.navigate({
      pathname: "/shop/[shopId]/home",
      params: {
        shopId: shop.id,
      },
    });
  };

  return (
    <Stack
      screenOptions={{
        headerLeft: () => (
          <TouchableOpacity onPress={() => goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="black" />
          </TouchableOpacity>
        ),
      }}
    >
      <Stack.Screen
        name="settings/tables"
        options={{
          headerShown: false,
        }}
      />
    </Stack>
  );
}
