import React from "react";
import { View, Image, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import modernTheme from "../styles/modernTheme";

/**
 * ModernAvatar component
 * A component for displaying user avatars with various options
 *
 * @param {Object} props - Component props
 * @param {string} props.source - Image source URI
 * @param {string} props.name - User name for fallback initials
 * @param {string} props.size - Avatar size ('xs', 'sm', 'md', 'lg', 'xl') or custom number
 * @param {string} props.shape - Avatar shape ('circle', 'rounded', 'square')
 * @param {string} props.backgroundColor - Background color for fallback avatar
 * @param {string} props.textColor - Text color for fallback avatar
 * @param {boolean} props.showBadge - Whether to show status badge
 * @param {string} props.badgeColor - Badge color
 * @param {string} props.badgePosition - Badge position ('top-right', 'top-left', 'bottom-right', 'bottom-left')
 * @param {boolean} props.interactive - Whether avatar is interactive (touchable)
 * @param {Function} props.onPress - Function to call when avatar is pressed
 * @param {Object} props.style - Additional styles
 */
const ModernAvatar = ({
  source,
  name = "",
  size = "md",
  shape = "circle",
  backgroundColor,
  textColor,
  showBadge = false,
  badgeColor = modernTheme.colors.success.main,
  badgePosition = "bottom-right",
  interactive = false,
  onPress,
  style,
  ...props
}) => {
  // Define size values
  const sizeMap = {
    xs: 24,
    sm: 32,
    md: 40,
    lg: 56,
    xl: 80,
  };

  // Get size value
  const sizeValue =
    typeof size === "string" ? sizeMap[size] || sizeMap.md : size;

  // Calculate font size based on avatar size
  const fontSize = sizeValue * 0.4;

  // Get initials from name
  const getInitials = () => {
    if (!name) return "";

    const nameParts = name.trim().split(" ");
    if (nameParts.length === 1) {
      return nameParts[0].charAt(0).toUpperCase();
    }

    return (
      nameParts[0].charAt(0) + nameParts[nameParts.length - 1].charAt(0)
    ).toUpperCase();
  };

  // Define border radius based on shape
  const getBorderRadius = () => {
    switch (shape) {
      case "square":
        return 0;
      case "rounded":
        return sizeValue * 0.2;
      case "circle":
      default:
        return sizeValue / 2;
    }
  };

  // Get badge position styles
  const getBadgePosition = () => {
    switch (badgePosition) {
      case "top-left":
        return { top: 0, left: 0 };
      case "top-right":
        return { top: 0, right: 0 };
      case "bottom-left":
        return { bottom: 0, left: 0 };
      case "bottom-right":
      default:
        return { bottom: 0, right: 0 };
    }
  };

  // Base avatar styles
  const avatarStyles = {
    width: sizeValue,
    height: sizeValue,
    borderRadius: getBorderRadius(),
    backgroundColor: backgroundColor || modernTheme.colors.primary[100],
  };

  // Badge size based on avatar size
  const badgeSize = Math.max(sizeValue * 0.25, 8);

  // Render avatar content
  const renderAvatarContent = () => {
    if (source) {
      return (
        <Image
          source={{ uri: source }}
          style={[styles.image, avatarStyles]}
          resizeMode="cover"
        />
      );
    }

    return (
      <View style={[styles.fallback, avatarStyles]}>
        <Text
          style={[
            styles.initials,
            {
              fontSize,
              color: textColor || modernTheme.colors.primary[700],
            },
          ]}
        >
          {getInitials()}
        </Text>
      </View>
    );
  };

  // Render badge if needed
  const renderBadge = () => {
    if (!showBadge) return null;

    return (
      <View
        style={[
          styles.badge,
          {
            width: badgeSize,
            height: badgeSize,
            backgroundColor: badgeColor,
            ...getBadgePosition(),
          },
        ]}
      />
    );
  };

  // Render interactive avatar
  if (interactive) {
    return (
      <TouchableOpacity
        onPress={onPress}
        style={[styles.container, style]}
        activeOpacity={0.8}
        {...props}
      >
        {renderAvatarContent()}
        {renderBadge()}
      </TouchableOpacity>
    );
  }

  // Render non-interactive avatar
  return (
    <View style={[styles.container, style]} {...props}>
      {renderAvatarContent()}
      {renderBadge()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "relative",
  },
  image: {
    // Image styles are applied dynamically
  },
  fallback: {
    alignItems: "center",
    justifyContent: "center",
  },
  initials: {
    fontWeight: modernTheme.typography.fontWeight.semibold,
  },
  badge: {
    position: "absolute",
    borderRadius: 999,
    borderWidth: 2,
    borderColor: modernTheme.colors.background.paper,
  },
});

export default ModernAvatar;
