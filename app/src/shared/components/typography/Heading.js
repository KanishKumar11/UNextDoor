import React from "react";
import { Text, StyleSheet } from "react-native";
import modernTheme from "../../styles/modernTheme";

/**
 * Heading component
 * A typography component for headings with consistent styling
 *
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Heading content
 * @param {string} props.level - Heading level ('h1', 'h2', 'h3', 'h4', 'h5', 'h6')
 * @param {string} props.color - Text color (from theme or custom)
 * @param {string} props.align - Text alignment ('left', 'center', 'right')
 * @param {boolean} props.gutterBottom - Whether to add bottom margin
 * @param {Object} props.style - Additional styles
 */
const Heading = ({
  children,
  level = "h1",
  color,
  align,
  gutterBottom = false,
  style,
  ...props
}) => {
  // Define heading styles by level
  const headingStyles = {
    h1: {
      fontSize: modernTheme.typography.fontSize["3xl"],
      fontFamily: modernTheme.typography.fontFamily.bold,
      lineHeight:
        modernTheme.typography.lineHeight.xs *
        modernTheme.typography.fontSize["3xl"],
      marginBottom: gutterBottom ? modernTheme.spacing.md : 0,
      ...(typeof window !== "undefined" && { fontWeight: "700" }), // Only for web
    },
    h2: {
      fontSize: modernTheme.typography.fontSize["2xl"],
      fontFamily: modernTheme.typography.fontFamily.bold,
      lineHeight:
        modernTheme.typography.lineHeight.xs *
        modernTheme.typography.fontSize["2xl"],
      marginBottom: gutterBottom ? modernTheme.spacing.sm : 0,
      ...(typeof window !== "undefined" && { fontWeight: "700" }), // Only for web
    },
    h3: {
      fontSize: modernTheme.typography.fontSize.xl,
      fontFamily: modernTheme.typography.fontFamily.semibold,
      lineHeight:
        modernTheme.typography.lineHeight.sm *
        modernTheme.typography.fontSize.xl,
      marginBottom: gutterBottom ? modernTheme.spacing.sm : 0,
      ...(typeof window !== "undefined" && { fontWeight: "600" }), // Only for web
    },
    h4: {
      fontSize: modernTheme.typography.fontSize.lg,
      fontFamily: modernTheme.typography.fontFamily.semibold,
      lineHeight:
        modernTheme.typography.lineHeight.sm *
        modernTheme.typography.fontSize.lg,
      marginBottom: gutterBottom ? modernTheme.spacing.xs : 0,
      ...(typeof window !== "undefined" && { fontWeight: "600" }), // Only for web
    },
    h5: {
      fontSize: modernTheme.typography.fontSize.md,
      fontFamily: modernTheme.typography.fontFamily.semibold,
      lineHeight:
        modernTheme.typography.lineHeight.md *
        modernTheme.typography.fontSize.md,
      marginBottom: gutterBottom ? modernTheme.spacing.xs : 0,
      ...(typeof window !== "undefined" && { fontWeight: "600" }), // Only for web
    },
    h6: {
      fontSize: modernTheme.typography.fontSize.sm,
      fontFamily: modernTheme.typography.fontFamily.semibold,
      lineHeight:
        modernTheme.typography.lineHeight.md *
        modernTheme.typography.fontSize.sm,
      marginBottom: gutterBottom ? modernTheme.spacing.xs : 0,
      ...(typeof window !== "undefined" && { fontWeight: "600" }), // Only for web
    },
  };

  // Get base styles from level
  const baseStyles = {
    ...(headingStyles[level] || headingStyles.h1),
    color: modernTheme.colors.text.primary,
  };

  // Override with props if provided
  if (color) {
    // Handle theme colors or custom colors
    if (typeof color === "string" && color.includes(".")) {
      // Handle nested theme colors like 'primary.500'
      const [colorCategory, colorShade] = color.split(".");
      baseStyles.color =
        modernTheme.colors[colorCategory]?.[colorShade] || color;
    } else {
      baseStyles.color = modernTheme.colors.text[color] || color;
    }
  }

  if (align) {
    baseStyles.textAlign = align;
  }

  return (
    <Text style={[baseStyles, style]} {...props}>
      {children}
    </Text>
  );
};

export default Heading;
