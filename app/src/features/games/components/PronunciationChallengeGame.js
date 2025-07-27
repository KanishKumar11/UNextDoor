import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Animated,
  Dimensions,
  ActivityIndicator,
  Platform,
  Modal,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Audio } from "expo-av";
import { router } from "expo-router";
// import ConfettiCannon from "react-native-confetti-cannon"; // Temporarily disabled
import { BRAND_COLORS } from "../../../shared/constants/colors";
import { Row } from "../../../shared/components/layout";
import ModernButton from "../../../shared/components/ModernButton";
import { useAchievements } from "../../achievements/context/AchievementContext";
import GameResultsPage from "./GameResultsPage";
import ttsService from "../../../shared/services/ttsService";
import { pronunciationService } from "../../pronunciation/services/pronunciationService";

const { width } = Dimensions.get("window");

// Helper function for cross-platform font families
const getFontFamily = (weight = 'regular') => {
  if (Platform.OS === 'web') {
    return 'Montserrat, sans-serif';
  }

  const fontMap = {
    light: 'Montserrat-Light',
    regular: 'Montserrat-Regular',
    medium: 'Montserrat-Medium',
    semibold: 'Montserrat-SemiBold',
    bold: 'Montserrat-Bold',
    extrabold: 'Montserrat-ExtraBold',
  };

  return fontMap[weight] || fontMap.regular;
};

/**
 * Pronunciation Challenge Game Component
 * 
 * Features:
 * - Audio recording and playback
 * - Real-time pronunciation analysis
 * - Progress tracking with animated progress bar
 * - Achievement system
 * - Standardized GameResultsPage integration
 * - Compact listen button design for small devices
 */
