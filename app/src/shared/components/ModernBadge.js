import React from "react";
import { View, Text, StyleSheet } from "react-native";
import modernTheme from "../styles/modernTheme";

/**
 * ModernBadge component
 * A component for displaying badges with various styles
 *
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Badge content
 * @param {string} props.variant - Badge variant ('solid', 'outline', 'subtle')
 * @param {string} props.color - Badge color ('primary', 'secondary', 'success', 'error', 'warning', 'info')
 * @param {string} props.size - Badge size ('sm', 'md', 'lg')
 * @param {boolean} props.pill - Whether badge has pill shape
 * @param {Object} props.style - Additional styles
 */
const ModernBadge = ({
  children,
  variant = "solid",
  color = "primary",
  size = "md",
  pill = false,
  style,
  ...props
}) => {
  // Define color styles
  const colorStyles = {
    primary: {
      background: modernTheme.colors.primary[500],
      text: modernTheme.colors.text.white,
      border: modernTheme.colors.primary[500],
      subtleBg: modernTheme.colors.primary[50],
      subtleText: modernTheme.colors.primary[700],
    },
    secondary: {
      background: modernTheme.colors.secondary[500],
      text: modernTheme.colors.text.white,
      border: modernTheme.colors.secondary[500],
      subtleBg: modernTheme.colors.secondary[50],
      subtleText: modernTheme.colors.secondary[700],
    },
    success: {
      background: modernTheme.colors.success.main,
      text: modernTheme.colors.text.white,
      border: modernTheme.colors.success.main,
      subtleBg: modernTheme.colors.success.light,
      subtleText: modernTheme.colors.success.dark,
    },
    error: {
      background: modernTheme.colors.error.main,
      text: modernTheme.colors.text.white,
      border: modernTheme.colors.error.main,
      subtleBg: modernTheme.colors.error.light,
      subtleText: modernTheme.colors.error.dark,
    },
    warning: {
      background: modernTheme.colors.warning.main,
      text: modernTheme.colors.text.white,
      border: modernTheme.colors.warning.main,
      subtleBg: modernTheme.colors.warning.light,
      subtleText: modernTheme.colors.warning.dark,
    },
    info: {
      background: modernTheme.colors.info.main,
      text: modernTheme.colors.text.white,
      border: modernTheme.colors.info.main,
      subtleBg: modernTheme.colors.info.light,
      subtleText: modernTheme.colors.info.dark,
    },
  };

  // Define size styles
  const sizeStyles = {
    sm: {
      paddingHorizontal: modernTheme.spacing.xs,
      paddingVertical: 2,
      fontSize: modernTheme.typography.fontSize.xs,
      borderRadius: pill ? 12 : modernTheme.borderRadius.xs,
    },
    md: {
      paddingHorizontal: modernTheme.spacing.sm,
      paddingVertical: 4,
      fontSize: modernTheme.typography.fontSize.sm,
      borderRadius: pill ? 16 : modernTheme.borderRadius.sm,
    },
    lg: {
      paddingHorizontal: modernTheme.spacing.md,
      paddingVertical: 6,
      fontSize: modernTheme.typography.fontSize.md,
      borderRadius: pill ? 20 : modernTheme.borderRadius.md,
    },
  };

  // Get current color and size styles
  const currentColor = colorStyles[color] || colorStyles.primary;
  const currentSize = sizeStyles[size] || sizeStyles.md;

  // Define variant styles
  const variantStyles = {
    solid: {
      backgroundColor: currentColor.background,
      borderColor: "transparent",
      color: currentColor.text,
    },
    outline: {
      backgroundColor: "transparent",
      borderColor: currentColor.border,
      borderWidth: 1,
      color: currentColor.border,
    },
    subtle: {
      backgroundColor: currentColor.subtleBg,
      borderColor: "transparent",
      color: currentColor.subtleText,
    },
  };

  // Get current variant styles
  const currentVariant = variantStyles[variant] || variantStyles.solid;

  return (
    <View
      style={[
        styles.badge,
        {
          backgroundColor: currentVariant.backgroundColor,
          borderColor: currentVariant.borderColor,
          borderWidth: currentVariant.borderWidth || 0,
          borderRadius: currentSize.borderRadius,
          paddingHorizontal: currentSize.paddingHorizontal,
          paddingVertical: currentSize.paddingVertical,
        },
        style,
      ]}
      {...props}
    >
      <Text
        style={[
          styles.text,
          {
            color: currentVariant.color,
            fontSize: currentSize.fontSize,
          },
        ]}
      >
        {children}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    alignSelf: "flex-start",
  },
  text: {
    fontWeight: modernTheme.typography.fontWeight.medium,
    textAlign: "center",
  },
});

export default ModernBadge;
