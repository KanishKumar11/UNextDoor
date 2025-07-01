import React from "react";
import { StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

/**
 * SafeAreaWrapper component
 * Adds safe area insets padding to screens and accounts for the floating tab bar
 * Note: Top insets are now handled by the ModernAppHeader component
 *
 * @param {Object} props
 * @param {React.ReactNode} props.children - The screen content
 * @param {Object} props.style - Additional styles for the container
 * @param {boolean} props.includeBottom - Whether to include bottom padding (default: true)
 * @param {boolean} props.includeTabBar - Whether to include extra padding for tab bar (default: true)
 */
const SafeAreaWrapper = ({
  children,
  style,
  includeBottom = true,
  includeTabBar = true,
  // includeTop is no longer used since the header handles top insets
}) => {
  const insets = useSafeAreaInsets();

  // Calculate the padding for the tab bar (if needed)
  // Floating tab bar height (65px) + margin (10px) + safe area padding
  const tabBarHeight = includeTabBar
    ? 65 + 10 + (insets.bottom > 0 ? insets.bottom : 16)
    : 0;

  // Calculate the padding values
  // We set paddingTop to 0 because the header already handles the top inset
  const paddingTop = 0; // The header component handles top insets
  const paddingBottom = includeBottom ? tabBarHeight : 0;
  const paddingLeft = insets.left;
  const paddingRight = insets.right;

  return (
    <View
      style={[
        styles.container,
        {
          paddingTop,
          // paddingBottom,
          paddingLeft,
          paddingRight,
        },
        style,
      ]}
    >
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default SafeAreaWrapper;
