import React from "react";
import { Text as RNText, Platform } from "react-native";
import modernTheme from "../../styles/modernTheme";

/**
 * Text component
 * A typography component for consistent text styling
 *
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Text content
 * @param {string} props.variant - Text variant ('body', 'caption', 'label', 'hint')
 * @param {string} props.size - Text size ('xs', 'sm', 'md', 'lg', 'xl', '2xl', '3xl')
 * @param {string} props.weight - Text weight ('light', 'regular', 'medium', 'semibold', 'bold')
 * @param {string} props.color - Text color (from theme or custom)
 * @param {string} props.align - Text alignment ('left', 'center', 'right')
 * @param {boolean} props.italic - Whether text is italic
 * @param {boolean} props.underline - Whether text is underlined
 * @param {boolean} props.strikethrough - Whether text has strikethrough
 * @param {number} props.lineHeight - Custom line height
 * @param {Object} props.style - Additional styles
 */
const Text = ({
  children,
  variant = "body",
  size,
  weight,
  color,
  align,
  italic = false,
  underline = false,
  strikethrough = false,
  lineHeight,
  style,
  ...props
}) => {
  // Define variant styles
  const variantStyles = {
    body: {
      fontSize: modernTheme.typography.fontSize.md,
      fontWeight: modernTheme.typography.fontWeight.regular,
      color: modernTheme.colors.text.primary,
      lineHeight:
        modernTheme.typography.lineHeight.md *
        modernTheme.typography.fontSize.md,
    },
    caption: {
      fontSize: modernTheme.typography.fontSize.sm,
      fontWeight: modernTheme.typography.fontWeight.regular,
      color: modernTheme.colors.text.secondary,
      lineHeight:
        modernTheme.typography.lineHeight.md *
        modernTheme.typography.fontSize.sm,
    },
    label: {
      fontSize: modernTheme.typography.fontSize.sm,
      fontWeight: modernTheme.typography.fontWeight.medium,
      color: modernTheme.colors.text.primary,
      lineHeight:
        modernTheme.typography.lineHeight.md *
        modernTheme.typography.fontSize.sm,
    },
    hint: {
      fontSize: modernTheme.typography.fontSize.xs,
      fontWeight: modernTheme.typography.fontWeight.regular,
      color: modernTheme.colors.text.hint,
      lineHeight:
        modernTheme.typography.lineHeight.md *
        modernTheme.typography.fontSize.xs,
    },
  };

  // Get base styles from variant
  const baseStyles = variantStyles[variant] || variantStyles.body;

  // Override with props if provided
  if (size) {
    baseStyles.fontSize =
      typeof size === "string"
        ? modernTheme.typography.fontSize[size] ||
          modernTheme.typography.fontSize.md
        : size;
  }

  if (weight) {
    // Map weight to appropriate font family - no fontWeight needed for individual files
    const weightMapping = {
      light: modernTheme.typography.fontFamily.light,
      regular: modernTheme.typography.fontFamily.regular,
      medium: modernTheme.typography.fontFamily.medium,
      semibold: modernTheme.typography.fontFamily.semibold,
      bold: modernTheme.typography.fontFamily.bold,
      extrabold: modernTheme.typography.fontFamily.extrabold,
    };

    baseStyles.fontFamily = weightMapping[weight] || weightMapping.regular;

    // Only set fontWeight for web compatibility
    if (typeof window !== "undefined") {
      const webWeightMapping = {
        light: "300",
        regular: "400",
        medium: "500",
        semibold: "600",
        bold: "700",
        extrabold: "800",
      };
      baseStyles.fontWeight =
        webWeightMapping[weight] || webWeightMapping.regular;
    }
  } else {
    // Default to regular Montserrat
    baseStyles.fontFamily = modernTheme.typography.fontFamily.regular;
    if (typeof window !== "undefined") {
      baseStyles.fontWeight = modernTheme.typography.fontWeight.regular;
    }
  }

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

  if (italic) {
    baseStyles.fontStyle = "italic";
  }

  if (underline) {
    baseStyles.textDecorationLine = "underline";
  }

  if (strikethrough) {
    baseStyles.textDecorationLine = underline
      ? "underline line-through"
      : "line-through";
  }

  if (lineHeight) {
    baseStyles.lineHeight = lineHeight;
  }

  return (
    <RNText style={[baseStyles, style]} {...props}>
      {children}
    </RNText>
  );
};

export default Text;
