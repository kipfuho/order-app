import React, { useEffect, useState } from "react";
import { View, FlatList, StyleSheet } from "react-native";
import {
  ActivityIndicator,
  Button,
  Card,
  Text,
  useTheme,
} from "react-native-paper";
import { useDispatch, useSelector } from "react-redux";
import { useSession } from "../../hooks/useSession";
import { RootState } from "../../stores/store";
import { queryShopsRequest } from "../../api/api.service";
import { useRouter } from "expo-router";

export default function ShopsPage() {
  const { session } = useSession();
  const shops = useSelector((state: RootState) => state.shop.shops);
  const [loading, setLoading] = useState(true);
  const dispatch = useDispatch();
  const router = useRouter();
  const theme = useTheme(); // Get theme colors

  useEffect(() => {
    const fetchShops = async () => {
      try {
        await queryShopsRequest({
          user: session,
          dispatch,
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
      <View style={styles.loaderContainer}>
        <ActivityIndicator
          animating={true}
          size="large"
          color={theme.colors.primary}
        />
      </View>
    );
  }

  return (
    <View
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <View style={styles.header}>
        <Text
          variant="headlineMedium"
          style={{ color: theme.colors.onBackground }}
        >
          Shops
        </Text>
        <Button
          mode="contained"
          onPress={() => router.push("/create-shop")}
          buttonColor={theme.colors.primary}
          textColor={theme.colors.onPrimary}
        >
          Create Shop
        </Button>
      </View>
      <FlatList
        data={shops}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <Card
            style={[styles.shopItem, { backgroundColor: theme.colors.surface }]}
            onPress={() =>
              router.push({
                pathname: "/shop/[shopId]/home",
                params: { shopId: item.id },
              })
            }
          >
            <Card.Title
              title={item.name}
              titleStyle={{ color: theme.colors.onSurface }}
              subtitle={item.location}
              subtitleStyle={{ color: theme.colors.onSurfaceVariant }}
            />
          </Card>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  shopItem: {
    marginBottom: 10,
    padding: 10,
  },
});
