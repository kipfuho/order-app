import React, { useEffect, useState } from "react";
import { ScrollView } from "react-native";
import {
  ActivityIndicator,
  Button,
  List,
  Surface,
  useTheme,
} from "react-native-paper";
import { useSelector } from "react-redux";
import { useSession } from "../../hooks/useSession";
import { RootState } from "../../stores/store";
import { queryShopsRequest } from "../../apis/api.service";
import { Link, useRouter } from "expo-router";
import { AppBar } from "../../components/AppBar";
import { styles } from "../_layout";

export default function ShopsPage() {
  const { session } = useSession();
  const shops = useSelector((state: RootState) => state.shop.shops);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const theme = useTheme(); // Get theme colors

  useEffect(() => {
    const fetchShops = async () => {
      try {
        await queryShopsRequest({
          user: session,
          limit: 1000,
          page: 1,
        });
      } catch (error) {
        console.error("Error fetching shops:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchShops();
  }, []);

  if (loading) {
    return (
      <Surface style={styles.baseContainer}>
        <ActivityIndicator
          animating={true}
          size="large"
          color={theme.colors.primary}
          style={styles.baseLoader}
        />
      </Surface>
    );
  }

  return (
    <>
      <AppBar title="Shops">
        <Button
          mode="contained-tonal"
          onPress={() => router.push("/create-shop")}
        >
          Create Shop
        </Button>
      </AppBar>
      <Surface style={{ flex: 1, padding: 16 }}>
        <ScrollView>
          {/* List of Table Positions */}
          <List.Section>
            {shops.map((item) => (
              <Link
                key={item.id}
                href={{
                  pathname: "/shop/[shopId]/home",
                  params: { shopId: item.id },
                }}
                asChild
              >
                <List.Item
                  title={item.name}
                  style={{
                    backgroundColor: theme.colors.backdrop,
                    borderRadius: 8,
                    marginBottom: 8,
                  }}
                  left={(props) => <List.Icon {...props} icon="store" />}
                />
              </Link>
            ))}
          </List.Section>
        </ScrollView>
      </Surface>
    </>
  );
}
