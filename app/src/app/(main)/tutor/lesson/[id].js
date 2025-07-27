import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  View,
  ScrollView,
  ActivityIndicator,
  SafeAreaView,
  TouchableOpacity,
  Modal,
  Alert,
} from "react-native";
import { useAudioPlayer } from 'expo-audio';
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import LottieView from "lottie-react-native";
import { useAuth } from "../../../../features/auth/hooks/useAuth";
import { useAchievements } from "../../../../features/achievements/context/AchievementContext";
import { useTheme } from "../../../../shared/context/ThemeContext";
import {
  Container,
  Text,
  Heading,
  ModernButton,
  Spacer,
} from "../../../../shared/components";

import SafeAreaWrapper from "../../../../shared/components/SafeAreaWrapper";
import { BRAND_COLORS } from "../../../../shared/constants/colors";
import { curriculumService } from "../../../../features/curriculum/services/curriculumService";
import useLessonsStore from "../../../../features/curriculum/stores/lessonsStore";
import LessonScreen from "../../../../features/tutor/components/LessonScreen";
import VocabularySection from "../../../../features/curriculum/components/VocabularySection";
import PersistentConversationView from "../../../../features/tutor/components/PersistentConversationView";
import webRTCConversationService from "../../../../features/tutor/services/WebRTCConversationService";
import { AI_TUTOR_NAME, PROFICIENCY_LEVELS } from "../../../../shared/constants/appConstants";
import MatchWordGame from "../../../../features/games/components/MatchWordGame";
import SentenceScrambleGame from "../../../../features/games/components/SentenceScrambleGame";
import PronunciationChallengeGame from "../../../../features/games/components/PronunciationChallengeGame";
import ttsService from "../../../../shared/services/ttsService";
import styles from "./styles";

// Minimum conversation time in seconds (1 minute)
const MIN_CONVERSATION_TIME = 60;

/**
 * LessonDetailScreen
 * Displays a specific lesson with its content
 */
