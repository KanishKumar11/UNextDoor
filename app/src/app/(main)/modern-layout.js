import { View, StyleSheet, TouchableOpacity } from "react-native";
import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../../shared/context/ThemeContext";
import { Text } from "../../shared/components/typography";

/**
 * ModernTabBar component
 * A custom tab bar with modern styling
 *
 * @param {Object} props - Component props from Tabs.Navigator
 */
function ModernTabBar({ state, descriptors, navigation }) {
  const { theme } = useTheme();

  return (
    <View
      style={[
        styles.tabBar,
        { backgroundColor: theme.colors.background.paper },
      ]}
    >
      {state.routes.map((route, index) => {
        const { options } = descriptors[route.key];
        const label = options.tabBarLabel || options.title || route.name;
        const isFocused = state.index === index;

        // Get icon name based on route
        const getIconName = () => {
          switch (route.name) {
            case "index":
              return isFocused ? "home" : "home-outline";
            case "tutor":
              return isFocused ? "school" : "school-outline";
            case "marketplace":
              return isFocused ? "cart" : "cart-outline";
            case "profile":
              return isFocused ? "person" : "person-outline";
            default:
              return isFocused ? "apps" : "apps-outline";
          }
        };

        // Handle tab press
        const onPress = () => {
          const event = navigation.emit({
            type: "tabPress",
            target: route.key,
            canPreventDefault: true,
          });

          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name);
          }
        };

        // Handle tab long press
        const onLongPress = () => {
          navigation.emit({
            type: "tabLongPress",
            target: route.key,
          });
        };

        return (
          <TouchableOpacity
            key={route.key}
            accessibilityRole="button"
            accessibilityState={isFocused ? { selected: true } : {}}
            accessibilityLabel={options.tabBarAccessibilityLabel}
            testID={options.tabBarTestID}
            onPress={onPress}
            onLongPress={onLongPress}
            style={styles.tabItem}
            activeOpacity={0.7}
          >
            <View style={styles.tabItemContent}>
              <Ionicons
                name={getIconName()}
                size={24}
                color={
                  isFocused
                    ? theme.colors.primary[500]
                    : theme.colors.neutral[400]
                }
              />

              <Text
                variant={isFocused ? "label" : "caption"}
                color={
                  isFocused
                    ? theme.colors.primary[500]
                    : theme.colors.text.secondary
                }
                style={styles.tabLabel}
              >
                {label}
              </Text>

              {isFocused && (
                <View
                  style={[
                    styles.activeIndicator,
                    { backgroundColor: theme.colors.primary[500] },
                  ]}
                />
              )}
            </View>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

/**
 * ModernLayout component
 * A modern tab navigation layout for the main app
 */
export default function ModernLayout() {
  const { theme } = useTheme();

  return (
    <Tabs
      tabBar={(props) => <ModernTabBar {...props} />}
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          display: "none", // Hide the default tab bar
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
        }}
      />

      <Tabs.Screen
        name="tutor"
        options={{
          title: "AI Tutor",
        }}
      />

      <Tabs.Screen
        name="marketplace"
        options={{
          title: "Marketplace",
        }}
      />

      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    flexDirection: "row",
    height: 60,
    borderTopWidth: 1,
    borderTopColor: "rgba(0, 0, 0, 0.1)",
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
  },
  tabItem: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  tabItemContent: {
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    height: "100%",
  },
  tabLabel: {
    marginTop: 2,
    fontSize: 12,
  },
  activeIndicator: {
    position: "absolute",
    top: 0,
    width: 20,
    height: 3,
    borderBottomLeftRadius: 4,
    borderBottomRightRadius: 4,
  },
});