const PronunciationChallengeGame = ({
  phrases = [],
  lessonId = null,
  onComplete = () => { },
  onClose = () => { },
}) => {
  // Game state
  const [gamePhrases, setGamePhrases] = useState([]);
  const [currentPhraseIndex, setCurrentPhraseIndex] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingUri, setRecordingUri] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [score, setScore] = useState(0);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [accuracyScores, setAccuracyScores] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Game completion state
  const [gameCompleted, setGameCompleted] = useState(false);
  const [gameResults, setGameResults] = useState(null);
  const [startTime, setStartTime] = useState(null);
  const [endTime, setEndTime] = useState(null);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [permissionsGranted, setPermissionsGranted] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [analysisDetails, setAnalysisDetails] = useState(null);
  const [errorModal, setErrorModal] = useState({ visible: false, title: '', message: '', onRetry: null });

  // Refs
  const confettiRef = useRef(null);
  const recordingRef = useRef(null);
  const soundRef = useRef(null);

  // Animation values
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const slideAnim = useRef(new Animated.Value(0)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;

  // Achievement context
  const { checkAchievements } = useAchievements();

  // Initialize game
  useEffect(() => {
    initializeGame();
    requestAudioPermissions();
    initializeTTSService();
  }, []);

  const initializeTTSService = async () => {
    try {
      console.log('🔊 Initializing TTS service...');
      console.log('🔊 TTS service object:', ttsService);
      console.log('🔊 TTS service methods:', Object.getOwnPropertyNames(Object.getPrototypeOf(ttsService)));

      if (ttsService && typeof ttsService.initialize === 'function') {
        await ttsService.initialize();
        console.log('✅ TTS service initialized successfully');
      } else {
        console.warn('⚠️ TTS service initialize method not available');
      }
    } catch (error) {
      console.error('❌ Failed to initialize TTS service:', error);
      console.error('❌ TTS service state:', {
        serviceExists: !!ttsService,
        initializeMethod: typeof ttsService?.initialize,
        speakMethod: typeof ttsService?.speak,
      });
    }
  };

  const requestAudioPermissions = async () => {
    try {
      const { status } = await Audio.requestPermissionsAsync();
      setPermissionsGranted(status === 'granted');

      if (status !== 'granted') {
        Alert.alert(
          'Permission Required',
          'This game requires microphone access to record your pronunciation.',
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      console.error('Error requesting audio permissions:', error);
      setPermissionsGranted(false);
    }
  };

  const initializeGame = () => {
    console.log("🎮 Initializing Pronunciation Challenge Game...");

    // Use provided phrases or load default ones
    const phrasesToUse = phrases.length > 0 ? phrases : getDefaultPhrases();

    setGamePhrases(phrasesToUse);
    setCurrentPhraseIndex(0);
    setScore(0);
    setCorrectAnswers(0);
    setAccuracyScores([]);
    setFeedback(null);
    setRecordingUri(null);
    setIsRecording(false);
    setIsAnalyzing(false);
    setIsTransitioning(false);
    setIsPlayingAudio(false);
    setAnalysisDetails(null);
    setStartTime(Date.now());
    setEndTime(null);

    // Reset animations
    fadeAnim.setValue(1);
    slideAnim.setValue(0);
    progressAnim.setValue(1); // Start with first phrase progress

    setIsLoading(false);
    console.log("🎮 Game initialized with", phrasesToUse.length, "phrases");
  };

  const getDefaultPhrases = () => {
    return [
      {
        korean: "안녕하세요",
        english: "Hello",
        romanization: "annyeonghaseyo"
      },
      {
        korean: "감사합니다",
        english: "Thank you",
        romanization: "gamsahamnida"
      },
      {
        korean: "죄송합니다",
        english: "I'm sorry",
        romanization: "joesonghamnida"
      },
      {
        korean: "괜찮아요",
        english: "It's okay",
        romanization: "gwaenchanayo"
      },
      {
        korean: "안녕히 가세요",
        english: "Goodbye",
        romanization: "annyeonghi gaseyo"
      }
    ];
  };

  const startRecording = async () => {
    if (!permissionsGranted) {
      Alert.alert('Permission Required', 'Microphone access is required to record.');
      return;
    }

    try {
      console.log('🎤 Starting recording...');

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );

      recordingRef.current = recording;
      setIsRecording(true);
      console.log('🎤 Recording started');
    } catch (error) {
      console.error('Failed to start recording:', error);
      Alert.alert('Error', 'Failed to start recording. Please try again.');
    }
  };

  const stopRecording = async () => {
    if (!recordingRef.current) return;

    try {
      console.log('🛑 Stopping recording...');
      setIsRecording(false);
      setIsAnalyzing(true);

      await recordingRef.current.stopAndUnloadAsync();
      const uri = recordingRef.current.getURI();
      recordingRef.current = null;

      setRecordingUri(uri);
      console.log('🛑 Recording stopped, URI:', uri);

      // Analyze the recording
      await analyzeRecording(uri);
    } catch (error) {
      console.error('Failed to stop recording:', error);
      setIsAnalyzing(false);
      Alert.alert('Error', 'Failed to process recording. Please try again.');
    }
  };

  const analyzeRecording = async (uri) => {
    try {
      console.log('🔍 Analyzing pronunciation with real AI service...');

      if (!uri) {
        throw new Error('No recording URI provided');
      }

      const currentPhrase = gamePhrases[currentPhraseIndex];
      if (!currentPhrase || !currentPhrase.korean) {
        throw new Error('No target phrase available for analysis');
      }

      console.log('🎯 Target phrase:', currentPhrase.korean);
      console.log('🎤 Recording URI:', uri);
      console.log('🔧 Pronunciation service available:', !!pronunciationService);
      console.log('🔧 analyzePronunciation method:', typeof pronunciationService?.analyzePronunciation);

      // Validate pronunciation service is available
      if (!pronunciationService || typeof pronunciationService.analyzePronunciation !== 'function') {
        throw new Error('Pronunciation service is not available or not properly initialized');
      }

      // Use real pronunciation analysis service
      const analysisResult = await pronunciationService.analyzePronunciation(
        uri,
        currentPhrase.korean,
        'beginner' // User level - could be made dynamic based on user profile
      );

      console.log('📊 Analysis result:', analysisResult);

      if (!analysisResult.success) {
        throw new Error(analysisResult.error || 'Analysis failed');
      }

      // Extract data from API response (data is nested inside 'data' property)
      const analysisData = analysisResult.data || analysisResult;
      console.log('📊 Extracted analysis data:', analysisData);

      // Extract accuracy and feedback from real analysis
      const accuracy = analysisData.accuracy || 0;
      const transcribedText = analysisData.transcribedText || '';

      // Generate user-friendly feedback based on real analysis results
      let feedbackText = '';

      if (accuracy >= 90) {
        feedbackText = analysisData.accentFeedback || "Excellent pronunciation! 🎉";
      } else if (accuracy >= 70) {
        feedbackText = analysisData.accentFeedback || "Good pronunciation! Keep it up!";
      } else if (accuracy >= 50) {
        feedbackText = analysisData.accentFeedback || "Not bad! Try focusing on clarity.";
      } else {
        feedbackText = analysisData.accentFeedback || "Keep practicing! You're making progress.";
      }

      // Skip transcription and tips to save space on smaller devices

      const newFeedback = {
        accuracy,
        text: feedbackText,
        phrase: currentPhrase.korean,
        transcribedText,
        improvementTips: analysisData.improvementTips || [],
        strengths: analysisData.strengths || [],
        difficultSounds: analysisData.difficultSounds || []
      };

      setFeedback(newFeedback);
      setAccuracyScores([...accuracyScores, accuracy]);
      setAnalysisDetails(analysisResult); // Store full analysis details

      // Update score based on real accuracy
      const points = Math.floor(accuracy / 10) * 10;
      setScore(prevScore => prevScore + points);

      // Count as correct if accuracy is 70% or higher
      if (accuracy >= 70) {
        setCorrectAnswers(prev => prev + 1);
      }

      setIsAnalyzing(false);
      console.log('✅ Real pronunciation analysis complete:', newFeedback);

    } catch (error) {
      console.error('❌ Error analyzing pronunciation:', error);
      setIsAnalyzing(false);

      // Show professional error modal
      const errorMessage = error.message || 'Failed to analyze pronunciation';
      const isNetworkError = errorMessage.includes('Network request failed') || errorMessage.includes('network');

      setErrorModal({
        visible: true,
        title: isNetworkError ? 'Connection Error' : 'Analysis Error',
        message: isNetworkError
          ? 'Unable to connect to our pronunciation analysis service. Please check your internet connection and try again.'
          : `${errorMessage}\n\nPlease try recording again with clear speech.`,
        onRetry: () => {
          setErrorModal({ visible: false, title: '', message: '', onRetry: null });
          // Allow user to record again by resetting feedback
          setFeedback(null);
          setRecordingUri(null);
        }
      });
    }
  };

  const playReferenceAudio = async () => {
    try {
      const currentPhrase = gamePhrases[currentPhraseIndex];
      if (!currentPhrase || !currentPhrase.korean) {
        console.warn('No Korean text available for audio playback');
        return;
      }

      // Prevent multiple simultaneous audio playback
      if (isPlayingAudio) {
        console.log('Audio already playing, ignoring request');
        return;
      }

      console.log('🔊 Playing reference audio for:', currentPhrase.korean);
      console.log('🔊 TTS Service available:', !!ttsService);
      console.log('🔊 TTS Service speak method:', typeof ttsService?.speak);

      setIsPlayingAudio(true);

      // Verify TTS service is available
      if (!ttsService) {
        throw new Error('TTS service is not available');
      }

      if (typeof ttsService.speak !== 'function') {
        throw new Error('TTS service speak method is not available');
      }

      // Use TTS service to speak the Korean phrase
      await ttsService.speak(currentPhrase.korean, {
        rate: 0.7, // Slower rate for learning pronunciation
        pitch: 1.0,
      });

      console.log('🔊 Audio playback completed successfully');
    } catch (error) {
      console.error('❌ Error playing reference audio:', error);
      console.error('❌ Error details:', {
        message: error.message,
        stack: error.stack,
        ttsServiceAvailable: !!ttsService,
        speakMethodType: typeof ttsService?.speak,
      });

      // Show professional error modal for audio issues
      setErrorModal({
        visible: true,
        title: 'Audio Not Available',
        message: `Unable to play pronunciation audio: ${error.message}\n\nPlease check your device settings.\n\nTo enable pronunciation audio:\n• On Android: Go to Settings > Accessibility > Text-to-speech\n• On iOS: Go to Settings > Accessibility > Spoken Content\n• Make sure Korean language is installed`,
        onRetry: () => {
          setErrorModal({ visible: false, title: '', message: '', onRetry: null });
        }
      });
    } finally {
      setIsPlayingAudio(false);
    }
  };

  const moveToNextPhrase = () => {
    if (currentPhraseIndex < gamePhrases.length - 1) {
      // Move to next phrase
      setCurrentPhraseIndex(prevIndex => {
        const newIndex = prevIndex + 1;

        // Animate progress bar
        Animated.timing(progressAnim, {
          toValue: newIndex + 1,
          duration: 300,
          useNativeDriver: false,
        }).start();

        return newIndex;
      });

      // Reset for next phrase
      setFeedback(null);
      setRecordingUri(null);
      setIsTransitioning(false);
      setIsPlayingAudio(false);
      setAnalysisDetails(null);

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
      // Complete the game
      completeGame();
    }
  };

  const completeGame = async () => {
    console.log("🏁 Completing Pronunciation Challenge Game...");

    const endTime = Date.now();
    const timeSpent = Math.round((endTime - startTime) / 1000);
    const totalQuestions = gamePhrases.length;
    const averageAccuracy = accuracyScores.length > 0
      ? Math.round(accuracyScores.reduce((sum, acc) => sum + acc, 0) / accuracyScores.length)
      : 0;

    const results = {
      score,
      correctAnswers,
      totalQuestions,
      accuracy: averageAccuracy,
      timeSpent,
      accuracyScores,
    };

    setGameResults(results);
    setEndTime(endTime);
    setGameCompleted(true);

    // Trigger confetti for good performance - temporarily disabled
    // if (averageAccuracy >= 70 && confettiRef.current) {
    //   setTimeout(() => {
    //     confettiRef.current.start();
    //   }, 500);
    // }

    // Check for achievements after game completion
    try {
      await checkAchievements();
      console.log('✅ Achievement check completed after pronunciation game');
    } catch (error) {
      console.error('❌ Error checking achievements:', error);
    }

    console.log("🏁 Game completed with results:", results);
  };

  const handleClose = () => {
    console.log("❌ Closing Pronunciation Challenge Game...");

    // Clean up audio resources
    if (recordingRef.current) {
      recordingRef.current.stopAndUnloadAsync();
    }
    if (soundRef.current) {
      soundRef.current.unloadAsync();
    }

    onClose();
    router.back();
  };

  // Render game results screen with standardized GameResultsPage
  if (gameCompleted && gameResults) {
    // Prepare data for the GameResultsPage component
    const resultsData = {
      score: gameResults.score,
      correctAnswers: gameResults.correctAnswers,
      totalQuestions: gameResults.totalQuestions,
      accuracy: gameResults.accuracy,
      timeSpent: gameResults.timeSpent || 120,
      xpEarned: Math.floor(gameResults.score * 0.15), // Calculate XP based on score
      incorrectAnswers: gameResults.totalQuestions - gameResults.correctAnswers,
    };

    console.log("🎮 PronunciationChallenge - Results data for GameResultsPage:", resultsData);
    console.log("🎮 PronunciationChallenge - Original gameResults:", gameResults);

    // Custom metrics specific to Pronunciation Challenge Game
    const customMetrics = {
      pronunciationAccuracy: `${gameResults.accuracy}%`,
      averageScore: `${Math.round(gameResults.score / gameResults.totalQuestions)}`,
      speakingConfidence: gameResults.accuracy >= 80 ? "High" : gameResults.accuracy >= 60 ? "Medium" : "Building",
    };

    // Mock achievements for demonstration (replace with real achievement system)
    const achievements = [];
    if (gameResults.accuracy === 100) {
      achievements.push({
        id: "perfect_pronunciation",
        name: "Perfect Speaker!",
        icon: "mic-outline",
        description: "Got 100% accuracy in pronunciation"
      });
    }
    if (gameResults.timeSpent < 90) {
      achievements.push({
        id: "speed_speaker",
        name: "Quick Speaker",
        icon: "flash-outline",
        description: "Completed in under 90 seconds"
      });
    }
    if (gameResults.correctAnswers >= 4) {
      achievements.push({
        id: "pronunciation_pro",
        name: "Pronunciation Pro",
        icon: "trophy-outline",
        description: "Excellent pronunciation skills"
      });
    }

    return (
      <GameResultsPage
        results={resultsData}
        gameType="pronunciation-challenge"
        onPlayAgain={() => {
          console.log("🔄 Retrying game...");
          // Reset all game state
          setGameCompleted(false);
          setGameResults(null);
          setCurrentPhraseIndex(0);
          setScore(0);
          setCorrectAnswers(0);
          setAccuracyScores([]);
          setFeedback(null);
          setRecordingUri(null);
          setIsRecording(false);
          setIsAnalyzing(false);
          setIsTransitioning(false);
          setStartTime(Date.now());
          setEndTime(null);

          // Reset animations
          fadeAnim.setValue(1);
          slideAnim.setValue(0);
          progressAnim.setValue(1);

          // Reinitialize the game with existing phrases
          if (gamePhrases.length > 0) {
            console.log("🎮 Reinitializing game with existing phrases");
            // Game will restart with current phrases
          } else {
            console.log("🎮 Loading new content for retry");
            // Reload content if no phrases available
            if (phrases.length > 0) {
              setGamePhrases(phrases);
            } else {
              // Use default phrases if no content available
              setGamePhrases(getDefaultPhrases());
            }
          }
        }}
        onContinue={() => {
          console.log("🏠 Continuing to next lesson or home...");
          router.back();
        }}
        customMetrics={customMetrics}
        achievements={achievements}
      // confettiRef={confettiRef} // Temporarily disabled
      />
    );
  }

  // Render loading state
  if (isLoading) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: BRAND_COLORS.CARD_BACKGROUND,
        }}
      >
        <ActivityIndicator size="large" color={BRAND_COLORS.EXPLORER_TEAL} />
        <Text
          style={{
            marginTop: 16,
            fontSize: 16,
            color: BRAND_COLORS.SHADOW_GREY,
            fontFamily: getFontFamily('medium'),
          }}
        >
          Loading game...
        </Text>
      </View>
    );
  }

  // Get current phrase
  const currentPhrase = gamePhrases[currentPhraseIndex];

  // Safety check - if no current phrase available, show loading
  if (!currentPhrase) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: BRAND_COLORS.CARD_BACKGROUND,
        }}
      >
        <ActivityIndicator size="large" color={BRAND_COLORS.EXPLORER_TEAL} />
        <Text
          style={{
            marginTop: 16,
            fontSize: 16,
            color: BRAND_COLORS.SHADOW_GREY,
            fontFamily: getFontFamily('medium'),
          }}
        >
          Loading phrase...
        </Text>
      </View>
    );
  }

  // Render game screen
  return (
    <View style={styles.container}>
      {/* Confetti for celebrations - temporarily disabled to fix startup issue */}
      {/* Modern Progress Section */}
      <View
        style={{
          paddingHorizontal: 16, // theme.spacing.md
          paddingVertical: 8,    // theme.spacing.sm
          backgroundColor: BRAND_COLORS.CARD_BACKGROUND,
        }}
      >
        {/* Game Title */}
        <Row justify="space-between" align="center" style={{ marginBottom: 8 }}>
          <Text
            style={{
              fontSize: 18,
              color: BRAND_COLORS.OCEAN_BLUE,
              fontFamily: getFontFamily('bold'),
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
              backgroundColor: BRAND_COLORS.SHADOW_GREY + "30",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Ionicons
              name="close"
              size={18}
              color={BRAND_COLORS.SHADOW_GREY}
            />
          </TouchableOpacity>
        </Row>

        {/* Progress Text */}
        <Text
          style={{
            fontSize: 14,
            color: BRAND_COLORS.SHADOW_GREY,
            fontFamily: getFontFamily('medium'),
            marginBottom: 8,
          }}
        >
          Phrase {currentPhraseIndex + 1} of {gamePhrases.length}
        </Text>

        {/* Progress Bar */}
        <View
          style={{
            height: 8,
            backgroundColor: BRAND_COLORS.SHADOW_GREY + "30",
            borderRadius: 4,
            overflow: "hidden",
          }}
        >
          <Animated.View
            style={{
              height: "100%",
              backgroundColor: BRAND_COLORS.EXPLORER_TEAL,
              borderRadius: 4,
              width: progressAnim.interpolate({
                inputRange: [0, gamePhrases.length],
                outputRange: ["0%", "100%"],
                extrapolate: "clamp",
              }),
            }}
          />
        </View>
      </View>

      {/* Game Content */}
      <View style={styles.gameContainer}>
        <Text style={styles.instructionText}>
          Record yourself saying the following phrase:
        </Text>

        <View style={styles.phraseContainer}>
          {/* Korean phrase with inline audio button */}
          <View style={styles.koreanPhraseRow}>
            <Text style={styles.koreanPhrase}>{currentPhrase.korean}</Text>
            <TouchableOpacity
              style={[
                styles.compactListenButton,
                isPlayingAudio && styles.compactListenButtonActive
              ]}
              onPress={playReferenceAudio}
              disabled={isPlayingAudio}
            >
              {isPlayingAudio ? (
                <ActivityIndicator size="small" color={BRAND_COLORS.EXPLORER_TEAL} />
              ) : (
                <Ionicons name="volume-high" size={18} color={BRAND_COLORS.EXPLORER_TEAL} />
              )}
            </TouchableOpacity>
          </View>

          <Text style={styles.englishPhrase}>"{currentPhrase.english}"</Text>

          {currentPhrase.romanization && (
            <Text style={styles.romanizationText}>
              {currentPhrase.romanization}
            </Text>
          )}
        </View>

        {/* Recording Section */}
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
      </View>

      {/* Professional Error Modal */}
      <Modal
        visible={errorModal.visible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setErrorModal({ visible: false, title: '', message: '', onRetry: null })}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <ModernCard style={styles.errorCard}>
              {/* Error Icon */}
              <View style={styles.errorIconContainer}>
                <Ionicons
                  name="alert-circle"
                  size={48}
                  color={BRAND_COLORS.SHADOW_GREY}
                />
              </View>

              {/* Error Title */}
              <Text style={styles.errorTitle}>
                {errorModal.title}
              </Text>

              {/* Error Message */}
              <Text style={styles.errorMessage}>
                {errorModal.message}
              </Text>

              {/* Action Buttons */}
              <View style={styles.errorButtonContainer}>
                <ModernButton
                  text="Cancel"
                  variant="outline"
                  color="secondary"
                  onPress={() => setErrorModal({ visible: false, title: '', message: '', onRetry: null })}
                  style={styles.errorCancelButton}
                />

                <ModernButton
                  text="Try Again"
                  onPress={errorModal.onRetry}
                  style={styles.errorRetryButton}
                />
              </View>
            </ModernCard>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BRAND_COLORS.CARD_BACKGROUND,
  },
  gameContainer: {
    // flex: 1,
    padding: 16,
  },
  instructionText: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 24,
    color: BRAND_COLORS.SHADOW_GREY,
    fontFamily: getFontFamily('medium'),
  },
  phraseContainer: {
    alignItems: "center",
    // marginBottom: 32,
    padding: 16,
    borderRadius: 12,
    elevation: 0,
  },
  koreanPhraseRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
    gap: 12,
  },
  koreanPhrase: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    color: BRAND_COLORS.OCEAN_BLUE,
    fontFamily: getFontFamily('bold'),
  },
  compactListenButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: BRAND_COLORS.EXPLORER_TEAL + "20",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: BRAND_COLORS.EXPLORER_TEAL + "40",
  },
  compactListenButtonActive: {
    backgroundColor: BRAND_COLORS.EXPLORER_TEAL + "40",
    borderColor: BRAND_COLORS.EXPLORER_TEAL + "60",
  },
  englishPhrase: {
    fontSize: 16,
    color: BRAND_COLORS.SHADOW_GREY,
    marginBottom: 8,
    textAlign: "center",
    fontFamily: getFontFamily('medium'),
  },
  romanizationText: {
    fontSize: 14,
    color: BRAND_COLORS.SHADOW_GREY + "80",
    marginBottom: 16,
    textAlign: "center",
    fontFamily: getFontFamily('regular'),
  },
  recordingContainer: {
    marginTop: 60,
    justifyContent: "center",
    alignItems: "center",
  },
  recordButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: BRAND_COLORS.EXPLORER_TEAL,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  recordingActive: {
    backgroundColor: "#FF5757", // Keep red for recording state
  },
  recordingDisabled: {
    backgroundColor: BRAND_COLORS.SHADOW_GREY,
  },
  recordingText: {
    fontSize: 16,
    color: BRAND_COLORS.SHADOW_GREY,
    textAlign: "center",
    fontFamily: getFontFamily('medium'),
  },
  feedbackContainer: {
    // marginTop: 40,
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
    borderColor: BRAND_COLORS.EXPLORER_TEAL,
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
    color: BRAND_COLORS.OCEAN_BLUE,
    fontFamily: getFontFamily('bold'),
  },
  feedbackText: {
    fontSize: 14,
    textAlign: "center",
    marginBottom: 16,
    color: BRAND_COLORS.SHADOW_GREY,
    fontFamily: getFontFamily('medium'),
  },
  actionButtonsContainer: {
    flexDirection: "row",
    gap: 12,
    marginTop: 16,
  },
  tryAgainButton: {
    flex: 1,
  },
  nextButton: {
    flex: 1,
    backgroundColor: BRAND_COLORS.EXPLORER_TEAL,
  },
  // Professional Error Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContainer: {
    width: '100%',
    maxWidth: 400,
  },
  errorCard: {
    padding: 24,
    alignItems: 'center',
    backgroundColor: BRAND_COLORS.CARD_BACKGROUND,
    borderRadius: 16,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
  },
  errorIconContainer: {
    marginBottom: 16,
    padding: 12,
    borderRadius: 50,
    backgroundColor: BRAND_COLORS.SHADOW_GREY + '20',
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: BRAND_COLORS.OCEAN_BLUE,
    textAlign: 'center',
    marginBottom: 12,
    fontFamily: getFontFamily('bold'),
  },
  errorMessage: {
    fontSize: 16,
    color: BRAND_COLORS.SHADOW_GREY,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 24,
    fontFamily: getFontFamily('regular'),
  },
  errorButtonContainer: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  errorCancelButton: {
    flex: 1,
  },
  errorRetryButton: {
    flex: 1,
    backgroundColor: BRAND_COLORS.EXPLORER_TEAL,
  },
});

export default PronunciationChallengeGame;
