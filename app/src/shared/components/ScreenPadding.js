import React from "react";
import { View, StyleSheet, Dimensions } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

/**
 * ScreenPadding component
 * Adds appropriate padding to the bottom of screens to account for the floating tab bar
 *
 * @param {Object} props
 * @param {React.ReactNode} props.children - The screen content
 * @param {Object} props.style - Additional styles for the container
 */
const ScreenPadding = ({ children, style }) => {
  const insets = useSafeAreaInsets();

  // Calculate the total height needed for the floating tab bar
  // 65px for the tab bar height + 10px for the bottom margin + safe area insets
  const tabBarHeight = 65 + 10 + (insets.bottom > 0 ? insets.bottom : 16);

  return (
    <View style={[styles.container, { paddingBottom: tabBarHeight }, style]}>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default ScreenPadding;
