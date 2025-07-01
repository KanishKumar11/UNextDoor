import React from "react";
import {
  View,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  Platform,
} from "react-native";
import modernTheme from "../../styles/modernTheme";

/**
 * Container component
 * A layout component that provides consistent container styling with safe area handling
 *
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Container content
 * @param {boolean} props.useSafeArea - Whether to use SafeAreaView
 * @param {string} props.backgroundColor - Background color
 * @param {boolean} props.withPadding - Whether to add padding
 * @param {string} props.statusBarStyle - Status bar style ('light-content', 'dark-content')
 * @param {Object} props.style - Additional styles
 */
const Container = ({
  children,
  useSafeArea = true,
  backgroundColor = modernTheme.colors.background.default,
  withPadding = false,
  statusBarStyle = "dark-content",
  style,
  ...props
}) => {
  // Base container styles
  const containerStyles = [
    styles.container,
    { backgroundColor },
    withPadding && styles.withPadding,
    style,
  ];

  // Render with SafeAreaView if needed
  if (useSafeArea) {
    return (
      <SafeAreaView style={[styles.safeArea, { backgroundColor }]} {...props}>
        <StatusBar
          barStyle={statusBarStyle}
          backgroundColor={backgroundColor}
        />
        <View style={containerStyles}>{children}</View>
      </SafeAreaView>
    );
  }

  // Render without SafeAreaView
  return (
    <View style={containerStyles} {...props}>
      <StatusBar barStyle={statusBarStyle} backgroundColor={backgroundColor} />
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  withPadding: {
    padding: modernTheme.spacing.lg,
  },
});

export default Container;
