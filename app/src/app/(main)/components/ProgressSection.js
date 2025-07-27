import React from 'react';
import { View, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../../shared/context/ThemeContext';
import {
  Text,
  Heading,
  ModernCard,
  ModernButton,
  Row,
  Column,
  ModernProgressBar
} from '../../../shared/components';
import { useRouter } from 'expo-router';
import { BRAND_COLORS } from '../../../shared/constants/colors';

const ProgressSection = ({ progressData, fadeAnim, scaleAnim }) => {
  const { theme } = useTheme();
  const router = useRouter();

  return (
    <Animated.View
      style={{
        opacity: fadeAnim,
        transform: [{ scale: scaleAnim }],
        paddingHorizontal: theme.spacing.md,
        backgroundColor: BRAND_COLORS.CARD_BACKGROUND,

      }}
    >
      {/* Enhanced Progress Card */}
      <ModernCard
        variant="elevated"
        style={{
          borderRadius: 16,
          shadowColor: "transparent",
          shadowOpacity: 0,
        }}
      >
        {/* Header Section */}
        <Row
          justify="space-between"
          align="center"
          style={{ marginBottom: theme.spacing.md }}
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
                marginBottom: -18,
              }}
            >
              Your Progress
            </Text>
            <Heading
              level="h3"
              style={{
                color: theme.colors.brandNavy,
                fontFamily: theme.typography.fontFamily.bold,
                fontSize: 20,
              }}
            >
              {progressData.currentLevel} Level
            </Heading>
          </Column>

          {/* Enhanced Level Badge */}
          <View
            style={{
              backgroundColor: (progressData.currentLevelColor || theme.colors.brandGreen) + "15",
              paddingHorizontal: 12,
              paddingVertical: 6,
              borderRadius: 20,
              borderWidth: 1,
              borderColor: (progressData.currentLevelColor || theme.colors.brandGreen) + "30",
              flexDirection: 'row',
              alignItems: 'center',
            }}
          >
            <Ionicons
              name={progressData.currentLevelIcon || "star-outline"}
              size={14}
              color={progressData.currentLevelColor || theme.colors.brandGreen}
              style={{ marginRight: 4 }}
            />
            <Text
              weight="semibold"
              style={{
                color: progressData.currentLevelColor || theme.colors.brandGreen,
                fontFamily: theme.typography.fontFamily.semibold,
                fontSize: 12,
              }}
            >
              Level {progressData.currentLevelNumber}
            </Text>
          </View>
        </Row>

        {/* Progress Section */}
        <View style={{ marginBottom: theme.spacing.lg }}>
          <Row
            justify="space-between"
            align="center"
            style={{ marginBottom: theme.spacing.sm }}
          >
            <Text
              weight="semibold"
              style={{
                color: theme.colors.brandNavy,
                fontFamily: theme.typography.fontFamily.semibold,
                fontSize: 16,
              }}
            >
              {progressData.levelProgress}% Complete
            </Text>
            <Text
              variant="caption"
              style={{
                color: theme.colors.neutral[500],
                fontFamily: theme.typography.fontFamily.medium,
                fontSize: 12,
              }}
            >
              {progressData.totalXP || 0} /{" "}
              {progressData.xpToNextLevel === 0
                ? "∞"
                : (progressData.totalXP || 0) + (progressData.xpToNextLevel || 0)}{" "}
              XP
            </Text>
          </Row>

          <ModernProgressBar
            value={progressData.levelProgress}
            max={100}
            height={8}
            rounded
            style={{
              backgroundColor: theme.colors.neutral[200],
            }}
            color={theme.colors.brandGreen}
          />

          <Text
            variant="caption"
            style={{
              color: theme.colors.neutral[500],
              fontFamily: theme.typography.fontFamily.regular,
              fontSize: 11,
              marginTop: 6,
            }}
          >
            {progressData.xpToNextLevel === 0
              ? "Maximum level reached! 🎉"
              : `${progressData.xpToNextLevel} XP to next level`}
          </Text>
        </View>

        {/* Stats Grid */}
        <View style={{ marginBottom: theme.spacing.lg }}>
          <Row justify="space-between">
            {/* XP Stat */}
            <Column align="center" style={{ flex: 1 }}>
              <Text
                weight="bold"
                style={{
                  color: theme.colors.brandGreen,
                  fontFamily: theme.typography.fontFamily.bold,
                  fontSize: 24,
                  lineHeight: 28,
                }}
              >
                {progressData.totalXP || 0}
              </Text>
              <Text
                variant="caption"
                style={{
                  color: theme.colors.neutral[500],
                  fontFamily: theme.typography.fontFamily.medium,
                  fontSize: 11,
                  marginTop: 2,
                }}
              >
                Total XP
              </Text>
            </Column>

            {/* Vertical Divider */}
            <View
              style={{
                width: 1,
                height: 40,
                backgroundColor: theme.colors.neutral[200],
                marginHorizontal: theme.spacing.md,
              }}
            />

            {/* Lessons Stat */}
            <Column align="center" style={{ flex: 1 }}>
              <Text
                weight="bold"
                style={{
                  color: theme.colors.brandNavy,
                  fontFamily: theme.typography.fontFamily.bold,
                  fontSize: 24,
                  lineHeight: 28,
                }}
              >
                {progressData.lessonsCompleted || 0}
              </Text>
              <Text
                variant="caption"
                style={{
                  color: theme.colors.neutral[500],
                  fontFamily: theme.typography.fontFamily.medium,
                  fontSize: 11,
                  marginTop: 2,
                }}
              >
                Lessons
              </Text>
            </Column>

            {/* Vertical Divider */}
            <View
              style={{
                width: 1,
                height: 40,
                backgroundColor: theme.colors.neutral[200],
                marginHorizontal: theme.spacing.md,
              }}
            />

            {/* Streak Stat */}
            <Column align="center" style={{ flex: 1 }}>
              <Text
                weight="bold"
                style={{
                  color: "#FF9800",
                  fontFamily: theme.typography.fontFamily.bold,
                  fontSize: 24,
                  lineHeight: 28,
                }}
              >
                {progressData.streak || 0}
              </Text>
              <Text
                variant="caption"
                style={{
                  color: theme.colors.neutral[500],
                  fontFamily: theme.typography.fontFamily.medium,
                  fontSize: 11,
                  marginTop: 2,
                }}
              >
                Day Streak
              </Text>
            </Column>
          </Row>
        </View>

        {/* Action Button */}
        <ModernButton
          text="View Detailed Progress"
          variant="solid"
          iconName="analytics-outline"
          iconPosition="left"
          onPress={() => router.push("/tutor/progress")}
          style={{
            // backgroundColor: theme.colors.brandGreen,
            borderRadius: 12,
          }}
          textStyle={{
            fontFamily: theme.typography.fontFamily.semibold,
          }}
        />
      </ModernCard>
    </Animated.View>
  );
};

export default ProgressSection;
