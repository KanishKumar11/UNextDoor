import React from "react";
import { View, TouchableOpacity, StyleSheet, Dimensions } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Animated, {
  useAnimatedStyle,
  withSpring,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "../context/ThemeContext";
import { BlurView } from "expo-blur";
import { BRAND_COLORS } from "../constants/colors";

const { width } = Dimensions.get("window");

/**
 * FloatingTabBar component
 * A modern, floating tab bar with animated indicators and icon-only tabs
 *
 * This component only shows tabs for routes that have a tabBarIcon defined
 * and don't have tabBarVisible set to false. This allows for routes to be
 * defined in the navigation structure without appearing in the tab bar.
 *
 * @param {Object} props - Component props
 * @param {Object} props.state - Navigation state
 * @param {Object} props.descriptors - Navigation descriptors
 * @param {Object} props.navigation - Navigation object
 */
const FloatingTabBar = ({ state, descriptors, navigation }) => {
  const { theme, isDarkMode } = useTheme();
  const insets = useSafeAreaInsets();

  // Filter routes to only include those that should be shown in the tab bar
  const tabRoutes = state.routes.filter((route) => {
    const { options } = descriptors[route.key];
    // Only include routes that have tabBarIcon defined and don't have tabBarVisible set to false
    return options.tabBarIcon && options.tabBarVisible !== false;
  });

  // Calculate the actual container width (92% of screen width)
  const CONTAINER_WIDTH = width * 0.92;

  // Calculate tab width based on container width and number of tab routes
  const TAB_WIDTH = CONTAINER_WIDTH / tabRoutes.length;

  // Find the active tab index in our filtered tabRoutes
  const activeTabIndex = tabRoutes.findIndex(
    (route) => route.key === state.routes[state.index].key
  );

  // Animated style for the indicator
  const indicatorStyle = useAnimatedStyle(() => {
    // Safety check: if activeTabIndex is -1, hide the indicator
    if (activeTabIndex === -1) {
      return {
        opacity: 0,
        transform: [{ translateX: 0 }],
      };
    }

    // Alternative approach: Calculate based on screen percentage
    // Since container is 92% of screen width, and we have equal distribution
    const screenWidth = width;
    const containerWidth = screenWidth * 0.9;
    const tabWidth = containerWidth / tabRoutes.length;

    // Center of tab = left edge of tab + half tab width
    // Left edge of tab = tabIndex * tabWidth
    const tabCenter = activeTabIndex * tabWidth + tabWidth / 2;

    // Subtract half indicator width to center the indicator on the tab
    const indicatorPosition = tabCenter - 18; // 10 = half of 20px indicator width

    return {
      opacity: 1,
      transform: [
        {
          translateX: withSpring(indicatorPosition, {
            damping: 20,
            stiffness: 200,
          }),
        },
      ],
    };
  });

  // Animated styles for each tab icon
  const getTabAnimatedStyle = (index) => {
    return useAnimatedStyle(() => {
      const isActive = index === activeTabIndex;
      return {
        transform: [
          {
            scale: withSpring(isActive ? 1.1 : 1, {
              damping: 15,
              stiffness: 200,
            }),
          },
        ],
        opacity: withSpring(isActive ? 1 : 0.7, {
          damping: 15,
          stiffness: 200,
        }),
      };
    });
  };

  return (
    <View
      style={[
        styles.container,
        {
          paddingBottom: Math.max(insets.bottom, 16), // Ensure minimum 16px padding
          paddingLeft: Math.max(insets.left, 8), // Ensure minimum 8px side padding
          paddingRight: Math.max(insets.right, 8), // Ensure minimum 8px side padding
        },
      ]}
    >
      <BlurView
        intensity={isDarkMode ? 70 : 80} // Adjusted intensity for better visibility
        tint={isDarkMode ? "dark" : "light"}
        style={[
          styles.tabBarContainer,
          {
            shadowColor: isDarkMode ? "#000" : "rgba(0, 0, 0, 0.1)",
            backgroundColor: isDarkMode
              ? "rgba(30, 30, 30, 0.85)" // Increased opacity for dark mode
              : "rgba(255, 255, 255, 0.85)", // Increased opacity for light mode
          },
        ]}
      >
        {/* Animated indicator - positioned absolutely */}
        <Animated.View style={[styles.indicatorContainer, indicatorStyle]}>
          <View
            style={[
              styles.indicator,
              {
                backgroundColor:
                  theme.colors.explorerTeal ||
                  BRAND_COLORS.EXPLORER_TEAL,
              },
            ]}
          />
        </Animated.View>

        {/* Tab buttons */}
        {tabRoutes.map((route, index) => {
          const { options } = descriptors[route.key];
          const isFocused = route.key === state.routes[state.index].key;

          // Get icon name from options
          const iconName = options.tabBarIcon
            ? options.tabBarIcon({
              color: "transparent",
              size: 24,
              focused: isFocused,
            }).props.name
            : "help-circle-outline";

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
              style={styles.tabButton}
            >
              <Animated.View
                style={[styles.iconContainer, getTabAnimatedStyle(index)]}
              >
                <Ionicons
                  name={iconName}
                  size={24}
                  color={
                    isFocused
                      ? theme.colors.brandGreen ||
                      theme.colors.primary?.[500] ||
                      BRAND_COLORS.EXPLORER_TEAL
                      : isDarkMode
                        ? theme.colors.neutral?.[400] || "#9CA3AF"
                        : theme.colors.neutral?.[500] || "#6B7280"
                  }
                />
              </Animated.View>
            </TouchableOpacity>
          );
        })}
      </BlurView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    bottom: 0,
    left: 0,
    backgroundColor: "#ffffff00",
    right: 0,
    alignItems: "center",
  },
  tabBarContainer: {
    flexDirection: "row",
    height: 65,
    width: "92%",
    borderRadius: 30,
    marginBottom: 5,
    position: "relative",
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.35, // Increased shadow opacity
    shadowRadius: 16, // Increased shadow radius
    elevation: 15, // Increased elevation for Android
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.3)", // More visible border
    overflow: "hidden", // Important for the blur effect
  },
  indicatorContainer: {
    position: "absolute",
    bottom: 6,
    left: 0, // Start from the left edge of the container
    zIndex: 2,
    alignItems: "center",
    justifyContent: "center",
  },
  indicator: {
    width: 32,
    height: 3,
    borderRadius: 3,
  },
  tabButton: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1,
    paddingVertical: 8,
  },
  iconContainer: {
    width: 40, // Reduced size
    height: 40, // Reduced size
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 20, // Match half of width/height for perfect circle
    marginBottom: 0, // Removed margin
  },
});

export default FloatingTabBar;
