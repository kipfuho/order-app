import FontAwesome from "@expo/vector-icons/FontAwesome";
import { Tabs, useLocalSearchParams } from "expo-router";
import { useTheme } from "react-native-paper";

export default function TablesTabLayout() {
  const { shopId } = useLocalSearchParams();
  const theme = useTheme(); // Get the theme from Paper

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
      {/* Tables List */}
      <Tabs.Screen
        name="index"
        options={{
          title: "Bàn",
          tabBarIcon: ({ color }) => (
            <FontAwesome size={24} name="list" color={color} />
          ),
        }}
        initialParams={{ shopId }}
      />

      {/* Table Positions */}
      <Tabs.Screen
        name="table-position"
        options={{
          title: "Khu vực",
          tabBarIcon: ({ color }) => (
            <FontAwesome size={24} name="home" color={color} />
          ),
        }}
        initialParams={{ shopId }}
      />

      {/* Hidden Screens */}
      {[
        "create-table-position",
        "create-table",
        "update-table/[tableId]",
        "update-table-position/[tablePositionId]",
      ].map((name) => (
        <Tabs.Screen
          key={name}
          name={name}
          options={{ href: null, tabBarStyle: { display: "none" } }}
        />
      ))}
    </Tabs>
  );
}
