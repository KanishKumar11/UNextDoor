import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import {
  Text,
  Heading,
  ModernCard,
  Spacer,
  ModernButton,
  ModernTextInput,
  Row,
} from "../../../shared/components";
import modernTheme from "../../../shared/styles/modernTheme";
import { useRouter } from "expo-router";
import { useAuth } from "../../../features/auth/hooks/useAuth";
import { grammarService } from "../../grammar/services/grammarService";
import { vocabularyAnalysisService } from "../../vocabulary/services/vocabularyAnalysisService";
import GrammarAnalysis from "../../grammar/components/GrammarAnalysis";
import VocabularyAnalysis from "../../vocabulary/components/VocabularyAnalysis";
import { useUserLevel } from "../../level/context/UserLevelContext";

/**
 * LanguageAnalysisScreen component
 * Screen for analyzing grammar and vocabulary
 */
const LanguageAnalysisScreen = () => {
  // Hooks
  const router = useRouter();
  const { user } = useAuth();
  const { addXp } = useUserLevel();

  // State
  const [activeTab, setActiveTab] = useState("grammar");
  const [text, setText] = useState("");
  const [userLevel, setUserLevel] = useState("beginner");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [grammarAnalysis, setGrammarAnalysis] = useState(null);
  const [vocabularyAnalysis, setVocabularyAnalysis] = useState(null);
  const [error, setError] = useState(null);
  const [showResults, setShowResults] = useState(false);

  // Reset analysis when tab changes
  useEffect(() => {
    setShowResults(false);
    setError(null);
  }, [activeTab]);

  // Analyze text
  const analyzeText = async () => {
    if (!text.trim()) {
      setError("Please enter some text to analyze");
      return;
    }

    setIsAnalyzing(true);
    setError(null);

    try {
      if (activeTab === "grammar") {
        // Analyze grammar
        const result = await grammarService.analyzeGrammar(text, userLevel);

        if (result.success) {
          setGrammarAnalysis(result);
          setShowResults(true);

          // Award XP based on score
          const xpAmount = Math.round((result.score / 100) * 30); // Up to 30 XP
          if (xpAmount > 0) {
            addXp(xpAmount, "grammar_analysis");
          }
        } else {
          setError(result.error || "Failed to analyze grammar");
        }
      } else {
        // Analyze vocabulary
        const result = await vocabularyAnalysisService.analyzeVocabulary(
          text,
          userLevel
        );

        if (result.success) {
          setVocabularyAnalysis(result);
          setShowResults(true);

          // Award XP for using vocabulary analysis
          addXp(15, "vocabulary_analysis");
        } else {
          setError(result.error || "Failed to analyze vocabulary");
        }
      }
    } catch (err) {
      console.error(`Error analyzing ${activeTab}:`, err);
      setError(`Failed to analyze ${activeTab}: ${err.message}`);

      // Use sample data for development
      if (activeTab === "grammar") {
        setGrammarAnalysis(grammarService.getSampleGrammarAnalysis());
      } else {
        setVocabularyAnalysis(
          vocabularyAnalysisService.getSampleVocabularyAnalysis()
        );
      }
      setShowResults(true);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Reset analysis
  const resetAnalysis = () => {
    setShowResults(false);
    setError(null);

    if (activeTab === "grammar") {
      setGrammarAnalysis(null);
    } else {
      setVocabularyAnalysis(null);
    }
  };

  // If showing results, render the analysis component
  if (showResults) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={resetAnalysis}
            activeOpacity={0.7}
          >
            <Ionicons
              name="arrow-back"
              size={24}
              color={modernTheme.colors.neutral[800]}
            />
          </TouchableOpacity>

          <Heading level="h4">
            {activeTab === "grammar"
              ? "Grammar Analysis"
              : "Vocabulary Analysis"}
          </Heading>

          <View style={styles.backButton} />
        </View>

        <View style={styles.analysisContainer}>
          {activeTab === "grammar" ? (
            <GrammarAnalysis analysis={grammarAnalysis} />
          ) : (
            <VocabularyAnalysis
              analysis={vocabularyAnalysis}
              userLevel={userLevel}
            />
          )}
        </View>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 64 : 0}
    >
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
          activeOpacity={0.7}
        >
          <Ionicons
            name="arrow-back"
            size={24}
            color={modernTheme.colors.neutral[800]}
          />
        </TouchableOpacity>

        <Heading level="h4">Language Analysis</Heading>

        <View style={styles.backButton} />
      </View>

      {/* Tabs for grammar and vocabulary */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === "grammar" && styles.activeTab]}
          onPress={() => setActiveTab("grammar")}
          activeOpacity={0.7}
        >
          <Text
            weight={activeTab === "grammar" ? "semibold" : "regular"}
            color={activeTab === "grammar" ? "primary.700" : "neutral.600"}
          >
            Grammar
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, activeTab === "vocabulary" && styles.activeTab]}
          onPress={() => setActiveTab("vocabulary")}
          activeOpacity={0.7}
        >
          <Text
            weight={activeTab === "vocabulary" ? "semibold" : "regular"}
            color={activeTab === "vocabulary" ? "primary.700" : "neutral.600"}
          >
            Vocabulary
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <ModernCard style={styles.inputCard}>
          <Heading level="h4" gutterBottom>
            {activeTab === "grammar"
              ? "Grammar Analysis"
              : "Vocabulary Analysis"}
          </Heading>

          <Text color="neutral.700" style={styles.description}>
            {activeTab === "grammar"
              ? "Enter Korean text to analyze grammar usage, get corrections, and receive feedback on your grammar skills."
              : "Enter Korean text to analyze vocabulary usage, get suggestions for alternative words, and receive feedback on your vocabulary level."}
          </Text>

          <Spacer size="md" />

          <Text weight="semibold">Your Korean Level:</Text>
          <View style={styles.levelButtons}>
            <TouchableOpacity
              style={[
                styles.levelButton,
                userLevel === "beginner" && styles.selectedLevel,
              ]}
              onPress={() => setUserLevel("beginner")}
              activeOpacity={0.7}
            >
              <Text
                weight={userLevel === "beginner" ? "semibold" : "regular"}
                color={userLevel === "beginner" ? "primary.700" : "neutral.600"}
              >
                Beginner
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.levelButton,
                userLevel === "intermediate" && styles.selectedLevel,
              ]}
              onPress={() => setUserLevel("intermediate")}
              activeOpacity={0.7}
            >
              <Text
                weight={userLevel === "intermediate" ? "semibold" : "regular"}
                color={
                  userLevel === "intermediate" ? "primary.700" : "neutral.600"
                }
              >
                Intermediate
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.levelButton,
                userLevel === "advanced" && styles.selectedLevel,
              ]}
              onPress={() => setUserLevel("advanced")}
              activeOpacity={0.7}
            >
              <Text
                weight={userLevel === "advanced" ? "semibold" : "regular"}
                color={userLevel === "advanced" ? "primary.700" : "neutral.600"}
              >
                Advanced
              </Text>
            </TouchableOpacity>
          </View>

          <Spacer size="md" />

          <Text weight="semibold">Enter Korean Text:</Text>
          <ModernTextInput
            value={text}
            onChangeText={setText}
            placeholder={
              activeTab === "grammar"
                ? "Enter Korean text to analyze grammar..."
                : "Enter Korean text to analyze vocabulary..."
            }
            multiline
            numberOfLines={6}
            style={styles.textInput}
          />

          {error && (
            <View style={styles.errorContainer}>
              <Ionicons
                name="alert-circle-outline"
                size={20}
                color={modernTheme.colors.error[500]}
              />
              <Text color="error.500" style={styles.errorText}>
                {error}
              </Text>
            </View>
          )}

          <ModernButton
            text={`Analyze ${
              activeTab === "grammar" ? "Grammar" : "Vocabulary"
            }`}
            onPress={analyzeText}
            disabled={isAnalyzing || !text.trim()}
            loading={isAnalyzing}
            style={styles.analyzeButton}
          />
        </ModernCard>

        <ModernCard style={styles.tipsCard}>
          <Heading level="h4" gutterBottom>
            Tips for {activeTab === "grammar" ? "Grammar" : "Vocabulary"}{" "}
            Analysis
          </Heading>

          <View style={styles.tipsList}>
            {activeTab === "grammar" ? (
              <>
                <View style={styles.tipItem}>
                  <Ionicons
                    name="checkmark-circle"
                    size={20}
                    color={modernTheme.colors.success.main}
                    style={styles.tipIcon}
                  />
                  <Text color="neutral.700" style={styles.tipText}>
                    Use complete sentences for better analysis
                  </Text>
                </View>
                <View style={styles.tipItem}>
                  <Ionicons
                    name="checkmark-circle"
                    size={20}
                    color={modernTheme.colors.success.main}
                    style={styles.tipIcon}
                  />
                  <Text color="neutral.700" style={styles.tipText}>
                    Try different sentence structures to practice various
                    grammar patterns
                  </Text>
                </View>
                <View style={styles.tipItem}>
                  <Ionicons
                    name="checkmark-circle"
                    size={20}
                    color={modernTheme.colors.success.main}
                    style={styles.tipIcon}
                  />
                  <Text color="neutral.700" style={styles.tipText}>
                    Focus on one grammar point at a time for targeted practice
                  </Text>
                </View>
              </>
            ) : (
              <>
                <View style={styles.tipItem}>
                  <Ionicons
                    name="checkmark-circle"
                    size={20}
                    color={modernTheme.colors.success.main}
                    style={styles.tipIcon}
                  />
                  <Text color="neutral.700" style={styles.tipText}>
                    Use a variety of words to get more comprehensive feedback
                  </Text>
                </View>
                <View style={styles.tipItem}>
                  <Ionicons
                    name="checkmark-circle"
                    size={20}
                    color={modernTheme.colors.success.main}
                    style={styles.tipIcon}
                  />
                  <Text color="neutral.700" style={styles.tipText}>
                    Try using synonyms to expand your vocabulary
                  </Text>
                </View>
                <View style={styles.tipItem}>
                  <Ionicons
                    name="checkmark-circle"
                    size={20}
                    color={modernTheme.colors.success.main}
                    style={styles.tipIcon}
                  />
                  <Text color="neutral.700" style={styles.tipText}>
                    Write about different topics to practice domain-specific
                    vocabulary
                  </Text>
                </View>
              </>
            )}
          </View>
        </ModernCard>

        <Spacer size="xl" />
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: modernTheme.colors.background,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: modernTheme.colors.neutral[200],
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  tabContainer: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: modernTheme.colors.neutral[200],
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: "center",
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: modernTheme.colors.primary[500],
  },
  content: {
    flex: 1,
  },
  inputCard: {
    margin: 16,
    padding: 16,
  },
  description: {
    lineHeight: 22,
  },
  levelButtons: {
    flexDirection: "row",
    marginTop: 8,
  },
  levelButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    alignItems: "center",
    borderRadius: 4,
    marginHorizontal: 4,
    backgroundColor: modernTheme.colors.neutral[100],
  },
  selectedLevel: {
    backgroundColor: modernTheme.colors.primary[100],
  },
  textInput: {
    marginTop: 8,
    height: 120,
    textAlignVertical: "top",
  },
  errorContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
    padding: 8,
    backgroundColor: modernTheme.colors.error[50],
    borderRadius: 4,
  },
  errorText: {
    marginLeft: 8,
  },
  analyzeButton: {
    marginTop: 16,
  },
  tipsCard: {
    margin: 16,
    marginTop: 0,
    padding: 16,
  },
  tipsList: {
    marginTop: 8,
  },
  tipItem: {
    flexDirection: "row",
    marginBottom: 12,
  },
  tipIcon: {
    marginRight: 8,
    marginTop: 2,
  },
  tipText: {
    flex: 1,
  },
  analysisContainer: {
    flex: 1,
    padding: 16,
  },
});

export default LanguageAnalysisScreen;
