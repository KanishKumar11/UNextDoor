import React from "react";
import { View, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../context/ThemeContext";
import { Text } from "./index";
import { BRAND_COLORS } from "../constants/colors";
import { LinearGradient } from "expo-linear-gradient";

/**
 * AchievementBadge Component
 * A beautiful, code-based achievement badge with modern design
 */
const AchievementBadge = ({ achievement, onPress, style }) => {
  const { theme } = useTheme();

  // Enhanced achievement category colors with diverse, vibrant Miles-inspired palette
  const getAchievementStyle = (category, earned) => {
    const styles = {
      // Learning achievements - Cool, trustworthy teal tones
      learning: {
        color: BRAND_COLORS.EXPLORER_TEAL,
        icon: earned ? "school" : "school-outline",
        gradient: earned
          ? [BRAND_COLORS.EXPLORER_TEAL + "40", BRAND_COLORS.SKY_AQUA + "30"]
          : [BRAND_COLORS.CARD_BACKGROUND, BRAND_COLORS.EXPLORER_TEAL + "10"],
        bgColor: earned ? BRAND_COLORS.EXPLORER_TEAL + "25" : BRAND_COLORS.CARD_BACKGROUND,
        borderColor: earned ? BRAND_COLORS.EXPLORER_TEAL + "80" : BRAND_COLORS.EXPLORER_TEAL + "40",
        shadowColor: BRAND_COLORS.EXPLORER_TEAL,
        iconBg: earned ? BRAND_COLORS.EXPLORER_TEAL + "35" : BRAND_COLORS.EXPLORER_TEAL + "20",
        textColor: earned ? BRAND_COLORS.OCEAN_BLUE : BRAND_COLORS.SHADOW_GREY,
        accentColor: BRAND_COLORS.SKY_AQUA,
      },

      // Streak achievements - Warm, energetic brown/orange tones
      streak: {
        color: BRAND_COLORS.RUCKSACK_BROWN,
        icon: earned ? "flame" : "flame-outline",
        gradient: earned
          ? [BRAND_COLORS.RUCKSACK_BROWN + "40", BRAND_COLORS.SUNSET_ORANGE + "30"]
          : [BRAND_COLORS.CARD_BACKGROUND, BRAND_COLORS.RUCKSACK_BROWN + "10"],
        bgColor: earned ? BRAND_COLORS.RUCKSACK_BROWN + "25" : BRAND_COLORS.CARD_BACKGROUND,
        borderColor: earned ? BRAND_COLORS.RUCKSACK_BROWN + "80" : BRAND_COLORS.RUCKSACK_BROWN + "40",
        shadowColor: BRAND_COLORS.RUCKSACK_BROWN,
        iconBg: earned ? BRAND_COLORS.RUCKSACK_BROWN + "35" : BRAND_COLORS.RUCKSACK_BROWN + "20",
        textColor: earned ? BRAND_COLORS.RUCKSACK_BROWN : BRAND_COLORS.SHADOW_GREY,
        accentColor: BRAND_COLORS.SUNSET_ORANGE,
      },

      // XP achievements - Deep, prestigious blue tones
      xp: {
        color: BRAND_COLORS.OCEAN_BLUE,
        icon: earned ? "star" : "star-outline",
        gradient: earned
          ? [BRAND_COLORS.OCEAN_BLUE + "40", BRAND_COLORS.ROYAL_BLUE + "30"]
          : [BRAND_COLORS.CARD_BACKGROUND, BRAND_COLORS.OCEAN_BLUE + "10"],
        bgColor: earned ? BRAND_COLORS.OCEAN_BLUE + "25" : BRAND_COLORS.CARD_BACKGROUND,
        borderColor: earned ? BRAND_COLORS.OCEAN_BLUE + "80" : BRAND_COLORS.OCEAN_BLUE + "40",
        shadowColor: BRAND_COLORS.OCEAN_BLUE,
        iconBg: earned ? BRAND_COLORS.OCEAN_BLUE + "35" : BRAND_COLORS.OCEAN_BLUE + "20",
        textColor: earned ? BRAND_COLORS.OCEAN_BLUE : BRAND_COLORS.SHADOW_GREY,
        accentColor: BRAND_COLORS.ROYAL_BLUE,
      },

      // Completion achievements - Fresh, success-oriented aqua/green tones
      completion: {
        color: BRAND_COLORS.SKY_AQUA,
        icon: earned ? "checkmark-circle" : "checkmark-circle-outline",
        gradient: earned
          ? [BRAND_COLORS.SKY_AQUA + "40", BRAND_COLORS.FOREST_GREEN + "30"]
          : [BRAND_COLORS.CARD_BACKGROUND, BRAND_COLORS.SKY_AQUA + "10"],
        bgColor: earned ? BRAND_COLORS.SKY_AQUA + "25" : BRAND_COLORS.CARD_BACKGROUND,
        borderColor: earned ? BRAND_COLORS.SKY_AQUA + "80" : BRAND_COLORS.SKY_AQUA + "40",
        shadowColor: BRAND_COLORS.SKY_AQUA,
        iconBg: earned ? BRAND_COLORS.SKY_AQUA + "35" : BRAND_COLORS.SKY_AQUA + "20",
        textColor: earned ? BRAND_COLORS.OCEAN_BLUE : BRAND_COLORS.SHADOW_GREY,
        accentColor: BRAND_COLORS.FOREST_GREEN,
      },

      // Milestone achievements - Premium, celebratory golden tones
      milestone: {
        color: BRAND_COLORS.GOLDEN_AMBER,
        icon: earned ? "trophy" : "trophy-outline",
        gradient: earned
          ? [BRAND_COLORS.GOLDEN_AMBER + "40", BRAND_COLORS.EXPLORER_TEAL + "30"]
          : [BRAND_COLORS.CARD_BACKGROUND, BRAND_COLORS.GOLDEN_AMBER + "10"],
        bgColor: earned ? BRAND_COLORS.GOLDEN_AMBER + "25" : BRAND_COLORS.CARD_BACKGROUND,
        borderColor: earned ? BRAND_COLORS.GOLDEN_AMBER + "80" : BRAND_COLORS.GOLDEN_AMBER + "40",
        shadowColor: BRAND_COLORS.GOLDEN_AMBER,
        iconBg: earned ? BRAND_COLORS.GOLDEN_AMBER + "35" : BRAND_COLORS.GOLDEN_AMBER + "20",
        textColor: earned ? BRAND_COLORS.RUCKSACK_BROWN : BRAND_COLORS.SHADOW_GREY,
        accentColor: BRAND_COLORS.EXPLORER_TEAL,
      },

      // Social achievements - Warm, friendly coral tones
      social: {
        color: BRAND_COLORS.WARM_CORAL,
        icon: earned ? "people" : "people-outline",
        gradient: earned
          ? [BRAND_COLORS.WARM_CORAL + "40", BRAND_COLORS.SKY_AQUA + "30"]
          : [BRAND_COLORS.CARD_BACKGROUND, BRAND_COLORS.WARM_CORAL + "10"],
        bgColor: earned ? BRAND_COLORS.WARM_CORAL + "25" : BRAND_COLORS.CARD_BACKGROUND,
        borderColor: earned ? BRAND_COLORS.WARM_CORAL + "80" : BRAND_COLORS.WARM_CORAL + "40",
        shadowColor: BRAND_COLORS.WARM_CORAL,
        iconBg: earned ? BRAND_COLORS.WARM_CORAL + "35" : BRAND_COLORS.WARM_CORAL + "20",
        textColor: earned ? BRAND_COLORS.OCEAN_BLUE : BRAND_COLORS.SHADOW_GREY,
        accentColor: BRAND_COLORS.SKY_AQUA,
      },

      // Mastery achievements - Sophisticated, advanced purple tones
      mastery: {
        color: BRAND_COLORS.DEEP_PURPLE,
        icon: earned ? "diamond" : "diamond-outline",
        gradient: earned
          ? [BRAND_COLORS.DEEP_PURPLE + "40", BRAND_COLORS.OCEAN_BLUE + "30"]
          : [BRAND_COLORS.CARD_BACKGROUND, BRAND_COLORS.DEEP_PURPLE + "10"],
        bgColor: earned ? BRAND_COLORS.DEEP_PURPLE + "25" : BRAND_COLORS.CARD_BACKGROUND,
        borderColor: earned ? BRAND_COLORS.DEEP_PURPLE + "80" : BRAND_COLORS.DEEP_PURPLE + "40",
        shadowColor: BRAND_COLORS.DEEP_PURPLE,
        iconBg: earned ? BRAND_COLORS.DEEP_PURPLE + "35" : BRAND_COLORS.DEEP_PURPLE + "20",
        textColor: earned ? BRAND_COLORS.DEEP_PURPLE : BRAND_COLORS.SHADOW_GREY,
        accentColor: BRAND_COLORS.OCEAN_BLUE,
      },

      // Time-based achievements - Energetic, motivating orange tones
      time: {
        color: BRAND_COLORS.SUNSET_ORANGE,
        icon: earned ? "time" : "time-outline",
        gradient: earned
          ? [BRAND_COLORS.SUNSET_ORANGE + "40", BRAND_COLORS.GOLDEN_AMBER + "30"]
          : [BRAND_COLORS.CARD_BACKGROUND, BRAND_COLORS.SUNSET_ORANGE + "10"],
        bgColor: earned ? BRAND_COLORS.SUNSET_ORANGE + "25" : BRAND_COLORS.CARD_BACKGROUND,
        borderColor: earned ? BRAND_COLORS.SUNSET_ORANGE + "80" : BRAND_COLORS.SUNSET_ORANGE + "40",
        shadowColor: BRAND_COLORS.SUNSET_ORANGE,
        iconBg: earned ? BRAND_COLORS.SUNSET_ORANGE + "35" : BRAND_COLORS.SUNSET_ORANGE + "20",
        textColor: earned ? BRAND_COLORS.RUCKSACK_BROWN : BRAND_COLORS.SHADOW_GREY,
        accentColor: BRAND_COLORS.GOLDEN_AMBER,
      },

      // Default fallback - Explorer Teal theme
      default: {
        color: BRAND_COLORS.EXPLORER_TEAL,
        icon: earned ? "trophy" : "trophy-outline",
        gradient: earned
          ? [BRAND_COLORS.EXPLORER_TEAL + "40", BRAND_COLORS.SKY_AQUA + "30"]
          : [BRAND_COLORS.CARD_BACKGROUND, BRAND_COLORS.EXPLORER_TEAL + "10"],
        bgColor: earned ? BRAND_COLORS.EXPLORER_TEAL + "25" : BRAND_COLORS.CARD_BACKGROUND,
        borderColor: earned ? BRAND_COLORS.EXPLORER_TEAL + "80" : BRAND_COLORS.EXPLORER_TEAL + "40",
        shadowColor: BRAND_COLORS.EXPLORER_TEAL,
        iconBg: earned ? BRAND_COLORS.EXPLORER_TEAL + "35" : BRAND_COLORS.EXPLORER_TEAL + "20",
        textColor: earned ? BRAND_COLORS.OCEAN_BLUE : BRAND_COLORS.SHADOW_GREY,
        accentColor: BRAND_COLORS.SKY_AQUA,
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
            backgroundColor: BRAND_COLORS.OCEAN_BLUE,
            borderRadius: 16,
            paddingHorizontal: 8,
            paddingVertical: 4,
            flexDirection: "row",
            alignItems: "center",
            shadowColor: theme.colors.oceanBlue,
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.15,
            shadowRadius: 8,
            elevation: 0,
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
          borderRadius: 20,
          overflow: 'hidden',
          borderWidth: achievement.earned ? 2 : 1,
          borderColor: achievementStyle.borderColor,
          shadowColor: achievement.earned ? achievementStyle.shadowColor : theme.colors.oceanBlue,
          shadowOffset: { width: 0, height: achievement.earned ? 4 : 2 },
          shadowOpacity: achievement.earned ? 0.2 : 0.05,
          shadowRadius: achievement.earned ? 12 : 8,
          elevation: 0,
        }}
      >
        {achievement.earned ? (
          <LinearGradient
            colors={achievementStyle.gradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{
              flex: 1,
              padding: theme.spacing.lg,
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            {/* Content for earned achievements */}
            {renderAchievementContent()}
          </LinearGradient>
        ) : (
          <LinearGradient
            colors={achievementStyle.gradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{
              flex: 1,
              padding: theme.spacing.lg,
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            {/* Content for unearned achievements */}
            {renderAchievementContent()}
          </LinearGradient>
        )}
      </TouchableOpacity>
    </View>
  );

  // Helper function to render achievement content
  function renderAchievementContent() {
    return (
      <>
        {/* Badge Header with Icon */}
        <View style={{ alignItems: "center", flex: 1, justifyContent: "center" }}>
          {/* Enhanced Achievement Icon with Dynamic Colors */}
          {achievement.earned ? (
            <LinearGradient
              colors={[achievementStyle.color + "50", achievementStyle.accentColor + "30"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={{
                width: 76,
                height: 76,
                borderRadius: 38,
                alignItems: "center",
                justifyContent: "center",
                marginBottom: theme.spacing.sm,
                borderWidth: 3,
                borderColor: achievementStyle.color + "90",
                shadowColor: achievementStyle.shadowColor,
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.4,
                shadowRadius: 8,
                elevation: 0,
              }}
            >
              <Ionicons
                name={achievementStyle.icon}
                size={38}
                color={achievementStyle.color}
              />
            </LinearGradient>
          ) : (
            <LinearGradient
              colors={[achievementStyle.iconBg, BRAND_COLORS.CARD_BACKGROUND]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={{
                width: 68,
                height: 68,
                borderRadius: 34,
                alignItems: "center",
                justifyContent: "center",
                marginBottom: theme.spacing.sm,
                borderWidth: 2,
                borderColor: achievementStyle.color + "40",
                shadowColor: achievementStyle.shadowColor,
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 4,
                elevation: 0,
              }}
            >
              <Ionicons
                name={achievementStyle.icon}
                size={34}
                color={achievementStyle.color}
              />
            </LinearGradient>
          )}
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
                ? achievementStyle.textColor
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

        {/* Enhanced Earned Badge Overlay with Gradient */}
        {achievement.earned && (
          <LinearGradient
            colors={[achievementStyle.color, achievementStyle.accentColor]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{
              position: "absolute",
              top: 10,
              right: 10,
              width: 32,
              height: 32,
              borderRadius: 16,
              alignItems: "center",
              justifyContent: "center",
              shadowColor: achievementStyle.shadowColor,
              shadowOffset: { width: 0, height: 3 },
              shadowOpacity: 0.4,
              shadowRadius: 10,
              elevation: 0,
              borderWidth: 3,
              borderColor: BRAND_COLORS.WHISPER_WHITE,
            }}
          >
            <Ionicons name="checkmark" size={18} color={BRAND_COLORS.WHISPER_WHITE} />
          </LinearGradient>
        )}
      </>
    );
  };
};

export default AchievementBadge;
