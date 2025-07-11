import React, { useState, useEffect, useRef } from "react";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
  ActivityIndicator,
  Platform,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import ConfettiCannon from "react-native-confetti-cannon";
import * as FileSystem from "expo-file-system";
import { useAudioRecorder, AudioModule, RecordingPresets } from "expo-audio";
import { Audio } from "../../../shared/utils/audioUtils";
import ttsService from "../../../shared/services/ttsService";
import { useTheme } from "../../../shared/context/ThemeContext";
import { Text, Heading, ModernButton, Row } from "../../../shared/components";
import { useAchievements } from "../../achievements/context/AchievementContext";
import { curriculumService } from "../../../features/curriculum/services/curriculumService";
import { gameService } from "../services/gameService";
import { apiClient } from "../../../shared/api/apiClient";
import gameContentService from "../services/gameContentService";
import { useAuth } from "../../auth/hooks/useAuth";
import { ENDPOINTS } from "../../../shared/config/api";

const { width } = Dimensions.get("window");

/**
 * Pronunciation Challenge Game Component
 * A game where users record themselves speaking Korean and get feedback
 *
 * @param {Object} props - Component props
 * @param {string} props.lessonId - ID of the lesson this game is for
 * @param {Array} props.phrases - Array of phrases to pronounce
 * @param {Function} props.onComplete - Function to call when game is completed
 * @param {Function} props.onClose - Function to call when game is closed
 */
