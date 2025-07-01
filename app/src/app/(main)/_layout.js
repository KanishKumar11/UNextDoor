import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../../shared/context/ThemeContext";

// Import our custom components
import FloatingTabBar from "../../shared/components/FloatingTabBar";
import ModernAppHeader from "../../shared/components/ModernAppHeader";

/**
 * Main tab navigation layout
 * This component defines the tab navigation structure for the main app
 */
export default function MainLayout() {
  const { theme, isDarkMode } = useTheme();

  return (
    <Tabs
      tabBar={(props) => <FloatingTabBar {...props} />}
      screenOptions={({ route }) => ({
        tabBarShowLabel: false,
        // Use custom header component
        header: () => (
          <ModernAppHeader showBackButton={route.name !== "index"} />
        ),
        // Wrap each screen in the ScreenPadding component
        contentStyle: {
          backgroundColor: isDarkMode
            ? theme.colors.background.default
            : theme.colors.background.paper,
        },
      })}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons
              name={focused ? "home" : "home-outline"}
              size={size}
              color={color}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="tutor/lessons"
        options={{
          title: "Lessons",
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons
              name={focused ? "book" : "book-outline"}
              size={size}
              color={color}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="marketplace"
        options={{
          title: "Explore",
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons
              name={focused ? "compass" : "compass-outline"}
              size={size}
              color={color}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons
              name={focused ? "person" : "person-outline"}
              size={size}
              color={color}
            />
          ),
        }}
      />

      {/* Hidden routes - these won't appear in the tab bar */}
      <Tabs.Screen
        name="tutor/conversations"
        options={{
          href: null, // Hide from tab bar - replaced by lessons
        }}
      />
      <Tabs.Screen
        name="tutor/progress"
        options={{
          href: null, // Hide from tab bar
        }}
      />
      <Tabs.Screen
        name="tutor/new"
        options={{
          href: null, // Hide from tab bar
        }}
      />
      <Tabs.Screen
        name="tutor/scenarios"
        options={{
          href: null, // Hide from tab bar
        }}
      />
      <Tabs.Screen
        name="tutor/conversation/[id]"
        options={{
          href: null, // Hide from tab bar
          headerShown: false, // Hide header for conversation screen
        }}
      />
      <Tabs.Screen
        name="tutor/conversation"
        options={{
          href: null, // Hide from tab bar
          headerShown: false, // Hide header for conversation screen
        }}
      />
      <Tabs.Screen
        name="tutor/custom"
        options={{
          href: null, // Hide from tab bar
        }}
      />
      <Tabs.Screen
        name="profile/edit"
        options={{
          href: null, // Hide from tab bar
        }}
      />
      <Tabs.Screen
        name="profile/notifications"
        options={{
          href: null, // Hide from tab bar
        }}
      />
      <Tabs.Screen
        name="profile/privacy"
        options={{
          href: null, // Hide from tab bar
        }}
      />
      <Tabs.Screen
        name="profile/help"
        options={{
          href: null, // Hide from tab bar
        }}
      />
      <Tabs.Screen
        name="profile/about"
        options={{
          href: null, // Hide from tab bar
        }}
      />
      <Tabs.Screen
        name="profile/settings"
        options={{
          href: null, // Hide from tab bar
        }}
      />
      <Tabs.Screen
        name="profile/theme"
        options={{
          href: null, // Hide from tab bar
        }}
      />
      <Tabs.Screen
        name="marketplace/category/[id]"
        options={{
          href: null, // Hide from tab bar
        }}
      />
      <Tabs.Screen
        name="marketplace/product/[id]"
        options={{
          href: null, // Hide from tab bar
        }}
      />
      <Tabs.Screen
        name="marketplace/new"
        options={{
          href: null, // Hide from tab bar
        }}
      />
      <Tabs.Screen
        name="notifications"
        options={{
          href: null, // Hide from tab bar
        }}
      />
      <Tabs.Screen
        name="realtime-conversation"
        options={{
          href: null, // Hide from tab bar
          headerShown: false, // Hide header for realtime conversation screen
        }}
      />
      <Tabs.Screen
        name="tutor/standalone"
        options={{
          href: null, // Hide from tab bar
          headerShown: false, // Hide header for standalone conversation screen
        }}
      />
      <Tabs.Screen
        name="tutor/module/[id]"
        options={{
          href: null, // Hide from tab bar
        }}
      />
      <Tabs.Screen
        name="tutor/lesson/[id]"
        options={{
          href: null, // Hide from tab bar
        }}
      />
    </Tabs>
  );
}
