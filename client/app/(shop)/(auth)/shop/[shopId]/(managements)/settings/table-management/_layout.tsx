import { Tabs, useLocalSearchParams } from "expo-router";
import { useTranslation } from "react-i18next";
import { Icon, useTheme } from "react-native-paper";

export default function TablesTabLayout() {
  const { shopId } = useLocalSearchParams();
  const theme = useTheme(); // Get the theme from Paper
  const { t } = useTranslation();

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
        name="tables"
        options={{
          title: t("table"),
          tabBarIcon: ({ color }) => (
            <Icon size={24} source="list" color={color} />
          ),
        }}
        initialParams={{ shopId }}
      />

      {/* Table Positions */}
      <Tabs.Screen
        name="table-positions"
        options={{
          title: t("table_position"),
          tabBarIcon: ({ color }) => (
            <Icon size={24} source="home" color={color} />
          ),
        }}
        initialParams={{ shopId }}
      />

      {/* Hidden Screens */}
      {[
        "index",
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
