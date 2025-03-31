import FontAwesome from "@expo/vector-icons/FontAwesome";
import { Tabs, useLocalSearchParams, useRouter } from "expo-router";
import { useTheme } from "react-native-paper";
import { goBackShopHome } from "../../../../../../apis/navigate.service";
import { AppBar } from "../../../../../../components/AppBar";

export default function TabLayout() {
  const { shopId } = useLocalSearchParams() as { shopId: string };
  const theme = useTheme();
  const router = useRouter();

  return (
    <>
      <AppBar
        title="Order Management"
        goBack={() => {
          goBackShopHome({ router, shopId });
        }}
      />
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarStyle: {
            backgroundColor: theme.colors.surface, // Use theme surface color
            borderTopWidth: 0, // Remove top border for a cleaner look
            elevation: 4, // Add shadow for depth
          },
          tabBarActiveTintColor: theme.colors.primary, // Highlight active tab
          tabBarInactiveTintColor: theme.colors.onSurfaceDisabled, // Subtle color for inactive tabs
        }}
      >
        <Tabs.Screen
          name="approve-order"
          options={{
            title: "Approve",
            tabBarIcon: ({ color }) => (
              <FontAwesome size={28} name="list" color={color} />
            ),
          }}
          initialParams={{ shopId }}
        />
        <Tabs.Screen
          name="index"
          options={{
            title: "Order",
            tabBarIcon: ({ color }) => (
              <FontAwesome size={28} name="home" color={color} />
            ),
          }}
          initialParams={{ shopId }}
        />
        <Tabs.Screen
          name="history"
          options={{
            title: "History",
            tabBarIcon: ({ color }) => (
              <FontAwesome size={28} name="history" color={color} />
            ),
          }}
          initialParams={{ shopId }}
        />

        {["create-order"].map((name) => (
          <Tabs.Screen
            key={name}
            name={name}
            options={{ href: null, tabBarStyle: { display: "none" } }}
          />
        ))}
      </Tabs>
    </>
  );
}
