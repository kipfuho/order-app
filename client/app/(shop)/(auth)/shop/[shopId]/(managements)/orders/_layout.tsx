import { Tabs, useLocalSearchParams } from "expo-router";
import { Icon, useTheme } from "react-native-paper";

export default function TabLayout() {
  const { shopId } = useLocalSearchParams() as { shopId: string };
  const theme = useTheme();

  return (
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
            <Icon size={28} source="list" color={color} />
          ),
        }}
        initialParams={{ shopId }}
      />
      <Tabs.Screen
        name="index"
        options={{
          title: "Order",
          tabBarIcon: ({ color }) => (
            <Icon size={28} source="home" color={color} />
          ),
        }}
        initialParams={{ shopId }}
      />
      <Tabs.Screen
        name="history"
        options={{
          title: "History",
          tabBarIcon: ({ color }) => (
            <Icon size={28} source="history" color={color} />
          ),
        }}
        initialParams={{ shopId }}
      />

      {["table/[tableId]"].map((name) => (
        <Tabs.Screen
          key={name}
          name={name}
          options={{ href: null, tabBarStyle: { display: "none" } }}
        />
      ))}
    </Tabs>
  );
}
