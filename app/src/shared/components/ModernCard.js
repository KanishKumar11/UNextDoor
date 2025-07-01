import React from "react";
import { View, StyleSheet, TouchableOpacity } from "react-native";
import modernTheme from "../styles/modernTheme";

/**
 * ModernCard component
 * A card component with modern styling, supporting various appearances
 *
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Card content
 * @param {string} props.variant - Card variant (default, outlined, elevated)
 * @param {string} props.color - Background color (from theme or custom)
 * @param {boolean} props.interactive - Whether the card is interactive (touchable)
 * @param {Function} props.onPress - Function to call when card is pressed
 * @param {Object} props.style - Additional styles to apply
 */
const ModernCard = ({
  children,
  variant = "default",
  color,
  interactive = false,
  onPress,
  style,
  ...props
}) => {
  // Define variant styles
  const variantStyles = {
    default: {
      backgroundColor: modernTheme.colors.background.paper,
      borderWidth: 0,
      ...modernTheme.shadows.sm,
    },
    outlined: {
      backgroundColor: modernTheme.colors.background.paper,
      borderWidth: 1,
      borderColor: modernTheme.colors.neutral[200],
      ...modernTheme.shadows.none,
    },
    elevated: {
      backgroundColor: modernTheme.colors.background.paper,
      borderWidth: 0,
      ...modernTheme.shadows.md,
    },
    flat: {
      backgroundColor: modernTheme.colors.background.card,
      borderWidth: 0,
      ...modernTheme.shadows.none,
    },
  };

  // Get current variant styles
  const currentVariant = variantStyles[variant] || variantStyles.default;

  // Apply custom background color if provided
  if (color) {
    currentVariant.backgroundColor = color;
  }

  // Combine styles
  const cardStyles = [
    styles.card,
    currentVariant,
    interactive && styles.interactive,
    style,
  ];

  // Render touchable card if interactive
  if (interactive) {
    return (
      <TouchableOpacity
        style={cardStyles}
        onPress={onPress}
        activeOpacity={0.7}
        {...props}
      >
        {children}
      </TouchableOpacity>
    );
  }

  // Render regular card
  return (
    <View style={cardStyles} {...props}>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: modernTheme.borderRadius.lg,
    padding: modernTheme.spacing.md,
    marginVertical: modernTheme.spacing.sm,
  },
  interactive: {
    // Additional styles for interactive cards
  },
});

export default ModernCard;
