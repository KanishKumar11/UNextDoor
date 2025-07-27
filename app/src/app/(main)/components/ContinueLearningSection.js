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
  Column
} from '../../../shared/components';
import { useRouter } from 'expo-router';
import { BRAND_COLORS } from '../../../shared/constants/colors';

const ContinueLearningSection = ({ currentLesson, fadeAnim, scaleAnim }) => {
  const { theme } = useTheme();
  const router = useRouter();

  if (!currentLesson) return null;

  return (
    <Animated.View
      style={{
        opacity: fadeAnim,
        transform: [{ scale: scaleAnim }],
        paddingHorizontal: theme.spacing.md,
      }}
    >
      <Heading
        level="h3"
        style={{
          marginBottom: theme.spacing.sm,
          color: theme.colors.oceanBlue,
          fontFamily: theme.typography.fontFamily.semibold,
        }}
      >
        Continue Learning
      </Heading>
      <ModernCard
        variant="elevated"
        style={{
          backgroundColor: theme.colors.explorerTeal + "10",
          borderRadius: theme.borderRadius.lg,
          borderWidth: 1,
          borderColor: theme.colors.explorerTeal + "20",
        }}
      >
        <Row align="center">
          <View
            style={{
              width: 56,
              height: 56,
              borderRadius: 28,
              backgroundColor: theme.colors.brandGreen + "20",
              alignItems: "center",
              justifyContent: "center",
              marginRight: theme.spacing.md,
            }}
          >
            <Ionicons
              name="book-outline"
              size={28}
              color={BRAND_COLORS.EXPLORER_TEAL}
            />
          </View>
          <Column style={{ flex: 1 }}>
            <Text
              weight="semibold"
              numberOfLines={1}
              ellipsizeMode="tail"
              style={{
                color: BRAND_COLORS.OCEAN_BLUE,
                fontFamily: theme.typography.fontFamily.semibold,
                fontSize: 16,
                marginBottom: 2,
              }}
            >
              {currentLesson.name}
            </Text>
            <Text
              variant="caption"
              weight="medium"
              numberOfLines={1}
              style={{
                color: BRAND_COLORS.SHADOW_GREY,
                fontFamily: theme.typography.fontFamily.medium,
                fontSize: 13,
              }}
            >
              {currentLesson.level} • {currentLesson.duration || "5 min"}
            </Text>
          </Column>
          <ModernButton
            text="Continue"
            variant="solid"
            size="sm"
            onPress={() =>
              router.push(`/tutor/lesson/${currentLesson.lessonId}`)
            }
            style={{
              backgroundColor: theme.colors.brandGreen,
              paddingHorizontal: 16,
              paddingVertical: 8,
            }}
            textStyle={{
              fontSize: 12,
              fontFamily: theme.typography.fontFamily.semibold,
            }}
          />
        </Row>
      </ModernCard>
    </Animated.View>
  );
};

export default ContinueLearningSection;
