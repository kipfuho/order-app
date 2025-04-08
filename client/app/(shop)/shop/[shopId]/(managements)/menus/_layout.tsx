import { Tabs, useLocalSearchParams } from "expo-router";
import { useTranslation } from "react-i18next";
import { Icon, useTheme } from "react-native-paper";

export default function TabLayout() {
  const { shopId } = useLocalSearchParams();
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
        name="dishes"
        options={{
          title: t("dish"),
          tabBarIcon: ({ color }) => (
            <Icon source="food" size={28} color={color} />
          ),
        }}
        initialParams={{ shopId }}
      />
      <Tabs.Screen
        name="categories"
        options={{
          title: t("dish_category"),
          tabBarIcon: ({ color }) => (
            <Icon source="view-list" size={28} color={color} />
          ),
        }}
        initialParams={{ shopId }}
      />
      {/* Hidden Screens */}
      {[
        "index",
        "create-dish",
        "create-dish-category",
        "update-dish/[dishId]",
        "update-dish-category/[dishCategoryId]",
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
