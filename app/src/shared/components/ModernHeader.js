import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import modernTheme from "../styles/modernTheme";
import ModernAvatar from "./ModernAvatar";

/**
 * ModernHeader component
 * A header component with modern styling
 *
 * @param {Object} props - Component props
 * @param {string} props.title - Header title
 * @param {string} props.subtitle - Header subtitle
 * @param {boolean} props.showBackButton - Show back button
 * @param {Function} props.onBackPress - Back button press handler
 * @param {React.ReactNode} props.rightContent - Content to display on the right
 * @param {Object} props.user - User object for avatar
 * @param {Function} props.onAvatarPress - Avatar press handler
 * @param {Object} props.style - Additional styles
 */
const ModernHeader = ({
  title,
  subtitle,
  showBackButton = false,
  onBackPress,
  rightContent,
  user,
  onAvatarPress,
  style,
  ...props
}) => {
  const router = useRouter();

  // Handle back button press
  const handleBackPress = () => {
    if (onBackPress) {
      onBackPress();
    } else {
      router.back();
    }
  };

  // Handle avatar press
  const handleAvatarPress = () => {
    if (onAvatarPress) {
      onAvatarPress();
    } else if (user) {
      router.push("/profile");
    }
  };

  // Render avatar using ModernAvatar component
  const renderAvatar = () => {
    if (!user) return null;

    return (
      <ModernAvatar
        source={user.profilePicture}
        name={user.displayName || user.username || user.email || "User"}
        size={36}
        interactive
        onPress={handleAvatarPress}
      />
    );
  };

  return (
    <View style={[styles.container, style]} {...props}>
      <View style={styles.leftSection}>
        {showBackButton && (
          <TouchableOpacity onPress={handleBackPress} style={styles.backButton}>
            <Ionicons
              name="chevron-back"
              size={24}
              color={modernTheme.colors.text.primary}
            />
          </TouchableOpacity>
        )}

        <View style={styles.titleContainer}>
          {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
          <Text style={styles.title}>{title}</Text>
        </View>
      </View>

      <View style={styles.rightSection}>
        {rightContent}

        {user && <View style={styles.avatarContainer}>{renderAvatar()}</View>}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: modernTheme.spacing.md,
    paddingVertical: modernTheme.spacing.md,
    backgroundColor: modernTheme.colors.background.paper,
    borderBottomWidth: 1,
    borderBottomColor: modernTheme.colors.neutral[200],
  },
  leftSection: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  backButton: {
    marginRight: modernTheme.spacing.sm,
    padding: modernTheme.spacing.xs,
  },
  titleContainer: {
    flex: 1,
  },
  title: {
    fontSize: modernTheme.typography.fontSize.lg,
    fontWeight: modernTheme.typography.fontWeight.semibold,
    color: modernTheme.colors.text.primary,
  },
  subtitle: {
    fontSize: modernTheme.typography.fontSize.sm,
    color: modernTheme.colors.text.secondary,
    marginBottom: 2,
  },
  rightSection: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatarContainer: {
    marginLeft: modernTheme.spacing.sm,
  },
});

export default ModernHeader;
