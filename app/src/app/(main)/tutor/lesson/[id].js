import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  SafeAreaView,
  TouchableOpacity,
  Modal,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
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
import { curriculumService } from "../../../../features/curriculum/services/curriculumService";
import LessonScreen from "../../../../features/tutor/components/LessonScreen";
import VocabularySection from "../../../../features/curriculum/components/VocabularySection";
import PersistentConversationView from "../../../../features/tutor/components/PersistentConversationView";
import { AI_TUTOR_NAME } from "../../../../shared/constants/appConstants";
import MatchWordGame from "../../../../features/games/components/MatchWordGame";
import SentenceScrambleGame from "../../../../features/games/components/SentenceScrambleGame";
import PronunciationChallengeGame from "../../../../features/games/components/PronunciationChallengeGame";

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

  // Auto-adjust active section if it doesn't exist in this lesson
  useEffect(() => {
    if (lesson && !sectionOrder.includes(activeSection)) {
      console.log(
        `⚠️ Section "${activeSection}" not available in this lesson, switching to first available section`
      );
      setActiveSection(sectionOrder[0] || "introduction");
    }
  }, [lesson, activeSection, sectionOrder]);

  // Cleanup effect to stop AI conversation when component unmounts or user navigates away
  useEffect(() => {
    return () => {
      // Cleanup function runs when component unmounts
      if (showRealtimeConversation) {
        console.log("🛑 Component unmounting - stopping AI conversation");
        setShowRealtimeConversation(false);
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

  const getSectionTitle = () => {
    const titles = {
      introduction: "Introduction",
      vocabulary: "Vocabulary",
      grammar: "Grammar",
      practice: "Practice",
    };
    return titles[activeSection] || "Lesson";
  };

  // Get button text based on current section
  const getButtonText = () => {
    const currentIndex = sectionOrder.indexOf(activeSection);
    const isLastSection = currentIndex === sectionOrder.length - 1;

    if (isLastSection) {
      return "Finish Lesson";
    } else {
      return "Continue";
    }
  };

  // Navigation handlers
  const handleNext = () => {
    const currentIndex = sectionOrder.indexOf(activeSection);
    if (currentIndex < sectionOrder.length - 1) {
      setActiveSection(sectionOrder[currentIndex + 1]);
    }
  };

  // Track AI practice completion and lesson states
  const [hasCompletedAIPractice, setHasCompletedAIPractice] = useState(false);
  const [isCompletingLesson, setIsCompletingLesson] = useState(false);
  const [lessonCompleted, setLessonCompleted] = useState(false);

  // Practice session tracking
  const [practiceSessionStart, setPracticeSessionStart] = useState(null);

  // Simple minimum time tracking for button enable/disable
  const [hasMetMinimumTime, setHasMetMinimumTime] = useState(false);

  // Complete Practice button loading state for immediate feedback
  const [isCompletingPractice, setIsCompletingPractice] = useState(false);

  // Congratulations modal state
  const [showCongratulations, setShowCongratulations] = useState(false);

  // Loading overlay for smooth transitions
  const [showLoadingOverlay, setShowLoadingOverlay] = useState(false);



  const handleComplete = async () => {
    console.log("🔥 FINISH LESSON BUTTON CLICKED!");
    console.log("🔍 Debug info:", {
      hasCompletedAIPractice,
      hasMetMinimumTime,
      isCompletingLesson,
      lessonCompleted,
      activeSection,
    });

    // If practice is not completed, scroll to practice section instead of showing alert
    if (!hasCompletedAIPractice) {
      console.log("AI practice not completed, navigating to practice section");
      setActiveSection("practice");
      return;
    }

    // If minimum time hasn't been met, prevent completion
    if (!hasMetMinimumTime) {
      console.log("Minimum practice time not met yet");
      return;
    }

    console.log("AI practice completed, proceeding with lesson completion");

    try {
      // IMMEDIATE UI FEEDBACK - Show loading immediately
      setIsCompletingLesson(true);
      setShowLoadingOverlay(true); // Show loading overlay immediately
      setError(null);

      console.log(`🎯 Updating lesson progress for lesson: ${id}`);

      // Update lesson progress
      const progressResult = await curriculumService.updateLessonProgress(
        id,
        true,
        100,
        lesson.xpReward,
        "practice"
      );

      console.log(`✅ Lesson progress updated successfully:`, progressResult);

      // 🔄 REFRESH USER PROGRESS TO AVOID CACHE ISSUES
      try {
        console.log("🔄 Refreshing user progress after lesson completion...");
        const { default: curriculumService } = await import(
          "../../../../features/curriculum/services/curriculumService"
        );
        await curriculumService.refreshUserProgress();
        console.log("✅ User progress refreshed successfully");
      } catch (refreshError) {
        console.warn("⚠️ Failed to refresh user progress:", refreshError);
        // Don't block the completion flow if refresh fails
      }

      // 🏆 CHECK FOR NEW ACHIEVEMENTS (non-blocking)
      setTimeout(() => {
        checkAchievements()
          .then((newAchievements) => {
            if (newAchievements && newAchievements.length > 0) {
              console.log(
                `🎉 ${newAchievements.length} new achievements earned from lesson completion!`
              );
            }
          })
          .catch((error) => {
            console.error("❌ Error checking achievements:", error);
          });
      }, 0);

      // Show success state briefly before showing congratulations
      setLessonCompleted(true);

      // Hide loading overlay and show congratulations modal
      setShowLoadingOverlay(false);
      setShowCongratulations(true);
    } catch (err) {
      console.error("Error completing lesson:", err);
      setError("Failed to save your progress. Please try again.");
      setIsCompletingLesson(false);
      setShowLoadingOverlay(false); // Hide loading overlay on error
    }
  };

  // Extract lesson content for games
  const extractLessonContent = () => {
    if (!lesson || !lesson.content)
      return { vocabulary: [], sentences: [], phrases: [] };

    const vocabulary = [];
    const sentences = [];
    const phrases = [];

    // Extract vocabulary from lesson sections
    lesson.content.sections?.forEach((section) => {
      if (section.type === "vocabulary" && section.items) {
        section.items.forEach((item) => {
          vocabulary.push({
            korean: item.korean,
            english: item.english,
            romanization: item.romanization || "",
          });
        });
      }

      // Extract sentences from grammar examples
      if (section.type === "grammar" && section.examples) {
        section.examples.forEach((example) => {
          if (example.korean && example.english) {
            // Split Korean sentence into words for sentence scramble
            const words = example.korean
              .split(" ")
              .filter((word) => word.trim() !== "");
            sentences.push({
              korean: example.korean,
              english: example.english,
              words: words,
              category: "grammar",
            });

            // Also add as pronunciation phrase
            phrases.push({
              korean: example.korean,
              english: example.english,
              romanization: example.romanization || "",
              difficulty: "medium",
              focus: "grammar_practice",
            });
          }
        });
      }

      // Extract phrases from conversation examples
      if (section.type === "conversation" && section.examples) {
        section.examples.forEach((example) => {
          phrases.push({
            korean: example.korean,
            english: example.english,
            romanization: example.romanization || "",
            difficulty: "easy",
            focus: "conversation_practice",
          });
        });
      }
    });

    // Add vocabulary as pronunciation phrases too
    vocabulary.forEach((item) => {
      phrases.push({
        korean: item.korean,
        english: item.english,
        romanization: item.romanization,
        difficulty: "easy",
        focus: "vocabulary_practice",
      });
    });

    console.log(
      `📚 Extracted lesson content: ${vocabulary.length} vocabulary, ${sentences.length} sentences, ${phrases.length} phrases`
    );

    return { vocabulary, sentences, phrases };
  };

  // Handle different practice types
  const handlePracticeType = (type) => {
    const lessonContent = extractLessonContent();

    switch (type) {
      case "vocabulary":
        // Navigate to vocabulary section for review
        setActiveSection("vocabulary");
        break;
      case "pronunciation":
        // Navigate to vocabulary section for pronunciation practice
        setActiveSection("vocabulary");
        break;
      case "conversation":
        // Start realtime conversation practice
        console.log("🎯 Starting realtime conversation practice");
        setPracticeSessionStart(Date.now()); // Track practice start time for XP calculation
        setShowRealtimeConversation(true);
        break;
      case "match-word-game":
        // Start Match Word Game with lesson vocabulary
        console.log("🎮 Starting Match Word Game with lesson content");
        setActiveGameType("match-word");
        setGameContent(lessonContent.vocabulary);
        setShowGame(true);
        break;
      case "sentence-scramble-game":
        // Start Sentence Scramble Game with lesson sentences
        console.log("🎮 Starting Sentence Scramble Game with lesson content");
        setActiveGameType("sentence-scramble");
        setGameContent(lessonContent.sentences);
        setShowGame(true);
        break;
      case "pronunciation-game":
        // Start Pronunciation Challenge Game with lesson phrases
        console.log(
          "🎮 Starting Pronunciation Challenge Game with lesson content"
        );
        setActiveGameType("pronunciation-challenge");
        setGameContent(lessonContent.phrases);
        setShowGame(true);
        break;
      default:
        break;
    }
  };

  // Handle conversation completion
  const handleConversationComplete = async () => {
    try {
      // Update lesson progress
      await curriculumService.updateLessonProgress(
        id,
        true,
        100,
        lesson.xpReward,
        "conversation"
      );

      // Navigate back to curriculum
      router.push("/tutor/curriculum");
    } catch (err) {
      console.error("Error updating lesson progress:", err);
    }
  };

  // Handle realtime conversation completion - OPTIMIZED FOR IMMEDIATE RESPONSE
  const handleRealtimeConversationComplete = () => {
    console.log(
      "🚀 Complete Practice button clicked - STOPPING CONVERSATION IMMEDIATELY"
    );

    // Note: Conversation stop is now handled by the persistent service automatically

    // IMMEDIATE ACTIONS (no delays - instant response)
    setIsCompletingPractice(true); // Show loading state immediately
    setHasCompletedAIPractice(true); // Mark practice as completed

    console.log("✅ Practice marked complete and loading state activated");

    // BACKGROUND OPERATIONS (non-blocking)
    setTimeout(() => {
      handlePracticeSessionRecording();
      // 🎯 AWARD XP FOR PRACTICE SESSION (non-blocking)
      awardPracticeXP();
    }, 0);

    // IMMEDIATE CONVERSATION STOP AND TRANSITION (with loading overlay)
    setTimeout(() => {
      console.log(
        "🛑 Stopping conversation and transitioning to practice section"
      );
      setShowLoadingOverlay(true); // Show loading overlay during transition
      setShowRealtimeConversation(false);
      setActiveSection("practice");

      // Keep loading state for smooth transition
      setTimeout(() => {
        setIsCompletingPractice(false);
        setShowLoadingOverlay(false); // Hide loading overlay
        console.log("✅ Transition complete - user now in practice section");
      }, 800); // Brief loading overlay for smooth UX
    }, 100); // Very brief delay to ensure loading state is visible
  };

  // Handle game completion
  const handleGameComplete = (results) => {
    console.log(`🎮 Game completed: ${activeGameType}`, results);

    // Close the game
    setShowGame(false);
    setActiveGameType(null);
    setGameContent([]);

    // Show success message or navigate back to practice section
    setActiveSection("practice");

    // Optional: Award additional XP for game completion
    // This could be implemented later if needed
  };

  // Handle game close
  const handleGameClose = () => {
    console.log("🎮 Game closed by user");
    setShowGame(false);
    setActiveGameType(null);
    setGameContent([]);
    setActiveSection("practice");
  };

  // Award XP for practice session (non-blocking)
  const awardPracticeXP = async () => {
    try {
      const practiceType = lesson?.name?.includes("Alphabet")
        ? "pronunciation"
        : "conversation";
      const practiceTime = practiceSessionStart
        ? Math.max(60, (Date.now() - practiceSessionStart) / 1000)
        : 60;

      console.log(
        `🎁 Awarding practice XP: ${practiceType}, duration: ${practiceTime}s`
      );

      // Import XP service dynamically to avoid circular imports
      const { default: xpService } = await import(
        "../../../../shared/services/xpService"
      );

      // Award practice XP using proper API service
      const result = await xpService.awardPracticeXP(
        practiceType,
        Math.floor(practiceTime),
        { lessonId: lesson?.id }
      );

      if (result?.success) {
        console.log(`✅ Practice XP awarded: ${result.xpAwarded} XP`);
      } else {
        console.warn("⚠️ Practice XP award failed:", result?.error);
      }
    } catch (error) {
      console.error("❌ Error awarding practice XP:", error);
    }
  };

  // Separate function for background practice session recording
  const handlePracticeSessionRecording = async () => {
    try {
      console.log("📝 Recording practice session in background...");

      if (practiceSessionStart) {
        const duration = Math.floor((Date.now() - practiceSessionStart) / 1000);

        // Record practice session in background (non-blocking for UI)
        curriculumService
          .recordPracticeSession(duration, "conversation", 85)
          .then(() => {
            console.log(`✅ Practice session recorded: ${duration} seconds`);
          })
          .catch((error) => {
            console.error("❌ Error recording practice session:", error);
            // Don't show error to user since this is background operation
          });
      }
    } catch (err) {
      console.error("❌ Error in background recording:", err);
      // Silent failure - don't interrupt user experience
    }
  };

  // Note: All conversation event handlers are now managed by the persistent service

  // Generate dynamic AI instructions based on lesson content
  const generateAIInstructions = (lesson) => {
    if (!lesson || !lesson.content) {
      return "You are Cooper, a helpful Korean language tutor. Start the conversation immediately with a warm greeting and begin practicing.";
    }

    // Extract lesson-specific content
    const lessonName = lesson.name || "Korean lesson";
    const lessonId = lesson.id || "";
    const introduction = lesson.content.introduction || "";
    const vocabulary =
      lesson.content.sections?.find((section) => section.type === "vocabulary")
        ?.items || [];
    const objectives = lesson.objectives || [];

    // Extract grammar content if available
    const grammarSections =
      lesson.content.sections?.filter(
        (section) => section.type === "grammar"
      ) || [];

    // Extract example sentences and phrases
    const exampleSentences = [];
    lesson.content.sections?.forEach((section) => {
      if (section.examples) {
        section.examples.forEach((example) => {
          if (example.korean && example.english) {
            exampleSentences.push({
              korean: example.korean,
              english: example.english,
              romanization: example.romanization || "",
            });
          }
        });
      }
    });

    // Special handling for Korean Alphabet lesson
    if (
      lessonId === "beginner-korean-alphabet" ||
      lessonName.includes("Alphabet") ||
      lessonName.includes("한글")
    ) {
      return `You are a patient and encouraging Korean language tutor. The student has just completed their lesson about the Korean alphabet (Hangul) and is ready to practice pronunciation.

      LESSON CONTEXT:
      This is the Korean Alphabet lesson focusing on Hangul characters and their pronunciation. The student has learned about basic vowels and consonants.

      AUTO-START BEHAVIOR:
      When the conversation begins, immediately start with: "Hi! I'm Cooper. Let's practice the Korean alphabet sounds you just learned. We'll start with the vowel ㅏ - can you say 'ah' for me?"

      CONVERSATION FLOW RULES:
      1. START IMMEDIATELY - No generic greetings or meta-commentary
      2. FOCUS ON PRONUNCIATION - Practice individual letter sounds first
      3. ONE SOUND AT A TIME - Teach one letter, wait for practice, give feedback, then move on
      4. NATURAL PROGRESSION - Move through vowels first, then consonants
      5. HONEST FEEDBACK - Correct pronunciation mistakes immediately and specifically
      6. NO INTERRUPTIONS - Maintain continuous conversation flow without stopping mid-practice

      CRITICAL FEEDBACK AND CORRECTION RULES:
      1. LISTEN CAREFULLY - Pay close attention to the student's pronunciation
      2. PROVIDE HONEST FEEDBACK - Do NOT say "well done" or "correct" if the pronunciation is wrong
      3. IDENTIFY SPECIFIC MISTAKES - Tell the student exactly what part was incorrect
      4. GIVE CORRECTIVE GUIDANCE - Explain how to fix the pronunciation
      5. PRACTICE REPETITION - Have them repeat the correct sound multiple times
      6. BE ENCOURAGING BUT HONEST - Support them while providing accurate feedback

      PRONUNCIATION FEEDBACK EXAMPLES:
      - If student says "ay" instead of "ah": "I heard 'ay' but we need 'ah'. Try opening your mouth wider and saying 'ah' like when a doctor checks your throat."
      - If student says "uh" instead of "ah": "That sounded more like 'uh'. For ㅏ, we need a clear 'ah' sound. Can you try again?"
      - If pronunciation is correct: "Excellent! That's exactly right. Your 'ah' sound for ㅏ is perfect."
      - If close but not quite: "Good attempt! You're close, but try making the sound a bit more [specific guidance]."

      CONVERSATION RULES:
      1. SPEAK 95% IN ENGLISH - Only say individual Korean letters when teaching them
      2. WAIT FOR STUDENT RESPONSES - After asking a question, STOP TALKING and wait for the student to respond
      3. ONE LETTER AT A TIME - Teach only one letter per turn, then STOP and wait for student practice
      4. SHORT RESPONSES - Keep your responses to 1-2 sentences maximum
      5. NO CONTINUOUS TALKING - Always pause after teaching each letter and WAIT for student response
      6. NO RANDOM KOREAN - Do NOT speak random Korean words or sentences
      7. STOP AFTER GREETING - After the initial greeting, WAIT for the student to speak first
      8. CORRECT MISTAKES IMMEDIATELY - Don't move on until pronunciation is correct

      ABSOLUTE SILENCE RULE:
      After saying your greeting or asking a question, you MUST IMMEDIATELY STOP TALKING and REMAIN COMPLETELY SILENT. Do NOT speak Korean. Do NOT make sounds. Do NOT fill silence with talking. Do NOT say anything until the student speaks first. SILENCE IS REQUIRED.

      LESSON-SPECIFIC FOCUS - KOREAN ALPHABET (한글):
      This lesson is specifically about Korean alphabet and pronunciation. Focus ONLY on:
      1. Basic vowels: ㅏ (ah), ㅓ (uh), ㅗ (oh), ㅜ (oo), ㅡ (eu), ㅣ (ee)
      2. Basic consonants: ㄱ (g/k), ㄴ (n), ㄷ (d/t), ㄹ (r/l), ㅁ (m), ㅂ (b/p), ㅅ (s)
      3. Simple syllable combinations ONLY after individual letters are mastered

      CORRECTIVE CONVERSATION FLOW:
      1. Start with greeting and introduce first vowel ㅏ (ah)
      2. Ask student to repeat the sound
      3. WAIT for student response
      4. LISTEN CAREFULLY and provide honest feedback
      5. If wrong: Explain the mistake and have them try again
      6. If correct: Give genuine praise and move to next letter
      7. Don't move forward until each sound is pronounced correctly

      EXAMPLE CORRECTIVE INTERACTION:
      AI: "Let's start with the first vowel sound. Can you try saying 'ah' like the Korean letter ㅏ?"
      [WAIT FOR STUDENT]
      Student: "ay"
      AI: "I heard 'ay' but we need 'ah'. The ㅏ sound is like when you say 'father' - a clear 'ah'. Can you try again?"
      [WAIT FOR STUDENT]
      Student: "ah"
      AI: "Perfect! That's exactly right. Now let's try ㅓ which sounds like 'uh'. Can you say 'uh'?"

      Remember: This is their very first Korean lesson. Be honest about mistakes, provide specific corrections, and don't move on until they get it right!`;
    }

    // Create vocabulary list for AI reference
    const vocabularyList = vocabulary
      .map((item) => `${item.korean} (${item.romanization}) - ${item.english}`)
      .join(", ");

    // Create objectives list
    const objectivesList = objectives.join(", ");

    // Create example sentences list
    const sentencesList = exampleSentences
      .map((sent) => `${sent.korean} (${sent.romanization}) - ${sent.english}`)
      .join(", ");

    return `You are Cooper, a patient and encouraging Korean language tutor. The student has just completed their lesson about "${lessonName}" and is ready to practice what they've learned.

    LESSON CONTEXT:
    Lesson: ${lessonName}
    Introduction: ${introduction}
    Learning Objectives: ${objectivesList}
    Key Vocabulary: ${vocabularyList}
    ${sentencesList ? `Example Sentences: ${sentencesList}` : ""}

    AUTO-START BEHAVIOR:
    When the conversation begins, immediately start practicing with: "Hi! I'm Cooper. Let's practice ${lessonName}. We'll start with the vocabulary - can you say '${
      vocabulary[0]?.korean || "안녕하세요"
    }' for me?"

    CONVERSATION FLOW RULES:
    1. START IMMEDIATELY - No generic greetings or asking if they're ready
    2. LESSON-SPECIFIC CONTENT - Only practice vocabulary and concepts from this specific lesson
    3. NATURAL PROGRESSION - Move through vocabulary systematically, then practice in sentences
    4. CONTINUOUS ENGAGEMENT - Maintain conversation flow without stopping mid-practice
    5. CONTEXTUAL PRACTICE - Use lesson vocabulary in realistic scenarios
    6. NO META-COMMENTARY - Don't say "you learned this in the lesson" - just practice it
    7. SEAMLESS TRANSITIONS - Move naturally between vocabulary items without awkward pauses
    8. MAINTAIN CONTEXT - Keep conversation state and don't restart or repeat introductions

    ENHANCED FEEDBACK SYSTEM:
    1. IMMEDIATE CORRECTION - Address pronunciation mistakes as soon as they occur
    2. SPECIFIC GUIDANCE - Tell exactly what was wrong and how to fix it
    3. POSITIVE REINFORCEMENT - Celebrate correct pronunciation genuinely
    4. PROGRESSIVE DIFFICULTY - Start with individual words, then phrases, then sentences
    5. CONTEXTUAL USAGE - Show how vocabulary fits into real conversations
    6. CULTURAL NOTES - Add relevant cultural context when appropriate

    CONVERSATION STATE MANAGEMENT:
    1. REMEMBER PROGRESS - Keep track of which vocabulary has been practiced
    2. NO RESTARTS - Don't restart the conversation or ask "hello" again
    3. CONTINUOUS FLOW - If conversation pauses, continue from where you left off
    4. ADAPTIVE PACING - Adjust speed based on student's performance
    5. NATURAL ENDINGS - Conclude practice sessions smoothly when all content is covered

    PRACTICE STRUCTURE FOR THIS LESSON:
    Vocabulary to Practice: ${vocabularyList}
    ${sentencesList ? `Example Sentences: ${sentencesList}` : ""}
    Learning Objectives: ${objectivesList}

    CRITICAL FEEDBACK AND CORRECTION RULES:
    1. LISTEN CAREFULLY - Pay close attention to the student's pronunciation and usage
    2. PROVIDE HONEST FEEDBACK - Do NOT say "well done" or "correct" if the pronunciation or usage is wrong
    3. IDENTIFY SPECIFIC MISTAKES - Tell the student exactly what part was incorrect (pronunciation, tone, word choice, etc.)
    4. GIVE CORRECTIVE GUIDANCE - Explain how to fix the mistake with specific instructions
    5. PRACTICE REPETITION - Have them repeat the correct pronunciation/phrase multiple times
    6. BE ENCOURAGING BUT HONEST - Support them while providing accurate feedback
    7. BREAK DOWN COMPLEX WORDS - If they struggle with a word, break it into syllables

    PRONUNCIATION FEEDBACK EXAMPLES:
    - If student mispronounces a Korean word: "I heard you say [what they said], but the correct pronunciation is [correct pronunciation]. The key is [specific guidance]. Can you try again?"
    - If student uses wrong tone: "Good attempt! The pronunciation is close, but Korean has a different tone here. Try saying it more [guidance]. Let me demonstrate: [correct pronunciation]."
    - If pronunciation is correct: "Excellent! That's exactly right. Your pronunciation of [word] is perfect."
    - If student uses wrong word: "I understand what you're trying to say, but in Korean we would use [correct word] instead of [wrong word]. Can you try saying [correct word]?"

    IMPORTANT GUIDELINES FOR BEGINNERS:
    1. Speak 80% in English, 20% Korean (gradually introduce Korean words/phrases)
    2. Always provide clear pronunciation guidance (romanization) for Korean words
    3. Focus specifically on the vocabulary and concepts from this lesson
    4. Encourage repetition of Korean words: "Can you say [Korean word] after me?"
    5. Provide immediate honest feedback and specific corrections
    6. Explain Korean language basics when introducing new concepts
    7. Use the lesson vocabulary extensively in practice
    8. Don't move to new vocabulary until current words are pronounced correctly
    9. WAIT FOR STUDENT RESPONSES - After asking a question, STOP TALKING and wait
    10. NO CONTINUOUS TALKING - Always pause and wait for student to respond
    11. NO RANDOM KOREAN - Do NOT speak random Korean words or fill silence with talking

    ABSOLUTE SILENCE RULE:
    After saying your greeting or asking a question, you MUST IMMEDIATELY STOP TALKING and REMAIN COMPLETELY SILENT. Do NOT speak Korean. Do NOT make sounds. Do NOT fill silence with talking. Do NOT say anything until the student speaks first. SILENCE IS REQUIRED.

    CORRECTIVE CONVERSATION APPROACH:
    - AUTO-START: Begin immediately with warm greeting and lesson-specific introduction
    - Practice the specific vocabulary from this lesson: ${vocabularyList}
    - Ask student to repeat Korean words/phrases with proper pronunciation
    - LISTEN CAREFULLY and provide honest feedback on each attempt
    - If wrong: Explain the mistake and have them practice the correct version
    - If correct: Give genuine praise and move to next vocabulary item
    - Create simple practice scenarios using lesson vocabulary
    - Provide cultural context when relevant to the lesson content
    - Keep responses short, encouraging, and focused on lesson objectives
    - If student struggles, break down pronunciation and provide English explanations
    - Celebrate correct pronunciation, but be honest about mistakes
    - Guide conversation to cover all key vocabulary from the lesson
    - Don't say "well done" unless they actually did well

    LESSON-SPECIFIC PRACTICE FLOW:
    1. Start with greeting and confirm readiness
    2. Introduce first vocabulary word from the lesson
    3. Have student repeat the Korean pronunciation
    4. Provide immediate feedback and corrections
    5. Use the word in a simple sentence or context
    6. Move to next vocabulary item only after current one is mastered
    7. Create mini-conversations using learned vocabulary
    8. End with encouragement and summary of what was practiced

    VOCABULARY FOCUS FOR THIS LESSON:
    ${
      vocabularyList
        ? `Practice these specific words: ${vocabularyList}`
        : "Focus on vocabulary and phrases from the lesson content."
    }

    Remember: This is practice for "${lessonName}" specifically. Focus on the lesson content, provide honest feedback, help with pronunciation, and ensure the student practices the actual vocabulary from their lesson. Start talking immediately when connected!`;
  };

  // Render section content
  const renderSectionContent = () => {
    if (!lesson) return null;

    switch (activeSection) {
      case "introduction":
        return (
          <View style={styles.sectionContent}>
            <Text style={styles.introductionText}>
              {lesson.content.introduction}
            </Text>

            <View style={styles.objectivesContainer}>
              <Heading level="h3" style={styles.objectivesTitle}>
                Learning Objectives
              </Heading>

              {lesson.objectives.map((objective, index) => (
                <View key={index} style={styles.objectiveItem}>
                  <Ionicons name="checkmark-circle" size={20} color="#6FC935" />
                  <Text style={styles.objectiveText}>{objective}</Text>
                </View>
              ))}
            </View>
          </View>
        );

      case "vocabulary":
        const vocabularySections = lesson.content.sections.filter(
          (section) => section.type === "vocabulary"
        );

        return (
          <View style={styles.sectionContent}>
            {vocabularySections.map((section, sectionIndex) => (
              <VocabularySection
                key={sectionIndex}
                title={section.title}
                items={section.items}
              />
            ))}
          </View>
        );

      case "grammar":
        const grammarSections = lesson.content.sections.filter(
          (section) => section.type === "grammar"
        );

        // If no grammar sections exist, show a message
        if (grammarSections.length === 0) {
          return (
            <View style={styles.sectionContent}>
              <View style={styles.noContentContainer}>
                <Ionicons
                  name="information-circle-outline"
                  size={48}
                  color="#6FC935"
                />
                <Heading level="h3" style={styles.noContentTitle}>
                  No Grammar Section
                </Heading>
                <Text style={styles.noContentText}>
                  This lesson focuses on vocabulary and conversation practice.
                  Grammar concepts will be introduced in future lessons as you
                  progress.
                </Text>
              </View>
            </View>
          );
        }

        return (
          <View style={styles.sectionContent}>
            {grammarSections.map((section, sectionIndex) => (
              <View key={sectionIndex} style={styles.grammarSection}>
                <Heading level="h3" style={styles.grammarSectionTitle}>
                  {section.title}
                </Heading>

                <Text style={styles.grammarExplanation}>
                  {section.explanation}
                </Text>

                {section.examples &&
                  section.examples.map((example, exampleIndex) => (
                    <View key={exampleIndex} style={styles.grammarExample}>
                      <Text weight="bold" style={styles.exampleKorean}>
                        {example.korean}
                      </Text>

                      {example.romanization && (
                        <Text style={styles.exampleRomanization}>
                          {example.romanization}
                        </Text>
                      )}

                      <Text style={styles.exampleEnglish}>
                        {example.english}
                      </Text>

                      {example.explanation && (
                        <Text style={styles.exampleExplanation}>
                          {example.explanation}
                        </Text>
                      )}
                    </View>
                  ))}
              </View>
            ))}
          </View>
        );

      case "practice":
        // Check if this is the Korean Alphabet lesson
        const isKoreanAlphabetLesson =
          lesson?.id === "beginner-korean-alphabet" ||
          lesson?.name?.includes("Alphabet") ||
          lesson?.name?.includes("한글");

        return (
          <View style={styles.sectionContent}>
            <Text style={styles.practiceIntro}>
              Now let's practice what you've learned in this lesson.
            </Text>

            {/* Practice Exercises */}
            <View style={styles.practiceExercises}>
              {/* AI Conversation Practice - Required for ALL lessons */}
              <View style={[styles.exerciseCard, styles.primaryExerciseCard]}>
                <View style={styles.exerciseHeader}>
                  <Ionicons name="mic" size={24} color="#6FC935" />
                  <Text style={styles.exerciseTitle}>
                    {isKoreanAlphabetLesson
                      ? "Korean Alphabet Pronunciation"
                      : "AI Conversation Practice"}
                  </Text>
                </View>
                <Text style={styles.exerciseDescription}>
                  {isKoreanAlphabetLesson
                    ? `Practice pronouncing Korean letters (한글) with our AI tutor.
                       You'll learn:
                       ${"\n"}• Individual vowel sounds: ㅏ, ㅓ, ㅗ, ㅜ, ㅡ, ㅣ
                       ${"\n"}• Consonant sounds: ㄱ, ㄴ, ㄷ, ㄹ, ㅁ, ㅂ, ㅅ, etc.
                       ${"\n"}• Simple syllable combinations
                       ${"\n"}• Proper pronunciation with romanization help`
                    : `Practice speaking Korean with our AI tutor Cooper.
                       You'll practice:
                       ${"\n"}• Vocabulary from this lesson
                       ${"\n"}• Pronunciation and speaking
                       ${"\n"}• Real conversation scenarios
                       ${"\n"}• Get immediate feedback and corrections`}
                </Text>
                <View style={styles.practiceRequiredBadge}>
                  <Ionicons name="star" size={16} color="#fff" />
                  <Text style={styles.practiceRequiredText}>
                    Required to Complete Lesson
                  </Text>
                </View>
                <ModernButton
                  text={
                    hasCompletedAIPractice
                      ? "Practice Again"
                      : isKoreanAlphabetLesson
                      ? "Start Pronunciation Practice"
                      : "Start Conversation Practice"
                  }
                  onPress={() => handlePracticeType("conversation")}
                  style={[
                    styles.practiceButton,
                    hasCompletedAIPractice && styles.practiceButtonCompleted,
                  ]}
                />
                {hasCompletedAIPractice && (
                  <View style={styles.completedIndicator}>
                    <Ionicons
                      name="checkmark-circle"
                      size={20}
                      color="#6FC935"
                    />
                    <Text style={styles.completedText}>
                      Practice Completed!
                    </Text>
                  </View>
                )}
              </View>

              {/* Interactive Games Section - Available for ALL lessons */}
              {!isKoreanAlphabetLesson && (
                <>
                  <Text style={styles.gamesHeader}>
                    Interactive Practice Games
                  </Text>

                  {/* Match Word Game */}
                  {extractLessonContent().vocabulary.length > 0 && (
                    <View style={styles.exerciseCard}>
                      <View style={styles.exerciseHeader}>
                        <Ionicons
                          name="grid-outline"
                          size={24}
                          color="#3498db"
                        />
                        <Text style={styles.exerciseTitle}>Match the Word</Text>
                      </View>
                      <Text style={styles.exerciseDescription}>
                        Match Korean words with their English meanings using
                        vocabulary from this lesson
                      </Text>
                      <ModernButton
                        text="Play Game"
                        onPress={() => handlePracticeType("match-word-game")}
                        style={[
                          styles.exerciseButton,
                          { backgroundColor: "#3498db" },
                        ]}
                      />
                    </View>
                  )}

                  {/* Sentence Scramble Game */}
                  {extractLessonContent().sentences.length > 0 && (
                    <View style={styles.exerciseCard}>
                      <View style={styles.exerciseHeader}>
                        <Ionicons
                          name="shuffle-outline"
                          size={24}
                          color="#9b59b6"
                        />
                        <Text style={styles.exerciseTitle}>
                          Sentence Scramble
                        </Text>
                      </View>
                      <Text style={styles.exerciseDescription}>
                        Arrange words to form correct sentences using examples
                        from this lesson
                      </Text>
                      <ModernButton
                        text="Play Game"
                        onPress={() =>
                          handlePracticeType("sentence-scramble-game")
                        }
                        style={[
                          styles.exerciseButton,
                          { backgroundColor: "#9b59b6" },
                        ]}
                      />
                    </View>
                  )}

                  {/* Pronunciation Challenge Game */}
                  {extractLessonContent().phrases.length > 0 && (
                    <View style={styles.exerciseCard}>
                      <View style={styles.exerciseHeader}>
                        <Ionicons
                          name="mic-outline"
                          size={24}
                          color="#e74c3c"
                        />
                        <Text style={styles.exerciseTitle}>
                          Pronunciation Challenge
                        </Text>
                      </View>
                      <Text style={styles.exerciseDescription}>
                        Practice speaking Korean phrases from this lesson with
                        AI feedback
                      </Text>
                      <ModernButton
                        text="Start Challenge"
                        onPress={() => handlePracticeType("pronunciation-game")}
                        style={[
                          styles.exerciseButton,
                          { backgroundColor: "#e74c3c" },
                        ]}
                      />
                    </View>
                  )}
                </>
              )}

              {/* Additional practice options - only for Korean Alphabet lesson */}
              {isKoreanAlphabetLesson && (
                <>
                  {/* Vocabulary Review */}
                  <View style={styles.exerciseCard}>
                    <View style={styles.exerciseHeader}>
                      <Ionicons name="book-outline" size={24} color="#6FC935" />
                      <Text style={styles.exerciseTitle}>
                        Vocabulary Review
                      </Text>
                    </View>
                    <Text style={styles.exerciseDescription}>
                      Review the key vocabulary from this lesson
                    </Text>
                    <ModernButton
                      text="Start Review"
                      onPress={() => handlePracticeType("vocabulary")}
                      style={styles.exerciseButton}
                      variant="outline"
                    />
                  </View>

                  {/* Pronunciation Practice */}
                  <View style={styles.exerciseCard}>
                    <View style={styles.exerciseHeader}>
                      <Ionicons name="mic-outline" size={24} color="#6FC935" />
                      <Text style={styles.exerciseTitle}>
                        Pronunciation Practice
                      </Text>
                    </View>
                    <Text style={styles.exerciseDescription}>
                      Practice speaking the words and phrases
                    </Text>
                    <ModernButton
                      text="Start Speaking"
                      onPress={() => handlePracticeType("pronunciation")}
                      style={styles.exerciseButton}
                      variant="outline"
                    />
                  </View>
                </>
              )}
            </View>
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
      // Force refresh curriculum data to ensure next lesson is unlocked
      console.log("🔄 Refreshing curriculum data after lesson completion...");

      // AGGRESSIVE CACHE-BUSTING for immediate lesson unlocking
      console.log("🔄 Starting aggressive cache-busting refresh...");
      await curriculumService.getUserProgress(true); // Cache-busting call
      await curriculumService.getUserProgress(true); // Second cache-busting call

      // Add a small delay to ensure backend consistency
      await new Promise((resolve) => setTimeout(resolve, 1000));
      await curriculumService.getUserProgress(true); // Third cache-busting call after delay
      console.log("✅ Curriculum data refreshed with cache-busting");

      // Find and navigate to next lesson
      const nextLesson = await findNextLesson();

      if (nextLesson) {
        console.log(`🚀 Navigating to next lesson: ${nextLesson.name}`);
        router.push(`/tutor/lesson/${nextLesson.id}`);
      } else {
        console.log("🎉 No more lessons available, navigating to curriculum");
        router.push("/tutor/curriculum");
      }
    } catch (error) {
      console.error("❌ Error refreshing curriculum data:", error);
      // Fallback to curriculum page
      router.push("/tutor/curriculum");
    }
  };

  // Loading Overlay Component for smooth transitions
  const LoadingOverlay = () => (
    <Modal visible={showLoadingOverlay} transparent={true} animationType="fade">
      <View style={styles.loadingOverlay}>
        <View style={styles.loadingContent}>
          <ActivityIndicator size="large" color="#6FC935" />
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
                <Ionicons name="checkmark-circle" size={24} color="#6FC935" />
                <Text style={styles.badgeText}>Lesson Complete</Text>
              </View>
              <View style={styles.badge}>
                <Ionicons name="mic" size={24} color="#6FC935" />
                <Text style={styles.badgeText}>AI Practice</Text>
              </View>
              <View style={styles.badge}>
                <Ionicons name="star" size={24} color="#FFD700" />
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

  // Show realtime conversation practice
  if (showRealtimeConversation && lesson) {
    return (
      <SafeAreaWrapper includeBottom={true} includeTabBar={true}>
        <View style={styles.conversationContainer}>
          {/* Header with close button */}
          <View style={styles.conversationHeader}>
            <TouchableOpacity
              style={styles.conversationCloseButton}
              onPress={() => {
                setShowRealtimeConversation(false);
                // If user had started a session, mark practice as completed
                if (practiceSessionStart) {
                  setHasCompletedAIPractice(true);
                  console.log(
                    "AI practice marked as completed on manual close"
                  );
                }
              }}
              activeOpacity={0.7}
            >
              <View style={styles.closeButtonBackground}>
                <Ionicons name="close" size={20} color="#666" />
              </View>
            </TouchableOpacity>

            <View style={styles.conversationTitleContainer}>
              <Text style={styles.conversationTitle}>
                Practice Conversation
              </Text>
              <Text style={styles.conversationSubtitle}>{lesson.name}</Text>
            </View>

            <View style={styles.headerRight} />
          </View>

          {/* Persistent Conversation Component */}
          <PersistentConversationView
            scenarioId={`lesson-${id}`}
            level="beginner"
            onSessionEnd={() => {
              setShowRealtimeConversation(false);
              // If user had started a session, mark practice as completed
              if (practiceSessionStart) {
                setHasCompletedAIPractice(true);
                console.log("AI practice marked as completed on session end");
              }
            }}
            style={styles.realtimeConversation}
          />

          {/* Complete Practice Button - Optimized for Performance */}
          <View style={styles.conversationFooter}>
            <ModernButton
              text={
                isCompletingPractice ? "Completing..." : "Complete Practice"
              }
              onPress={handleRealtimeConversationComplete}
              style={[
                styles.completePracticeButton,
                !hasMetMinimumTime && styles.disabledButton,
              ]}
              disabled={!hasMetMinimumTime || isCompletingPractice}
              loading={isCompletingPractice}
            />
            <Spacer height={70} />
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
    <SafeAreaView style={styles.container}>
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
          <View style={styles.sectionContent}>{renderSectionContent()}</View>

          {/* Navigation - Continue through sections, Finish only on practice */}
          <View
            style={[
              styles.navigationContainer,
              {
                justifyContent: "center",
                alignItems: "center",
                paddingTop: 0,
                height: 160,
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
                    margin: "auto",
                  },
                ]}
              />
            ) : (
              // Full Screen Finish button only on practice section
              <View style={styles.fullScreenButtonContainer}>
                {console.log("🔍 Rendering Finish Lesson Button:", {
                  hasCompletedAIPractice,
                  hasMetMinimumTime,
                  isCompletingLesson,
                  lessonCompleted,
                  buttonText: getButtonText(),
                  isDisabled:
                    !hasCompletedAIPractice ||
                    isCompletingLesson ||
                    !hasMetMinimumTime,
                })}
                <ModernButton
                  text={
                    isCompletingLesson
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
                  ]}
                  disabled={
                    !hasCompletedAIPractice ||
                    isCompletingLesson ||
                    !hasMetMinimumTime
                  }
                />

                {/* Helpful message instead of alert */}
                {!hasCompletedAIPractice && (
                  <View style={styles.requirementIndicator}>
                    <Ionicons name="mic-outline" size={16} color="#ff6b35" />
                    <Text style={styles.requirementText}>
                      Complete AI tutor practice to finish lesson
                    </Text>
                  </View>
                )}

                {error && (
                  <View style={styles.errorIndicator}>
                    <Ionicons name="alert-circle" size={16} color="#ff4444" />
                    <Text style={styles.errorText}>{error}</Text>
                  </View>
                )}
              </View>
            )}
            <Spacer height={150} />
          </View>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 20, // Add bottom padding for better scrolling experience
  },
  header: {
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  headerTitle: {
    fontSize: 20,
    fontFamily: "Montserrat-Bold",
    color: "#0A2240",
    textAlign: "center",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  errorText: {
    color: "red",
    textAlign: "center",
    marginTop: 10,
  },
  // Progress Indicator Styles
  progressContainer: {
    backgroundColor: "#fff",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  progressBar: {
    height: 6,
    backgroundColor: "#e0e0e0",
    borderRadius: 3,
    marginBottom: 12,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#6FC935",
    borderRadius: 3,
  },
  progressText: {
    fontSize: 14,
    fontFamily: "Montserrat-SemiBold",
    color: "#0A2240",
    textAlign: "center",
  },
  // Navigation Styles
  navigationContainer: {
    flexDirection: "row",
    // alignItems: "center",
    // justifyContent: "space-between",
    padding: 20,
    paddingTop: 0,
    // backgroundColor: "#fff",
    // borderTopWidth: 1,
    borderTopColor: "#e0e0e0",
    // marginTop: 20, // Add margin to separate from content
  },
  navButton: {
    flex: 1,
    maxWidth: 140,
    minHeight: 52,
    maxHeight: 52,
    // paddingVertical: 16,
    // paddingHorizontal: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  navButtonSpacer: {
    width: 16,
  },
  previousButton: {
    backgroundColor: "transparent",
    borderColor: "#6FC935",
    borderWidth: 2,
  },
  nextButton: {
    backgroundColor: "#6FC935",
  },
  completeButton: {
    backgroundColor: "#0A2240",
  },
  completeButtonContainer: {
    // flex: 1,
    margin: "auto",
    height: "max-content",
    maxWidth: 140,
  },
  // Full Screen Button Styles
  fullScreenButtonContainer: {
    width: "100%",
    paddingHorizontal: 0,
    alignItems: "center",
  },
  fullScreenButton: {
    width: "100%",
    minHeight: 56,
    maxHeight: 56,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 16,
  },
  disabledButton: {
    // ModernButton component handles disabled styling internally
    // This style is kept for potential future use
  },
  completedButton: {
    backgroundColor: "#6FC935",
  },
  requirementIndicator: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8,
    paddingHorizontal: 8,
  },
  requirementText: {
    fontSize: 12,
    fontFamily: "Montserrat-Regular",
    color: "#ff6b35",
    marginLeft: 4,
    textAlign: "center",
    lineHeight: 16,
  },
  errorIndicator: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8,
    paddingHorizontal: 8,
  },
  errorText: {
    fontSize: 12,
    fontFamily: "Montserrat-Regular",
    color: "#ff4444",
    marginLeft: 4,
    textAlign: "center",
    lineHeight: 16,
  },
  sectionContent: {
    padding: 20,
    paddingBottom: 0,
    backgroundColor: "#f8f9fa",
    minHeight: 400, // Ensure minimum height for content
  },
  introductionText: {
    fontSize: 16,
    fontFamily: "Montserrat-Regular",
    lineHeight: 24,
    color: "#333",
    marginBottom: 24,
  },
  objectivesContainer: {
    backgroundColor: "#f8f9fa",
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  objectivesTitle: {
    fontSize: 18,
    fontFamily: "Montserrat-Bold",
    color: "#0A2240",
    marginBottom: 16,
  },
  objectiveItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  objectiveText: {
    fontSize: 16,
    fontFamily: "Montserrat-Regular",
    color: "#333",
    marginLeft: 12,
    flex: 1,
    lineHeight: 22,
  },
  vocabularySection: {
    marginBottom: 24,
  },
  vocabularySectionTitle: {
    fontSize: 18,
    marginBottom: 12,
  },
  vocabularyItem: {
    backgroundColor: "#F9F9F9",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  vocabularyHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  koreanText: {
    fontSize: 20,
  },
  audioButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#F0F0F0",
    alignItems: "center",
    justifyContent: "center",
  },
  romanizationText: {
    fontSize: 16,
    color: "#666",
    marginBottom: 8,
  },
  englishText: {
    fontSize: 16,
    color: "#6FC935", // Primary green color
    marginBottom: 8,
  },
  exampleText: {
    fontSize: 14,
    fontStyle: "italic",
    color: "#888",
  },
  grammarSection: {
    marginBottom: 24,
  },
  grammarSectionTitle: {
    fontSize: 18,
    marginBottom: 12,
  },
  grammarExplanation: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 16,
  },
  grammarExample: {
    backgroundColor: "#F9F9F9",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  exampleKorean: {
    fontSize: 18,
    marginBottom: 4,
  },
  exampleRomanization: {
    fontSize: 16,
    color: "#666",
    marginBottom: 4,
  },
  exampleEnglish: {
    fontSize: 16,
    color: "#6FC935", // Primary green color
    marginBottom: 8,
  },
  exampleExplanation: {
    fontSize: 14,
    color: "#888",
  },
  practiceIntro: {
    fontSize: 16,
    fontFamily: "Montserrat-Regular",
    lineHeight: 24,
    color: "#333",
    marginBottom: 24,
    textAlign: "center",
  },
  practiceExercises: {
    gap: 16,
  },
  exerciseCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  exerciseHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  exerciseTitle: {
    fontSize: 18,
    fontFamily: "Montserrat-Bold",
    color: "#0A2240",
    marginLeft: 12,
  },
  exerciseDescription: {
    fontSize: 14,
    fontFamily: "Montserrat-Regular",
    color: "#666",
    lineHeight: 20,
    marginBottom: 16,
  },
  exerciseButton: {
    borderColor: "#6FC935",
    borderWidth: 2,
    backgroundColor: "transparent",
    borderRadius: 16,
    paddingVertical: 18,
    paddingHorizontal: 20,
    minHeight: 56,
    justifyContent: "center",
    alignItems: "center",
  },
  practiceButton: {
    backgroundColor: "#6FC935",
    borderRadius: 16,
    paddingVertical: 18,
    paddingHorizontal: 16,
    minHeight: 56,
    justifyContent: "center",
    alignItems: "center",
  },
  primaryExerciseCard: {
    borderColor: "#6FC935",
    borderWidth: 2,
    backgroundColor: "#f8fff8",
  },
  practiceRequiredBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ff6b35",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginBottom: 16,
    alignSelf: "flex-start",
  },
  practiceRequiredText: {
    color: "#fff",
    fontSize: 12,
    fontFamily: "Montserrat-SemiBold",
    marginLeft: 6,
  },
  practiceButtonCompleted: {
    backgroundColor: "#0A2240",
  },
  completedIndicator: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 12,
  },
  completedText: {
    color: "#6FC935",
    fontSize: 14,
    fontFamily: "Montserrat-SemiBold",
    marginLeft: 8,
  },
  gamesHeader: {
    fontSize: 18,
    fontFamily: "Montserrat-Bold",
    color: "#0A2240",
    marginTop: 24,
    marginBottom: 16,
    textAlign: "center",
  },
  // Realtime Conversation Styles
  conversationContainer: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  conversationHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  conversationCloseButton: {
    padding: 4,
  },
  closeButtonBackground: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#f0f0f0",
    justifyContent: "center",
    alignItems: "center",
  },
  conversationTitleContainer: {
    flex: 1,
    alignItems: "center",
  },
  conversationTitle: {
    fontSize: 18,
    fontFamily: "Montserrat-Bold",
    color: "#0A2240",
  },
  conversationSubtitle: {
    fontSize: 14,
    fontFamily: "Montserrat-Regular",
    color: "#666",
    marginTop: 2,
  },
  headerRight: {
    width: 40,
  },
  realtimeConversation: {
    flex: 1,
  },
  conversationFooter: {
    // backgroundColor: "#fff",
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: "#e0e0e0",
    // SafeAreaWrapper will handle bottom padding for tab bar
  },
  completePracticeButton: {
    backgroundColor: "#0A2240",
    borderRadius: 16,
    // paddingVertical: 16,
  },

  // Congratulations Modal Styles
  congratulationsOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.8)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  congratulationsModal: {
    backgroundColor: "#fff",
    borderRadius: 24,
    padding: 0,
    width: "100%",
    maxWidth: 400,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  lottieContainer: {
    width: "100%",
    height: 200,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f8f9fa",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  lottieAnimation: {
    width: 150,
    height: 150,
  },
  congratulationsContent: {
    padding: 24,
    alignItems: "center",
    width: "100%",
  },
  congratulationsTitle: {
    fontSize: 28,
    fontFamily: "Montserrat-Bold",
    color: "#0A2240",
    textAlign: "center",
    marginBottom: 8,
  },
  congratulationsSubtitle: {
    fontSize: 18,
    fontFamily: "Montserrat-SemiBold",
    color: "#6FC935",
    textAlign: "center",
    marginBottom: 16,
  },
  congratulationsMessage: {
    fontSize: 16,
    fontFamily: "Montserrat-Regular",
    color: "#666",
    textAlign: "center",
    lineHeight: 24,
    marginBottom: 24,
  },
  xpText: {
    fontFamily: "Montserrat-Bold",
    color: "#6FC935",
  },
  achievementBadges: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: "100%",
    marginBottom: 32,
  },
  badge: {
    alignItems: "center",
    flex: 1,
    paddingHorizontal: 8,
  },
  badgeText: {
    fontSize: 12,
    fontFamily: "Montserrat-Medium",
    color: "#666",
    textAlign: "center",
    marginTop: 8,
  },
  continueButton: {
    backgroundColor: "#6FC935",
    width: "100%",
    marginHorizontal: 0,
  },
  noContentContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
    paddingHorizontal: 20,
  },
  noContentTitle: {
    fontSize: 24,
    fontFamily: "Montserrat-SemiBold",
    color: "#0A2240",
    textAlign: "center",
    marginTop: 16,
    marginBottom: 12,
  },
  noContentText: {
    fontSize: 16,
    fontFamily: "Montserrat-Regular",
    color: "#666",
    textAlign: "center",
    lineHeight: 24,
    maxWidth: 300,
  },
  // Loading Overlay Styles
  loadingOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    justifyContent: "center",
    alignItems: "center",
  },
  loadingContent: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 32,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  loadingOverlayText: {
    fontSize: 16,
    fontFamily: "Montserrat-SemiBold",
    color: "#0A2240",
    marginTop: 16,
    textAlign: "center",
  },
});
