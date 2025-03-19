import { Link, Stack, useLocalSearchParams, useRouter } from "expo-router";
import { useSelector } from "react-redux";
import { SafeAreaView } from "react-native-safe-area-context";
import { Text, TouchableOpacity } from "react-native";
import { RootState } from "../../../../../stores/store";
import { styles } from "../../../../_layout";

export default function ShopLayout() {
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

  return <Stack screenOptions={{ headerShown: false }} />;
}
