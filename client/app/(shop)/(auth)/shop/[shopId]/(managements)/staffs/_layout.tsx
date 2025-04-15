import FontAwesome from "@expo/vector-icons/FontAwesome";
import { Tabs, useLocalSearchParams } from "expo-router";
import { useTranslation } from "react-i18next";
import { useTheme } from "react-native-paper";

export default function StaffTabLayout() {
  const { shopId } = useLocalSearchParams() as { shopId: string };
  const theme = useTheme();
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
      <Tabs.Screen
        name="index"
        options={{
          title: t("employee"),
          tabBarIcon: ({ color }) => (
            <FontAwesome size={28} name="list" color={color} />
          ),
        }}
        initialParams={{ shopId }}
      />
      <Tabs.Screen
        name="departments"
        options={{
          title: t("department"),
          tabBarIcon: ({ color }) => (
            <FontAwesome size={28} name="home" color={color} />
          ),
        }}
        initialParams={{ shopId }}
      />
      <Tabs.Screen
        name="employee-positions"
        options={{
          title: t("employee_position"),
          tabBarIcon: ({ color }) => (
            <FontAwesome size={28} name="history" color={color} />
          ),
        }}
        initialParams={{ shopId }}
      />

      {[
        "create-employee",
        "create-employee-position",
        "create-department",
        "update-employee/[employeeId]",
        "update-employee-position/[employeePositionId]",
        "update-department/[departmentId]",
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
