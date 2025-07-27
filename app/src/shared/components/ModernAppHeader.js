import React from "react";
import { View, StyleSheet, TouchableOpacity, Image } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "../context/ThemeContext";
import { useNotifications } from "../context/NotificationContext";
import { Text } from "./typography";
import { Row } from "./layout";
import { BRAND_COLORS } from "../constants/colors";

/**
 * ModernAppHeader component
 * A custom header component with logo and notifications button
 *
 * @param {Object} props - Component props
 * @param {boolean} props.showBackButton - Whether to show the back button
 * @param {Function} props.onBackPress - Function to call when back button is pressed
 * @param {boolean} props.showNotifications - Whether to show the notifications button
 * @param {Function} props.onNotificationsPress - Function to call when notifications button is pressed
 * @param {Object} props.style - Additional styles for the header
 */
const ModernAppHeader = ({
  showBackButton = false,
  onBackPress,
  showNotifications = true,
  onNotificationsPress,
  style,
  ...props
}) => {
  const router = useRouter();
  const { theme, isDarkMode } = useTheme();
  const { hasUnreadNotifications, unreadCount } = useNotifications();
  const insets = useSafeAreaInsets();

  // Handle back button press
  const handleBackPress = () => {
    if (onBackPress) {
      onBackPress();
    } else {
      router.back();
    }
  };

  // Handle notifications button press
  const handleNotificationsPress = () => {
    if (onNotificationsPress) {
      onNotificationsPress();
    } else {
      router.push("/notifications");
    }
  };

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: isDarkMode
            ? theme.colors.background.default
            : BRAND_COLORS.CARD_BACKGROUND,
          borderBottomColor: isDarkMode
            ? theme.colors.neutral[800]
            : theme.colors.neutral[200],
          paddingTop: insets.top > 0 ? insets.top : 16, // Apply safe area top inset
        },
        style,
      ]}
      {...props}
    >
      <Row justify="space-between" align="center">
        <Row align="center">
          {showBackButton && (
            <TouchableOpacity
              onPress={handleBackPress}
              style={styles.iconButton}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Ionicons
                name="chevron-back"
                size={24}
                color={
                  isDarkMode
                    ? theme.colors.text.primary
                    : theme.colors.text.primary
                }
              />
            </TouchableOpacity>
          )}

          {/* App Logo */}
          <Image
            source={require("../../assets/app-logo.png")}
            style={styles.logo}
            resizeMode="contain"
          />
        </Row>

        <Row align="center">
          {showNotifications && (
            <TouchableOpacity
              onPress={handleNotificationsPress}
              style={styles.iconButton}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <View style={styles.notificationIconContainer}>
                <Ionicons
                  name="notifications-outline"
                  size={24}
                  color={
                    isDarkMode
                      ? theme.colors.text.primary
                      : theme.colors.text.primary
                  }
                />
                {/* Notification badge - only show when there are unread notifications */}
                {hasUnreadNotifications && (
                  <View
                    style={[
                      styles.badge,
                      { backgroundColor: theme.colors.brandGreen },
                    ]}
                  />
                )}
              </View>
            </TouchableOpacity>
          )}
        </Row>
      </Row>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    zIndex: 10, // Ensure header is above other content
  },
  logo: {
    width: 60,
    height: 32,
  },
  iconButton: {
    padding: 4, // Reduced padding
  },
  notificationIconContainer: {
    position: "relative",
  },
  badge: {
    position: "absolute",
    top: 0,
    right: 0,
    width: 10,
    height: 10,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: "white",
  },
});

export default ModernAppHeader;
