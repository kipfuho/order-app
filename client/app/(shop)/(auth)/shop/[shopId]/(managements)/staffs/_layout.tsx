import { Tabs, useLocalSearchParams } from "expo-router";
import { useTranslation } from "react-i18next";
import { Icon, useTheme } from "react-native-paper";

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
        name="employees"
        options={{
          title: t("employee"),
          tabBarIcon: ({ color }) => (
            <Icon size={28} source="face-agent" color={color} />
          ),
        }}
        initialParams={{ shopId }}
      />
      <Tabs.Screen
        name="departments"
        options={{
          title: t("department"),
          tabBarIcon: ({ color }) => (
            <Icon size={28} source="home" color={color} />
          ),
        }}
        initialParams={{ shopId }}
      />
      <Tabs.Screen
        name="employee-positions"
        options={{
          title: t("employee_position"),
          tabBarIcon: ({ color }) => (
            <Icon size={28} source="history" color={color} />
          ),
        }}
        initialParams={{ shopId }}
      />

      {[
        "index",
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