const PronunciationChallengeGame = ({
  lessonId,
  phrases = [],
  onComplete,
  onClose,
}) => {
  const router = useRouter();
  const { theme } = useTheme();
  const { checkAchievements } = useAchievements();
  const { user } = useAuth();

  // Game state
  const [gamePhrases, setGamePhrases] = useState([]);
  const [currentPhraseIndex, setCurrentPhraseIndex] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingUri, setRecordingUri] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [score, setScore] = useState(0);
  const [accuracyScores, setAccuracyScores] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [gameCompleted, setGameCompleted] = useState(false);
  const [gameResults, setGameResults] = useState(null);
  const [startTime, setStartTime] = useState(null);
  const [endTime, setEndTime] = useState(null);
  const [permissionsGranted, setPermissionsGranted] = useState(false);

  // expo-audio recorder hook
  const audioRecorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);

  // Confetti ref
  const confettiRef = useRef(null);

  // Animation values
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const slideAnim = useRef(new Animated.Value(0)).current;

  // Initialize game
  useEffect(() => {
    initializeGameAsync();
  }, [lessonId, phrases]);

  // Initialize game asynchronously
  const initializeGameAsync = async () => {
    try {
      // Request permissions first
      const permissionsResult = await requestPermissions();
      if (!permissionsResult) {
        return; // Exit if permissions not granted
      }

      // Load phrases
      if (phrases.length > 0) {
        initializeGame(phrases);
      } else if (lessonId && lessonId !== "practice") {
        await loadPhrasesFromLesson(lessonId);
      } else {
        await loadContentFromService();
      }

      // Start game timer
      setStartTime(Date.now());
    } catch (error) {
      console.error("❌ Error initializing game:", error);
      setIsLoading(false);
    }
  };

  // Clean up when component unmounts
  useEffect(() => {
    return () => {
      if (isRecording) {
        // Stop recording on cleanup
        audioRecorder.stop().catch(() => {});
      }
    };
  }, []);

  // Load content from the new game content service
  const loadContentFromService = async () => {
    try {
      setIsLoading(true);

      // Determine user level
      const userLevel = user?.preferences?.languageLevel || "beginner";

      console.log(
        `🎮 Loading Pronunciation Challenge content for level: ${userLevel}`
      );

      // Get content from the new service
      const content = await gameContentService.getPronunciationContent({
        level: userLevel,
        count: 5,
      });

      console.log(`✅ Loaded ${content.length} phrases from content service`);

      if (content && content.length > 0) {
        initializeGame(content);
      } else {
        // Fallback to default phrases if service fails
        console.warn("⚠️ No content from service, using fallback");
        loadFallbackPhrases();
      }
    } catch (error) {
      console.error("❌ Error loading content from service:", error);
      // Fallback to default phrases on error
      loadFallbackPhrases();
    } finally {
      setIsLoading(false);
    }
  };

  // Fallback phrases if content service fails
  const loadFallbackPhrases = () => {
    const fallbackPhrases = [
      {
        korean: "안녕하세요",
        english: "Hello",
        romanization: "annyeonghaseyo",
      },
      {
        korean: "감사합니다",
        english: "Thank you",
        romanization: "gamsahamnida",
      },
      {
        korean: "저는 한국어를 공부해요",
        english: "I study Korean",
        romanization: "jeoneun hangugeo-reul gongbuhaeyo",
      },
      {
        korean: "오늘 날씨가 좋아요",
        english: "The weather is good today",
        romanization: "oneul nalssiga joayo",
      },
      {
        korean: "한국 음식을 좋아해요",
        english: "I like Korean food",
        romanization: "hanguk eumsigeul joahaeyo",
      },
    ];
    initializeGame(fallbackPhrases);
  };

  // Request audio recording permissions
  const requestPermissions = async () => {
    try {
      console.log("🎤 Requesting audio permissions...");

      // Request recording permissions using AudioModule
      const permissionResult = await AudioModule.requestRecordingPermissionsAsync();
      console.log("📱 Permission result:", permissionResult);

      if (!permissionResult.granted) {
        console.error("❌ Audio recording permissions not granted");
        alert("Microphone permission is required for pronunciation practice. Please enable it in your device settings.");
        setPermissionsGranted(false);
        return false;
      }

      console.log("✅ Audio permissions granted");
      setPermissionsGranted(true);

      // Set audio mode for recording
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
        staysActiveInBackground: false,
        shouldDuckAndroid: true,
        playThroughEarpieceAndroid: false,
      });

      console.log("✅ Audio mode configured for recording");
      return true;
    } catch (error) {
      console.error("❌ Error requesting permissions:", error);
      alert("Failed to set up audio recording. Please check your device settings.");
      setPermissionsGranted(false);
      return false;
    }
  };

  // Load phrases from lesson
  const loadPhrasesFromLesson = async (lessonId) => {
    try {
      setIsLoading(true);
      const response = await curriculumService.getLesson(lessonId);
      const lesson = response.data.lesson;

      // Extract phrases from lesson
      const phraseItems = [];
      lesson.content.sections.forEach((section) => {
        if (section.type === "vocabulary" || section.type === "conversation") {
          if (section.type === "vocabulary") {
            section.items.forEach((item) => {
              phraseItems.push({
                korean: item.korean,
                english: item.english,
                romanization: item.romanization,
              });
            });
          } else if (section.examples) {
            section.examples.forEach((example) => {
              if (example.korean && example.english) {
                phraseItems.push({
                  korean: example.korean,
                  english: example.english,
                  romanization: example.romanization || "",
                });
              }
            });
          }
        }
      });

      if (phraseItems.length > 0) {
        initializeGame(phraseItems);
      } else {
        // Use default phrases if no phrases found
        initializeGame([
          {
            korean: "안녕하세요",
            english: "Hello",
            romanization: "Annyeonghaseyo",
          },
          {
            korean: "감사합니다",
            english: "Thank you",
            romanization: "Gamsahamnida",
          },
        ]);
      }
    } catch (error) {
      console.error("Error loading lesson phrases:", error);
      // Use default phrases on error
      initializeGame([
        {
          korean: "안녕하세요",
          english: "Hello",
          romanization: "Annyeonghaseyo",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  // Initialize game with phrases
  const initializeGame = (phraseList) => {
    // Shuffle phrases and create game state
    const shuffledPhrases = [...phraseList].sort(() => Math.random() - 0.5);
    setGamePhrases(shuffledPhrases.slice(0, 5)); // Limit to 5 phrases for game
    setIsLoading(false);
  };

  // Start recording
  const startRecording = async () => {
    try {
      if (!permissionsGranted) {
        console.error("❌ Permissions not granted for recording");
        alert("Please grant microphone permissions to record pronunciation.");
        return;
      }

      console.log("🎤 Starting recording...");

      // Prepare and start recording using expo-audio
      await audioRecorder.prepareToRecordAsync();
      audioRecorder.record();

      setIsRecording(true);

      console.log("✅ Recording started successfully");
    } catch (error) {
      console.error("❌ Error starting recording:", error);
      
      // Provide specific error messages based on the error type
      if (error.message.includes("permissions")) {
        alert("Microphone permission is required. Please enable it in your device settings.");
      } else if (error.message.includes("busy")) {
        alert("Microphone is busy. Please close other apps using the microphone and try again.");
      } else {
        alert("Failed to start recording. Please check microphone permissions and try again.");
      }
    }
  };

  // Stop recording
  const stopRecording = async () => {
    try {
      if (!isRecording) {
        console.warn("⚠️ No recording to stop");
        return;
      }

      console.log("🛑 Stopping recording...");

      // Stop recording using expo-audio
      await audioRecorder.stop();

      // Get recording URI from audioRecorder
      const uri = audioRecorder.uri;
      console.log("📁 Recording URI:", uri);

      setRecordingUri(uri);
      setIsRecording(false);
      console.log("✅ Recording stopped, URI:", uri);

      // Analyze pronunciation
      if (uri) {
        await analyzePronunciation(uri);
      } else {
        console.error("❌ No recording URI available");
        alert("Recording failed. Please try again.");
      }
    } catch (error) {
      console.error("❌ Error stopping recording:", error);
      setIsRecording(false);
      alert("Failed to stop recording. Please try again.");
    }
  };

  // Analyze pronunciation
  const analyzePronunciation = async (uri) => {
    try {
      setIsAnalyzing(true);

      // Create form data for audio file
      const formData = new FormData();
      formData.append("audio", {
        uri,
        type: "audio/m4a",
        name: "recording.m4a",
      });
      formData.append("targetText", gamePhrases[currentPhraseIndex].korean);
      formData.append("userLevel", user?.preferences?.languageLevel || "beginner");

      // Send to server for analysis
      const response = await apiClient.post(
        ENDPOINTS.TUTOR.ANALYZE_PRONUNCIATION,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      // Get analysis results
      const analysisData = response.data.data;
      const accuracy = analysisData.accuracy;
      const feedbackText = analysisData.accentFeedback;

      // Check if no speech was detected (accuracy is 0 or very low)
      if (
        accuracy === 0 ||
        !analysisData.transcribedText ||
        analysisData.transcribedText.trim() === ""
      ) {
        // No speech detected - provide specific feedback
        setFeedback({
          accuracy: 0,
          text: "No speech detected. Please try recording again and speak clearly into the microphone.",
          transcribedText: "",
          improvementTips: [
            "Make sure your microphone is working",
            "Speak clearly and loudly enough",
            "Try recording in a quiet environment",
          ],
          strengths: [],
        });

        // Don't add any score for empty recordings
        setAccuracyScores((prev) => [...prev, 0]);
        return;
      }

      // Update score based on accuracy
      const phraseScore = Math.round(accuracy);
      setScore((prevScore) => prevScore + phraseScore);

      // Save accuracy score for this phrase
      setAccuracyScores((prev) => [...prev, phraseScore]);

      // Set feedback
      setFeedback({
        accuracy: phraseScore,
        text: feedbackText,
        transcribedText: analysisData.transcribedText,
        improvementTips: analysisData.improvementTips || [],
        strengths: analysisData.strengths || [],
      });

      // Clean up recording file
      if (Platform.OS !== "web") {
        try {
          await FileSystem.deleteAsync(uri);
        } catch (error) {
          console.error("Error deleting recording file:", error);
        }
      }
    } catch (error) {
      console.error("❌ Error analyzing pronunciation:", error);

      // Check if it's a 404 or server error - likely means no speech detected
      if (
        error.response &&
        (error.response.status === 404 || error.response.status === 400)
      ) {
        setFeedback({
          accuracy: 0,
          text: "Could not analyze the recording. Please try again and speak clearly.",
          transcribedText: "",
          improvementTips: [
            "Make sure you speak into the microphone",
            "Try recording in a quieter environment",
            "Speak the phrase clearly and at normal volume",
          ],
          strengths: [],
        });

        // Don't add any score for failed recordings
        setAccuracyScores((prev) => [...prev, 0]);
      } else {
        // Other errors - provide generic feedback but still no score
        setFeedback({
          accuracy: 0,
          text: "Unable to analyze pronunciation at this time. Please try again.",
          transcribedText: "",
          improvementTips: [
            "Check your internet connection",
            "Try recording again",
            "Make sure your microphone is working",
          ],
          strengths: [],
        });

        setAccuracyScores((prev) => [...prev, 0]);
      }
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Play reference audio using TTS service (same as lessons)
  const playReferenceAudio = async () => {
    try {
      // Get current phrase
      const phrase = gamePhrases[currentPhraseIndex].korean;

      // Use the same TTS service that works in lessons
      await ttsService.speak(phrase, {
        language: "ko-KR",
        rate: 0.8, // Slower rate for learning
        pitch: 1.0,
      });
    } catch (error) {
      console.error("Error playing reference audio:", error);
    }
  };

  // Move to next phrase
  const moveToNextPhrase = () => {
    // Animate transition to next phrase
    Animated.sequence([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: -width,
        duration: 0,
        useNativeDriver: true,
      }),
    ]).start(() => {
      // Reset feedback
      setFeedback(null);
      setRecordingUri(null);

      // Move to next phrase or end game
      if (currentPhraseIndex < gamePhrases.length - 1) {
        setCurrentPhraseIndex((prevIndex) => prevIndex + 1);

        // Reset animations for next phrase
        slideAnim.setValue(width);

        Animated.sequence([
          Animated.timing(slideAnim, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
          }),
        ]).start();
      } else {
        // Game completed
        completeGame();
      }
    });
  };



  // Complete game and show results
  const completeGame = () => {
    const endTimeValue = Date.now();
    setEndTime(endTimeValue);

    const totalTime = (endTimeValue - startTime) / 1000; // in seconds

    // Calculate average accuracy with safety checks
    const validScores = accuracyScores.filter(
      (score) => !isNaN(score) && score !== null && score !== undefined
    );
    const totalAccuracy = validScores.reduce((sum, score) => sum + score, 0);
    const averageAccuracy =
      validScores.length > 0
        ? Math.round(totalAccuracy / validScores.length)
        : 0;

    // Calculate time bonus (faster = more points)
    const timeBonus = Math.max(0, 500 - Math.floor(totalTime) * 2);

    // Calculate final score with safety check
    const finalScore = (score || 0) + timeBonus;

    // Prepare game results with safety checks
    const results = {
      score: finalScore,
      accuracy: averageAccuracy,
      correctAnswers: validScores.filter((score) => score >= 70).length,
      totalQuestions: gamePhrases.length || 0,
      timeSpent: totalTime,
      rewards: [],
    };

    // Add rewards based on performance
    if (averageAccuracy >= 90) {
      results.rewards.push({
        type: "Pronunciation Master",
        points: 200,
        icon: "mic",
      });
    }

    if (totalTime < 120) {
      results.rewards.push({
        type: "Quick Speaker",
        points: 100,
        icon: "timer",
      });
    }

    // Save game results
    if (lessonId) {
      saveGameResults(lessonId, results);
    }

    setGameResults(results);
    setGameCompleted(true);

    // Trigger confetti for good performance
    setTimeout(() => {
      if (confettiRef.current && averageAccuracy >= 70) {
        confettiRef.current.start();
      }
    }, 500);

    // Check for achievements
    if (checkAchievements) {
      checkAchievements();
    }
  };

  // Save game results to backend
  const saveGameResults = async (lessonId, results) => {
    try {
      // Update lesson progress
      await curriculumService.updateLessonProgress(
        lessonId,
        results.accuracy >= 70, // Mark as completed if accuracy is at least 70%
        results.score,
        results.score, // XP earned equals score
        "game-pronunciation-challenge"
      );

      // Save game-specific results
      await gameService.saveGameResults(
        "pronunciation-challenge",
        lessonId,
        results
      );
    } catch (error) {
      console.error("Error saving game results:", error);
    }
  };

  // Handle continue button in results screen
  const handleContinue = () => {
    if (onComplete) {
      onComplete(gameResults);
    } else {
      // Navigate back to lesson or games screen
      router.back();
    }
  };

  // Handle try again button in results screen
  const handleTryAgain = () => {
    console.log("🔄 Restarting pronunciation challenge game...");

    // Reset all game state
    setGameCompleted(false);
    setGameResults(null);
    setCurrentPhraseIndex(0);
    setScore(0);
    setAccuracyScores([]);
    setFeedback(null);
    setRecordingUri(null);
    setIsRecording(false);
    setIsAnalyzing(false);
    setStartTime(Date.now());

    // Reset animations
    fadeAnim.setValue(1);
    slideAnim.setValue(0);
    progressAnim.setValue(0);

    console.log("✅ Game restarted successfully");
  };

  // Handle close button
  const handleClose = () => {
    if (onClose) {
      onClose();
    } else {
      router.back();
    }
  };

  // Render game results screen
  if (gameCompleted && gameResults) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: theme.colors.brandWhite,
        }}
      >
        {/* Confetti */}
        {gameResults && gameResults.accuracy >= 70 && (
          <ConfettiCannon
            ref={confettiRef}
            count={150}
            origin={{ x: width / 2, y: 0 }}
            autoStart={false}
            fadeOut={true}
            explosionSpeed={350}
            fallSpeed={2000}
            colors={[
              theme.colors.brandGreen,
              "#FFD700",
              "#FF6B35",
              "#9B59B6",
              "#3498DB",
            ]}
          />
        )}

        {/* Results Header */}
        <View
          style={{
            paddingHorizontal: theme.spacing.md,
            paddingVertical: theme.spacing.sm,
            backgroundColor: theme.colors.brandWhite,
          }}
        >
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Text
              style={{
                fontSize: 18,
                color: theme.colors.brandNavy,
                fontFamily: theme.typography.fontFamily.bold,
              }}
            >
              Pronunciation Challenge
            </Text>
            <TouchableOpacity
              onPress={handleClose}
              style={{
                width: 32,
                height: 32,
                borderRadius: 16,
                backgroundColor: theme.colors.neutral[100],
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Ionicons
                name="close"
                size={18}
                color={theme.colors.neutral[600]}
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* Results Content */}
        <View
          style={{
            flex: 1,
            paddingHorizontal: theme.spacing.md,
            paddingTop: theme.spacing.lg,
          }}
        >
          {/* Celebration Card */}
          <View
            style={{
              alignItems: "center",
              padding: theme.spacing.xl,
              marginBottom: theme.spacing.lg,
              backgroundColor:
                gameResults && gameResults.accuracy >= 70
                  ? theme.colors.brandGreen + "10"
                  : theme.colors.brandWhite,
              borderRadius: 20,
              borderWidth: gameResults && gameResults.accuracy >= 70 ? 2 : 1,
              borderColor:
                gameResults && gameResults.accuracy >= 70
                  ? theme.colors.brandGreen
                  : theme.colors.neutral[200],
            }}
          >
            <Text style={{ fontSize: 64, marginBottom: 16 }}>
              {gameResults && gameResults.accuracy >= 70 ? "🎤" : "🗣️"}
            </Text>
            <Heading
              level="h2"
              style={{
                textAlign: "center",
                marginBottom: 8,
                color: theme.colors.brandNavy,
                fontFamily: theme.typography.fontFamily.bold,
                fontSize: 24,
              }}
            >
              {gameResults && gameResults.accuracy >= 70
                ? "Great Speaking!"
                : "Keep Practicing!"}
            </Heading>
            <Text
              style={{
                textAlign: "center",
                color: theme.colors.neutral[600],
                fontFamily: theme.typography.fontFamily.medium,
                fontSize: 16,
              }}
            >
              {gameResults && gameResults.accuracy >= 70
                ? "Your pronunciation is improving!"
                : "Practice makes perfect in pronunciation!"}
            </Text>
          </View>

          {/* Stats Cards */}
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-around",
              marginBottom: theme.spacing.lg,
            }}
          >
            <View
              style={{
                alignItems: "center",
                backgroundColor: theme.colors.brandWhite,
                padding: theme.spacing.md,
                borderRadius: 16,
                borderWidth: 1,
                borderColor: theme.colors.neutral[200],
                minWidth: 100,
              }}
            >
              <Text
                style={{
                  fontSize: 32,
                  color: theme.colors.brandGreen,
                  fontFamily: theme.typography.fontFamily.bold,
                  marginBottom: 4,
                }}
              >
                {gameResults ? gameResults.score : 0}
              </Text>
              <Text
                style={{
                  fontSize: 14,
                  color: theme.colors.neutral[600],
                  fontFamily: theme.typography.fontFamily.medium,
                }}
              >
                Score
              </Text>
            </View>

            <View
              style={{
                alignItems: "center",
                backgroundColor: theme.colors.brandWhite,
                padding: theme.spacing.md,
                borderRadius: 16,
                borderWidth: 1,
                borderColor: theme.colors.neutral[200],
                minWidth: 100,
              }}
            >
              <Text
                style={{
                  fontSize: 32,
                  color:
                    gameResults && gameResults.accuracy >= 70
                      ? theme.colors.brandGreen
                      : theme.colors.neutral[500],
                  fontFamily: theme.typography.fontFamily.bold,
                  marginBottom: 4,
                }}
              >
                {gameResults ? gameResults.accuracy : 0}%
              </Text>
              <Text
                style={{
                  fontSize: 14,
                  color: theme.colors.neutral[600],
                  fontFamily: theme.typography.fontFamily.medium,
                }}
              >
                Accuracy
              </Text>
            </View>

            <View
              style={{
                alignItems: "center",
                backgroundColor: theme.colors.brandWhite,
                padding: theme.spacing.md,
                borderRadius: 16,
                borderWidth: 1,
                borderColor: theme.colors.neutral[200],
                minWidth: 100,
              }}
            >
              <Text
                style={{
                  fontSize: 32,
                  color: theme.colors.brandGreen,
                  fontFamily: theme.typography.fontFamily.bold,
                  marginBottom: 4,
                }}
              >
                {gameResults ? gameResults.correctAnswers : 0}
              </Text>
              <Text
                style={{
                  fontSize: 14,
                  color: theme.colors.neutral[600],
                  fontFamily: theme.typography.fontFamily.medium,
                }}
              >
                Correct
              </Text>
            </View>
          </View>

          {/* Rewards Section */}
          {gameResults.rewards && gameResults.rewards.length > 0 && (
            <View style={{ marginBottom: theme.spacing.lg }}>
              <Text
                style={{
                  fontSize: 20,
                  color: theme.colors.brandNavy,
                  fontFamily: theme.typography.fontFamily.bold,
                  marginBottom: theme.spacing.md,
                }}
              >
                Rewards Earned
              </Text>

              {gameResults.rewards.map((reward, index) => (
                <View
                  key={index}
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    backgroundColor: theme.colors.brandGreen + "10",
                    borderRadius: 12,
                    padding: theme.spacing.md,
                    marginBottom: theme.spacing.sm,
                    borderWidth: 1,
                    borderColor: theme.colors.brandGreen + "30",
                  }}
                >
                  <View
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: 20,
                      backgroundColor: theme.colors.brandGreen + "20",
                      justifyContent: "center",
                      alignItems: "center",
                      marginRight: theme.spacing.md,
                    }}
                  >
                    <Ionicons
                      name={reward.icon}
                      size={24}
                      color={theme.colors.brandGreen}
                    />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text
                      style={{
                        fontSize: 16,
                        color: theme.colors.brandNavy,
                        fontFamily: theme.typography.fontFamily.semibold,
                        marginBottom: 2,
                      }}
                    >
                      {reward.type}
                    </Text>
                    <Text
                      style={{
                        fontSize: 14,
                        color: theme.colors.brandGreen,
                        fontFamily: theme.typography.fontFamily.medium,
                      }}
                    >
                      +{reward.points} XP
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          )}

          {/* Action Buttons */}
          <View style={styles.resultsActionButtons}>
            {gameResults.accuracy < 80 && (
              <ModernButton
                text="Try Again"
                variant="outline"
                color="secondary"
                onPress={handleTryAgain}
                style={styles.resultsTryAgainButton}
              />
            )}

            <ModernButton
              text="Continue"
              onPress={handleContinue}
              style={[
                styles.resultsContinueButton,
                gameResults.accuracy >= 80 && { flex: 1 } // Full width when no try again button
              ]}
            />
          </View>
        </View>
      </View>
    );
  }

  // Render loading state
  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={styles.loadingText}>Loading game...</Text>
      </View>
    );
  }

  // Get current phrase
  const currentPhrase = gamePhrases[currentPhraseIndex];

  // Render game screen
  return (
    <View style={styles.container}>
      {/* Modern Progress Section */}
      <View
        style={{
          paddingHorizontal: theme.spacing.md,
          paddingVertical: theme.spacing.sm,
          backgroundColor: theme.colors.brandWhite,
        }}
      >
        {/* Game Title */}
        <Row justify="space-between" align="center" style={{ marginBottom: 8 }}>
          <Text
            style={{
              fontSize: 18,
              color: theme.colors.brandNavy,
              fontFamily: theme.typography.fontFamily.bold,
            }}
          >
            Pronunciation Challenge
          </Text>
          <TouchableOpacity
            onPress={handleClose}
            style={{
              width: 32,
              height: 32,
              borderRadius: 16,
              backgroundColor: theme.colors.neutral[100],
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Ionicons
              name="close"
              size={18}
              color={theme.colors.neutral[600]}
            />
          </TouchableOpacity>
        </Row>

        {/* Progress Info */}
        <Row
          justify="space-between"
          align="center"
          style={{ marginBottom: 12 }}
        >
          <Text
            style={{
              fontSize: 14,
              color: theme.colors.neutral[600],
              fontFamily: theme.typography.fontFamily.medium,
            }}
          >
            Phrase {currentPhraseIndex + 1} of {gamePhrases.length}
          </Text>
          <Text
            style={{
              fontSize: 14,
              color: theme.colors.brandGreen,
              fontFamily: theme.typography.fontFamily.semibold,
            }}
          >
            Score: {score}
          </Text>
        </Row>

        {/* Progress Bar */}
        <View
          style={{
            height: 8,
            backgroundColor: theme.colors.neutral[200],
            borderRadius: 4,
            overflow: "hidden",
          }}
        >
          <View
            style={{
              height: "100%",
              width: `${
                ((currentPhraseIndex + 1) / gamePhrases.length) * 100
              }%`,
              backgroundColor: theme.colors.brandGreen,
              borderRadius: 4,
            }}
          />
        </View>
      </View>

      <Animated.View
        style={[
          styles.gameContainer,
          {
            opacity: fadeAnim,
            transform: [{ translateX: slideAnim }],
          },
        ]}
      >
        <Text style={styles.instructionText}>
          Record yourself saying the following phrase:
        </Text>

        <View style={styles.phraseContainer}>
          <Text style={styles.koreanPhrase}>{currentPhrase.korean}</Text>
          <Text style={styles.englishPhrase}>"{currentPhrase.english}"</Text>

          {currentPhrase.romanization && (
            <Text style={styles.romanizationText}>
              {currentPhrase.romanization}
            </Text>
          )}

          <TouchableOpacity
            style={styles.listenButton}
            onPress={playReferenceAudio}
          >
            <Ionicons name="volume-high" size={20} color="#fff" />
            <Text style={styles.listenButtonText}>Listen</Text>
          </TouchableOpacity>
        </View>

        {feedback ? (
          <View style={styles.feedbackContainer}>
            <View
              style={[
                styles.accuracyIndicator,
                feedback.accuracy >= 90
                  ? styles.excellentAccuracy
                  : feedback.accuracy >= 70
                  ? styles.goodAccuracy
                  : styles.poorAccuracy,
              ]}
            >
              <Text style={styles.accuracyText}>{feedback.accuracy}%</Text>
            </View>

            <Text style={styles.feedbackText}>{feedback.text}</Text>

            {/* Action Buttons */}
            <View style={styles.actionButtonsContainer}>
              <ModernButton
                text="Try Again"
                variant="outline"
                color="secondary"
                onPress={() => {
                  // Reset feedback and allow user to record again
                  setFeedback(null);
                  setRecordingUri(null);
                }}
                style={styles.tryAgainButton}
              />

              <ModernButton
                text="Continue"
                onPress={moveToNextPhrase}
                style={styles.nextButton}
              />
            </View>
          </View>
        ) : (
          <View style={styles.recordingContainer}>
            <TouchableOpacity
              style={[
                styles.recordButton,
                isRecording && styles.recordingActive,
                isAnalyzing && styles.recordingDisabled,
              ]}
              onPress={isRecording ? stopRecording : startRecording}
              disabled={isAnalyzing}
            >
              {isAnalyzing ? (
                <ActivityIndicator size="large" color="#fff" />
              ) : (
                <Ionicons
                  name={isRecording ? "stop" : "mic"}
                  size={32}
                  color="#fff"
                />
              )}
            </TouchableOpacity>

            <Text style={styles.recordingText}>
              {isAnalyzing
                ? "Analyzing your pronunciation..."
                : isRecording
                ? "Recording... Tap to stop"
                : "Tap to start recording"}
            </Text>
          </View>
        )}
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#EFEFEF",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
  },
  closeButton: {
    padding: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
  },
  progressContainer: {
    padding: 16,
  },
  progressText: {
    fontSize: 14,
    marginBottom: 8,
  },
  progressBarContainer: {
    height: 8,
    backgroundColor: "#F0F0F0",
    borderRadius: 4,
    overflow: "hidden",
  },
  progressBar: {
    height: "100%",
    borderRadius: 4,
  },
  gameContainer: {
    flex: 1,
    padding: 16,
  },
  instructionText: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 24,
  },
  phraseContainer: {
    alignItems: "center",
    marginBottom: 32,
    padding: 16,
    backgroundColor: "#F9F9F9",
    borderRadius: 12,
  },
  koreanPhrase: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 8,
  },
  englishPhrase: {
    fontSize: 16,
    color: "#666",
    marginBottom: 8,
  },
  romanizationText: {
    fontSize: 14,
    color: "#999",
    marginBottom: 16,
  },
  listenButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#6FC953",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
  },
  listenButtonText: {
    color: "#fff",
    marginLeft: 8,
  },
  recordingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  recordButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#6FC953",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  recordingActive: {
    backgroundColor: "#FF5757",
  },
  recordingDisabled: {
    backgroundColor: "#999",
  },
  recordingText: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
  },
  feedbackContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  accuracyIndicator: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  excellentAccuracy: {
    backgroundColor: "rgba(111, 201, 83, 0.2)",
    borderColor: "#6FC953",
    borderWidth: 2,
  },
  goodAccuracy: {
    backgroundColor: "rgba(255, 193, 7, 0.2)",
    borderColor: "#FFC107",
    borderWidth: 2,
  },
  poorAccuracy: {
    backgroundColor: "rgba(255, 87, 87, 0.2)",
    borderColor: "#FF5757",
    borderWidth: 2,
  },
  accuracyText: {
    fontSize: 24,
    fontWeight: "bold",
  },
  feedbackText: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 32,
    color: "#666",
  },
  actionButtonsContainer: {
    flexDirection: "row",
    gap: 12,
    marginTop: 8,
  },
  tryAgainButton: {
    flex: 1,
  },
  nextButton: {
    flex: 1,
    backgroundColor: "#6FC953",
  },
  resultsContainer: {
    flex: 1,
    padding: 24,
  },
  resultsTitle: {
    fontSize: 28,
    textAlign: "center",
    marginBottom: 16,
  },
  resultsSubtitle: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 32,
    color: "#666",
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 32,
  },
  statItem: {
    alignItems: "center",
  },
  statValue: {
    fontSize: 32,
    color: "#6FC953",
  },
  statLabel: {
    fontSize: 14,
    color: "#666",
  },
  rewardsContainer: {
    marginBottom: 32,
  },
  rewardsTitle: {
    fontSize: 20,
    marginBottom: 16,
  },
  rewardItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F9F9F9",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  rewardIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(111, 201, 83, 0.1)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  rewardInfo: {
    flex: 1,
  },
  rewardTitle: {
    fontSize: 16,
    marginBottom: 4,
  },
  rewardPoints: {
    fontSize: 14,
    color: "#666",
  },
  continueButton: {
    backgroundColor: "#6FC953",
  },
  // Results page action buttons
  resultsActionButtons: {
    flexDirection: "row",
    gap: 12,
    paddingBottom: 32,
  },
  resultsTryAgainButton: {
    flex: 1,
  },
  resultsContinueButton: {
    flex: 1,
    backgroundColor: "#6FC953",
    borderRadius: 12,
  },
});

export default PronunciationChallengeGame;
