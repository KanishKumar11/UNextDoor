import React, { useState } from "react";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../../../shared/context/ThemeContext";
import { Text, ModernCard } from "../../../shared/components";
import ttsService from "../../../shared/services/ttsService";

/**
 * VocabularySection component
 * Displays vocabulary items with audio pronunciation
 *
 * @param {Object} props - Component props
 * @param {Array} props.items - Vocabulary items
 * @param {string} props.title - Section title
 */
const VocabularySection = ({ items = [], title = "Vocabulary" }) => {
  const { theme } = useTheme();
  const [playingItem, setPlayingItem] = useState(null);
  const [isPlayingAll, setIsPlayingAll] = useState(false);

  // Normalize vocabulary item to standard format
  const normalizeVocabularyItem = (item) => {
    if (!item) return null;

    // Handle different vocabulary item formats
    if (item.korean) {
      // Standard format: { korean, romanization, english }
      return {
        korean: item.korean,
        romanization: item.romanization || "",
        english: item.english || "",
        example: item.example || "",
        sound: item.sound || "",
      };
    } else if (item.character) {
      // Alphabet format: { character, romanization, sound, example }
      return {
        korean: item.character,
        romanization: item.romanization || "",
        english: item.sound || "",
        example: item.example || "",
        sound: item.sound || "",
      };
    }

    return null;
  };

  // Handle individual item pronunciation
  const handlePlayItem = async (item, index) => {
    // Normalize the vocabulary item
    const normalizedItem = normalizeVocabularyItem(item);

    if (!normalizedItem || !normalizedItem.korean) {
      console.warn("Invalid vocabulary item for TTS:", item);
      Alert.alert(
        "Audio Error",
        "This vocabulary item cannot be played. Please try another one.",
        [{ text: "OK" }]
      );
      return;
    }

    const itemId = `${normalizedItem.korean}-${index}`;

    if (playingItem === itemId) {
      // Stop if already playing this item
      await ttsService.stop();
      setPlayingItem(null);
      return;
    }

    try {
      setPlayingItem(itemId);
      await ttsService.speakVocabulary(normalizedItem);
      setPlayingItem(null);
    } catch (error) {
      console.error("Error playing vocabulary item:", error);
      setPlayingItem(null);

      // Show a more helpful error message
      Alert.alert(
        "Audio Not Available",
        `Unable to play pronunciation for "${normalizedItem.korean}". This feature requires text-to-speech support on your device.`,
        [
          { text: "OK" },
          {
            text: "Learn More",
            onPress: () => {
              Alert.alert(
                "Text-to-Speech Info",
                "To enable audio pronunciation:\n\n• On Android: Go to Settings > Accessibility > Text-to-speech\n• On iOS: Go to Settings > Accessibility > Spoken Content\n• Make sure Korean language is installed",
                [{ text: "Got it" }]
              );
            },
          },
        ]
      );
    }
  };

  // Handle play all items
  const handlePlayAll = async () => {
    if (isPlayingAll) {
      await ttsService.stop();
      setIsPlayingAll(false);
      setPlayingItem(null);
      return;
    }

    // Normalize and validate all items before playing
    const normalizedItems = items
      .map((item) => normalizeVocabularyItem(item))
      .filter((item) => item && item.korean);
    if (normalizedItems.length === 0) {
      Alert.alert("Audio Error", "No valid vocabulary items found to play.", [
        { text: "OK" },
      ]);
      return;
    }

    try {
      setIsPlayingAll(true);
      setPlayingItem(null);
      await ttsService.speakVocabularyList(normalizedItems, 2000); // 2 second pause between items
      setIsPlayingAll(false);
    } catch (error) {
      console.error("Error playing all vocabulary items:", error);
      setIsPlayingAll(false);
      Alert.alert(
        "Audio Not Available",
        "Unable to play pronunciation for vocabulary items. This feature requires text-to-speech support on your device.",
        [
          { text: "OK" },
          {
            text: "Learn More",
            onPress: () => {
              Alert.alert(
                "Text-to-Speech Info",
                "To enable audio pronunciation:\n\n• On Android: Go to Settings > Accessibility > Text-to-speech\n• On iOS: Go to Settings > Accessibility > Spoken Content\n• Make sure Korean language is installed",
                [{ text: "Got it" }]
              );
            },
          },
        ]
      );
    }
  };

  // Render vocabulary item
  const renderVocabularyItem = (item, index) => {
    // Normalize the item for display and audio
    const normalizedItem = normalizeVocabularyItem(item);

    if (!normalizedItem || !normalizedItem.korean) {
      console.warn("Skipping invalid vocabulary item:", item);
      return null;
    }

    const itemId = `${normalizedItem.korean}-${index}`;
    const isPlaying = playingItem === itemId;

    return (
      <View key={index} style={styles.vocabularyItem}>
        <View style={styles.vocabularyContent}>
          <View style={styles.vocabularyText}>
            <Text weight="bold" style={styles.koreanText}>
              {normalizedItem.korean}
            </Text>
            <Text
              variant="caption"
              color={theme.colors.text?.secondary || "#666"}
              style={styles.romanizationText}
            >
              {normalizedItem.romanization}
            </Text>
            <Text style={styles.englishText}>{normalizedItem.english}</Text>
            {normalizedItem.example && (
              <Text
                variant="caption"
                color={theme.colors.text?.secondary || "#666"}
                style={styles.exampleText}
              >
                Example: {normalizedItem.example}
              </Text>
            )}
            {normalizedItem.sound && (
              <Text
                variant="caption"
                color={theme.colors.text?.secondary || "#666"}
                style={styles.soundText}
              >
                Sounds like {normalizedItem.sound}
              </Text>
            )}
          </View>

          <TouchableOpacity
            style={[styles.playButton, isPlaying && styles.playingButton]}
            onPress={() => handlePlayItem(item, index)}
            disabled={isPlayingAll}
          >
            {isPlaying ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Ionicons name="volume-high" size={20} color="#fff" />
            )}
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  if (!items || items.length === 0) {
    return null;
  }

  return (
    <ModernCard style={styles.container}>
      <View style={styles.header}>
        <Text weight="bold" style={styles.title}>
          {title}
        </Text>

        <TouchableOpacity
          style={[styles.playAllButton, isPlayingAll && styles.playingButton]}
          onPress={handlePlayAll}
          disabled={!!playingItem}
        >
          {isPlayingAll ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Ionicons name="play" size={16} color="#fff" />
          )}
          <Text color="#fff" style={styles.playAllText}>
            {isPlayingAll ? "Stop" : "Play All"}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.vocabularyList}>
        {items.map(renderVocabularyItem)}
      </View>
    </ModernCard>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
  },
  playAllButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#6FC935",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  playingButton: {
    backgroundColor: "#e74c3c",
  },
  playAllText: {
    fontSize: 12,
    marginLeft: 4,
  },
  vocabularyList: {
    gap: 12,
  },
  vocabularyItem: {
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
    paddingBottom: 12,
  },
  vocabularyContent: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
  },
  vocabularyText: {
    flex: 1,
    marginRight: 12,
  },
  koreanText: {
    fontSize: 20,
    marginBottom: 4,
    color: "#2c3e50",
  },
  romanizationText: {
    fontSize: 14,
    marginBottom: 2,
    fontStyle: "italic",
  },
  englishText: {
    fontSize: 16,
    marginBottom: 4,
    color: "#34495e",
  },
  exampleText: {
    fontSize: 12,
    lineHeight: 16,
    marginTop: 4,
  },
  soundText: {
    fontSize: 12,
    fontStyle: "italic",
    marginTop: 2,
  },
  playButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#6FC935",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
});

export default VocabularySection;
