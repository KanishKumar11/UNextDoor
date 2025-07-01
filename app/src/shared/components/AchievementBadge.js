import React from "react";
import { View, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../context/ThemeContext";
import { Text } from "./index";

/**
 * AchievementBadge Component
 * A beautiful, code-based achievement badge with modern design
 */
const AchievementBadge = ({ achievement, onPress, style }) => {
  const { theme } = useTheme();

  // Achievement category colors and icons
  const getAchievementStyle = (category, earned) => {
    const styles = {
      learning: {
        color: "#6FC935", // Brand green
        icon: earned ? "school" : "school-outline",
        gradient: ["#6FC935", "#5BA82C"],
      },
      streak: {
        color: "#FF6B35", // Orange-red
        icon: earned ? "flame" : "flame-outline",
        gradient: ["#FF6B35", "#E55A2B"],
      },
      xp: {
        color: "#FFD700", // Gold
        icon: earned ? "star" : "star-outline",
        gradient: ["#FFD700", "#E6C200"],
      },
      completion: {
        color: "#2196F3", // Blue
        icon: earned ? "checkmark-circle" : "checkmark-circle-outline",
        gradient: ["#2196F3", "#1976D2"],
      },
      milestone: {
        color: "#9C27B0", // Purple
        icon: earned ? "trophy" : "trophy-outline",
        gradient: ["#9C27B0", "#7B1FA2"],
      },
      default: {
        color: theme.colors.brandGreen,
        icon: earned ? "trophy" : "trophy-outline",
        gradient: [theme.colors.brandGreen, "#5BA82C"],
      },
    };
    return styles[category] || styles.default;
  };

  const achievementStyle = getAchievementStyle(
    achievement.category,
    achievement.earned
  );

  return (
    <View style={[{ position: "relative" }, style]}>
      {/* XP Reward Badge - Positioned at top center */}
      {achievement.earned && achievement.xpReward && (
        <View
          style={{
            position: "absolute",
            top: -12,
            left: "50%",
            transform: [{ translateX: -30 }], // Half of badge width (60px)
            zIndex: 10,
            backgroundColor: theme.colors.brandNavy,
            borderRadius: 16,
            paddingHorizontal: 8,
            paddingVertical: 4,
            flexDirection: "row",
            alignItems: "center",
            shadowColor: theme.colors.brandNavy,
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.4,
            shadowRadius: 6,
            elevation: 8,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Ionicons
            name="star"
            size={12}
            color="#FFF"
            style={{ marginRight: 4 }}
          />
          <Text
            variant="caption"
            weight="bold"
            style={{
              fontSize: 10,
              color: "#FFF",
              fontFamily: theme.typography.fontFamily.bold,
              textAlign: "center",
            }}
          >
            +{achievement.xpReward}
          </Text>
        </View>
      )}

      {/* Progress Badge - Positioned at top center for ongoing achievements */}
      {!achievement.earned && achievement.progress > 0 && (
        <View
          style={{
            position: "absolute",
            top: -12,
            left: "50%",
            transform: [{ translateX: -25 }], // Half of badge width (50px)
            zIndex: 10,
            backgroundColor: theme.colors.brandGreen,
            borderRadius: 16,
            paddingHorizontal: 8,
            paddingVertical: 4,
            shadowColor: theme.colors.brandGreen,
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.4,
            shadowRadius: 6,
            aspectRatio: "1/1",
            width: 35,
            alignItems: "center",
            justifyContent: "center",
            elevation: 8,
          }}
        >
          <Text
            variant="caption"
            weight="bold"
            style={{
              fontSize: 10,
              color: "#FFF",
              fontFamily: theme.typography.fontFamily.bold,
              textAlign: "center",
            }}
          >
            {Math.round(achievement.progress)}%
          </Text>
        </View>
      )}

      <TouchableOpacity
        onPress={onPress}
        style={{
          width: 160,
          height: 180,
          backgroundColor: theme.colors.brandWhite,
          borderRadius: 20,
          padding: theme.spacing.lg,
          alignItems: "center",
          justifyContent: "space-between",
          borderWidth: achievement.earned ? 2 : 1,
          borderColor: achievement.earned
            ? achievementStyle.color
            : theme.colors.neutral[200],
          shadowColor: achievement.earned
            ? achievementStyle.color
            : theme.colors.neutral[300],
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: achievement.earned ? 0.25 : 0.1,
          shadowRadius: 12,
          elevation: achievement.earned ? 6 : 2,
        }}
      >
        {/* Badge Header with Icon */}
        <View
          style={{ alignItems: "center", flex: 1, justifyContent: "center" }}
        >
          {/* Main Achievement Icon */}
          <View
            style={{
              width: 64,
              height: 64,
              borderRadius: 32,
              backgroundColor: achievement.earned
                ? achievementStyle.color + "20"
                : theme.colors.neutral[100],
              alignItems: "center",
              justifyContent: "center",
              marginBottom: theme.spacing.sm,
              borderWidth: achievement.earned ? 2 : 0,
              borderColor: achievement.earned
                ? achievementStyle.color + "40"
                : "transparent",
            }}
          >
            <Ionicons
              name={achievementStyle.icon}
              size={32}
              color={
                achievement.earned
                  ? achievementStyle.color
                  : theme.colors.neutral[400]
              }
            />
          </View>
        </View>

        {/* Badge Footer with Text */}
        <View style={{ alignItems: "center" }}>
          <Text
            variant="caption"
            weight="semibold"
            align="center"
            numberOfLines={2}
            style={{
              marginBottom: 4,
              color: achievement.earned
                ? theme.colors.brandNavy
                : theme.colors.neutral[600],
              fontFamily: theme.typography.fontFamily.semibold,
              fontSize: 12,
              lineHeight: 16,
            }}
          >
            {achievement.title}
          </Text>
          <Text
            variant="caption"
            align="center"
            numberOfLines={2}
            style={{
              color: achievement.earned
                ? achievementStyle.color
                : theme.colors.neutral[500],
              fontFamily: theme.typography.fontFamily.regular,
              fontSize: 10,
              lineHeight: 14,
            }}
          >
            {achievement.description}
          </Text>
        </View>

        {/* Earned Badge Overlay */}
        {achievement.earned && (
          <View
            style={{
              position: "absolute",
              top: 12,
              right: 12,
              width: 24,
              height: 24,
              borderRadius: 12,
              backgroundColor: achievementStyle.color,
              alignItems: "center",
              justifyContent: "center",
              shadowColor: achievementStyle.color,
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.4,
              shadowRadius: 4,
              elevation: 4,
            }}
          >
            <Ionicons name="checkmark" size={14} color="#FFF" />
          </View>
        )}
      </TouchableOpacity>
    </View>
  );
};

export default AchievementBadge;
