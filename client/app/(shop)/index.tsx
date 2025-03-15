import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { useSession } from "../../hooks/useSession";
import { RootState } from "../../stores/store";
import { queryShopsRequest } from "../../api/api.service";
import { useRouter } from "expo-router";
import { styles } from "../_layout";

export default function ShopsPage() {
  const { session } = useSession();
  const shops = useSelector((state: RootState) => state.shop.shops);
  const [loading, setLoading] = useState(true);
  const dispatch = useDispatch();
  const router = useRouter();

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
    return <ActivityIndicator size="large" style={styles.loader} />;
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Shops</Text>
        <TouchableOpacity
          style={styles.createButton}
          onPress={() => router.push("/create-shop")}
        >
          <Text style={styles.createButtonText}>Create Shop</Text>
        </TouchableOpacity>
      </View>
      <FlatList
        data={shops}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.shopItem}
            onPress={() =>
              router.push({
                pathname: "/shop/[shopId]/home",
                params: {
                  shopId: item.id,
                },
              })
            } // Navigate to shop details
          >
            <Text style={styles.shopName}>{item.name}</Text>
            <Text style={styles.shopDetails}>{item.location}</Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}
