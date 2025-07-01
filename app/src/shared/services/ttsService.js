import { AudioModule } from "expo-audio";
import * as Speech from "expo-speech";
import { Platform } from "react-native";

/**
 * Text-to-Speech Service
 * Handles pronunciation of Korean text using device TTS or fallback methods
 */
class TTSService {
  constructor() {
    this.isInitialized = false;
    this.sound = null;
  }

  /**
   * Initialize the TTS service
   */
  async initialize() {
    try {
      // Set audio mode for playback
      await AudioModule.setAudioModeAsync({
        allowsRecordingIOS: false,
        staysActiveInBackground: false,
        playsInSilentModeIOS: true,
        shouldDuckAndroid: true,
        playThroughEarpieceAndroid: false,
      });

      this.isInitialized = true;
      console.log("TTS Service initialized");
    } catch (error) {
      console.error("Error initializing TTS service:", error);
    }
  }

  /**
   * Check if Speech is available
   */
  async isSpeechAvailable() {
    try {
      if (Platform.OS === "web") {
        return typeof window !== "undefined" && "speechSynthesis" in window;
      } else {
        // Check if expo-speech is available
        return Speech && typeof Speech.speak === "function";
      }
    } catch (error) {
      console.error("Error checking speech availability:", error);
      return false;
    }
  }

  /**
   * Speak Korean text using device TTS
   * @param {string} text - Korean text to speak
   * @param {Object} options - TTS options
   */
  async speak(text, options = {}) {
    if (!this.isInitialized) {
      await this.initialize();
    }

    if (!text || typeof text !== "string" || text.trim().length === 0) {
      throw new Error("Invalid text for TTS");
    }

    const cleanText = text.trim();
    console.log("Attempting to speak:", cleanText);

    try {
      // Check if speech is available
      const speechAvailable = await this.isSpeechAvailable();
      if (!speechAvailable) {
        throw new Error("Speech synthesis not available");
      }

      if (Platform.OS === "web") {
        // Web fallback - use Web Speech API
        if (typeof window !== "undefined" && window.speechSynthesis) {
          return new Promise((resolve, reject) => {
            const utterance = new SpeechSynthesisUtterance(cleanText);
            utterance.lang = "ko-KR";
            utterance.rate = options.rate || 0.8;
            utterance.pitch = options.pitch || 1.0;

            // Try to find a Korean voice
            const voices = window.speechSynthesis.getVoices();
            const koreanVoice = voices.find((voice) =>
              voice.lang.startsWith("ko")
            );
            if (koreanVoice) {
              utterance.voice = koreanVoice;
            }

            utterance.onend = () => resolve();
            utterance.onerror = (error) => reject(error);

            window.speechSynthesis.speak(utterance);
          });
        } else {
          throw new Error("Web Speech API not available");
        }
      } else {
        // Mobile platforms - use expo-speech
        if (!Speech || typeof Speech.speak !== "function") {
          throw new Error("expo-speech not available");
        }

        return new Promise((resolve, reject) => {
          Speech.speak(cleanText, {
            language: "ko-KR", // Korean language code
            pitch: options.pitch || 1.0,
            rate: options.rate || 0.8, // Slower rate for learning
            voice: options.voice || undefined,
            onDone: () => {
              console.log("Speech completed successfully");
              resolve();
            },
            onStopped: () => {
              console.log("Speech stopped");
              resolve();
            },
            onError: (error) => {
              console.error("Speech error:", error);
              reject(new Error(`Speech synthesis failed: ${error}`));
            },
          });
        });
      }
    } catch (error) {
      console.error("Error speaking text:", error);
      throw new Error(`Audio playback not available: ${error.message}`);
    }
  }

  /**
   * Stop current speech
   */
  async stop() {
    try {
      if (
        Platform.OS === "web" &&
        typeof window !== "undefined" &&
        window.speechSynthesis
      ) {
        window.speechSynthesis.cancel();
      } else {
        if (Speech && typeof Speech.stop === "function") {
          await Speech.stop();
        }
      }
    } catch (error) {
      console.error("Error stopping speech:", error);
    }
  }

  /**
   * Check if TTS is available
   */
  async isAvailable() {
    return await this.isSpeechAvailable();
  }

  /**
   * Get available voices for Korean
   */
  async getKoreanVoices() {
    try {
      if (
        Platform.OS === "web" &&
        typeof window !== "undefined" &&
        window.speechSynthesis
      ) {
        const voices = window.speechSynthesis.getVoices();
        return voices.filter((voice) => voice.lang.startsWith("ko"));
      } else {
        // For mobile platforms, return empty array as voice selection is handled by the system
        return [];
      }
    } catch (error) {
      console.error("Error getting Korean voices:", error);
      return [];
    }
  }

  /**
   * Speak vocabulary item with Korean pronunciation
   * @param {Object} vocabularyItem - Vocabulary item with korean, romanization, english
   */
  async speakVocabulary(vocabularyItem) {
    if (!vocabularyItem || typeof vocabularyItem !== "object") {
      console.warn("Invalid vocabulary item for TTS: item is not an object");
      throw new Error("Invalid vocabulary item: not an object");
    }

    if (!vocabularyItem.korean || typeof vocabularyItem.korean !== "string") {
      console.warn(
        "Invalid vocabulary item for TTS: missing or invalid korean text",
        vocabularyItem
      );
      throw new Error("Invalid vocabulary item: missing korean text");
    }

    if (vocabularyItem.korean.trim().length === 0) {
      console.warn("Invalid vocabulary item for TTS: empty korean text");
      throw new Error("Invalid vocabulary item: empty korean text");
    }

    try {
      // Speak the Korean text
      await this.speak(vocabularyItem.korean.trim(), {
        rate: 0.7, // Slower for learning
        pitch: 1.0,
      });
    } catch (error) {
      console.error("Error speaking vocabulary:", error);
      throw error;
    }
  }

  /**
   * Speak a list of vocabulary items with pauses
   * @param {Array} vocabularyItems - Array of vocabulary items
   * @param {number} pauseDuration - Pause between items in milliseconds
   */
  async speakVocabularyList(vocabularyItems, pauseDuration = 1500) {
    if (!Array.isArray(vocabularyItems)) {
      console.warn("Invalid vocabulary items list for TTS: not an array");
      return;
    }

    for (let i = 0; i < vocabularyItems.length; i++) {
      try {
        const item = vocabularyItems[i];

        // Validate item before attempting to speak
        if (!item || typeof item !== "object" || !item.korean) {
          console.warn(`Skipping invalid vocabulary item at index ${i}:`, item);
          continue;
        }

        await this.speakVocabulary(item);

        // Add pause between items (except for the last one)
        if (i < vocabularyItems.length - 1) {
          await new Promise((resolve) => setTimeout(resolve, pauseDuration));
        }
      } catch (error) {
        console.error(`Error speaking vocabulary item ${i}:`, error);
        // Continue with next item even if one fails
      }
    }
  }

  /**
   * Clean up resources
   */
  async cleanup() {
    try {
      await this.stop();

      if (this.sound) {
        await this.sound.unloadAsync();
        this.sound = null;
      }
    } catch (error) {
      console.error("Error cleaning up TTS service:", error);
    }
  }
}

// Create singleton instance
const ttsService = new TTSService();

export default ttsService;
