import React from "react";
import { View, StyleSheet, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import { useTheme } from "../../../shared/context/ThemeContext";
import SafeAreaWrapper from "../../../shared/components/SafeAreaWrapper";
import {
  Container,
  Row,
  Column,
  Spacer,
  Text,
  Heading,
  ModernCard,
  ModernButton,
  ModernBadge,
} from "../../../shared/components";
import { Ionicons } from "@expo/vector-icons";

/**
 * Scenarios Screen
 * Displays a list of learning scenarios for the user to choose from
 */
export default function ScenariosScreen() {
  const router = useRouter();
  const { theme } = useTheme();

  // Sample learning scenarios
  const learningScenarios = [
    {
      id: "s1",
      title: "Greetings & Introductions",
      description: "Learn how to introduce yourself and greet others",
      level: "Beginner",
      icon: "hand-left-outline",
      color: theme.colors.brandGreen,
      completed: true,
    },
    {
      id: "s2",
      title: "Ordering Food",
      description: "Practice ordering food at a restaurant",
      level: "Beginner",
      icon: "restaurant-outline",
      color: theme.colors.brandNavy,
      completed: true,
    },
    {
      id: "s3",
      title: "Making Plans",
      description: "Learn how to make plans with friends",
      level: "Intermediate",
      icon: "calendar-outline",
      color: "#FF9800", // Orange
      completed: true,
    },
    {
      id: "s4",
      title: "Shopping",
      description: "Practice shopping conversations",
      level: "Beginner",
      icon: "cart-outline",
      color: "#2196F3", // Blue
      completed: false,
    },
    {
      id: "s5",
      title: "Asking for Directions",
      description: "Learn how to ask for and give directions",
      level: "Beginner",
      icon: "map-outline",
      color: "#9C27B0", // Purple
      completed: false,
    },
    {
      id: "s6",
      title: "Job Interview",
      description: "Practice for a job interview",
      level: "Advanced",
      icon: "briefcase-outline",
      color: "#F44336", // Red
      completed: false,
    },
    {
      id: "s7",
      title: "Making a Complaint",
      description: "Learn how to make a complaint politely",
      level: "Intermediate",
      icon: "alert-circle-outline",
      color: "#607D8B", // Blue Grey
      completed: false,
    },
  ];

  // Navigate to scenario
  const navigateToScenario = (scenarioId) => {
    // Find the scenario to get its details
    const allScenarios = [
      ...beginnerScenarios,
      ...intermediateScenarios,
      ...advancedScenarios,
    ];
    const scenario = allScenarios.find((s) => s.id === scenarioId);

    if (!scenario) {
      console.error(`Scenario with ID ${scenarioId} not found`);
      return;
    }

    // Use standalone conversation route for better reliability
    router.push({
      pathname: "/tutor/standalone-conversation",
      params: {
        scenarioId: scenarioId,
        title: scenario.title,
        level: scenario.level,
      },
    });
  };

  // Group scenarios by level
  const beginnerScenarios = learningScenarios.filter(
    (scenario) => scenario.level === "Beginner"
  );
  const intermediateScenarios = learningScenarios.filter(
    (scenario) => scenario.level === "Intermediate"
  );
  const advancedScenarios = learningScenarios.filter(
    (scenario) => scenario.level === "Advanced"
  );

  // Render a scenario group
  const renderScenarioGroup = (title, scenarios) => (
    <>
      <Heading
        level="h3"
        gutterBottom
        style={{
          color: theme.colors.brandNavy,
          fontFamily: theme.typography.fontFamily.semibold,
        }}
      >
        {title}
      </Heading>

      {scenarios.map((scenario) => (
        <ModernCard
          key={scenario.id}
          interactive
          onPress={() => navigateToScenario(scenario.id)}
          style={{
            marginBottom: theme.spacing.sm,
            backgroundColor: theme.colors.brandWhite,
            borderWidth: 1,
            borderColor: scenario.color + "20",
          }}
        >
          <Row align="center">
            <View
              style={{
                width: 48,
                height: 48,
                borderRadius: 24,
                backgroundColor: scenario.color + "15",
                alignItems: "center",
                justifyContent: "center",
                marginRight: theme.spacing.md,
              }}
            >
              <Ionicons name={scenario.icon} size={24} color={scenario.color} />
            </View>

            <Column style={{ flex: 1, minWidth: "85%", maxWidth: "90%" }}>
              <Row
                align="center"
                justify="space-between"
                style={{ marginBottom: 2 }}
              >
                <Text
                  weight="semibold"
                  numberOfLines={1}
                  ellipsizeMode="tail"
                  style={{
                    color: theme.colors.brandNavy,
                    fontFamily: theme.typography.fontFamily.semibold,
                    flex: 1,
                  }}
                >
                  {scenario.title}
                </Text>
                {scenario.completed && (
                  <ModernBadge
                    text="Completed"
                    variant="success"
                    size="sm"
                    style={{
                      marginLeft: 8,
                      position: "absolute",
                      right: -20,
                      top: -20,
                    }}
                  />
                )}
              </Row>
              <Text
                variant="caption"
                numberOfLines={2}
                ellipsizeMode="tail"
                style={{
                  color: theme.colors.neutral[600],
                  fontFamily: theme.typography.fontFamily.regular,
                  lineHeight: 16,
                  maxWidth: "95%",
                }}
              >
                {scenario.description}
              </Text>
            </Column>

            <Ionicons
              name="chevron-forward"
              size={20}
              color={scenario.color}
              style={{ position: "absolute", right: 20 }}
            />
          </Row>
        </ModernCard>
      ))}

      <Spacer size="lg" />
    </>
  );

  return (
    <SafeAreaWrapper>
      <Container>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            padding: theme.spacing.lg,
            paddingBottom: 100, // Add padding to avoid floating tab bar overlap
          }}
        >
          <Heading
            level="h1"
            gutterBottom
            style={{
              color: theme.colors.brandNavy,
              fontFamily: theme.typography.fontFamily.bold,
            }}
          >
            Learning Scenarios
          </Heading>
          <Text
            gutterBottom
            style={{
              color: theme.colors.neutral[600],
              fontFamily: theme.typography.fontFamily.regular,
            }}
          >
            Choose a scenario to practice with our AI tutor
          </Text>

          <Spacer size="lg" />

          {/* Render scenario groups */}
          {renderScenarioGroup("Beginner", beginnerScenarios)}
          {renderScenarioGroup("Intermediate", intermediateScenarios)}
          {renderScenarioGroup("Advanced", advancedScenarios)}
        </ScrollView>
      </Container>
    </SafeAreaWrapper>
  );
}
