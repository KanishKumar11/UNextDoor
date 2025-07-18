import React, { useEffect, useCallback, useRef, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Animated,
  ScrollView,
  Platform,
  AppState,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect } from '@react-navigation/native';
import { useWebRTCConversation } from '../hooks/useWebRTCConversation';
import { setAudioModeAsync } from '../../../shared/utils/audioUtils';

/**
 * Enhanced conversation view with streaming AI transcript and modern aesthetics
 */
const PersistentConversationView = ({
  scenarioId,
  level = "beginner",
  onSessionEnd,
  style
}) => {
  // Animation values
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;
  const waveAnim = useRef(new Animated.Value(0)).current;
  const cursorAnim = useRef(new Animated.Value(1)).current;
  const statusPulseAnim = useRef(new Animated.Value(1)).current;
  // const scrollViewRef = useRef(null); // No longer needed for current dialog mode
  
  // Streaming state
  const [displayedTranscript, setDisplayedTranscript] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const streamingIntervalRef = useRef(null);
  const transcriptIndexRef = useRef(0);

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
    userEndedSession,
    allowAutoRestart,
    conversationHistory,
    currentAITranscript,

    // Actions
    startSession,
    stopSession,
    changeScenario,
    stopSessionByUser,
    resetSessionControlFlags,
    clearAllData, // Add this method from the hook for complete data clearing

    // Computed state
    isConnecting,
    isDisconnected,
  } = useWebRTCConversation();

  // Complete cleanup function
  const performCompleteCleanup = useCallback(async () => {
    console.log("🧹 Performing complete cleanup of conversation data");
    
    try {
      // Clear streaming intervals
      if (streamingIntervalRef.current) {
        clearInterval(streamingIntervalRef.current);
        streamingIntervalRef.current = null;
      }
      
      // Reset local state
      setDisplayedTranscript('');
      setIsStreaming(false);
      transcriptIndexRef.current = 0;
      
      // DON'T reset animations to initial values - let them stay for next session
      // Only reset animations if component is unmounting
      
      // Clear WebRTC data and stop session
      if (clearAllData) {
        await clearAllData();
      } else {
        await stopSession();
      }
      
      console.log("✅ Complete cleanup finished");
    } catch (error) {
      console.error("❌ Error during complete cleanup:", error);
    }
  }, [clearAllData, stopSession]);

  // Cleanup for component unmount only
  const performUnmountCleanup = useCallback(async () => {
    console.log("🧹 Performing unmount cleanup");
    
    try {
      // Clear streaming intervals
      if (streamingIntervalRef.current) {
        clearInterval(streamingIntervalRef.current);
        streamingIntervalRef.current = null;
      }
      
      // Reset local state
      setDisplayedTranscript('');
      setIsStreaming(false);
      transcriptIndexRef.current = 0;
      
      // Reset animations to initial values for unmount
      pulseAnim.setValue(1);
      fadeAnim.setValue(0);
      slideAnim.setValue(50);
      glowAnim.setValue(0);
      waveAnim.setValue(0);
      cursorAnim.setValue(1);
      statusPulseAnim.setValue(1);
      
      // Clear WebRTC data and stop session
      if (clearAllData) {
        await clearAllData();
      } else {
        await stopSession();
      }
      
      console.log("✅ Unmount cleanup finished");
    } catch (error) {
      console.error("❌ Error during unmount cleanup:", error);
    }
  }, [
    clearAllData, 
    stopSession, 
    pulseAnim, 
    fadeAnim, 
    slideAnim, 
    glowAnim, 
    waveAnim, 
    cursorAnim, 
    statusPulseAnim
  ]);

  // Entrance animations
  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  // Reset animations when scenario changes (new conversation starts)
  useEffect(() => {
    if (scenarioId && isInitialized) {
      console.log("🎯 Scenario changed, resetting UI animations");
      
      // Ensure animations are visible for new session
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 400,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [scenarioId, isInitialized, fadeAnim, slideAnim]);

  // Enhanced pulse animation for AI speaking
  useEffect(() => {
    if (isAISpeaking) {
      const pulse = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.15,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
        ])
      );
      
      const glow = Animated.loop(
        Animated.sequence([
          Animated.timing(glowAnim, {
            toValue: 1,
            duration: 1200,
            useNativeDriver: true,
          }),
          Animated.timing(glowAnim, {
            toValue: 0,
            duration: 1200,
            useNativeDriver: true,
          }),
        ])
      );

      const wave = Animated.loop(
        Animated.timing(waveAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        })
      );

      pulse.start();
      glow.start();
      wave.start();
      
      return () => {
        pulse.stop();
        glow.stop();
        wave.stop();
      };
    } else {
      Animated.parallel([
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(glowAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(waveAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [isAISpeaking]);

  // Streaming AI transcript effect
  useEffect(() => {
    if (currentAITranscript && currentAITranscript.length > 0) {
      if (!isStreaming) {
        setIsStreaming(true);
        transcriptIndexRef.current = 0;
        setDisplayedTranscript('');
      }

      // Clear existing interval
      if (streamingIntervalRef.current) {
        clearInterval(streamingIntervalRef.current);
      }

      // Start streaming animation
      streamingIntervalRef.current = setInterval(() => {
        const currentIndex = transcriptIndexRef.current;
        if (currentIndex < currentAITranscript.length) {
          const nextChar = currentAITranscript[currentIndex];
          setDisplayedTranscript(prev => prev + nextChar);
          transcriptIndexRef.current++;
        } else {
          // Streaming complete
          setIsStreaming(false);
          clearInterval(streamingIntervalRef.current);
          streamingIntervalRef.current = null;
        }
      }, 30); // Adjust speed as needed

    } else if (!currentAITranscript) {
      // Reset when transcript is cleared
      setDisplayedTranscript('');
      setIsStreaming(false);
      if (streamingIntervalRef.current) {
        clearInterval(streamingIntervalRef.current);
        streamingIntervalRef.current = null;
      }
    }

    return () => {
      if (streamingIntervalRef.current) {
        clearInterval(streamingIntervalRef.current);
      }
    };
  }, [currentAITranscript]);

  // Cursor blinking animation
  useEffect(() => {
    if (isStreaming) {
      const cursorBlink = Animated.loop(
        Animated.sequence([
          Animated.timing(cursorAnim, {
            toValue: 0,
            duration: 600,
            useNativeDriver: true,
          }),
          Animated.timing(cursorAnim, {
            toValue: 1,
            duration: 600,
            useNativeDriver: true,
          }),
        ])
      );
      cursorBlink.start();
      
      return () => {
        cursorBlink.stop();
      };
    } else {
      Animated.timing(cursorAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }
  }, [isStreaming]);

  // Status indicator pulse animation when connected
  useEffect(() => {
    if (isConnected && isSessionActive) {
      const statusPulse = Animated.loop(
        Animated.sequence([
          Animated.timing(statusPulseAnim, {
            toValue: 1.3,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(statusPulseAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      );
      statusPulse.start();
      
      return () => {
        statusPulse.stop();
      };
    } else {
      Animated.timing(statusPulseAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [isConnected, isSessionActive]);

  // Auto-scroll effect is no longer needed since we show only current dialog
  // useEffect(() => {
  //   if (scrollViewRef.current && (conversationHistory.length > 0 || displayedTranscript)) {
  //     setTimeout(() => {
  //       scrollViewRef.current?.scrollToEnd({ animated: true });
  //     }, 100);
  //   }
  // }, [conversationHistory.length, displayedTranscript]);

  // Session management
  useEffect(() => {
    if (!isInitialized || !scenarioId) return;
    
    if (userEndedSession || !allowAutoRestart) {
      console.log("🎯 User ended session or auto-restart disabled, not auto-restarting");
      return;
    }

    const handleScenarioChange = async () => {
      try {
        if (isSessionActive && currentScenario === scenarioId) {
          console.log("🎯 Already running scenario:", scenarioId);
          return;
        }

        if (isSessionActive && currentScenario !== scenarioId) {
          console.log("🎯 Changing scenario from", currentScenario, "to", scenarioId);
          await changeScenario(scenarioId, level);
        } else {
          console.log("🎯 Starting new session for scenario:", scenarioId);
          
          // Reset UI state for new session
          setDisplayedTranscript('');
          setIsStreaming(false);
          transcriptIndexRef.current = 0;
          
          await startSession(scenarioId, level);
        }
      } catch (error) {
        console.error("🎯 Error handling scenario change:", error);
        Alert.alert("Connection Error", "Failed to start conversation. Please try again.");
      }
    };

    handleScenarioChange();
  }, [isInitialized, scenarioId, level, isSessionActive, currentScenario, userEndedSession, allowAutoRestart, startSession, changeScenario]);

  const handleEndSession = useCallback(async () => {
    try {
      console.log("🎯 Ending conversation session from component");
      
      // Perform complete cleanup but don't reset animations
      await performCompleteCleanup();
      
      // Reset session control flags to allow restart
      if (resetSessionControlFlags) {
        resetSessionControlFlags();
      }
      
      if (onSessionEnd) {
        onSessionEnd();
      }
    } catch (error) {
      console.error("🎯 Error ending session:", error);
    }
  }, [performCompleteCleanup, resetSessionControlFlags, onSessionEnd]);

  useEffect(() => {
    return () => {
      console.log("🛑 PersistentConversationView unmounting - performing unmount cleanup");
      performUnmountCleanup().catch(error => {
        console.error("🛑 Error during unmount cleanup:", error);
      });
    };
  }, [performUnmountCleanup]);

  // Additional cleanup for scenario/route changes
  useEffect(() => {
    // This effect runs when the component mounts or when key props change
    // If there's an active session from a previous conversation, clean it up
    return () => {
      console.log("🔄 Route/scenario changed - ensuring clean state");
      if (isConnected || isSessionActive) {
        console.log("🧹 Cleaning up previous session due to route change");
        clearAllData().catch(error => {
          console.error("🛑 Error during route change cleanup:", error);
        });
      }
    };
  }, [scenarioId, level]); // Re-run when scenario changes

  // Sync audio output route when device changes
  useEffect(() => {
    // Reconfigure audio routing via audioUtils (Android SCO and OS routing)
    setAudioModeAsync({});
  }, [audioOutputDevice]);

  // Handle app state changes (background/foreground)
  useEffect(() => {
    const handleAppStateChange = (nextAppState) => {
      console.log("🎯 App state changed to:", nextAppState);
      
      if (nextAppState === 'background' || nextAppState === 'inactive') {
        console.log("🎯 App going to background - ending session");
        handleEndSession();
      }
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);

    return () => {
      subscription?.remove();
    };
  }, [handleEndSession]);

  // Handle navigation focus/blur events with immediate cleanup
  useFocusEffect(
    useCallback(() => {
      console.log("🎯 PersistentConversationView focused");

      // Component is focused - session management is handled by other useEffect

      return () => {
        console.log("🎯 PersistentConversationView blurred - performing IMMEDIATE cleanup");

        // Immediate synchronous cleanup for critical resources
        try {
          // Clear streaming intervals immediately
          if (streamingIntervalRef.current) {
            clearInterval(streamingIntervalRef.current);
            streamingIntervalRef.current = null;
          }

          // Stop animations immediately
          if (pulseAnim) {
            pulseAnim.stopAnimation();
            pulseAnim.setValue(1);
          }

          // Force immediate WebRTC cleanup using clearAllData
          clearAllData().catch(error => {
            console.error("🛑 Error during blur cleanup:", error);
          });

        } catch (error) {
          console.error("🛑 Error during immediate cleanup:", error);
        }
      };
    }, [performCompleteCleanup, pulseAnim])
  );

  const getConnectionStatus = () => {
    if (!isInitialized) return "Initializing...";
    if (isConnecting) return "Connecting...";
    if (isConnected && isSessionActive) return "Connected";
    if (isDisconnected) return "Disconnected";
    return "Ready";
  };

  const getConnectionStatusColor = () => {
    if (!isInitialized || isConnecting) return "#FF9500";
    if (isConnected && isSessionActive) return "#34C759";
    if (isDisconnected) return "#FF3B30";
    return "#8E8E93";
  };

  const renderWaveforms = () => {
    const waves = Array.from({ length: 5 }, (_, i) => (
      <Animated.View
        key={i}
        style={[
          styles.waveBar,
          {
            height: Animated.multiply(
              waveAnim,
              new Animated.Value(Math.random() * 20 + 10)
            ),
            opacity: glowAnim,
          },
        ]}
      />
    ));
    return waves;
  };

  if (error) {
    return (
      <Animated.View style={[styles.container, style, { opacity: fadeAnim }]}>
        <LinearGradient
          colors={['#FF6B6B', '#FF8E8E', '#FFA8A8']}
          style={styles.errorGradient}
        >
          <View style={styles.errorContainer}>
            <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
              <View style={styles.errorIconContainer}>
                <Ionicons name="alert-circle" size={48} color="white" />
              </View>
            </Animated.View>
            <Text style={styles.errorTitle}>
              {error.error?.message?.includes('429') ? 'Service Busy' : 'Connection Error'}
            </Text>
            <Text style={styles.errorMessage}>
              {error.error?.message?.includes('429') 
                ? "The conversation service is currently busy. Please wait a moment and try again."
                : (error.error?.message || "Failed to connect to conversation service")
              }
            </Text>
            <TouchableOpacity
              style={styles.retryButton}
              onPress={() => startSession(scenarioId, level)}
              activeOpacity={0.8}
            >
              <Ionicons name="refresh" size={20} color="white" style={styles.retryIcon} />
              <Text style={styles.retryButtonText}>
                {error.error?.message?.includes('429') ? 'Try Again' : 'Retry Connection'}
              </Text>
            </TouchableOpacity>
          </View>
        </LinearGradient>
      </Animated.View>
    );
  }

  return (
    <Animated.View style={[
      styles.container, 
      style, 
      { 
        opacity: fadeAnim,
        transform: [{ translateY: slideAnim }]
      }
    ]}>
      {/* Main Conversation Layout - Redesigned */}
      <View style={styles.modernContainer}>
        
       
        {/* Scrollable Content Area */}
        <ScrollView 
          style={styles.scrollContainer}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          bounces={true}
        >
           {/* Top Status Bar with End Button */}
        <View style={styles.modernStatusBar}>
          <View style={styles.statusLeft}>
            <Animated.View style={[
              styles.connectionDot,
              { 
                backgroundColor: getConnectionStatusColor(),
                transform: [{ scale: statusPulseAnim }]
              }
            ]} />
            <Text style={styles.connectionStatus}>{getConnectionStatus()}</Text>
          </View>
          
          <View style={styles.topActions}>
            <Text style={styles.sessionCounter}>{conversationHistory.length} exchanges</Text>
            <TouchableOpacity
              style={styles.topEndButton}
              onPress={handleEndSession}
              activeOpacity={0.8}
            >
              <Ionicons name="close-circle" size={28} color="#ef4444" />
            </TouchableOpacity>
          </View>
        </View>

          {/* Central Focus Area - Miles Avatar & Streaming Text */}
          <View style={styles.centralFocusArea}>
          
          {/* Miles Avatar - Large and Prominent */}
          <View style={styles.milesSection}>
            <Animated.View style={[
              // styles.milesAvatarContainer,
              { transform: [{ scale: pulseAnim }] }
            ]}>
              {/* Animated Glow Rings when speaking */}
              {isAISpeaking && (
                <>
                  <Animated.View style={[
                    // styles.glowRing,
                    // styles.outerGlow,
                    { 
                      opacity: glowAnim,
                      transform: [{ scale: Animated.multiply(glowAnim, 1.2) }]
                    }
                  ]} />
                  <Animated.View style={[
                    // styles.glowRing,
                    // styles.middleGlow,
                    { 
                      opacity: Animated.multiply(glowAnim, 0.8),
                      transform: [{ scale: Animated.multiply(glowAnim, 1.1) }]
                    }
                  ]} />
                  <Animated.View style={[
                    styles.glowRing,
                    styles.innerGlow,
                    { 
                      opacity: Animated.multiply(glowAnim, 0.5),
                      transform: [{ scale: Animated.multiply(glowAnim, 1.05) }]
                    }
                  ]} />
                </>
              )}
              
              {/* Main Miles Avatar */}
              <View

                style={styles.milesAvatar}
              >
                {/* AI Tutor Avatar - Using app logo */}
                <View style={{}}>
                  <Image
                    source={require('../../../assets/app-logo-square.png')}
                    style={[
                      styles.avatarLogo,
                      {
                        opacity: isAISpeaking ? 1 : 0.9,
                        // Remove tintColor to show original logo colors
                      }
                    ]}
                    resizeMode="contain"
                  />
                  {/* Add speaking indicator overlay */}
                  {isAISpeaking && (
                    <View style={styles.speakingIndicator}>
                      <View style={[styles.speakingDot, { backgroundColor: 'rgba(255,255,255,0.8)' }]} />
                    </View>
                  )}
                </View>
              </View>
            </Animated.View>
            
            {/* Miles Label */}
            <View style={styles.milesInfo}>
              <Text style={styles.milesName}>Miles</Text>
              <Text style={styles.milesRole}>Your Korean Conversation Partner</Text>
            </View>
          </View>

          {/* Streaming Text Display - Main Focus */}
          <View style={styles.streamingTextArea}>
            {displayedTranscript ? (
              // Active streaming response
              <Animated.View 
                style={[
                  styles.streamingCard,
                  { 
                    opacity: fadeAnim,
                    transform: [{ translateY: slideAnim }]
                  }
                ]}
              >
                {/* Speaking Indicator */}
                <View style={styles.speakingIndicatorBar}>
                  <View style={styles.speakingDots}>
                    {isAISpeaking && renderWaveforms()}
                  </View>
                  <Text style={styles.speakingLabel}>Speaking...</Text>
                </View>
                
                {/* Main Streaming Text */}
                <Text style={styles.streamingText}>
                  {displayedTranscript}
                  {isStreaming && (
                    <Animated.Text style={[styles.typingCursor, { opacity: cursorAnim }]}>
                      |
                    </Animated.Text>
                  )}
                </Text>
              </Animated.View>
            ) : conversationHistory.length > 0 ? (
              // Show the most recent exchange
              (() => {
                const lastMessage = conversationHistory[conversationHistory.length - 1];
                return (
                  <Animated.View 
                    style={[
                      styles.lastMessageCard,
                      { 
                        opacity: fadeAnim,
                        transform: [{ translateY: slideAnim }]
                      }
                    ]}
                  >
                    <View style={styles.messageHeader}>
                      <View style={[
                        styles.messageTypeIndicator,
                        { backgroundColor: lastMessage.type === 'user' ? '#3b82f6' : '#10b981' }
                      ]} />
                      <Text style={styles.messageType}>
                        {lastMessage.type === 'user' ? 'You said' : 'Miles responded'}
                      </Text>
                    </View>
                    <Text style={styles.lastMessageText}>
                      {lastMessage.text}
                    </Text>
                  </Animated.View>
                );
              })()
            ) : (
              // Waiting to start conversation
              <Animated.View 
                style={[
                  styles.waitingCard,
                  { 
                    opacity: fadeAnim,
                    transform: [{ translateY: slideAnim }]
                  }
                ]}
              >
                <Text style={styles.waitingText}>
                  {isConnected && isSessionActive 
                    ? "Miles is starting the conversation..." 
                    : "Ready to practice Korean conversation?"
                  }
                </Text>
                <Text style={styles.waitingSubtext}>
                  {isConnected && isSessionActive 
                    ? "Listen for Miles to greet you and start chatting!" 
                    : "Miles will greet you first and guide the conversation"
                  }
                </Text>
              </Animated.View>
            )}
          </View>
        </View>
        </ScrollView>

    
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  
  // Modern Layout Styles
  modernContainer: {
    flex: 1,
    position: 'relative',
    // backgroundColor: '#f8fafc',
    // paddingTop: Platform.OS === 'android' ? 16 : 0,
  },
  
  modernStatusBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 20,
    zIndex: 1,
    position: 'relative',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.05)',
  },
  
  statusLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  
  connectionDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  
  connectionStatus: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
  },
  
  sessionInfo: {
    alignItems: 'flex-end',
  },
  
  topActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  
  topEndButton: {
    marginLeft: 12,
    padding: 4,
  },
  
  scrollContainer: {
    flex: 1,
    position: 'relative',
  },
  
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 20,
  },
  
  sessionCounter: {
    fontSize: 13,
    fontWeight: '400',
    color: '#6b7280',
  },
  
  centralFocusArea: {
    // minHeight: 400, // Changed from flex: 1 to a minimum height
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 32,
    marginTop: -20,
    marginBottom: 20,
    zIndex: 10,
  },
  
  milesSection: {
    alignItems: 'center',
    marginBottom: 48,
  },
  
  milesAvatarContainer: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  
glowRing: {
    position: 'absolute',
    borderRadius: 80,
    borderWidth: 2,
  },
  
  outerGlow: {
    width: 160,
    height: 160,
    borderColor: 'rgba(99, 102, 241, 0.2)',
  },
  
  middleGlow: {
    width: 145,
    height: 145,
    borderColor: 'rgba(99, 102, 241, 0.3)',
  },
  
  innerGlow: {
    width: 130,
    height: 130,
    borderColor: 'rgba(99, 102, 241, 0.4)',
  },
  
  milesAvatar: {
    width: 120,
    height: 120,
    padding: 0,
    // borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: -40,
    zIndex: 10,
    position: 'relative'
    
  },
  
  avatarContent: {
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },

  avatarLogo: {
    width: 125,
    height: 125,
  },

  speakingIndicator: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#34C759',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'white',
  },

  speakingDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  
  avatarMainIcon: {
    marginBottom: 4,
  },
  
  avatarChatIcon: {
    position: 'absolute',
    bottom: -8,
    right: -8,
  },
  
  milesInfo: {
    alignItems: 'center',
  },
  
  milesName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 4,
  },
  
  milesRole: {
    fontSize: 16,
    fontWeight: '500',
    color: '#6b7280',
  },
  
  streamingTextArea: {
    width: '100%',
    // minHeight: 200,
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  streamingCard: {
    width: '100%',
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 24,
    paddingTop: 0,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
      },
      android: {
        elevation: 6,
      },
    }),
  },
  
  speakingIndicatorBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  
  speakingDots: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 20,
  },
  
  waveBar: {
    width: 3,
    backgroundColor: '#10b981',
    marginHorizontal: 2,
    borderRadius: 2,
  },
  
  speakingLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#10b981',
  },
  
  streamingText: {
    fontSize: 20,
    lineHeight: 28,
    color: '#1f2937',
    fontWeight: '400',
    textAlign: 'left',
  },
  
  typingCursor: {
    color: '#6366f1',
    fontWeight: '700',
    fontSize: 20,
  },
  
  lastMessageCard: {
    width: '100%',
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 24,
    borderLeftWidth: 4,
    borderLeftColor: '#10b981',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
      },
      android: {
        elevation: 6,
      },
    }),
  },
  
  messageHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  
  messageTypeIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  
  messageType: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6b7280',
  },
  
  lastMessageText: {
    fontSize: 18,
    lineHeight: 26,
    color: '#1f2937',
    fontWeight: '400',
  },
  
  waitingCard: {
    width: '100%',
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 32,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#e5e7eb',
    borderStyle: 'dashed',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  
  waitingText: {
    fontSize: 18,
    lineHeight: 26,
    color: '#374151',
    fontWeight: '500',
    textAlign: 'center',
    marginBottom: 8,
  },
  
  waitingSubtext: {
    fontSize: 15,
    lineHeight: 22,
    color: '#6b7280',
    fontWeight: '400',
    textAlign: 'center',
  },
  
  debugPanel: {
    position: 'absolute',
    bottom: 20, // Changed from 80 to 20 since there's no action area
    left: 20,
    right: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    padding: 12,
    borderRadius: 12,
  },
  
  debugText: {
    fontSize: 11,
    fontWeight: '500',
    color: 'white',
    marginBottom: 2,
    opacity: 0.9,
  },
  
  mainGradient: {
    flex: 1,
    borderRadius: 24,
    padding: 24,
  },
  errorGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 24,
    margin: 20,
  },
  
  // Error States
  errorContainer: {
    alignItems: 'center',
    padding: 32,
  },
  errorIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  errorTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: 'white',
    marginBottom: 8,
  },
  errorMessage: {
    fontSize: 16,
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 24,
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  retryIcon: {
    marginRight: 8,
  },
  retryButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: 'white',
  },
});

export default PersistentConversationView;