export default function LessonDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { theme } = useTheme();
  const { user } = useAuth();
  const { checkAchievements } = useAchievements();

  // Audio player hook
  const audioPlayer = useAudioPlayer();

  // Lessons store for centralized state management
  const lessonsStore = useLessonsStore();
  const {
    userProgress,
    isCompletingLesson: storeIsCompletingLesson,
    completingLessonId,
    error: storeError,
    completeLesson,
    fetchUserProgress,
    clearError,
    isLessonCompleted,
    getLessonById,
    findNextLesson: storeFindNextLesson,
  } = lessonsStore;

  const [lesson, setLesson] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeSection, setActiveSection] = useState("introduction");
  const [showConversation, setShowConversation] = useState(false);
  const [showRealtimeConversation, setShowRealtimeConversation] =
    useState(false);

  // Game state management
  const [showGame, setShowGame] = useState(false);
  const [activeGameType, setActiveGameType] = useState(null);
  const [gameContent, setGameContent] = useState([]);

  // Success feedback state
  const [showSuccessFeedback, setShowSuccessFeedback] = useState(false);

  // AI Practice state management
  const [hasCompletedAIPractice, setHasCompletedAIPractice] = useState(false);
  const [hasMetMinimumTime, setHasMetMinimumTime] = useState(false);
  const [practiceSessionStart, setPracticeSessionStart] = useState(null);

  // Lesson completion state
  const [showCongratulations, setShowCongratulations] = useState(false);
  const [isCompletingLesson, setIsCompletingLesson] = useState(false);
  const [isCompletingPractice, setIsCompletingPractice] = useState(false);
  const [showLoadingOverlay, setShowLoadingOverlay] = useState(false);
  const [lessonCompleted, setLessonCompleted] = useState(false);

  // Audio playback state
  const [playingAudio, setPlayingAudio] = useState(null);

  // Reset lesson state when lesson ID changes (for next lesson navigation)
  useEffect(() => {
    console.log(`🔄 Resetting lesson state for lesson: ${id}`);

    // Reset all lesson state when navigating to a new lesson
    setActiveSection("introduction");
    setHasCompletedAIPractice(false);
    setShowRealtimeConversation(false);
    setHasMetMinimumTime(false);
    setShowCongratulations(false);
    setIsCompletingLesson(false);
    setIsCompletingPractice(false); // Reset practice completion loading state
    setShowLoadingOverlay(false); // Reset loading overlay
    setPracticeSessionStart(null);
    setLessonCompleted(false);
    setShowConversation(false);
    setError(null);

    console.log(`✅ Lesson state reset complete for lesson: ${id}`);
  }, [id]);

  // Fetch lesson data
  useEffect(() => {
    const fetchLesson = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const response = await curriculumService.getLesson(id);
        setLesson(response.data.lesson);
      } catch (err) {
        console.error("Error fetching lesson:", err);
        setError("Failed to load lesson. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };

    if (id) {
      fetchLesson();
    }
  }, [id]);

  // Section navigation order - dynamically determined based on lesson content
  const getSectionOrder = () => {
    if (!lesson) return ["introduction", "vocabulary", "grammar", "practice"];

    const availableSections = ["introduction"];

    // Check if lesson has vocabulary sections
    const hasVocabulary = lesson.content.sections?.some(
      (section) => section.type === "vocabulary"
    );
    if (hasVocabulary) {
      availableSections.push("vocabulary");
    }

    // Check if lesson has grammar sections
    const hasGrammar = lesson.content.sections?.some(
      (section) => section.type === "grammar"
    );
    if (hasGrammar) {
      availableSections.push("grammar");
    }

    // Practice is always available
    availableSections.push("practice");

    console.log(
      `📚 Available sections for lesson ${lesson.id}:`,
      availableSections
    );
    return availableSections;
  };

  const sectionOrder = getSectionOrder();

  // Audio handling for vocabulary
  const playAudio = async (text) => {
    // Defensive check - ensure text is valid
    if (!text || typeof text !== 'string' || text.trim().length === 0) {
      console.warn(`Invalid audio text provided: ${text}`);
      return;
    }

    // Prevent multiple audio calls at once
    if (playingAudio) {
      console.log("Audio already playing, ignoring new request");
      return;
    }

    try {
      console.log(`Playing audio for: ${text}`);
      setPlayingAudio(text);

      // Check if this is a single Korean character (common in alphabet lessons)
      const isSingleKoreanChar = text.length === 1 && /[ㄱ-ㅎㅏ-ㅣ가-힣]/.test(text);

      // Use TTS service for Korean pronunciation
      await ttsService.speak(text);

      // If we get here, audio played successfully
      console.log(`Audio played successfully for: ${text}`);

    } catch (error) {
      console.error('Error playing audio:', error);

      // Check if this is a single Korean character
      const isSingleKoreanChar = text && text.length === 1 && /[ㄱ-ㅎㅏ-ㅣ가-힣]/.test(text);

      if (isSingleKoreanChar) {
        // For single Korean characters (like vowels in lesson 1), just log the issue
        // Don't show error dialogs as this is a known limitation
        console.warn(`Audio not available for single Korean character: ${text} - this is normal for alphabet lessons`);
      } else {
        // Show user-friendly error message for longer text
        Alert.alert("Audio Error", "Could not play audio. Please check your device settings.", [
          { text: "OK", onPress: () => console.log("Audio error acknowledged") }
        ]);
      }
    } finally {
      setPlayingAudio(null);
    }
  };

  // Auto-adjust active section if it doesn't exist in this lesson
  useEffect(() => {
    if (lesson && !sectionOrder.includes(activeSection)) {
      console.log(
        `⚠️ Section "${activeSection}" not available in this lesson, switching to first available section`
      );
      setActiveSection(sectionOrder[0] || "introduction");
    }
  }, [lesson, activeSection, sectionOrder]);

  // Enhanced cleanup effect to stop AI conversation when component unmounts or user navigates away
  useEffect(() => {
    return () => {
      // Cleanup function runs when component unmounts
      if (showRealtimeConversation) {
        console.log("🛑 Component unmounting - stopping AI conversation");
        setShowRealtimeConversation(false);

        // Also try to stop the WebRTC service directly
        try {
          if (webRTCConversationService && webRTCConversationService.isSessionActive) {
            console.log("🛑 Force stopping WebRTC session on unmount");
            webRTCConversationService.stopSession().catch(err => {
              console.error("Error in force stop:", err);
            });
          }
        } catch (error) {
          console.error("Error stopping WebRTC service on unmount:", error);
        }
      }
    };
  }, [showRealtimeConversation]);

  // Also stop conversation when user navigates to different sections
  useEffect(() => {
    if (showRealtimeConversation && activeSection !== "practice") {
      console.log(
        "🛑 User navigated away from practice - stopping AI conversation"
      );
      setShowRealtimeConversation(false);

      // Also try to stop the WebRTC service directly
      try {
        if (webRTCConversationService && webRTCConversationService.isSessionActive) {
          console.log("🛑 Force stopping WebRTC session on section change");
          webRTCConversationService.stopSession().catch(err => {
            console.error("Error in force stop on section change:", err);
          });
        }
      } catch (error) {
        console.error("Error stopping WebRTC service on section change:", error);
      }
    }
  }, [activeSection, showRealtimeConversation]);

  // Note: Timer updates are now handled by the persistent service



  // Also stop conversation when user navigates to different sections
  useEffect(() => {
    if (showRealtimeConversation && activeSection !== "practice") {
      console.log(
        "🛑 User navigated away from practice - stopping AI conversation"
      );
      setShowRealtimeConversation(false);

      // Also try to stop the WebRTC service directly
      try {
        if (webRTCConversationService && webRTCConversationService.isSessionActive) {
          console.log("🛑 Force stopping WebRTC session on section change");
          webRTCConversationService.stopSession().catch(err => {
            console.error("Error in force stop on section change:", err);
          });
        }
      } catch (error) {
        console.error("Error stopping WebRTC service on section change:", error);
      }
    }
  }, [activeSection, showRealtimeConversation]);

  // Note: Timer updates are now handled by the persistent service

  // Helper functions for navigation
  const getSectionNumber = () => {
    return sectionOrder.indexOf(activeSection) + 1;
  };

  const getSectionProgress = () => {
    return (getSectionNumber() / sectionOrder.length) * 100;
  };

  // Enhanced helper function to get section title
  const getSectionTitle = (section) => {
    const titles = {
      introduction: "Introduction",
      vocabulary: "Vocabulary",
      grammar: "Grammar",
      practice: "Practice",
    };
    return titles[section || activeSection] || "Lesson";
  };

  // Enhanced render section content with modern card layout
  const renderSectionContent = () => {
    if (!lesson) return null;

    // Helper function to detect if this is an alphabet lesson
    const isAlphabetLesson = () => {
      // Check lesson ID, name, and content from backend
      const lessonId = lesson?.id?.toLowerCase() || '';
      const lessonName = lesson?.name?.toLowerCase() || '';

      // Check if it's explicitly an alphabet lesson
      if (lessonId.includes('alphabet') ||
        lessonId.includes('hangul') ||
        lessonName.includes('alphabet') ||
        lessonName.includes('hangul') ||
        lessonName.includes('한글')) {
        return true;
      }

      // Check if vocabulary items are single characters (likely alphabet)
      const hasAlphabetContent = lesson?.content?.sections?.some(section =>
        section.type === "vocabulary" &&
        section.items?.some(item => {
          // Check if Korean text is single character or very short (typical for alphabet)
          const koreanText = item.korean || '';
          return koreanText.length === 1 ||
            (koreanText.length <= 2 && /^[ㄱ-ㅎㅏ-ㅣ가-힣]/.test(koreanText));
        })
      );

      return hasAlphabetContent;
    };

    // Helper function to detect if this is the first lesson
    const isFirstLesson = () => {
      const lessonId = lesson?.id?.toLowerCase() || '';
      const lessonName = lesson?.name?.toLowerCase() || '';

      // Check for common first lesson indicators
      return lessonId.includes('first') ||
        lessonId.includes('lesson-1') ||
        lessonId.includes('intro') ||
        lessonName.includes('first') ||
        lessonName.includes('introduction') ||
        isAlphabetLesson(); // Alphabet lesson is typically the first lesson
    };

    switch (activeSection) {
      case "introduction":
        return (
          <View style={styles.modernSectionContainer}>
            <View style={[]}>
              <View style={styles.cardHeader}>
                <Ionicons name="book-outline" size={24} color={BRAND_COLORS.EXPLORER_TEAL} />
                <Text style={styles.cardTitle}>Lesson Overview</Text>
              </View>
              <Text style={styles.modernIntroductionText}>
                {lesson.content.introduction}
              </Text>
            </View>

            <View style={{ marginTop: 20 }}>
              <View style={styles.cardHeader}>
                <Ionicons name="checkmark-circle-outline" size={24} color={BRAND_COLORS.EXPLORER_TEAL} />
                <Text style={styles.cardTitle}>Learning Objectives</Text>
              </View>
              <View style={styles.objectivesList}>
                {lesson.objectives.map((objective, index) => (
                  <View key={index} style={styles.modernObjectiveItem}>
                    <View style={styles.objectiveNumber}>
                      <Text style={styles.objectiveNumberText}>{index + 1}</Text>
                    </View>
                    <Text style={styles.modernObjectiveText}>{objective}</Text>
                  </View>
                ))}
              </View>
            </View>
          </View>
        );

      case "vocabulary":
        const vocabularySections = lesson.content.sections.filter(
          (section) => section.type === "vocabulary"
        );

        const isAlphabet = isAlphabetLesson();

        return (
          <View style={[styles.modernSectionContainer, {

          }]}>
            {vocabularySections.map((section, sectionIndex) => (
              <View key={sectionIndex} style={[styles.modernCard, {
                elevation: 0,
              }]}>
                <View style={styles.cardHeader}>
                  <Ionicons name="library-outline" size={24} color={BRAND_COLORS.EXPLORER_TEAL} />
                  <Text style={styles.cardTitle}>{section.title}</Text>
                </View>
                <View style={styles.vocabularyGrid}>
                  {section.items.map((item, itemIndex) => {
                    // Handle both alphabet lessons (character) and regular lessons (korean)
                    const koreanText = item.character || item.korean;
                    const englishText = item.sound || item.english;

                    // Debug logging to understand data structure
                    if (itemIndex === 0) {
                      console.log('🔍 Vocabulary item structure:', {
                        item,
                        koreanText,
                        englishText,
                        isAlphabet: isAlphabet
                      });
                    }

                    return (
                      <View key={itemIndex} style={isAlphabet ? styles.compactVocabularyItem : styles.modernVocabularyItem}>
                        <View style={isAlphabet ? styles.compactVocabularyItemHeader : styles.vocabularyItemHeader}>
                          <Text style={isAlphabet ? styles.compactKoreanText : styles.modernKoreanText}>{koreanText}</Text>
                          <TouchableOpacity
                            style={[
                              styles.modernAudioButton,
                              playingAudio === koreanText && styles.audioButtonPlaying
                            ]}
                            onPress={() => playAudio(koreanText)}
                            activeOpacity={0.7}
                            disabled={playingAudio === koreanText}
                          >
                            {playingAudio === koreanText ? (
                              <ActivityIndicator size="small" color="white" />
                            ) : (
                              <Ionicons name="volume-high" size={20} color="white" />
                            )}
                          </TouchableOpacity>
                        </View>
                        <Text style={isAlphabet ? styles.compactRomanizationText : styles.modernRomanizationText}>{item.romanization}</Text>
                        <Text style={isAlphabet ? styles.compactEnglishText : styles.modernEnglishText}>{englishText}</Text>
                        {item.example && (
                          <Text style={styles.modernExampleText}>"{item.example}"</Text>
                        )}
                      </View>
                    );
                  })}
                </View>
              </View>
            ))}
          </View>
        );

      case "grammar":
        const grammarSections = lesson.content.sections.filter(
          (section) => section.type === "grammar"
        );

        if (grammarSections.length === 0) {
          return (
            <View style={styles.modernSectionContainer}>
              <View style={styles.modernCard}>
                <View style={styles.noContentContainer}>
                  <Ionicons name="information-circle-outline" size={48} color={BRAND_COLORS.EXPLORER_TEAL} />
                  <Text style={styles.noContentTitle}>No Grammar Section</Text>
                  <Text style={styles.noContentText}>
                    This lesson focuses on vocabulary and conversation practice.
                    Grammar concepts will be introduced in future lessons.
                  </Text>
                </View>
              </View>
            </View>
          );
        }

        return (
          <View style={styles.modernSectionContainer}>
            {grammarSections.map((section, sectionIndex) => (
              <View key={sectionIndex} style={styles.modernCard}>
                <View style={styles.cardHeader}>
                  <Ionicons name="school-outline" size={24} color={BRAND_COLORS.EXPLORER_TEAL} />
                  <Text style={styles.cardTitle}>{section.title}</Text>
                </View>
                <Text style={styles.modernGrammarExplanation}>
                  {section.explanation}
                </Text>
                {section.examples && (
                  <View style={styles.grammarExamplesContainer}>
                    {section.examples.map((example, exampleIndex) => (
                      <View key={exampleIndex} style={styles.modernGrammarExample}>
                        <Text style={styles.modernExampleKorean}>{example.korean}</Text>
                        {example.romanization && (
                          <Text style={styles.modernExampleRomanization}>
                            {example.romanization}
                          </Text>
                        )}
                        <Text style={styles.modernExampleEnglish}>{example.english}</Text>
                        {example.explanation && (
                          <Text style={styles.modernExampleExplanation}>
                            {example.explanation}
                          </Text>
                        )}
                      </View>
                    ))}
                  </View>
                )}
              </View>
            ))}
          </View>
        );

      case "practice":
        const isAlphabetPractice = isAlphabetLesson();
        const isFirstPractice = isFirstLesson();

        return (
          <View style={styles.modernSectionContainer}>
            <View style={styles.modernCard}>
              <View style={styles.cardHeader}>
                <Ionicons name="mic" size={24} color={BRAND_COLORS.EXPLORER_TEAL} />
                <Text style={styles.cardTitle}>Practice Session</Text>
              </View>
              <Text style={styles.modernPracticeIntro}>
                Ready to practice what you've learned? Let's get started!
              </Text>
            </View>

            {/* AI Conversation Practice - Required */}
            <View style={[styles.modernCard, styles.primaryPracticeCard]}>
              <View style={styles.practiceCardHeader}>
                <View style={styles.practiceIconContainer}>
                  <Ionicons name="mic" size={28} color="white" />
                </View>
                <View style={styles.practiceCardTitleContainer}>
                  <Text style={styles.practiceCardTitle}>
                    {isAlphabetPractice
                      ? "Korean Alphabet Pronunciation"
                      : "AI Conversation Practice"}
                  </Text>
                  <Text style={styles.practiceCardSubtitle}>
                    {isAlphabetPractice
                      ? "Practice Korean letters with AI tutor"
                      : `Practice speaking with ${AI_TUTOR_NAME}`}
                  </Text>
                </View>
              </View>

              <View style={styles.practiceCardContent}>
                <Text style={styles.practiceCardDescription}>
                  {isAlphabetPractice
                    ? "Learn to pronounce Korean letters (한글) with proper guidance and feedback."
                    : "Practice vocabulary and conversation with real-time AI feedback."}
                </Text>

                <View style={styles.practiceFeatures}>
                  <View style={styles.featureItem}>
                    <Ionicons name="checkmark-circle" size={16} color={BRAND_COLORS.EXPLORER_TEAL} />
                    <Text style={styles.featureText}>
                      {isAlphabetPractice ? "Individual letter sounds" : "Real-time feedback"}
                    </Text>
                  </View>
                  <View style={styles.featureItem}>
                    <Ionicons name="checkmark-circle" size={16} color={BRAND_COLORS.EXPLORER_TEAL} />
                    <Text style={styles.featureText}>
                      {isAlphabetPractice ? "Pronunciation corrections" : "Vocabulary practice"}
                    </Text>
                  </View>
                  <View style={styles.featureItem}>
                    <Ionicons name="checkmark-circle" size={16} color={BRAND_COLORS.EXPLORER_TEAL} />
                    <Text style={styles.featureText}>
                      {isAlphabetPractice ? "Step-by-step guidance" : "Natural conversation"}
                    </Text>
                  </View>
                </View>
              </View>

              <View style={styles.practiceCardActions}>
                <View style={styles.practiceRequiredBadge}>
                  <Ionicons name="star" size={16} color={BRAND_COLORS.WHISPER_WHITE} />
                  <Text style={styles.practiceRequiredText}>Required to Complete</Text>
                </View>
                <ModernButton
                  text={
                    hasCompletedAIPractice
                      ? "Practice Again"
                      : isAlphabetPractice
                        ? "Start Pronunciation Practice"
                        : "Start Conversation Practice"
                  }
                  onPress={() => handlePracticeType("conversation")}
                  style={[
                    styles.modernPracticeButton,
                    hasCompletedAIPractice && styles.practiceButtonCompleted,
                  ]}
                />
                {hasCompletedAIPractice && (
                  <View style={styles.modernCompletedIndicator}>
                    <Ionicons name="checkmark-circle" size={20} color={BRAND_COLORS.EXPLORER_TEAL} />
                    <Text style={styles.modernCompletedText}>Practice Completed!</Text>
                  </View>
                )}
              </View>
            </View>

            {/* Interactive Games Section */}
            {!isAlphabetPractice && (
              <View style={styles.modernCard}>
                <View style={styles.cardHeader}>
                  <Ionicons name="game-controller-outline" size={24} color={BRAND_COLORS.EXPLORER_TEAL} />
                  <Text style={styles.cardTitle}>Interactive Games</Text>
                </View>
                <Text style={styles.gamesDescription}>
                  Reinforce your learning with fun interactive games
                </Text>

                <View style={styles.gamesGrid}>
                  {/* Match Word Game */}
                  {extractLessonContent().vocabulary.length > 0 && (
                    <TouchableOpacity
                      style={styles.modernGameCard}
                      onPress={() => handlePracticeType("match-word-game")}
                      activeOpacity={0.8}
                    >
                      <View style={[styles.gameIconContainer, { backgroundColor: BRAND_COLORS.OCEAN_BLUE }]}>
                        <Ionicons name="grid-outline" size={20} color={BRAND_COLORS.WHISPER_WHITE} />
                      </View>
                      <Text style={styles.gameTitle}>Match Words</Text>
                      <Text style={styles.gameDescription}>Match Korean words with English meanings</Text>
                    </TouchableOpacity>
                  )}

                  {/* Sentence Scramble Game */}
                  {extractLessonContent().sentences.length > 0 && (
                    <TouchableOpacity
                      style={styles.modernGameCard}
                      onPress={() => handlePracticeType("sentence-scramble-game")}
                      activeOpacity={0.8}
                    >
                      <View style={[styles.gameIconContainer, { backgroundColor: BRAND_COLORS.RUCKSACK_BROWN }]}>
                        <Ionicons name="shuffle-outline" size={20} color={BRAND_COLORS.WHISPER_WHITE} />
                      </View>
                      <Text style={styles.gameTitle}>Sentence Scramble</Text>
                      <Text style={styles.gameDescription}>Arrange words to form sentences</Text>
                    </TouchableOpacity>
                  )}

                  {/* Pronunciation Challenge */}
                  {extractLessonContent().phrases.length > 0 && (
                    <TouchableOpacity
                      style={styles.modernGameCard}
                      onPress={() => handlePracticeType("pronunciation-game")}
                      activeOpacity={0.8}
                    >
                      <View style={[styles.gameIconContainer, { backgroundColor: BRAND_COLORS.WARM_CORAL }]}>
                        <Ionicons name="mic-outline" size={20} color={BRAND_COLORS.WHISPER_WHITE} />
                      </View>
                      <Text style={styles.gameTitle}>Pronunciation</Text>
                      <Text style={styles.gameDescription}>Practice speaking with AI feedback</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            )}

            {/* Additional practice for Korean Alphabet lesson (not for first lesson) */}
            {isAlphabetPractice && !isFirstPractice && (
              <View style={styles.modernCard}>
                <View style={styles.cardHeader}>
                  <Ionicons name="refresh-outline" size={24} color={BRAND_COLORS.EXPLORER_TEAL} />
                  <Text style={styles.cardTitle}>Additional Practice</Text>
                </View>
                <View style={styles.additionalPracticeGrid}>
                  <TouchableOpacity
                    style={styles.additionalPracticeItem}
                    onPress={() => handlePracticeType("vocabulary")}
                    activeOpacity={0.8}
                  >
                    <Ionicons name="book-outline" size={24} color={BRAND_COLORS.EXPLORER_TEAL} />
                    <Text style={styles.additionalPracticeTitle}>Vocabulary Review</Text>
                    <Text style={styles.additionalPracticeDescription}>
                      Review the key vocabulary
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.additionalPracticeItem}
                    onPress={() => handlePracticeType("pronunciation")}
                    activeOpacity={0.8}
                  >
                    <Ionicons name="mic-outline" size={24} color={BRAND_COLORS.EXPLORER_TEAL} />
                    <Text style={styles.additionalPracticeTitle}>Pronunciation Practice</Text>
                    <Text style={styles.additionalPracticeDescription}>
                      Practice speaking words
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </View>
        );

      default:
        return null;
    }
  };

  // Find next lesson in the curriculum
  const findNextLesson = async () => {
    try {
      console.log("🔍 Finding next lesson after:", id);

      // Get user progress which includes all curriculum data
      const progressResponse = await curriculumService.getUserProgress();
      const curriculumData = progressResponse.data.progress.levels;
      console.log("📚 Curriculum data loaded");

      // Find current lesson across all levels and modules
      let currentLessonFound = false;
      let nextLesson = null;

      for (const level of curriculumData) {
        for (const module of level.modules) {
          for (let i = 0; i < module.lessons.length; i++) {
            const lessonItem = module.lessons[i];

            if (currentLessonFound && !nextLesson) {
              // This is the next lesson
              nextLesson = {
                id: lessonItem.id,
                name: lessonItem.name,
                moduleId: module.id,
                levelId: level.id,
              };
              break;
            }

            if (lessonItem.id === id) {
              currentLessonFound = true;
              console.log(
                `✅ Found current lesson: ${lessonItem.name} in module: ${module.name}`
              );
            }
          }
          if (nextLesson) break;
        }
        if (nextLesson) break;
      }

      console.log("🎯 Next lesson found:", nextLesson);
      return nextLesson;
    } catch (error) {
      console.error("❌ Error finding next lesson:", error);
      return null;
    }
  };

  // Handle congratulations modal close
  const handleCongratulationsClose = async () => {
    setShowCongratulations(false);
    setIsCompletingLesson(false);

    try {
      console.log("🔄 Finding next lesson using store data...");

      // Use store's findNextLesson function for immediate navigation
      const nextLesson = storeFindNextLesson(id);

      if (nextLesson) {
        console.log(`🚀 Navigating to next lesson: ${nextLesson.name}`);
        router.push(`/tutor/lesson/${nextLesson.lessonId}`);
      } else {
        console.log("🎉 No more lessons available, navigating to lessons");
        router.push("/tutor/lessons");
      }
    } catch (error) {
      console.error("❌ Error finding next lesson:", error);
      // Fallback to lessons page
      router.push("/tutor/lessons");
    }
  };

  // Loading Overlay Component for smooth transitions
  const LoadingOverlay = () => (
    <Modal visible={showLoadingOverlay} transparent={true} animationType="fade">
      <View style={styles.loadingOverlay}>
        <View style={styles.loadingContent}>
          <ActivityIndicator size="large" color={BRAND_COLORS.EXPLORER_TEAL} />
          <Text style={styles.loadingOverlayText}>Completing practice...</Text>
        </View>
      </View>
    </Modal>
  );

  // Congratulations Modal Component
  const CongratulationsModal = () => (
    <Modal
      visible={showCongratulations}
      transparent={true}
      animationType="fade"
      onRequestClose={handleCongratulationsClose}
    >
      <View style={styles.congratulationsOverlay}>
        <View style={styles.congratulationsModal}>
          {/* Lottie Animation */}
          <View style={styles.lottieContainer}>
            <LottieView
              source={require("../../../../assets/animations/celebration.json")} // You'll add this
              autoPlay
              loop={false}
              style={styles.lottieAnimation}
              onAnimationFinish={() => {
                // Optional: Auto-close after animation finishes
                // setTimeout(handleCongratulationsClose, 1000);
              }}
            />
          </View>

          {/* Congratulations Content */}
          <View style={styles.congratulationsContent}>
            <Text style={styles.congratulationsTitle}>🎉 Congratulations!</Text>
            <Text style={styles.congratulationsSubtitle}>
              You've completed the lesson!
            </Text>
            <Text style={styles.congratulationsMessage}>
              Great job practicing Korean! You've earned{" "}
              <Text style={styles.xpText}>{lesson?.xpReward || 50} XP</Text> and
              unlocked new content.
            </Text>

            {/* Achievement Badges */}
            <View style={styles.achievementBadges}>
              <View style={styles.badge}>
                <Ionicons name="checkmark-circle" size={24} color={BRAND_COLORS.EXPLORER_TEAL} />
                <Text style={styles.badgeText}>Lesson Complete</Text>
              </View>
              <View style={styles.badge}>
                <Ionicons name="mic" size={24} color={BRAND_COLORS.EXPLORER_TEAL} />
                <Text style={styles.badgeText}>AI Practice</Text>
              </View>
              <View style={styles.badge}>
                <Ionicons name="star" size={24} color={BRAND_COLORS.RUCKSACK_BROWN} />
                <Text style={styles.badgeText}>XP Earned</Text>
              </View>
            </View>

            {/* Continue Button */}
            <ModernButton
              text="Next Lesson"
              onPress={handleCongratulationsClose}
              style={styles.continueButton}
            />
          </View>
        </View>
      </View>
    </Modal>
  );

  // Helper function to extract lesson content for games
  const extractLessonContent = () => {
    if (!lesson) return { vocabulary: [], sentences: [], phrases: [] };

    const vocabulary = [];
    const sentences = [];
    const phrases = [];

    // Extract vocabulary from lesson sections
    lesson.content.sections?.forEach(section => {
      if (section.type === "vocabulary" && section.items) {
        vocabulary.push(...section.items);
      }
      if (section.type === "grammar" && section.examples) {
        sentences.push(...section.examples);
      }
    });

    // Add some default phrases if none exist
    if (vocabulary.length > 0) {
      phrases.push(...vocabulary.map(item => ({
        korean: item.korean,
        romanization: item.romanization,
        english: item.english
      })));
    }

    return { vocabulary, sentences, phrases };
  };

  // Handle practice type selection
  const handlePracticeType = (type) => {
    console.log(`🎯 Starting practice type: ${type}`);

    switch (type) {
      case "conversation":
        setPracticeSessionStart(Date.now());
        setShowRealtimeConversation(true);
        break;
      case "match-word-game":
        const content = extractLessonContent();
        setGameContent(content.vocabulary);
        setActiveGameType("match-word");
        setShowGame(true);
        break;
      case "sentence-scramble-game":
        const sentenceContent = extractLessonContent();
        setGameContent(sentenceContent.sentences);
        setActiveGameType("sentence-scramble");
        setShowGame(true);
        break;
      case "pronunciation-game":
        const phraseContent = extractLessonContent();
        setGameContent(phraseContent.phrases);
        setActiveGameType("pronunciation-challenge");
        setShowGame(true);
        break;
      case "vocabulary":
        setShowConversation(true);
        break;
      case "pronunciation":
        setPracticeSessionStart(Date.now());
        setShowRealtimeConversation(true);
        break;
      default:
        console.warn(`Unknown practice type: ${type}`);
    }
  };

  // Handle conversation complete
  const handleConversationComplete = () => {
    console.log("📝 Conversation practice completed");
    setShowConversation(false);
    setHasCompletedAIPractice(true);
    setHasMetMinimumTime(true);
  };

  // Handle realtime conversation complete
  const handleRealtimeConversationComplete = async () => {
    console.log("🎯 Completing realtime conversation practice");

    if (!hasMetMinimumTime) {
      alert("Please practice for at least 1 minute before completing.");
      return;
    }

    setIsCompletingPractice(true);

    try {
      // Mark practice as completed
      setHasCompletedAIPractice(true);
      setShowRealtimeConversation(false);

      // Small delay for smooth transition
      await new Promise(resolve => setTimeout(resolve, 500));

      console.log("✅ Realtime conversation practice completed");
    } catch (error) {
      console.error("❌ Error completing practice:", error);
    } finally {
      setIsCompletingPractice(false);
    }
  };

  // Handle game complete
  const handleGameComplete = (score) => {
    console.log(`🎮 Game completed with score: ${score}`);
    setShowGame(false);
    setActiveGameType(null);
    setGameContent([]);

    // Games are optional, so they don't affect lesson completion
    // But we can show some feedback
    alert(`Great job! You scored ${score} points!`);
  };

  // Handle game close
  const handleGameClose = () => {
    console.log("🎮 Game closed");
    setShowGame(false);
    setActiveGameType(null);
    setGameContent([]);
  };

  // Get button text based on current state
  const getButtonText = () => {
    if (activeSection === "practice") {
      if (storeIsCompletingLesson || isCompletingLesson) {
        return "Completing...";
      }
      if (lessonCompleted) {
        return "Lesson Complete!";
      }
      if (!hasCompletedAIPractice) {
        return "Complete AI Practice First";
      }
      if (!hasMetMinimumTime) {
        return "Practice More to Continue";
      }
      return "Finish Lesson";
    }

    // For non-practice sections
    const currentIndex = sectionOrder.indexOf(activeSection);
    const nextSection = sectionOrder[currentIndex + 1];

    if (nextSection) {
      return `Continue to ${getSectionTitle(nextSection)}`;
    }

    return "Continue";
  };

  // Handle next section navigation
  const handleNext = () => {
    console.log(`🔄 Navigating from ${activeSection}`);

    const currentIndex = sectionOrder.indexOf(activeSection);
    const nextSectionIndex = currentIndex + 1;

    if (nextSectionIndex < sectionOrder.length) {
      const nextSection = sectionOrder[nextSectionIndex];
      console.log(`➡️ Moving to section: ${nextSection}`);
      setActiveSection(nextSection);
    } else {
      console.log("🎯 Reached end of sections");
      // This shouldn't happen as practice is the last section
      setActiveSection("practice");
    }
  };

  // Handle lesson completion
  const handleComplete = async () => {
    console.log("🎯 Handle complete called");

    if (!hasCompletedAIPractice) {
      alert("Please complete the AI tutor practice session first.");
      return;
    }

    if (!hasMetMinimumTime) {
      alert("Please practice for at least 1 minute before completing the lesson.");
      return;
    }

    setIsCompletingLesson(true);
    setShowLoadingOverlay(true);

    try {
      console.log("🚀 Starting lesson completion process...");

      // Call the store's complete lesson function
      const result = await completeLesson(id);

      if (result.success) {
        console.log("✅ Lesson completed successfully");

        // Mark lesson as completed
        setLessonCompleted(true);

        // Show success feedback briefly
        setShowSuccessFeedback(true);
        setTimeout(() => setShowSuccessFeedback(false), 2000);

        // Check for achievements
        if (checkAchievements) {
          checkAchievements();
        }

        // Show congratulations modal
        setTimeout(() => {
          setShowCongratulations(true);
          setShowLoadingOverlay(false);
        }, 1000);

      } else {
        throw new Error(result.error || "Failed to complete lesson");
      }
    } catch (error) {
      console.error("❌ Error completing lesson:", error);
      setError(error.message || "Failed to complete lesson. Please try again.");
      setShowLoadingOverlay(false);
    } finally {
      setIsCompletingLesson(false);
    }
  };

  // Show game if active
  if (showGame && activeGameType && lesson) {
    const GameComponent =
      activeGameType === "match-word"
        ? MatchWordGame
        : activeGameType === "sentence-scramble"
          ? SentenceScrambleGame
          : activeGameType === "pronunciation-challenge"
            ? PronunciationChallengeGame
            : null;

    if (GameComponent) {
      return (
        <GameComponent
          lessonId={id}
          words={activeGameType === "match-word" ? gameContent : undefined}
          sentences={
            activeGameType === "sentence-scramble" ? gameContent : undefined
          }
          phrases={
            activeGameType === "pronunciation-challenge"
              ? gameContent
              : undefined
          }
          onComplete={handleGameComplete}
          onClose={handleGameClose}
        />
      );
    }
  }

  // Show realtime conversation practice - REDESIGNED LAYOUT
  if (showRealtimeConversation && lesson) {
    return (
      <SafeAreaWrapper includeBottom={true} includeTabBar={true}>
        <View style={styles.conversationPracticeContainer}>
          {/* Modern Header with Gradient */}
          <View style={styles.conversationPracticeHeader}>
            <LinearGradient
              colors={[BRAND_COLORS.EXPLORER_TEAL, BRAND_COLORS.OCEAN_BLUE, BRAND_COLORS.RUCKSACK_BROWN]}
              style={styles.conversationHeaderGradient}
            >
              <View style={styles.conversationHeaderContent}>
                <TouchableOpacity
                  style={styles.modernCloseButton}
                  onPress={() => {
                    console.log("🛑 User manually closed conversation");
                    setShowRealtimeConversation(false);
                    setActiveSection("practice");

                    // If user had started a session, mark practice as completed
                    if (practiceSessionStart) {
                      setHasCompletedAIPractice(true);

                      // Also check minimum time
                      const elapsed = (Date.now() - practiceSessionStart) / 1000;
                      if (elapsed >= MIN_CONVERSATION_TIME || elapsed >= 10) {
                        setHasMetMinimumTime(true);
                        console.log("✅ Minimum time requirement met on manual close");
                      }

                      console.log(
                        "AI practice marked as completed on manual close"
                      );
                    }
                  }}
                  activeOpacity={0.7}
                >
                  <Ionicons name="close" size={24} color="white" />
                </TouchableOpacity>

                <View style={styles.conversationHeaderInfo}>
                  <Text style={styles.conversationPracticeTitle}>
                    AI Practice Session
                  </Text>
                  <Text style={styles.conversationPracticeSubtitle}>
                    {lesson.name}
                  </Text>
                </View>

                <View style={styles.conversationHeaderStats}>
                  <View style={styles.statItem}>
                    <Ionicons name="time" size={16} color="rgba(255,255,255,0.8)" />
                    <Text style={styles.statText}>
                      {practiceSessionStart
                        ? Math.floor((Date.now() - practiceSessionStart) / 1000)
                        : 0}s
                    </Text>
                  </View>
                </View>
              </View>
            </LinearGradient>
          </View>

          {/* Main Conversation Area */}
          <View style={styles.conversationMainArea}>
            <PersistentConversationView
              scenarioId={`lesson-${id}`}
              level={user?.preferences?.languageLevel || PROFICIENCY_LEVELS.BEGINNER}
              onSessionEnd={() => {
                setShowRealtimeConversation(false);
                // If user had started a session, mark practice as completed
                if (practiceSessionStart) {
                  setHasCompletedAIPractice(true);

                  // Also check minimum time
                  const elapsed = (Date.now() - practiceSessionStart) / 1000;
                  if (elapsed >= MIN_CONVERSATION_TIME || elapsed >= 10) {
                    setHasMetMinimumTime(true);
                    console.log("✅ Minimum time requirement met on session end");
                  }

                  console.log("AI practice marked as completed on session end");
                }
              }}
              style={styles.modernConversationView}
            />
          </View>

          {/* Bottom Action Panel */}
          <View style={styles.conversationBottomPanel}>
            <View style={styles.bottomPanelContent}>
              {/* Practice Status */}
              <View style={styles.practiceStatusContainer}>
                <View style={styles.practiceStatusItem}>
                  <View style={[
                    styles.statusDot,
                    { backgroundColor: hasMetMinimumTime ? BRAND_COLORS.EXPLORER_TEAL : BRAND_COLORS.RUCKSACK_BROWN }
                  ]} />
                  <Text style={styles.statusText}>
                    {hasMetMinimumTime
                      ? "Time requirement met"
                      : `Need ${MIN_CONVERSATION_TIME - (practiceSessionStart ? Math.floor((Date.now() - practiceSessionStart) / 1000) : 0)}s more`
                    }
                  </Text>
                </View>
              </View>

              {/* Action Button */}
              <View style={styles.actionButtonContainer}>
                <ModernButton
                  text={
                    isCompletingPractice ? "Completing..." : "Complete Practice"
                  }
                  onPress={handleRealtimeConversationComplete}
                  style={[
                    styles.modernCompletePracticeButton,
                    !hasMetMinimumTime && styles.disabledActionButton,
                  ]}
                  disabled={!hasMetMinimumTime || isCompletingPractice}
                  loading={isCompletingPractice}
                />

                {/* Quick Tips */}
                <View style={styles.quickTipsContainer}>
                  <Text style={styles.quickTipsText}>
                    💡 Speak clearly and wait for Miles to respond
                  </Text>
                </View>
              </View>
            </View>
          </View>
        </View>
      </SafeAreaWrapper>
    );
  }

  if (showConversation && lesson) {
    // Convert lesson conversation to messages format
    const messages = lesson.content.conversation.dialogue.map((line) => ({
      id: Math.random().toString(),
      sender: line.speaker,
      text: line.text,
    }));

    return (
      <LessonScreen
        title={lesson.name}
        subtitle={`Lesson: ${lesson.name}`}
        messages={messages}
        onPractice={handleConversationComplete}
        onClose={() => setShowConversation(false)}
      />
    );
  }

  return (
    <SafeAreaView style={[styles.container, {
      paddingBottom: 40
    }]}>
      {/* Loading Overlay for smooth transitions */}
      <LoadingOverlay />

      {/* Congratulations Modal */}
      <CongratulationsModal />

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={styles.loadingText}>Loading lesson...</Text>
        </View>
      ) : error ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : (
        <ScrollView
          style={styles.scrollContainer}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Header - now part of scrollable content */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>{lesson?.name || "Lesson"}</Text>
          </View>

          {/* Progress Indicator */}
          <View style={styles.progressContainer}>
            <View style={styles.progressBar}>
              <View
                style={[
                  styles.progressFill,
                  { width: `${getSectionProgress()}%` },
                ]}
              />
            </View>
            <Text style={styles.progressText}>
              {getSectionTitle()} ({getSectionNumber()}/{sectionOrder.length})
            </Text>
          </View>

          {/* Section Content - now directly in main scroll */}
          <View style={[styles.sectionContent, {
          }]}>{renderSectionContent()}</View>

          {/* Navigation - Continue through sections, Finish only on practice */}
          <View
            style={[
              styles.navigationContainer,
              {
                justifyContent: "center",
                alignItems: "center",
                paddingTop: 0,
                height: 120,
              },
            ]}
          >
            {activeSection !== "practice" ? (
              // Continue button for non-practice sections
              <ModernButton
                text={getButtonText()}
                onPress={handleNext}
                style={[
                  styles.navButton,
                  styles.nextButton,
                  {
                    // margin: "auto",
                    marginTop: 10,

                  },
                ]}
              />
            ) : (
              // Full Screen Finish button only on practice section
              <View style={styles.fullScreenButtonContainer}>

                <ModernButton
                  text={
                    storeIsCompletingLesson || isCompletingLesson
                      ? "Completing..."
                      : lessonCompleted
                        ? "Lesson Complete!"
                        : getButtonText()
                  }
                  onPress={() => {
                    console.log("🔥 ModernButton onPress triggered!");
                    handleComplete();
                  }}
                  style={[
                    styles.fullScreenButton,
                    styles.completeButton,
                    !hasCompletedAIPractice && styles.disabledButton,
                    lessonCompleted && styles.completedButton,
                    {
                      marginTop: 20,
                    }
                  ]}
                  disabled={
                    !hasCompletedAIPractice ||
                    storeIsCompletingLesson ||
                    isCompletingLesson ||
                    !hasMetMinimumTime
                  }
                />

                {/* Helpful message instead of alert */}
                {!hasCompletedAIPractice && (
                  <View style={styles.requirementIndicator}>
                    <Ionicons name="mic-outline" size={16} color={BRAND_COLORS.WARM_CORAL} />
                    <Text style={styles.requirementText}>
                      Complete AI tutor practice to finish lesson
                    </Text>
                  </View>
                )}


                {error && (
                  <View style={styles.errorIndicator}>
                    <Ionicons name="alert-circle" size={16} color={BRAND_COLORS.WARM_CORAL} />
                    <Text style={styles.errorText}>{error}</Text>
                  </View>
                )}
              </View>
            )}
            <Spacer height={80} />
          </View>
        </ScrollView>
      )}

      {/* Success Feedback for Optimistic Updates */}
      {showSuccessFeedback && (
        <Modal visible={true} transparent={true} animationType="fade">
          <View style={styles.successFeedbackOverlay}>
            <View style={styles.successFeedbackContent}>
              <Ionicons name="checkmark-circle" size={48} color={BRAND_COLORS.EXPLORER_TEAL} />
              <Text style={styles.successFeedbackText}>Lesson Completed!</Text>
              <Text style={styles.successFeedbackSubtext}>Saving your progress...</Text>
            </View>
          </View>
        </Modal>
      )}
    </SafeAreaView>
  );
}
