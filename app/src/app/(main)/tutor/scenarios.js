import React, { useState } from "react";
import { View, StyleSheet, ScrollView, TouchableOpacity, Animated } from "react-native";
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
import { LinearGradient } from 'expo-linear-gradient';
import { BRAND_COLORS } from "../../../shared/constants/colors";
import { learningScenarios } from './scenarioData';

/**
 * Scenarios Screen
 * Displays a list of learning scenarios for the user to choose from
 */
export default function ScenariosScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const [selectedLevel, setSelectedLevel] = useState("All");

  // Use static learning scenarios
  // const learningScenarios = [...];

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

  // Filter scenarios based on selected level
  const getFilteredScenarios = () => {
    if (selectedLevel === "All") {
      return learningScenarios;
    }
    return learningScenarios.filter(scenario => scenario.level === selectedLevel);
  };

  // Render level filter tabs
  const renderLevelTabs = () => {
    const levels = ["All", "Beginner", "Intermediate", "Advanced"];

    return (
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: theme.spacing.md,
          // paddingVertical: theme.spacing.sm,
          // paddingRight: theme.spacing.xl, // Extra padding to prevent cropping
        }}
        style={{
          height: 60,
          // marginBottom: theme.spacing.xl,
          marginHorizontal: -theme.spacing.xs, // Negative margin for better alignment
        }}
      >
        {levels.map((level) => (
          <TouchableOpacity
            key={level}
            onPress={() => setSelectedLevel(level)}
            style={[
              styles.levelTab,
              {
                backgroundColor: selectedLevel === level
                  ? BRAND_COLORS.EXPLORER_TEAL
                  : BRAND_COLORS.CARD_BACKGROUND,
                borderColor: selectedLevel === level
                  ? BRAND_COLORS.EXPLORER_TEAL
                  : BRAND_COLORS.EXPLORER_TEAL + "30",
                marginRight: theme.spacing.sm,
              }
            ]}
          >
            <Text
              weight="semibold"
              style={{
                color: selectedLevel === level
                  ? BRAND_COLORS.WHISPER_WHITE
                  : BRAND_COLORS.SHADOW_GREY,
                fontFamily: theme.typography.fontFamily.semibold,
                fontSize: 14,
              }}
            >
              {level}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    );
  };

  // Render enhanced scenario card
  const renderScenarioCard = (scenario) => (
    <TouchableOpacity
      key={scenario.id}
      onPress={() => navigateToScenario(scenario.id)}
      style={[
        styles.scenarioCard,
        {
          backgroundColor: BRAND_COLORS.CARD_BACKGROUND,
          borderColor: scenario.color + "20",
          shadowColor: scenario.color,
          elevation: 0
        }
      ]}
    >
      {/* Gradient Header */}
      <LinearGradient
        colors={[scenario.color + "15", scenario.color + "05"]}
        style={styles.cardHeader}
      >
        <View style={styles.iconContainer}>
          <View
            style={[
              styles.iconBackground,
              { backgroundColor: scenario.color + "20" }
            ]}
          >
            <Ionicons
              name={scenario.icon}
              size={28}
              color={scenario.color}
            />
          </View>
        </View>

        {scenario.completed && (
          <View style={styles.completedBadge}>
            <Ionicons name="checkmark-circle" size={20} color={BRAND_COLORS.EXPLORER_TEAL} />
          </View>
        )}
      </LinearGradient>

      {/* Content */}
      <View style={styles.cardContent}>
        <Text
          weight="bold"
          numberOfLines={1}
          ellipsizeMode="tail"
          style={[
            styles.scenarioTitle,
            { color: BRAND_COLORS.OCEAN_BLUE }
          ]}
        >
          {scenario.title}
        </Text>

        <Text
          numberOfLines={2}
          ellipsizeMode="tail"
          style={[
            styles.scenarioDescription,
            { color: BRAND_COLORS.SHADOW_GREY }
          ]}
        >
          {scenario.description}
        </Text>

        {/* Duration */}
        <Row align="center" style={{ marginTop: theme.spacing.sm }}>
          <Ionicons name="time-outline" size={14} color={BRAND_COLORS.SHADOW_GREY} />
          <Text
            variant="caption"
            style={[
              styles.durationText,
              { color: BRAND_COLORS.SHADOW_GREY }
            ]}
          >
            5-10 min
          </Text>
        </Row>
      </View>

      {/* Action Arrow */}
      <View style={styles.actionArrow}>
        <Ionicons
          name="arrow-forward"
          size={18}
          color={scenario.color}
        />
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaWrapper>
      <Container>
        {/* Header */}
        <View style={styles.header}>
          <Column>
            <Text
              variant="caption"
              weight="medium"
              style={[
                styles.headerLabel,
                { color: BRAND_COLORS.SHADOW_GREY }
              ]}
            >
              PRACTICE
            </Text>
            <Heading
              level="h2"
              style={[
                styles.headerTitle,
                { color: BRAND_COLORS.OCEAN_BLUE }
              ]}
            >
              Learning Scenarios
            </Heading>
          </Column>
        </View>

        {/* Level Filter Tabs */}
        {renderLevelTabs()}

        {/* Scenarios Grid */}
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          <Text
            style={[
              styles.subtitle,
              { color: BRAND_COLORS.SHADOW_GREY }
            ]}
          >
            Choose a scenario to practice with Miles, your AI tutor
          </Text>

          <View style={styles.scenariosGrid}>
            {getFilteredScenarios().map(renderScenarioCard)}
          </View>

          {/* Empty State */}
          {getFilteredScenarios().length === 0 && (
            <View style={styles.emptyState}>
              <Ionicons
                name="chatbubbles-outline"
                size={64}
                color={BRAND_COLORS.SHADOW_GREY}
              />
              <Text
                weight="semibold"
                style={[
                  styles.emptyTitle,
                  { color: BRAND_COLORS.SHADOW_GREY }
                ]}
              >
                No scenarios found
              </Text>
              <Text
                style={[
                  styles.emptyDescription,
                  { color: BRAND_COLORS.SHADOW_GREY }
                ]}
              >
                Try selecting a different level
              </Text>
            </View>
          )}
        </ScrollView>
      </Container>
    </SafeAreaWrapper>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    paddingTop: 8,
  },
  headerLabel: {
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    fontSize: 11,
    marginBottom: -4,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  levelTab: {
    paddingHorizontal: 16,
    height: 32,
    paddingVertical: 4,
    borderRadius: 20,
    borderWidth: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 100,
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 24,
    lineHeight: 22,
  },
  scenariosGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  scenarioCard: {
    width: '48%',
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 16,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    overflow: 'hidden',
  },
  cardHeader: {
    height: 80,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconBackground: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  completedBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
  },
  cardContent: {
    padding: 16,
  },
  scenarioTitle: {
    fontSize: 16,
    marginBottom: 8,
    lineHeight: 20,
  },
  scenarioDescription: {
    fontSize: 14,
    lineHeight: 18,
    marginBottom: 12,
  },

  durationText: {
    fontSize: 12,
    marginLeft: 4,
  },
  actionArrow: {
    position: 'absolute',
    bottom: 16,
    right: 16,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
  },
  emptyTitle: {
    fontSize: 18,
    marginTop: 16,
    marginBottom: 8,
  },
  emptyDescription: {
    fontSize: 14,
    textAlign: 'center',
  },
});
