import { Link, useLocalSearchParams, useRouter } from "expo-router";
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from "react-native";
import { useSelector } from "react-redux";
import { RootState } from "../../../../../../stores/store";
import { SafeAreaView } from "react-native-safe-area-context";

interface Item {
  title: string;
  route: "tables";
}

const BUTTONS: Item[] = [{ title: "Tables", route: "tables" }];

export default function SettingManagementPage() {
  const { shopId } = useLocalSearchParams();
  const shop = useSelector((state: RootState) =>
    state.shop.shops.find((s) => s.id.toString() === shopId)
  );
  const router = useRouter();
  const { width } = useWindowDimensions();
  const buttonSize = width / 3 - 20;

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

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.buttonGrid}>
        {BUTTONS.map((item) => (
          <TouchableOpacity
            key={item.route}
            style={[styles.button, { width: buttonSize }]}
            onPress={() =>
              router.push({
                pathname: `/shop/[shopId]/settings/${item.route}`,
                params: { shopId: shop.id },
              })
            }
          >
            <Text style={styles.buttonText}>{item.title}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 10,
  },
  details: {
    fontSize: 18,
    textAlign: "center",
    marginBottom: 20,
  },
  errorText: {
    color: "red",
    fontSize: 18,
    textAlign: "center",
  },
  buttonGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    paddingVertical: 10,
  },
  button: {
    height: 100,
    margin: 5,
    backgroundColor: "#007bff",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 10,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  backButton: {
    padding: 10,
    backgroundColor: "#007bff",
    borderRadius: 5,
    alignItems: "center",
    alignSelf: "center",
    width: 50,
  },
  backButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },
});
