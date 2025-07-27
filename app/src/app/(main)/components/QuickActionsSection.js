import React from 'react';
import { View, Animated, TouchableOpacity, ScrollView, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../../shared/context/ThemeContext';
import {
  Text,
  Heading,
  Row,
  Column
} from '../../../shared/components';
import { useRouter } from 'expo-router';
import { BRAND_COLORS } from '../../../shared/constants/colors';

const { width } = Dimensions.get("window");

const QuickActionsSection = ({ fadeAnim, scaleAnim, currentLesson }) => {
  const { theme } = useTheme();
  const router = useRouter();

  return (
    <Animated.View
      style={{
        opacity: fadeAnim,
        transform: [{ scale: scaleAnim }],
        paddingHorizontal: theme.spacing.md,
      }}
    >
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
              marginBottom: -18,
            }}
          >
            Quick Actions
          </Text>
          <Heading
            level="h3"
            style={{
              color: theme.colors.brandNavy,
              fontFamily: theme.typography.fontFamily.bold,
              fontSize: 20,
            }}
          >
            Quick Actions
          </Heading>
        </Column>
      </Row>

      {/* Main Action Cards - Simple 2-card layout */}
      <Row justify="space-between" style={{ marginBottom: theme.spacing.md }}>
        {/* Talk with Miles */}
        <TouchableOpacity
          onPress={() =>
            router.push({
              pathname: "/tutor/standalone-conversation",
              params: {
                scenarioId: "general-conversation",
                title: "Talk with Miles",
                level: "Beginner",
              },
            })
          }
          style={{
            flex: 1,
            backgroundColor: theme.colors.explorerTeal,
            borderRadius: 16,
            padding: theme.spacing.lg,
            marginRight: theme.spacing.xs,
            minHeight: 100,
            justifyContent: "center",
            shadowColor: theme.colors.brandGreen,
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.2,
            shadowRadius: 8,
            // elevation: 4,
          }}
        >
          <View
            style={{
              width: 40,
              height: 40,
              borderRadius: 20,
              backgroundColor: 'rgba(255, 255, 255, 0.2)',
              alignItems: "center",
              justifyContent: "center",
              marginBottom: theme.spacing.sm,
              alignSelf: "center",
            }}
          >
            <Ionicons
              name="mic"
              size={20}
              color="white"
            />
          </View>
          <Text
            weight="bold"
            align="center"
            numberOfLines={1}
            style={{
              color: "white",
              fontFamily: theme.typography.fontFamily.bold,
              fontSize: 16,
              marginBottom: 4,
            }}
          >
            Talk with Miles
          </Text>
          <Text
            variant="caption"
            align="center"
            numberOfLines={1}
            style={{
              color: "rgba(255, 255, 255, 0.9)",
              fontFamily: theme.typography.fontFamily.medium,
              fontSize: 12,
            }}
          >
            AI Conversation
          </Text>
        </TouchableOpacity>

        {/* Current Lesson */}
        <TouchableOpacity
          onPress={() => {
            if (currentLesson) {
              router.push(`/tutor/lesson/${currentLesson.lessonId}`);
            } else {
              router.push("/tutor/lessons");
            }
          }}
          style={{
            flex: 1,
            backgroundColor: theme.colors.brandWhite,
            borderRadius: 16,
            padding: theme.spacing.lg,
            marginLeft: theme.spacing.xs,
            minHeight: 100,
            justifyContent: "center",
            borderWidth: 2,
            borderColor: BRAND_COLORS.OCEAN_BLUE + "45",
            shadowColor: theme.colors.brandNavy,
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 8,
            // elevation: 2,
          }}
        >
          <View
            style={{
              width: 40,
              height: 40,
              borderRadius: 20,
              backgroundColor: BRAND_COLORS.OCEAN_BLUE + "15",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: theme.spacing.sm,
              alignSelf: "center",
            }}
          >
            <Ionicons
              name="book"
              size={20}
              color={BRAND_COLORS.OCEAN_BLUE}
            />
          </View>
          <Text
            weight="bold"
            align="center"
            numberOfLines={1}
            style={{
              color: BRAND_COLORS.OCEAN_BLUE,
              fontFamily: theme.typography.fontFamily.bold,
              fontSize: 16,
              marginBottom: 4,
            }}
          >
            {currentLesson ? "Continue" : "Start Learning"}
          </Text>
          <Text
            variant="caption"
            align="center"
            numberOfLines={1}
            ellipsizeMode="tail"
            style={{
              color: theme.colors.neutral[600],
              fontFamily: theme.typography.fontFamily.medium,
              fontSize: 12,
            }}
          >
            {currentLesson ? currentLesson.name : "Begin journey"}
          </Text>
        </TouchableOpacity>
      </Row>

      {/* Quick Access Row - Horizontally scrollable cards */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{
          paddingRight: theme.spacing.md,
        }}
        style={{ marginTop: theme.spacing.xs }}
      >
        {/* Vocabulary - Hidden to streamline quick actions interface */}
        {/* <TouchableOpacity
          onPress={() => router.push("/vocabulary")}
          style={{
            width: (width - 48) * 0.75 / 2, // 75% of main card width
            backgroundColor: theme.colors.brandWhite,
            borderRadius: 14,
            padding: theme.spacing.md,
            marginRight: theme.spacing.sm,
            borderWidth: 1,
            borderColor: "#2196F3" + "20",
            alignItems: "center",
            minHeight: 90,
            justifyContent: "center",
            shadowColor: "#2196F3",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 4,
            // elevation: 2,
          }}
        >
          <View
            style={{
              width: 36,
              height: 36,
              borderRadius: 18,
              backgroundColor: "#2196F3" + "15",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: theme.spacing.sm,
            }}
          >
            <Ionicons
              name="library"
              size={18}
              color="#2196F3"
            />
          </View>
          <Text
            weight="semibold"
            align="center"
            numberOfLines={1}
            style={{
              color: theme.colors.brandNavy,
              fontFamily: theme.typography.fontFamily.semibold,
              fontSize: 13,
            }}
          >
            Vocabulary
          </Text>
          <Text
            variant="caption"
            align="center"
            style={{
              color: theme.colors.neutral[500],
              fontFamily: theme.typography.fontFamily.regular,
              fontSize: 11,
              marginTop: 2,
            }}
          >
            Learn words
          </Text>
        </TouchableOpacity> */}

        {/* Games */}
        <TouchableOpacity
          onPress={() => router.push("/games")}
          style={{
            width: (width - 48) * 0.75 / 2, // 75% of main card width
            backgroundColor: theme.colors.brandWhite,
            borderRadius: 14,
            padding: theme.spacing.md,
            marginRight: theme.spacing.sm,
            borderWidth: 1,
            borderColor: "#FF9800" + "20",
            alignItems: "center",
            minHeight: 90,
            justifyContent: "center",
            shadowColor: "#FF9800",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 4,
            // elevation: 2,
          }}
        >
          <View
            style={{
              width: 36,
              height: 36,
              borderRadius: 18,
              backgroundColor: "#FF9800" + "15",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: theme.spacing.sm,
            }}
          >
            <Ionicons
              name="game-controller"
              size={18}
              color="#FF9800"
            />
          </View>
          <Text
            weight="semibold"
            align="center"
            numberOfLines={1}
            style={{
              color: theme.colors.brandNavy,
              fontFamily: theme.typography.fontFamily.semibold,
              fontSize: 13,
            }}
          >
            Games
          </Text>
          <Text
            variant="caption"
            align="center"
            style={{
              color: theme.colors.neutral[500],
              fontFamily: theme.typography.fontFamily.regular,
              fontSize: 11,
              marginTop: 2,
            }}
          >
            Play & learn
          </Text>
        </TouchableOpacity>

        {/* Progress */}
        <TouchableOpacity
          onPress={() => router.push("/tutor/progress")}
          style={{
            width: (width - 48) * 0.75 / 2, // 75% of main card width
            backgroundColor: theme.colors.brandWhite,
            borderRadius: 14,
            padding: theme.spacing.md,
            marginRight: theme.spacing.sm,
            borderWidth: 1,
            borderColor: "#9C27B0" + "20",
            alignItems: "center",
            minHeight: 90,
            justifyContent: "center",
            shadowColor: "#9C27B0",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 4,
            // elevation: 2,
          }}
        >
          <View
            style={{
              width: 36,
              height: 36,
              borderRadius: 18,
              backgroundColor: "#9C27B0" + "15",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: theme.spacing.sm,
            }}
          >
            <Ionicons
              name="analytics"
              size={18}
              color="#9C27B0"
            />
          </View>
          <Text
            weight="semibold"
            align="center"
            numberOfLines={1}
            style={{
              color: theme.colors.brandNavy,
              fontFamily: theme.typography.fontFamily.semibold,
              fontSize: 13,
            }}
          >
            Progress
          </Text>
          <Text
            variant="caption"
            align="center"
            style={{
              color: theme.colors.neutral[500],
              fontFamily: theme.typography.fontFamily.regular,
              fontSize: 11,
              marginTop: 2,
            }}
          >
            View stats
          </Text>
        </TouchableOpacity>

        {/* Achievements */}
        <TouchableOpacity
          onPress={() => router.push("/achievements")}
          style={{
            width: (width - 48) * 0.75 / 2, // 75% of main card width
            backgroundColor: theme.colors.brandWhite,
            borderRadius: 14,
            padding: theme.spacing.md,
            marginRight: theme.spacing.sm,
            borderWidth: 1,
            borderColor: "#4CAF50" + "20",
            alignItems: "center",
            minHeight: 90,
            justifyContent: "center",
            shadowColor: "#4CAF50",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 4,
            // elevation: 2,
          }}
        >
          <View
            style={{
              width: 36,
              height: 36,
              borderRadius: 18,
              backgroundColor: "#4CAF50" + "15",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: theme.spacing.sm,
            }}
          >
            <Ionicons
              name="trophy"
              size={18}
              color="#4CAF50"
            />
          </View>
          <Text
            weight="semibold"
            align="center"
            numberOfLines={1}
            style={{
              color: theme.colors.brandNavy,
              fontFamily: theme.typography.fontFamily.semibold,
              fontSize: 13,
            }}
          >
            Awards
          </Text>
          <Text
            variant="caption"
            align="center"
            style={{
              color: theme.colors.neutral[500],
              fontFamily: theme.typography.fontFamily.regular,
              fontSize: 11,
              marginTop: 2,
            }}
          >
            Achievements
          </Text>
        </TouchableOpacity>

        {/* Scenarios */}
        <TouchableOpacity
          onPress={() => router.push("/tutor/scenarios")}
          style={{
            width: (width - 48) * 0.75 / 2, // 75% of main card width
            backgroundColor: theme.colors.brandWhite,
            borderRadius: 14,
            padding: theme.spacing.md,
            marginRight: theme.spacing.sm,
            borderWidth: 1,
            borderColor: "#E91E63" + "20",
            alignItems: "center",
            minHeight: 90,
            justifyContent: "center",
            shadowColor: "#E91E63",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 4,
            // elevation: 0.1,
          }}
        >
          <View
            style={{
              width: 36,
              height: 36,
              borderRadius: 18,
              backgroundColor: "#E91E63" + "15",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: theme.spacing.sm,
            }}
          >
            <Ionicons
              name="chatbubbles"
              size={18}
              color="#E91E63"
            />
          </View>
          <Text
            weight="semibold"
            align="center"
            numberOfLines={1}
            style={{
              color: theme.colors.brandNavy,
              fontFamily: theme.typography.fontFamily.semibold,
              fontSize: 13,
            }}
          >
            Scenarios
          </Text>
          <Text
            variant="caption"
            align="center"
            style={{
              color: theme.colors.neutral[500],
              fontFamily: theme.typography.fontFamily.regular,
              fontSize: 11,
              marginTop: 2,
            }}
          >
            Practice
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </Animated.View>
  );
};

export default QuickActionsSection;
