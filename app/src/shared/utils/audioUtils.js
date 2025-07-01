/**
 * Audio utilities for the app
 * This file provides a compatibility layer using React Native's PermissionsAndroid
 */

import * as ExpoAudio from "expo-audio";
import { Platform, PermissionsAndroid } from "react-native";

// Audio recording options presets
export const RECORDING_OPTIONS_PRESETS = {
  HIGH_QUALITY: {
    android: {
      extension: ".m4a",
      outputFormat: "mpeg_4",
      audioEncoder: "aac",
      sampleRate: 44100,
      numberOfChannels: 2,
      bitRate: 128000,
    },
    ios: {
      extension: ".m4a",
      outputFormat: "mpeg4_aac",
      audioQuality: "high",
      sampleRate: 44100,
      numberOfChannels: 2,
      bitRate: 128000,
      linearPCM: false,
    },
    web: {},
  },
};

// Audio interruption modes
export const INTERRUPTION_MODE = {
  IOS_MIX_WITH_OTHERS: 0,
  IOS_DO_NOT_MIX: 1,
  IOS_DUCK_OTHERS: 2,
  ANDROID_DO_NOT_MIX: 1,
  ANDROID_DUCK_OTHERS: 2,
};

/**
 * Request audio recording permissions using platform-specific APIs
 * @returns {Promise<Object>} - Promise resolving to { status, canAskAgain, granted }
 */
export const requestRecordingPermissions = async () => {
  try {
    if (Platform.OS === "android") {
      // Use React Native's PermissionsAndroid for Android
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
        {
          title: "Audio Recording Permission",
          message:
            "This app needs access to your microphone to record pronunciation.",
          buttonNeutral: "Ask Me Later",
          buttonNegative: "Cancel",
          buttonPositive: "OK",
        }
      );

      const isGranted = granted === PermissionsAndroid.RESULTS.GRANTED;
      return {
        status: isGranted ? "granted" : "denied",
        granted: isGranted,
        canAskAgain: granted !== PermissionsAndroid.RESULTS.NEVER_ASK_AGAIN,
      };
    } else if (Platform.OS === "ios") {
      // For iOS, try different approaches
      try {
        // Try expo-audio first
        if (ExpoAudio.requestPermissionsAsync) {
          return await ExpoAudio.requestPermissionsAsync();
        }

        // Try expo-av as fallback
        const { Audio: ExpoAV } = require("expo-av");
        if (ExpoAV && ExpoAV.requestPermissionsAsync) {
          return await ExpoAV.requestPermissionsAsync();
        }

        // If neither works, return success for development
        console.warn("Using mock permissions for iOS development");
        return {
          status: "granted",
          granted: true,
          canAskAgain: true,
        };
      } catch (error) {
        console.warn("iOS permissions request failed, using mock:", error);
        return {
          status: "granted",
          granted: true,
          canAskAgain: true,
        };
      }
    } else {
      // Web or other platforms
      try {
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
          await navigator.mediaDevices.getUserMedia({ audio: true });
          return {
            status: "granted",
            granted: true,
            canAskAgain: true,
          };
        }
      } catch (error) {
        console.error("Web audio permissions denied:", error);
        return {
          status: "denied",
          granted: false,
          canAskAgain: true,
        };
      }

      return {
        status: "granted",
        granted: true,
        canAskAgain: true,
      };
    }
  } catch (error) {
    console.error("Error requesting recording permissions:", error);

    // Return mock permissions for development
    return {
      status: "granted",
      granted: true,
      canAskAgain: true,
    };
  }
};

/**
 * Create a sound object from a source
 * @param {Object} source - The audio source (e.g., { uri: 'https://example.com/audio.mp3' })
 * @param {Object} initialStatus - Initial playback status
 * @param {Function} onPlaybackStatusUpdate - Callback for playback status updates
 * @returns {Promise<Object>} - Promise resolving to { sound } object
 */
export const createSound = async (
  source,
  initialStatus = {},
  onPlaybackStatusUpdate = null
) => {
  try {
    const sound = new ExpoAudio.Sound();

    await sound.loadAsync(source, initialStatus);

    if (onPlaybackStatusUpdate) {
      sound.setOnPlaybackStatusUpdate(onPlaybackStatusUpdate);
    }

    return { sound };
  } catch (error) {
    console.error("Error creating sound:", error);
    throw error;
  }
};

/**
 * Set audio mode for the app
 * @param {Object} options - Audio mode options
 * @returns {Promise<void>}
 */
export const setAudioMode = async (options = {}) => {
  const defaultOptions = {
    allowsRecordingIOS: false,
    playsInSilentModeIOS: true,
    staysActiveInBackground: false,
    interruptionModeIOS: INTERRUPTION_MODE.IOS_DO_NOT_MIX,
    interruptionModeAndroid: INTERRUPTION_MODE.ANDROID_DO_NOT_MIX,
  };

  const mergedOptions = { ...defaultOptions, ...options };

  try {
    if (ExpoAudio.setAudioModeAsync) {
      await ExpoAudio.setAudioModeAsync(mergedOptions);
    } else {
      console.warn("setAudioModeAsync not available in expo-audio");
    }
  } catch (error) {
    console.error("Error setting audio mode:", error);
    // Don't throw error as this is not critical for basic functionality
  }
};

/**
 * Create a recording object
 * @returns {Object} - Recording object
 */
export const createRecording = () => {
  return new ExpoAudio.Recording();
};

/**
 * Prepare a recording with options
 * @param {Object} recording - Recording object
 * @param {Object} options - Recording options
 * @returns {Promise<void>}
 */
export const prepareRecording = async (
  recording,
  options = RECORDING_OPTIONS_PRESETS.HIGH_QUALITY
) => {
  try {
    await recording.prepareToRecordAsync(options);
  } catch (error) {
    console.error("Error preparing recording:", error);
    throw error;
  }
};

/**
 * Start a recording
 * @param {Object} recording - Recording object
 * @returns {Promise<void>}
 */
export const startRecording = async (recording) => {
  try {
    await recording.startAsync();
  } catch (error) {
    console.error("Error starting recording:", error);
    throw error;
  }
};

/**
 * Stop a recording
 * @param {Object} recording - Recording object
 * @returns {Promise<void>}
 */
export const stopRecording = async (recording) => {
  try {
    await recording.stopAsync();
  } catch (error) {
    console.error("Error stopping recording:", error);
    throw error;
  }
};

/**
 * Get the URI of a recording
 * @param {Object} recording - Recording object
 * @returns {string} - URI of the recording
 */
export const getRecordingUri = (recording) => {
  return recording.getURI();
};

/**
 * Unload a recording
 * @param {Object} recording - Recording object
 * @returns {Promise<void>}
 */
export const unloadRecording = async (recording) => {
  try {
    await recording.unloadAsync();
  } catch (error) {
    console.error("Error unloading recording:", error);
    throw error;
  }
};

// Export a compatibility layer for expo-av
export const Audio = {
  Sound: {
    createAsync: createSound,
  },
  Recording: ExpoAudio.Recording,
  setAudioModeAsync: setAudioMode,
  requestPermissionsAsync: requestRecordingPermissions,
  RecordingOptionsPresets: RECORDING_OPTIONS_PRESETS,
  INTERRUPTION_MODE,
};
