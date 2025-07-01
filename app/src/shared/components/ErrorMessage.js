import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import modernTheme from "../styles/modernTheme";

/**
 * Error message component for displaying errors consistently across the app
 * Following UNextDoor brand guidelines with Montserrat fonts and brand colors
 * @param {Object} props - Component props
 * @param {string} props.error - Error message to display
 * @param {Object} props.style - Additional container style
 * @param {boolean} props.showIcon - Whether to show error icon (default: true)
 * @param {string} props.type - Error type ('error', 'warning', 'info') (default: 'error')
 * @returns {React.ReactNode} ErrorMessage component
 */
const ErrorMessage = ({ error, style, showIcon = true, type = "error" }) => {
  if (!error) return null;

  // Define styles based on type following brand guidelines with proper contrast
  const typeStyles = {
    error: {
      backgroundColor: "#FFEBEE", // Very light red background for better contrast
      borderColor: modernTheme.colors.error.main,
      iconColor: modernTheme.colors.error.dark,
      textColor: modernTheme.colors.error.dark, // Dark red text for better readability
      icon: "alert-circle-outline",
    },
    warning: {
      backgroundColor: "#FFF8E1", // Very light orange background for better contrast
      borderColor: modernTheme.colors.warning.main,
      iconColor: modernTheme.colors.warning.dark,
      textColor: modernTheme.colors.warning.dark, // Dark orange text for better readability
      icon: "warning-outline",
    },
    info: {
      backgroundColor: "#E3F2FD", // Very light blue background for better contrast
      borderColor: modernTheme.colors.info.main,
      iconColor: modernTheme.colors.info.dark,
      textColor: modernTheme.colors.info.dark, // Dark blue text for better readability
      icon: "information-circle-outline",
    },
  };

  const currentType = typeStyles[type] || typeStyles.error;

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: currentType.backgroundColor,
          borderColor: currentType.borderColor,
        },
        style,
      ]}
    >
      {showIcon && (
        <Ionicons
          name={currentType.icon}
          size={20}
          color={currentType.iconColor}
          style={styles.icon}
        />
      )}
      <Text style={[styles.text, { color: currentType.textColor }]}>
        {error}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    padding: modernTheme.spacing.md,
    borderRadius: modernTheme.borderRadius.md,
    borderWidth: 1,
    marginBottom: modernTheme.spacing.sm,
  },
  icon: {
    marginRight: modernTheme.spacing.sm,
  },
  text: {
    flex: 1,
    fontFamily: modernTheme.typography.fontFamily.regular,
    fontSize: modernTheme.typography.fontSize.sm,
    fontWeight: modernTheme.typography.fontWeight.regular,
    lineHeight: modernTheme.typography.fontSize.sm * 1.4,
  },
});

export default ErrorMessage;
