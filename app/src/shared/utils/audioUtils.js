/**
 * Audio utilities for the app
 * Uses expo-audio with proper hook-based API
 */

import { Platform } from "react-native";
import { AudioModule, RecordingPresets } from "expo-audio";

// Import expo-av for sound playback (expo-audio doesn't have sound playback yet)
let ExpoAVAudio = null;
try {
  const ExpoAV = require("expo-av");
  ExpoAVAudio = ExpoAV.Audio;
  console.log("✅ expo-av Audio imported for sound playback");
} catch (error) {
  console.error("❌ Failed to import expo-av:", error);
}

// Recording options presets for expo-audio
export const RECORDING_OPTIONS_PRESETS = {
  HIGH_QUALITY: RecordingPresets.HIGH_QUALITY,
  LOW_QUALITY: RecordingPresets.LOW_QUALITY,
};

/**
 * Get expo-audio recording options
 * @returns {Object} - expo-audio recording options
 */
export const getRecordingOptions = () => {
  // Use expo-audio's built-in presets
  return RecordingPresets.HIGH_QUALITY;
};

/**
 * Request audio recording permissions using expo-audio
 * @returns {Promise<Object>} - Promise resolving to { status, canAskAgain, granted }
 */
export const requestRecordingPermissions = async () => {
  try {
    console.log("🎤 Requesting audio recording permissions...");

    // Use expo-audio's AudioModule for permissions
    const result = await AudioModule.requestRecordingPermissionsAsync();
    console.log("🎤 Permission result:", result);

    return {
      status: result.granted ? "granted" : "denied",
      canAskAgain: result.canAskAgain !== false,
      granted: result.granted,
    };
  } catch (error) {
    console.error("❌ Error requesting recording permissions:", error);
    return { status: "denied", canAskAgain: false, granted: false };
  }
};

/**
 * Set audio mode for the app (simplified for expo-audio)
 * @param {Object} options - Audio mode options
 * @returns {Promise<void>}
 */
export const setAudioMode = async (options = {}) => {
  try {
    console.log("🎵 Setting audio mode with options:", options);

    // expo-audio doesn't have setAudioModeAsync, so we'll use expo-av if available
    if (ExpoAVAudio && ExpoAVAudio.setAudioModeAsync) {
      const audioModeConfig = {
        allowsRecordingIOS: options.allowsRecordingIOS || false,
        playsInSilentModeIOS: options.playsInSilentModeIOS !== undefined ? options.playsInSilentModeIOS : true,
        staysActiveInBackground: options.staysActiveInBackground || false,
        // interruptionModeIOS: ExpoAVAudio.INTERRUPTION_MODE_IOS_DO_NOT_MIX,
        shouldDuckAndroid: options.shouldDuckAndroid !== undefined ? options.shouldDuckAndroid : true,
        // interruptionModeAndroid: ExpoAVAudio.INTERRUPTION_MODE_ANDROID_DO_NOT_MIX,
        playThroughEarpieceAndroid: false,
      };

      console.log("🎵 Final audio mode config:", audioModeConfig);
      await ExpoAVAudio.setAudioModeAsync(audioModeConfig);
      console.log("✅ Audio mode set successfully");
    } else {
      console.warn("⚠️ setAudioModeAsync not available");
    }
  } catch (error) {
    console.error("❌ Error setting audio mode:", error);
    console.error("❌ Audio mode config that failed:", audioModeConfig);
    // Don't throw error as this is not critical for basic functionality
  }
};

/**
 * Create a sound object using expo-av
 * @param {Object} source - Sound source (URI or require())
 * @param {Object} initialStatus - Initial playback status
 * @param {Function} onPlaybackStatusUpdate - Status update callback
 * @returns {Promise<Object>} - Promise resolving to { sound, status }
 */
export const createSound = async (source, initialStatus = {}, onPlaybackStatusUpdate = null) => {
  try {
    console.log("🔊 Creating sound from source:", source);

    if (!ExpoAVAudio || !ExpoAVAudio.Sound) {
      throw new Error("expo-av Sound is not available");
    }

    const sound = new ExpoAVAudio.Sound();
    await sound.loadAsync(source, initialStatus);

    if (onPlaybackStatusUpdate) {
      sound.setOnPlaybackStatusUpdate(onPlaybackStatusUpdate);
    }

    console.log("✅ Sound created successfully");
    return { sound };
  } catch (error) {
    console.error("❌ Error creating sound:", error);
    throw error;
  }
};

// Export a compatibility layer for expo-audio
export const Audio = {
  Sound: {
    createAsync: createSound,
  },
  setAudioModeAsync: setAudioMode,
  requestPermissionsAsync: requestRecordingPermissions,
  getPermissionsAsync: () => AudioModule.getRecordingPermissionsAsync ? AudioModule.getRecordingPermissionsAsync() : null,
  RecordingOptionsPresets: RECORDING_OPTIONS_PRESETS,
};

// Export individual functions for direct use
export {
  setAudioMode as setAudioModeAsync,
  requestRecordingPermissions as requestPermissionsAsync,
  RECORDING_OPTIONS_PRESETS as RecordingOptionsPresets,
};

// Export expo-audio specific functions
export { AudioModule, RecordingPresets };
