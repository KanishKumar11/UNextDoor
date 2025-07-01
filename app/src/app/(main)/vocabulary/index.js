import React, { useState, useEffect } from "react";
import { View, StyleSheet, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import SafeAreaWrapper from "../../../shared/components/SafeAreaWrapper";
import {
  Container,
  Heading,
  Text,
  ModernButton,
  ModernCard,
  Row,
  Column,
  Spacer,
  ModernProgressBar,
} from "../../../shared/components";
import modernTheme from "../../../shared/styles/modernTheme";
import { vocabularyService } from "../../../features/vocabulary/services/vocabularyService";

/**
 * VocabularyScreen
 * Main screen for vocabulary learning features
 */
const VocabularyScreen = () => {
  const router = useRouter();
  const [progress, setProgress] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load vocabulary progress
  useEffect(() => {
    const loadProgress = async () => {
      try {
        setIsLoading(true);
        const result = await vocabularyService.getVocabularyProgress();

        if (result.success) {
          setProgress(result.progress);
        } else {
          // Use sample progress data for development
          setProgress({
            wordsLearned: 24,
            totalWords: 100,
            masteryLevel: 35,
            categories: {
              general: { learned: 10, total: 30 },
              food: { learned: 8, total: 25 },
              travel: { learned: 6, total: 25 },
              business: { learned: 0, total: 20 },
            },
          });
        }

        setIsLoading(false);
      } catch (error) {
        console.error("Error loading vocabulary progress:", error);
        setIsLoading(false);
      }
    };

    loadProgress();
  }, []);

  // Navigate to Match Word game
  const navigateToMatchWord = (category, difficulty) => {
    router.push(
      `/vocabulary/match-word?category=${category}&difficulty=${difficulty}`
    );
  };

  // Render loading state
  if (isLoading) {
    return (
      <SafeAreaWrapper>
        <Container withPadding>
          <Column align="center" justify="center" style={{ flex: 1 }}>
            <Ionicons
              name="hourglass-outline"
              size={48}
              color={modernTheme.colors.primary[500]}
            />
            <Spacer size="md" />
            <Text>Loading vocabulary data...</Text>
          </Column>
        </Container>
      </SafeAreaWrapper>
    );
  }

  return (
    <SafeAreaWrapper>
      <Container>
        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Header */}
          <View style={styles.header}>
            <Heading level="h1">Vocabulary</Heading>
            <Text color="neutral.600">
              Learn and practice Korean vocabulary
            </Text>
          </View>

          {/* Progress overview */}
          {progress && (
            <ModernCard style={styles.progressCard}>
              <Row justify="space-between" align="center">
                <Heading level="h3">Your Progress</Heading>
                <ModernButton
                  text="View Details"
                  variant="subtle"
                  size="sm"
                  onPress={() => router.push("/vocabulary/mastery")}
                  rightIcon={<Ionicons name="chevron-forward" size={16} />}
                />
              </Row>

              <Row align="center" style={styles.progressRow}>
                <View style={styles.progressCircle}>
                  <Text
                    weight="bold"
                    align="center"
                    style={styles.progressNumber}
                  >
                    {progress.masteryLevel}%
                  </Text>
                </View>

                <Column style={{ flex: 1, marginLeft: 16 }}>
                  <Text weight="semibold">
                    {progress.wordsLearned} of {progress.totalWords} words
                    learned
                  </Text>
                  <ModernProgressBar
                    value={progress.wordsLearned}
                    max={progress.totalWords}
                    height={8}
                    rounded
                    style={{ marginTop: 8 }}
                  />
                </Column>
              </Row>
            </ModernCard>
          )}

          {/* Match Word Game Card */}
          <ModernCard style={styles.gameCard}>
            <Row>
              <View style={styles.gameIconContainer}>
                <Ionicons
                  name="grid-outline"
                  size={32}
                  color={modernTheme.colors.primary[500]}
                />
              </View>

              <Column style={{ flex: 1, marginLeft: 16 }}>
                <Heading level="h3">Match the Word</Heading>
                <Text color="neutral.600">
                  Match Korean words with their English translations
                </Text>

                <Spacer size="md" />

                <Row>
                  <ModernButton
                    text="Beginner"
                    variant="outline"
                    size="sm"
                    onPress={() => navigateToMatchWord("general", "beginner")}
                    style={{ marginRight: 8 }}
                  />
                  <ModernButton
                    text="Intermediate"
                    variant="outline"
                    size="sm"
                    onPress={() =>
                      navigateToMatchWord("general", "intermediate")
                    }
                    style={{ marginRight: 8 }}
                  />
                  <ModernButton
                    text="Advanced"
                    variant="outline"
                    size="sm"
                    onPress={() => navigateToMatchWord("general", "advanced")}
                  />
                </Row>
              </Column>
            </Row>
          </ModernCard>

          {/* Category Cards */}
          <Heading level="h2" style={styles.sectionHeading}>
            Categories
          </Heading>

          {/* Food Category */}
          <ModernCard style={styles.categoryCard}>
            <Row>
              <View
                style={[
                  styles.categoryIconContainer,
                  { backgroundColor: modernTheme.colors.accent[100] },
                ]}
              >
                <Ionicons
                  name="restaurant-outline"
                  size={32}
                  color={modernTheme.colors.accent[500]}
                />
              </View>

              <Column style={{ flex: 1, marginLeft: 16 }}>
                <Heading level="h3">Food & Dining</Heading>
                <Text color="neutral.600">
                  Learn vocabulary for ordering food and dining out
                </Text>

                {progress && progress.categories.food && (
                  <>
                    <Text weight="medium" style={{ marginTop: 8 }}>
                      {progress.categories.food.learned} of{" "}
                      {progress.categories.food.total} words
                    </Text>
                    <ModernProgressBar
                      value={progress.categories.food.learned}
                      max={progress.categories.food.total}
                      height={4}
                      rounded
                      style={{ marginTop: 4 }}
                    />
                  </>
                )}

                <Spacer size="sm" />

                <ModernButton
                  text="Practice"
                  variant="primary"
                  size="sm"
                  onPress={() => navigateToMatchWord("food", "beginner")}
                  style={{ alignSelf: "flex-start" }}
                />
              </Column>
            </Row>
          </ModernCard>

          {/* Travel Category */}
          <ModernCard style={styles.categoryCard}>
            <Row>
              <View
                style={[
                  styles.categoryIconContainer,
                  { backgroundColor: modernTheme.colors.secondary[100] },
                ]}
              >
                <Ionicons
                  name="airplane-outline"
                  size={32}
                  color={modernTheme.colors.secondary[500]}
                />
              </View>

              <Column style={{ flex: 1, marginLeft: 16 }}>
                <Heading level="h3">Travel</Heading>
                <Text color="neutral.600">
                  Essential vocabulary for traveling in Korea
                </Text>

                {progress && progress.categories.travel && (
                  <>
                    <Text weight="medium" style={{ marginTop: 8 }}>
                      {progress.categories.travel.learned} of{" "}
                      {progress.categories.travel.total} words
                    </Text>
                    <ModernProgressBar
                      value={progress.categories.travel.learned}
                      max={progress.categories.travel.total}
                      height={4}
                      rounded
                      style={{ marginTop: 4 }}
                    />
                  </>
                )}

                <Spacer size="sm" />

                <ModernButton
                  text="Practice"
                  variant="primary"
                  size="sm"
                  onPress={() => navigateToMatchWord("travel", "beginner")}
                  style={{ alignSelf: "flex-start" }}
                />
              </Column>
            </Row>
          </ModernCard>

          <Spacer size="xl" />
        </ScrollView>
      </Container>
    </SafeAreaWrapper>
  );
};

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  progressCard: {
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 16,
  },
  progressRow: {
    marginTop: 16,
  },
  progressCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: modernTheme.colors.primary[100],
    justifyContent: "center",
    alignItems: "center",
  },
  progressNumber: {
    color: modernTheme.colors.primary[700],
    fontSize: 18,
  },
  gameCard: {
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 16,
  },
  gameIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 16,
    backgroundColor: modernTheme.colors.primary[100],
    justifyContent: "center",
    alignItems: "center",
  },
  sectionHeading: {
    paddingHorizontal: 16,
    marginTop: 16,
    marginBottom: 8,
  },
  categoryCard: {
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 16,
  },
  categoryIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
  },
});

export default VocabularyScreen;
