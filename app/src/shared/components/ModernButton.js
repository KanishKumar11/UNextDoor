import React from "react";
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  View,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import modernTheme from "../styles/modernTheme";
import { useResponsiveFonts } from "../hooks/useResponsiveFonts";

/**
 * ModernButton component
 * A button component with modern styling, supporting various appearances
 *
 * @param {Object} props - Component props
 * @param {string} props.text - Button text
 * @param {Function} props.onPress - Button press handler
 * @param {boolean} props.isLoading - Is button loading
 * @param {boolean} props.isDisabled - Is button disabled
 * @param {string} props.variant - Button variant (solid, outline, ghost, text)
 * @param {string} props.color - Button color (primary, secondary, accent, success, error, warning)
 * @param {string} props.size - Button size (sm, md, lg)
 * @param {string} props.iconName - Ionicons icon name
 * @param {string} props.iconPosition - Icon position (left, right)
 * @param {Object} props.style - Additional styles
 */
const ModernButton = ({
  text,
  onPress,
  isLoading = false,
  isDisabled = false,
  variant = "solid",
  color = "primary",
  size = "md",
  iconName,
  iconPosition = "left",
  style,
  ...props
}) => {
  // Get responsive font sizes
  const fonts = useResponsiveFonts();
  // Define color styles
  const colorStyles = {
    primary: {
      backgroundColor: modernTheme.colors.primary[500],
      borderColor: modernTheme.colors.primary[500],
      textColor: modernTheme.colors.text.white,
      pressedColor: modernTheme.colors.primary[600],
      ghostColor: modernTheme.colors.primary[500],
    },
    secondary: {
      backgroundColor: modernTheme.colors.secondary[500],
      borderColor: modernTheme.colors.secondary[500],
      textColor: modernTheme.colors.text.white,
      pressedColor: modernTheme.colors.secondary[600],
      ghostColor: modernTheme.colors.secondary[500],
    },
    accent: {
      backgroundColor: modernTheme.colors.accent[500],
      borderColor: modernTheme.colors.accent[500],
      textColor: modernTheme.colors.text.white,
      pressedColor: modernTheme.colors.accent[600],
      ghostColor: modernTheme.colors.accent[500],
    },
    success: {
      backgroundColor: modernTheme.colors.success.main,
      borderColor: modernTheme.colors.success.main,
      textColor: modernTheme.colors.text.white,
      pressedColor: modernTheme.colors.success.dark,
      ghostColor: modernTheme.colors.success.main,
    },
    error: {
      backgroundColor: modernTheme.colors.error.main,
      borderColor: modernTheme.colors.error.main,
      textColor: modernTheme.colors.text.white,
      pressedColor: modernTheme.colors.error.dark,
      ghostColor: modernTheme.colors.error.main,
    },
    warning: {
      backgroundColor: modernTheme.colors.warning.main,
      borderColor: modernTheme.colors.warning.main,
      textColor: modernTheme.colors.text.white,
      pressedColor: modernTheme.colors.warning.dark,
      ghostColor: modernTheme.colors.warning.main,
    },
  };

  // Define variant styles
  const variantStyles = {
    solid: (colorStyle) => ({
      backgroundColor: colorStyle.backgroundColor,
      borderColor: colorStyle.borderColor,
      textColor: colorStyle.textColor,
    }),
    outline: (colorStyle) => ({
      backgroundColor: "transparent",
      borderColor: colorStyle.borderColor,
      textColor: colorStyle.ghostColor,
    }),
    ghost: (colorStyle) => ({
      backgroundColor: "transparent",
      borderColor: "transparent",
      textColor: colorStyle.ghostColor,
    }),
    text: (colorStyle) => ({
      backgroundColor: "transparent",
      borderColor: "transparent",
      textColor: colorStyle.ghostColor,
    }),
  };

  // Define size styles with responsive font sizes and optimal readability
  const sizeStyles = {
    sm: {
      paddingVertical: 6,
      paddingHorizontal: 10,
      fontSize: fonts.button.small,
      minHeight: 36,
      iconSize: Math.max(16, fonts.button.small - 2),
    },
    md: {
      paddingVertical: 8,
      paddingHorizontal: 12,
      fontSize: fonts.button.medium,
      minHeight: 44,
      iconSize: Math.max(18, fonts.button.medium),
    },
    lg: {
      paddingVertical: 10,
      paddingHorizontal: 16,
      fontSize: fonts.button.large,
      minHeight: 52,
      iconSize: Math.max(20, fonts.button.large + 2),
    },
  };

  // Get current color, variant and size styles
  const currentColor = colorStyles[color] || colorStyles.primary;
  const currentVariant = variantStyles[variant] || variantStyles.solid;
  const currentSize = sizeStyles[size] || sizeStyles.md;

  // Apply styles based on variant and color
  const buttonStyle = currentVariant(currentColor);

  // Determine disabled styles
  const disabledStyles = {
    backgroundColor:
      variant === "solid" ? modernTheme.colors.neutral[300] : "transparent",
    borderColor:
      variant === "outline" ? modernTheme.colors.neutral[300] : "transparent",
    textColor:
      variant === "solid" ? "#ffffff" : modernTheme.colors.neutral[600],
  };

  // Apply styles based on state
  const finalButtonStyles = isDisabled ? disabledStyles : buttonStyle;
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={isDisabled || isLoading}
      style={[
        styles.button,
        {
          backgroundColor: finalButtonStyles.backgroundColor,
          borderColor: finalButtonStyles.borderColor,
          borderWidth: variant === "outline" ? 2 : 0,
          paddingVertical: currentSize.paddingVertical,
          paddingHorizontal: currentSize.paddingHorizontal,
          minHeight: currentSize.minHeight,
        },
        variant === "text" && styles.textButton,
        style,
      ]}
      activeOpacity={0.7}
      {...props}
    >
      <View style={styles.contentContainer}>
        {isLoading && (
          <ActivityIndicator
            size="small"
            color={finalButtonStyles.textColor}
            style={styles.spinner}
          />
        )}

        {!isLoading && iconName && iconPosition === "left" && (
          <Ionicons
            name={iconName}
            size={currentSize.iconSize}
            color={finalButtonStyles.textColor}
            style={styles.leftIcon}
          />
        )}

        <Text
          style={[
            styles.text,
            {
              color: finalButtonStyles.textColor,
              fontSize: currentSize.fontSize,
              fontFamily:
                variant === "text"
                  ? "Montserrat-Medium"
                  : "Montserrat-SemiBold",
              lineHeight: currentSize.fontSize * 1.2,
              fontWeight: variant === "text" ? "500" : "600",
            },
          ]}
          numberOfLines={1}
          adjustsFontSizeToFit={false}
        >
          {text}
        </Text>

        {!isLoading && iconName && iconPosition === "right" && (
          <Ionicons
            name={iconName}
            size={currentSize.iconSize}
            color={finalButtonStyles.textColor}
            style={styles.rightIcon}
          />
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
  },
  textButton: {
    paddingHorizontal: 0,
  },
  contentContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
    paddingHorizontal: 4,
  },
  text: {
    textAlign: "center",
    textAlignVertical: "center",
    includeFontPadding: false,
    textDecorationLine: "none",
  },
  leftIcon: {
    marginRight: modernTheme.spacing.xs,
  },
  rightIcon: {
    marginLeft: modernTheme.spacing.xs,
  },
  spinner: {
    marginRight: modernTheme.spacing.xs,
  },
});

export default ModernButton;
