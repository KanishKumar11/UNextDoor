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

const ScenarioPracticeCards = ({ fadeAnim, scaleAnim }) => {
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
            Practice
          </Text>
          <Heading
            level="h3"
            style={{
              color: theme.colors.brandNavy,
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
            See All
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
        {/* Restaurant Scenario */}
        <TouchableOpacity
          onPress={() =>
            router.push({
              pathname: "/tutor/standalone-conversation",
              params: {
                scenarioId: "restaurant-ordering",
                title: "Restaurant Ordering",
                level: "Beginner",
              },
            })
          }
          style={{
            width: 280,
            backgroundColor: theme.colors.brandWhite,
            borderRadius: 20,
            marginRight: theme.spacing.md,
            padding: theme.spacing.lg,
            borderWidth: 1,
            borderColor: theme.colors.brandGreen + "20",
            shadowColor: theme.colors.brandNavy,
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.05,
            shadowRadius: 8,
            elevation: 2,
          }}
        >
          <View
            style={{
              width: 56,
              height: 56,
              borderRadius: 28,
              backgroundColor: theme.colors.brandGreen + "15",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: theme.spacing.md,
            }}
          >
            <Ionicons
              name="restaurant-outline"
              size={28}
              color={theme.colors.brandGreen}
            />
          </View>
          <Text
            weight="semibold"
            style={{
              color: theme.colors.brandNavy,
              fontFamily: theme.typography.fontFamily.semibold,
              fontSize: 18,
              marginBottom: 8,
              lineHeight: 22,
            }}
          >
            Restaurant Ordering
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
            Practice ordering food and drinks in Korean restaurants
          </Text>
          <Row justify="space-between" align="center">
            <View
              style={{
                backgroundColor: theme.colors.brandGreen + "10",
                paddingHorizontal: 8,
                paddingVertical: 4,
                borderRadius: 12,
              }}
            >
              <Text
                variant="caption"
                weight="medium"
                style={{
                  color: theme.colors.brandGreen,
                  fontFamily: theme.typography.fontFamily.medium,
                  fontSize: 11,
                }}
              >
                Beginner
              </Text>
            </View>
            <Text
              variant="caption"
              style={{
                color: theme.colors.neutral[500],
                fontFamily: theme.typography.fontFamily.medium,
                fontSize: 12,
              }}
            >
              5-10 min
            </Text>
          </Row>
        </TouchableOpacity>

        {/* Shopping Scenario */}
        <TouchableOpacity
          onPress={() =>
            router.push({
              pathname: "/tutor/standalone-conversation",
              params: {
                scenarioId: "shopping-assistance",
                title: "Shopping Assistance",
                level: "Intermediate",
              },
            })
          }
          style={{
            width: 280,
            backgroundColor: theme.colors.brandWhite,
            borderRadius: 20,
            marginRight: theme.spacing.md,
            padding: theme.spacing.lg,
            borderWidth: 1,
            borderColor: "#2196F3" + "20",
            shadowColor: theme.colors.brandNavy,
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.05,
            shadowRadius: 8,
            elevation: 2,
          }}
        >
          <View
            style={{
              width: 56,
              height: 56,
              borderRadius: 28,
              backgroundColor: "#2196F3" + "15",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: theme.spacing.md,
            }}
          >
            <Ionicons
              name="bag-outline"
              size={28}
              color="#2196F3"
            />
          </View>
          <Text
            weight="semibold"
            style={{
              color: theme.colors.brandNavy,
              fontFamily: theme.typography.fontFamily.semibold,
              fontSize: 18,
              marginBottom: 8,
              lineHeight: 22,
            }}
          >
            Shopping Assistance
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
            Learn to ask for help and find items while shopping
          </Text>
          <Row justify="space-between" align="center">
            <View
              style={{
                backgroundColor: "#2196F3" + "10",
                paddingHorizontal: 8,
                paddingVertical: 4,
                borderRadius: 12,
              }}
            >
              <Text
                variant="caption"
                weight="medium"
                style={{
                  color: "#2196F3",
                  fontFamily: theme.typography.fontFamily.medium,
                  fontSize: 11,
                }}
              >
                Intermediate
              </Text>
            </View>
            <Text
              variant="caption"
              style={{
                color: theme.colors.neutral[500],
                fontFamily: theme.typography.fontFamily.medium,
                fontSize: 12,
              }}
            >
              8-12 min
            </Text>
          </Row>
        </TouchableOpacity>

        {/* Travel Scenario */}
        <TouchableOpacity
          onPress={() =>
            router.push({
              pathname: "/tutor/standalone-conversation",
              params: {
                scenarioId: "travel-directions",
                title: "Travel & Directions",
                level: "Intermediate",
              },
            })
          }
          style={{
            width: 280,
            backgroundColor: theme.colors.brandWhite,
            borderRadius: 20,
            marginRight: theme.spacing.md,
            padding: theme.spacing.lg,
            borderWidth: 1,
            borderColor: "#FF9800" + "20",
            shadowColor: theme.colors.brandNavy,
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.05,
            shadowRadius: 8,
            elevation: 2,
          }}
        >
          <View
            style={{
              width: 56,
              height: 56,
              borderRadius: 28,
              backgroundColor: "#FF9800" + "15",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: theme.spacing.md,
            }}
          >
            <Ionicons
              name="map-outline"
              size={28}
              color="#FF9800"
            />
          </View>
          <Text
            weight="semibold"
            style={{
              color: theme.colors.brandNavy,
              fontFamily: theme.typography.fontFamily.semibold,
              fontSize: 18,
              marginBottom: 8,
              lineHeight: 22,
            }}
          >
            Travel & Directions
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
            Navigate and ask for directions in Korean cities
          </Text>
          <Row justify="space-between" align="center">
            <View
              style={{
                backgroundColor: "#FF9800" + "10",
                paddingHorizontal: 8,
                paddingVertical: 4,
                borderRadius: 12,
              }}
            >
              <Text
                variant="caption"
                weight="medium"
                style={{
                  color: "#FF9800",
                  fontFamily: theme.typography.fontFamily.medium,
                  fontSize: 11,
                }}
              >
                Intermediate
              </Text>
            </View>
            <Text
              variant="caption"
              style={{
                color: theme.colors.neutral[500],
                fontFamily: theme.typography.fontFamily.medium,
                fontSize: 12,
              }}
            >
              10-15 min
            </Text>
          </Row>
        </TouchableOpacity>
      </ScrollView>
    </Animated.View>
  );
};

export default ScenarioPracticeCards;
