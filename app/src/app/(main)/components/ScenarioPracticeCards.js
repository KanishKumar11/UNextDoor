import React from 'react';
import { View, TouchableOpacity, ScrollView, Animated } from 'react-native';
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

const ScenarioPracticeCards = ({ fadeAnim, scaleAnim }) => {
  const { theme } = useTheme();
  const router = useRouter();

  // Define scenario data array
  const scenarios = [
    {
      scenarioId: 'restaurant-ordering',
      title: 'Restaurant Ordering',
      level: 'Beginner',
      duration: '5-10 min',
      description: 'Practice ordering food and drinks in Korean restaurants',
      icon: 'restaurant-outline',
      bgColor: theme.colors.whisperWhite,
      borderColor: theme.colors.explorerTeal + '20',
      iconBackground: theme.colors.explorerTeal + '15',
      iconColor: theme.colors.explorerTeal,
      shadowColor: theme.colors.oceanBlue,
      textColor: theme.colors.oceanBlue,
      levelColor: theme.colors.brandGreen,
      levelBackground: theme.colors.brandGreen + '10',
      durationColor: theme.colors.neutral[500],
    },
    {
      scenarioId: 'shopping-assistance',
      title: 'Shopping Assistance',
      level: 'Intermediate',
      duration: '8-12 min',
      description: 'Learn to ask for help and find items while shopping',
      icon: 'bag-outline',
      bgColor: theme.colors.brandWhite,
      borderColor: BRAND_COLORS.SKY_AQUA + '20',
      iconBackground: BRAND_COLORS.SKY_AQUA + '15',
      iconColor: BRAND_COLORS.SKY_AQUA,
      shadowColor: theme.colors.brandNavy,
      textColor: theme.colors.brandNavy,
      levelColor: BRAND_COLORS.SKY_AQUA,
      levelBackground: BRAND_COLORS.SKY_AQUA + '10',
      durationColor: theme.colors.neutral[500],
    },
    {
      scenarioId: 'travel-directions',
      title: 'Travel & Directions',
      level: 'Intermediate',
      duration: '10-15 min',
      description: 'Navigate and ask for directions in Korean cities',
      icon: 'map-outline',
      bgColor: theme.colors.whisperWhite,
      borderColor: theme.colors.rucksackBrown + '20',
      iconBackground: BRAND_COLORS.RUCKSACK_BROWN + '15',
      iconColor: BRAND_COLORS.RUCKSACK_BROWN,
      shadowColor: theme.colors.oceanBlue,
      textColor: theme.colors.brandNavy,
      levelColor: BRAND_COLORS.RUCKSACK_BROWN,
      levelBackground: BRAND_COLORS.RUCKSACK_BROWN + '10',
      durationColor: theme.colors.neutral[500],
    },
  ];

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
            Practice
          </Text>
          <Heading
            level="h3"
            style={{
              color: theme.colors.oceanBlue,
              fontFamily: theme.typography.fontFamily.bold,
              fontSize: 20,
            }}
          >
            Real-World Scenarios
          </Heading>
        </Column>
        <TouchableOpacity
          onPress={() => router.push("/tutor/scenarios")}
          style={{
            backgroundColor: theme.colors.explorerTeal + "15",
            paddingHorizontal: 12,
            paddingVertical: 6,
            borderRadius: 16,
            borderWidth: 1,
            borderColor: theme.colors.explorerTeal + "30",
          }}
        >
          <Text
            weight="semibold"
            style={{
              color: theme.colors.explorerTeal,
              fontFamily: theme.typography.fontFamily.semibold,
              fontSize: 12,
            }}
          >
            View All
          </Text>
        </TouchableOpacity>
      </Row>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{
          paddingRight: theme.spacing.md,
          paddingTop: theme.spacing.md,
        }}
        style={{ marginTop: theme.spacing.xs }}
      >
        {scenarios.map((scenario) => (
          <TouchableOpacity
            key={scenario.scenarioId}
            onPress={() =>
              router.push({
                pathname: "/tutor/standalone-conversation",
                params: {
                  scenarioId: scenario.scenarioId,
                  title: scenario.title,
                  level: scenario.level,
                },
              })
            }
            style={{
              width: 280,
              backgroundColor: scenario.bgColor,
              borderRadius: 20,
              marginRight: theme.spacing.md,
              padding: theme.spacing.lg,
              borderWidth: 1,
              borderColor: scenario.borderColor,
              shadowColor: scenario.shadowColor,
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.05,
              shadowRadius: 8,
              // elevation: 2,
            }}
          >
            <View
              style={{
                width: 56,
                height: 56,
                borderRadius: 28,
                backgroundColor: scenario.iconBackground,
                alignItems: "center",
                justifyContent: "center",
                marginBottom: theme.spacing.md,
              }}
            >
              <Ionicons
                name={scenario.icon}
                size={28}
                color={scenario.iconColor}
              />
            </View>
            <Text
              weight="semibold"
              style={{
                color: scenario.textColor,
                fontFamily: theme.typography.fontFamily.semibold,
                fontSize: 18,
                marginBottom: 8,
                lineHeight: 22,
              }}
            >
              {scenario.title}
            </Text>
            <Text
              style={{
                color: theme.colors.neutral[600],
                fontFamily: theme.typography.fontFamily.regular,
                fontSize: 14,
                lineHeight: 20,
                marginBottom: theme.spacing.md,
              }}
            >
              {scenario.description}
            </Text>
            <Row justify="space-between" align="center">
              <View
                style={{
                  backgroundColor: scenario.levelBackground,
                  paddingHorizontal: 8,
                  paddingVertical: 4,
                  borderRadius: 12,
                }}
              >
                <Text
                  variant="caption"
                  weight="medium"
                  style={{
                    color: scenario.levelColor,
                    fontFamily: theme.typography.fontFamily.medium,
                    fontSize: 11,
                  }}
                >
                  {scenario.level}
                </Text>
              </View>
              <Text
                variant="caption"
                style={{
                  color: scenario.durationColor,
                  fontFamily: theme.typography.fontFamily.medium,
                  fontSize: 12,
                }}
              >
                {scenario.duration}
              </Text>
            </Row>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </Animated.View>
  );
};

export default ScenarioPracticeCards;
