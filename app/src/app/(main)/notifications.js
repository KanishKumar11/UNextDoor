import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Animated,
} from "react-native";
import { useRouter } from "expo-router";
import { useTheme } from "../../shared/context/ThemeContext";
import { useAuth } from "../../features/auth/hooks/useAuth";
import { useNotifications } from "../../shared/context/NotificationContext";
import { useAchievements } from "../../features/achievements/context/AchievementContext";
import SafeAreaWrapper from "../../shared/components/SafeAreaWrapper";
import {
  Container,
  Row,
  Column,
  Spacer,
  Heading,
  ModernCard,
  ModernButton,
  ModernBadge,
  Text,
} from "../../shared/components";
import { Ionicons } from "@expo/vector-icons";
import { curriculumService } from "../../features/curriculum/services/curriculumService";
import pushNotificationService from "../../features/achievements/services/pushNotificationService";

/**
 * Notifications Screen
 * Displays user notifications
 */
export default function NotificationsScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const {
    notifications,
    isLoading,
    loadNotifications,
    markAsRead,
    markAllAsRead,
  } = useNotifications();
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Pull to refresh handler
  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    await loadNotifications();
    setIsRefreshing(false);
  }, [loadNotifications]);

  // Mark notification as read
  const handleNotificationPress = async (notification) => {
    console.log(
      `🔔 Notification pressed: ${notification.id}, read: ${notification.read}`
    );

    // Mark as read using context function (now async)
    await markAsRead(notification.id);

    // Navigate based on notification type
    switch (notification.type) {
      case "conversation":
        router.push({
          pathname: "/tutor/conversation",
          params: {
            id: "notification-convo",
            title: "AI Conversation",
            level: "Adaptive",
          },
        });
        break;
      case "achievement":
        // 🏆 NAVIGATE TO ACHIEVEMENTS PAGE with highlight
        if (notification.achievementId) {
          router.push(`/achievements?highlight=${notification.achievementId}`);
        } else {
          router.push("/achievements");
        }
        break;
      case "system":
        // Handle system notifications
        break;
      case "progress":
        router.push("/profile");
        break;
      default:
        break;
    }
  };

  // Get notification icon based on type and category
  const getNotificationIcon = (type, category) => {
    switch (type) {
      case "achievement":
        return "trophy";
      case "progress":
      case "streak":
        return category === "streak" ? "flame" : "trending-up";
      case "lesson":
        return "book";
      case "system":
        return category === "feature" ? "sparkles" : "information-circle";
      default:
        return "notifications";
    }
  };

  // Get notification color using Miles-inspired brand colors
  const getNotificationColor = (type, category) => {
    switch (type) {
      case "achievement":
        return theme.colors.canvasBeige; // Canvas Beige for achievements
      case "progress":
        return theme.colors.explorerTeal; // Explorer Teal for progress
      case "streak":
        return theme.colors.rucksackBrown; // Rucksack Brown for streaks
      case "lesson":
        return theme.colors.explorerTeal; // Explorer Teal for lessons
      case "system":
        return theme.colors.oceanBlue; // Ocean Blue for system
      default:
        return theme.colors.neutral[500];
    }
  };

  // Format timestamp
  const formatTimestamp = (timestamp) => {
    const now = new Date();
    const diff = now - timestamp;

    // Less than a minute
    if (diff < 1000 * 60) {
      return "Just now";
    }

    // Less than an hour
    if (diff < 1000 * 60 * 60) {
      const minutes = Math.floor(diff / (1000 * 60));
      return `${minutes} ${minutes === 1 ? "minute" : "minutes"} ago`;
    }

    // Less than a day
    if (diff < 1000 * 60 * 60 * 24) {
      const hours = Math.floor(diff / (1000 * 60 * 60));
      return `${hours} ${hours === 1 ? "hour" : "hours"} ago`;
    }

    // Less than a week
    if (diff < 1000 * 60 * 60 * 24 * 7) {
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      return `${days} ${days === 1 ? "day" : "days"} ago`;
    }

    // Format as date
    return timestamp.toLocaleDateString();
  };

  // Simplified notification item design
  const renderNotificationItem = ({ item, index }) => (
    <TouchableOpacity
      onPress={() => handleNotificationPress(item)}
      activeOpacity={0.7}
      style={{ marginBottom: theme.spacing.sm }}
    >
      <ModernCard
        style={{
          backgroundColor: theme.colors.brandWhite,
          borderRadius: 0,
          elevation: 0,
          padding: theme.spacing.md,
          borderLeftWidth: !item.read ? 4 : 0,
          borderLeftColor: !item.read
            ? getNotificationColor(item.type, item.category)
            : "transparent",
        }}
      >
        <Row align="flex-start">
          {/* Simple Icon */}
          <View
            style={{
              width: 30,
              height: 30,
              borderRadius: 20,
              backgroundColor: getNotificationColor(item.type, item.category),
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Ionicons
              name={getNotificationIcon(item.type, item.category)}
              size={20}
              color="#FFF"
            />
          </View>

          {/* Content */}
          <Column style={{ flex: 1, marginLeft: theme.spacing.xs }}>
            <Row justify="space-between" align="flex-start" style={{ gap: 2 }}>
              <Text
                weight="semibold"
                style={{
                  color: theme.colors.brandNavy,
                  fontFamily: theme.typography.fontFamily.semibold,
                  fontSize: 14,
                  flex: 1,
                  marginRight: theme.spacing.sm,
                  marginBottom: -16,
                }}
                numberOfLines={1}
              >
                {item.title}
              </Text>

              {!item.read && (
                <View
                  style={{
                    width: 6,
                    height: 6,
                    borderRadius: 3,
                    backgroundColor: theme.colors.brandGreen,
                  }}
                />
              )}
            </Row>

            <Text
              style={{
                color: theme.colors.neutral[600],
                fontFamily: theme.typography.fontFamily.regular,
                fontSize: 13,
                marginTop: 2,
                textWrap: "wrap",
                marginBottom: -28,
                // backgroundColor: "red",
              }}
              numberOfLines={3}
            >
              {item.message}
            </Text>

            <Row
              justify="space-between"
              align="center"
              style={{ marginTop: 4 }}
            >
              <Text
                style={{
                  color: theme.colors.neutral[500],
                  fontFamily: theme.typography.fontFamily.regular,
                  fontSize: 11,
                }}
              >
                {formatTimestamp(item.timestamp)}
              </Text>

              {item.xpReward && (
                <Text
                  style={{
                    fontSize: 11,
                    color: theme.colors.brandGreen,
                    fontFamily: theme.typography.fontFamily.semibold,
                  }}
                >
                  +{item.xpReward} XP
                </Text>
              )}
            </Row>
          </Column>
        </Row>
      </ModernCard>
    </TouchableOpacity>
  );

  return (
    <SafeAreaWrapper>
      <Container>
        <Column style={{ padding: theme.spacing.md }}>
          {/* Modern Header Design */}
          <Row
            justify="space-between"
            align="center"
            style={{ marginBottom: theme.spacing.lg }}
          >
            <Column>
              <Text
                variant="caption"
                weight="medium"
                style={{
                  color: theme.colors.neutral[500],
                  fontFamily: theme.typography.fontFamily.medium,
                  textTransform: "uppercase",
                  letterSpacing: 0.5,
                  fontSize: 11,
                  marginBottom: 4,
                }}
              >
                Inbox
              </Text>
              <Heading
                level="h3"
                style={{
                  color: theme.colors.oceanBlue,
                  fontFamily: theme.typography.fontFamily.bold,
                  fontSize: 20,
                }}
              >
                Notifications
              </Heading>
            </Column>

            {notifications.some((n) => !n.read) && (
              <TouchableOpacity
                onPress={async () => {
                  console.log("🔔 Marking all notifications as read");
                  await markAllAsRead();
                }}
                style={{
                  backgroundColor: theme.colors.brandGreen + "15",
                  paddingHorizontal: 12,
                  paddingVertical: 6,
                  borderRadius: 16,
                  borderWidth: 1,
                  borderColor: theme.colors.brandGreen + "30",
                }}
              >
                <Text
                  weight="semibold"
                  style={{
                    color: theme.colors.brandGreen,
                    fontFamily: theme.typography.fontFamily.semibold,
                    fontSize: 12,
                  }}
                >
                  Mark All Read
                </Text>
              </TouchableOpacity>
            )}
          </Row>

          {/* Content Area */}
          {isLoading ? (
            <Column align="center" justify="center" style={{ marginTop: 100 }}>
              <ActivityIndicator size="large" color={theme.colors.brandGreen} />
              <Text
                style={{
                  marginTop: theme.spacing.md,
                  color: theme.colors.neutral[600],
                  fontFamily: theme.typography.fontFamily.medium,
                }}
              >
                Loading notifications...
              </Text>
            </Column>
          ) : notifications.length > 0 ? (
            <FlatList
              data={notifications}
              renderItem={renderNotificationItem}
              keyExtractor={(item) => item.id}
              contentContainerStyle={{ paddingBottom: 100 }}
              showsVerticalScrollIndicator={false}
              refreshControl={
                <RefreshControl
                  refreshing={isRefreshing}
                  onRefresh={handleRefresh}
                  colors={[theme.colors.brandGreen]}
                  tintColor={theme.colors.brandGreen}
                />
              }
            />
          ) : (
            /* Enhanced Empty State */
            <Column align="center" justify="center" style={{ marginTop: 100 }}>
              <View
                style={{
                  width: 80,
                  height: 80,
                  borderRadius: 40,
                  backgroundColor: theme.colors.neutral[100],
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: theme.spacing.lg,
                }}
              >
                <Ionicons
                  name="notifications-off-outline"
                  size={40}
                  color={theme.colors.neutral[400]}
                />
              </View>
              <Text
                weight="semibold"
                style={{
                  color: theme.colors.brandNavy,
                  fontFamily: theme.typography.fontFamily.semibold,
                  fontSize: 16,
                  marginBottom: 8,
                  textAlign: "center",
                }}
              >
                No Notifications Yet
              </Text>
              <Text
                style={{
                  color: theme.colors.neutral[500],
                  fontFamily: theme.typography.fontFamily.regular,
                  fontSize: 13,
                  textAlign: "center",
                  lineHeight: 18,
                  paddingHorizontal: theme.spacing.xl,
                }}
              >
                Complete lessons, earn achievements, and practice to start
                receiving notifications about your progress!
              </Text>
            </Column>
          )}
        </Column>
      </Container>
    </SafeAreaWrapper>
  );
}
