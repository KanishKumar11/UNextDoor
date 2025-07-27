import React from "react";
import { View, StyleSheet, TouchableOpacity } from "react-native";
import modernTheme from "../styles/modernTheme";
import { BRAND_COLORS, BORDER_COLORS } from "../constants/colors";

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
  // Define variant styles with Miles-inspired colors
  const variantStyles = {
    default: {
      backgroundColor: BRAND_COLORS.CARD_BACKGROUND, // Using constant for card background
      borderWidth: 0,
      ...modernTheme.shadows.sm,
    },
    outlined: {
      backgroundColor: BRAND_COLORS.CARD_BACKGROUND, // Using constant for card background
      borderWidth: 1,
      borderColor: BORDER_COLORS.DARK, // Using constant for border
      ...modernTheme.shadows.none,
    },
    elevated: {
      backgroundColor: BRAND_COLORS.CARD_BACKGROUND, // Using constant for card background
      borderWidth: 0,
      ...modernTheme.shadows.md,
    },
    flat: {
      backgroundColor: BRAND_COLORS.CARD_BACKGROUND, // Using constant for card background
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
    backgroundColor: BRAND_COLORS.DEEP_PURPLE, // Using constant for card background
  },
  interactive: {
    // Additional styles for interactive cards
  },
});

export default ModernCard;
