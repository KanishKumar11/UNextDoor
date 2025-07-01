import React, { useState, useEffect, useRef } from "react";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Animated,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as FileSystem from "expo-file-system";
import { AudioModule } from "expo-audio";
import {
  Text,
  Heading,
  ModernButton,
  Spacer,
  ModernCard,
} from "../../../shared/components";
import modernTheme from "../../../shared/styles/modernTheme";
import { pronunciationService } from "../services/pronunciationService";
import PronunciationFeedback from "./PronunciationFeedback";
import { useUserLevel } from "../../level/context/UserLevelContext";

/**
 * PronunciationPractice component
 * Allows users to practice pronunciation with feedback
 *
 * @param {Object} props - Component props
 * @param {string} props.text - Text to practice pronouncing
 * @param {string} props.translation - English translation of the text
 * @param {string} props.difficulty - Difficulty level (beginner, intermediate, advanced)
 * @param {Function} props.onComplete - Function to call when practice is complete
 */
const PronunciationPractice = ({
  text,
  translation,
  difficulty = "beginner",
  onComplete,
}) => {
  // Refs
  const recording = useRef(null);
  const sound = useRef(null);
  const animationValue = useRef(new Animated.Value(1)).current;

  // State
  const [isRecording, setIsRecording] = useState(false);
  const [recordingUri, setRecordingUri] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState(null);
  const [error, setError] = useState(null);
  const [showFeedback, setShowFeedback] = useState(false);

  // Hooks
  const { addXp } = useUserLevel();

  // Set up audio recording
  useEffect(() => {
    (async () => {
      try {
        await AudioModule.requestPermissionsAsync();
        await AudioModule.setAudioModeAsync({
          allowsRecordingIOS: true,
          playsInSilentModeIOS: true,
          staysActiveInBackground: false,
          shouldDuckAndroid: true,
        });
      } catch (err) {
        setError("Failed to set up audio recording: " + err.message);
      }
    })();

    return () => {
      // Clean up
      if (recording.current) {
        recording.current.stopAndUnloadAsync().catch(() => {});
      }
      if (sound.current) {
        sound.current.unloadAsync().catch(() => {});
      }
    };
  }, []);

  // Start recording
  const startRecording = async () => {
    try {
      setError(null);

      // Reset previous recording
      if (recording.current) {
        await recording.current.stopAndUnloadAsync();
      }
      if (recordingUri) {
        await FileSystem.deleteAsync(recordingUri, { idempotent: true });
      }

      // Create new recording
      const { recording: newRecording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );

      recording.current = newRecording;
      setIsRecording(true);

      // Start pulse animation
      startPulseAnimation();
    } catch (err) {
      setError("Failed to start recording: " + err.message);
    }
  };

  // Stop recording
  const stopRecording = async () => {
    try {
      if (!recording.current) return;

      // Stop recording
      await recording.current.stopAndUnloadAsync();
      const uri = recording.current.getURI();

      setIsRecording(false);
      setRecordingUri(uri);
      recording.current = null;

      // Stop pulse animation
      stopPulseAnimation();
    } catch (err) {
      setError("Failed to stop recording: " + err.message);
    }
  };

  // Play recording
  const playRecording = async () => {
    try {
      if (!recordingUri) return;

      // Create sound object
      const { sound: newSound } = await Audio.Sound.createAsync(
        { uri: recordingUri },
        { shouldPlay: true }
      );

      sound.current = newSound;
      setIsPlaying(true);

      // Listen for playback status
      sound.current.setOnPlaybackStatusUpdate((status) => {
        if (status.didJustFinish) {
          setIsPlaying(false);
        }
      });
    } catch (err) {
      setError("Failed to play recording: " + err.message);
    }
  };

  // Analyze pronunciation
  const analyzePronunciation = async () => {
    try {
      if (!recordingUri) return;

      setIsAnalyzing(true);
      setError(null);

      // Call pronunciation service
      const result = await pronunciationService.analyzePronunciation(
        recordingUri,
        text,
        difficulty
      );

      if (result.success) {
        setAnalysis(result);
        setShowFeedback(true);

        // Award XP based on accuracy
        const xpAmount = Math.round((result.accuracy / 100) * 50); // Up to 50 XP
        if (xpAmount > 0) {
          addXp(xpAmount, "pronunciation_practice");
        }

        // Call onComplete callback if provided
        if (onComplete) {
          onComplete(result);
        }
      } else {
        setError(result.error || "Failed to analyze pronunciation");
      }
    } catch (err) {
      setError("Failed to analyze pronunciation: " + err.message);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Reset practice
  const resetPractice = () => {
    setShowFeedback(false);
    setAnalysis(null);
    setRecordingUri(null);
  };

  // Pulse animation for recording
  const startPulseAnimation = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(animationValue, {
          toValue: 1.2,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(animationValue, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
      ])
    ).start();
  };

  const stopPulseAnimation = () => {
    animationValue.stopAnimation();
    Animated.timing(animationValue, {
      toValue: 1,
      duration: 200,
      useNativeDriver: true,
    }).start();
  };

  // If showing feedback, render the feedback component
  if (showFeedback) {
    return (
      <View style={styles.container}>
        <PronunciationFeedback
          analysis={analysis}
          onClose={resetPractice}
          onTryAgain={resetPractice}
        />

        <View style={styles.buttonContainer}>
          <ModernButton
            text="Try Again"
            onPress={resetPractice}
            variant="outlined"
            style={styles.button}
          />

          <ModernButton
            text="Continue"
            onPress={() => {
              if (onComplete) onComplete(analysis);
            }}
            style={styles.button}
          />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ModernCard style={styles.practiceCard}>
        <Heading level="h3" align="center" gutterBottom>
          Pronunciation Practice
        </Heading>

        <View style={styles.textContainer}>
          <Text
            size="xl"
            weight="semibold"
            align="center"
            style={styles.koreanText}
          >
            {text}
          </Text>

          <Text
            color="neutral.600"
            align="center"
            style={styles.translationText}
          >
            {translation}
          </Text>
        </View>

        <Spacer size="lg" />

        <View style={styles.recordingContainer}>
          <TouchableOpacity
            style={[
              styles.recordButton,
              isRecording ? styles.recordingActive : null,
            ]}
            onPress={isRecording ? stopRecording : startRecording}
            activeOpacity={0.7}
          >
            <Animated.View
              style={[
                styles.recordButtonInner,
                isRecording ? styles.recordingActiveInner : null,
                { transform: [{ scale: isRecording ? animationValue : 1 }] },
              ]}
            >
              <Ionicons
                name={isRecording ? "stop" : "mic"}
                size={28}
                color={isRecording ? "#fff" : modernTheme.colors.primary[500]}
              />
            </Animated.View>
          </TouchableOpacity>

          <Text align="center" style={styles.recordingText}>
            {isRecording ? "Tap to stop recording" : "Tap to start recording"}
          </Text>
        </View>

        {recordingUri && (
          <>
            <Spacer size="md" />

            <View style={styles.playbackContainer}>
              <ModernButton
                text="Play Recording"
                onPress={playRecording}
                variant="outlined"
                leftIcon={
                  <Ionicons
                    name="play"
                    size={18}
                    color={modernTheme.colors.primary[500]}
                  />
                }
                disabled={isPlaying}
                style={styles.playButton}
              />

              <ModernButton
                text="Analyze Pronunciation"
                onPress={analyzePronunciation}
                disabled={isAnalyzing}
                style={styles.analyzeButton}
              />
            </View>
          </>
        )}

        {isAnalyzing && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator
              size="large"
              color={modernTheme.colors.primary[500]}
            />
            <Text align="center" style={styles.loadingText}>
              Analyzing pronunciation...
            </Text>
          </View>
        )}

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
      </ModernCard>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  practiceCard: {
    padding: 16,
  },
  textContainer: {
    marginTop: 16,
  },
  koreanText: {
    marginBottom: 8,
  },
  translationText: {
    fontStyle: "italic",
  },
  recordingContainer: {
    alignItems: "center",
  },
  recordButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: modernTheme.colors.neutral[100],
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  recordingActive: {
    backgroundColor: modernTheme.colors.error[100],
  },
  recordButtonInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: modernTheme.colors.neutral[50],
    justifyContent: "center",
    alignItems: "center",
  },
  recordingActiveInner: {
    backgroundColor: modernTheme.colors.error[500],
  },
  recordingText: {
    marginTop: 8,
  },
  playbackContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 16,
  },
  playButton: {
    marginRight: 8,
  },
  analyzeButton: {
    marginLeft: 8,
  },
  loadingContainer: {
    marginTop: 16,
    alignItems: "center",
  },
  loadingText: {
    marginTop: 8,
  },
  errorContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 16,
    padding: 8,
    backgroundColor: modernTheme.colors.error[50],
    borderRadius: 4,
  },
  errorText: {
    marginLeft: 8,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 16,
    paddingHorizontal: 16,
  },
  button: {
    flex: 1,
    marginHorizontal: 8,
  },
});

export default PronunciationPractice;
