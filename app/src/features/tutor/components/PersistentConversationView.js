import React, { useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Animated,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useWebRTCConversation } from '../hooks/useWebRTCConversation';

/**
 * Simplified conversation view that uses the persistent WebRTC service
 * This component can be remounted without losing the conversation state
 */
const PersistentConversationView = ({
  scenarioId,
  level = "beginner",
  onSessionEnd,
  style
}) => {
  // Animation values
  const pulseAnim = React.useRef(new Animated.Value(1)).current;
  const fadeAnim = React.useRef(new Animated.Value(0)).current;
  const {
    // State
    isInitialized,
    isConnected,
    isSessionActive,
    isAISpeaking,
    audioOutputDevice,
    currentScenario,
    connectionState,
    error,

    // Actions
    startSession,
    stopSession,
    changeScenario,

    // Computed state
    isConnecting,
    isDisconnected,
  } = useWebRTCConversation();

  // Start animations when component mounts
  React.useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim]);

  // Pulse animation for AI speaking
  React.useEffect(() => {
    if (isAISpeaking) {
      const pulse = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.2,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      );
      pulse.start();
      return () => pulse.stop();
    } else {
      Animated.timing(pulseAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [isAISpeaking, pulseAnim]);

  /**
   * Start or change session when scenario changes
   */
  useEffect(() => {
    if (!isInitialized || !scenarioId) return;

    const handleScenarioChange = async () => {
      try {
        if (isSessionActive && currentScenario === scenarioId) {
          // Already running the correct scenario
          console.log("🎯 Already running scenario:", scenarioId);
          return;
        }

        if (isSessionActive && currentScenario !== scenarioId) {
          // Change scenario without stopping session
          console.log("🎯 Changing scenario from", currentScenario, "to", scenarioId);
          await changeScenario(scenarioId, level);
        } else {
          // Start new session
          console.log("🎯 Starting new session for scenario:", scenarioId);
          await startSession(scenarioId, level);
        }
      } catch (error) {
        console.error("🎯 Error handling scenario change:", error);
        Alert.alert("Connection Error", "Failed to start conversation. Please try again.");
      }
    };

    handleScenarioChange();
  }, [isInitialized, scenarioId, level, isSessionActive, currentScenario, startSession, changeScenario]);

  /**
   * Handle session end
   */
  const handleEndSession = useCallback(async () => {
    try {
      await stopSession();
      if (onSessionEnd) {
        onSessionEnd();
      }
    } catch (error) {
      console.error("🎯 Error ending session:", error);
    }
  }, [stopSession, onSessionEnd]);



  /**
   * Get connection status display
   */
  const getConnectionStatus = () => {
    if (!isInitialized) return "Initializing...";
    if (isConnecting) return "Connecting...";
    if (isConnected && isSessionActive) return "Connected";
    if (isDisconnected) return "Disconnected";
    return "Ready";
  };

  /**
   * Get connection status color
   */
  const getConnectionStatusColor = () => {
    if (!isInitialized || isConnecting) return "#FFA500"; // Orange
    if (isConnected && isSessionActive) return "#6FC935"; // Green
    if (isDisconnected) return "#FF4444"; // Red
    return "#666"; // Gray
  };

  /**
   * Get audio device display
   */
  const getAudioDeviceDisplay = () => {
    switch (audioOutputDevice) {
      case "bluetooth":
        return "🎧 Bluetooth";
      case "headphones":
        return "🎧 Headphones";
      case "speaker":
        return "🔊 Speaker";
      default:
        return "🔊 Audio";
    }
  };



  if (error) {
    return (
      <Animated.View style={[styles.container, style, { opacity: fadeAnim }]}>
        <LinearGradient
          colors={['#FF6B6B', '#FF8E8E']}
          style={styles.errorGradient}
        >
          <View style={styles.errorContainer}>
            <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
              <Ionicons name="alert-circle" size={48} color="white" />
            </Animated.View>
            <Text style={styles.errorTitle}>Connection Error</Text>
            <Text style={styles.errorMessage}>
              {error.error?.message || "Failed to connect to conversation service"}
            </Text>
            <TouchableOpacity
              style={styles.retryButton}
              onPress={() => startSession(scenarioId, level)}
            >
              <Text style={styles.retryButtonText}>Retry</Text>
            </TouchableOpacity>
          </View>
        </LinearGradient>
      </Animated.View>
    );
  }

  return (
    <Animated.View style={[styles.container, style, { opacity: fadeAnim }]}>
      <LinearGradient
        colors={['#F8FFFE', '#E8F5E8']}
        style={styles.mainGradient}
      >
        {/* Cooper Avatar with Animation */}
        <View style={styles.avatarContainer}>
          <Animated.View style={[styles.avatarWrapper, { transform: [{ scale: pulseAnim }] }]}>
            <LinearGradient
              colors={isAISpeaking ? ['#6FC935', '#5BA82A'] : ['#E0E0E0', '#CCCCCC']}
              style={styles.avatar}
            >
              <Ionicons
                name="chatbubble-ellipses"
                size={32}
                color="white"
              />
            </LinearGradient>
          </Animated.View>
          <Text style={styles.avatarLabel}>Cooper</Text>
          {isAISpeaking && (
            <View style={styles.speakingIndicator}>
              <Text style={styles.speakingText}>Speaking...</Text>
            </View>
          )}
        </View>

        {/* Connection Status */}
        <View style={styles.statusContainer}>
          <View style={styles.statusRow}>
            <View style={[styles.statusIndicator, { backgroundColor: getConnectionStatusColor() }]} />
            <Text style={styles.statusText}>{getConnectionStatus()}</Text>
          </View>
          <Text style={styles.audioDeviceText}>{getAudioDeviceDisplay()}</Text>
        </View>

        {/* Conversation Instructions */}
        <View style={styles.instructionsContainer}>
          <Ionicons name="mic" size={24} color="#6FC935" />
          <Text style={styles.instructionsText}>
            Start speaking naturally - Cooper will respond and help you practice!
          </Text>
        </View>

      {/* Session Controls */}
      <View style={styles.sessionControls}>
        <TouchableOpacity
          style={styles.endButton}
          onPress={handleEndSession}
        >
          <Ionicons name="call" size={20} color="white" />
          <Text style={styles.endButtonText}>End Call</Text>
        </TouchableOpacity>
      </View>

      {/* Debug Info (only in development) */}
      {__DEV__ && (
        <View style={styles.debugContainer}>
          <Text style={styles.debugText}>
            Scenario: {currentScenario || 'None'} | Level: {level}
          </Text>
          <Text style={styles.debugText}>
            State: {connectionState} | OpenAI handles all voice detection automatically
          </Text>
        </View>
      )}
      </LinearGradient>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  mainGradient: {
    flex: 1,
    borderRadius:20,
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 16,
    margin: 20,
  },
  avatarContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  avatarWrapper: {
    marginBottom: 12,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  avatarLabel: {
    fontSize: 18,
    fontWeight: '600',
    color: '#0A2240',
    marginBottom: 8,
  },
  speakingIndicator: {
    backgroundColor: '#6FC935',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  speakingText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '500',
  },
  statusContainer: {
    alignItems: 'center',
    marginBottom: 30,
    // backgroundColor: 'rgba(255, 255, 255, 0.8)',
    padding: 16,
    borderRadius: 16,
    // shadowColor: '#000',
    // shadowOffset: {
    //   width: 0,
    //   height: 2,
    // },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    // elevation: 3,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  statusIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  statusText: {
    fontSize: 16,
    fontFamily: 'Montserrat-Medium',
    color: '#333',
  },
  audioDeviceText: {
    fontSize: 14,
    fontFamily: 'Montserrat-Regular',
    color: '#666',
  },
  aiSpeakingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F8FF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginBottom: 20,
  },
  aiSpeakingText: {
    marginLeft: 8,
    fontSize: 14,
    fontFamily: 'Montserrat-Medium',
    color: '#6FC935',
  },
  instructionsContainer: {
    backgroundColor: 'rgba(111, 201, 53, 0.1)',
    padding: 20,
    borderRadius: 16,
    marginBottom: 30,
    alignItems: 'center',
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: 'rgba(111, 201, 53, 0.3)',
  },
  instructionsText: {
    fontSize: 16,
    fontFamily: 'Montserrat-Medium',
    color: '#0A2240',
    textAlign: 'center',
    lineHeight: 24,
    marginLeft: 12,
    flex: 1,
    fontWeight: '500',
  },
  sessionControls: {
    alignItems: 'center',
  },
  endButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FF4444',
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 16,
    shadowColor: '#FF4444',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  endButtonText: {
    marginLeft: 8,
    fontSize: 16,
    fontFamily: 'Montserrat-Medium',
    color: 'white',
  },
  errorContainer: {
    alignItems: 'center',
    padding: 30,
  },
  errorTitle: {
    fontSize: 20,
    fontFamily: 'Montserrat-Bold',
    color: 'white',
    marginTop: 16,
    marginBottom: 8,
  },
  errorMessage: {
    fontSize: 16,
    fontFamily: 'Montserrat-Regular',
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
  },
  retryButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  retryButtonText: {
    fontSize: 16,
    fontFamily: 'Montserrat-SemiBold',
    color: 'white',
  },
  debugContainer: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    backgroundColor: 'rgba(0,0,0,0.8)',
    padding: 10,
    borderRadius: 8,
  },
  debugText: {
    fontSize: 10,
    fontFamily: 'Montserrat-Regular',
    color: 'white',
    marginBottom: 2,
  },
});

export default PersistentConversationView;
