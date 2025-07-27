import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Pressable
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../../shared/context/ThemeContext';
import {
  Text,
  ModernButton,
} from '../../../shared/components';
import { Audio } from 'expo-av';
import { BRAND_COLORS } from '../../../shared/constants/colors';

/**
 * LessonReviewScreen component
 * Displays a review of vocabulary and phrases learned in a lesson
 * 
 * @param {Object} props - Component props
 * @param {string} props.title - Review title
 * @param {string} props.description - Review description
 * @param {Array} props.vocabulary - Array of vocabulary items
 * @param {Function} props.onContinue - Function to call when continue button is pressed
 * @param {Function} props.onClose - Function to call when close button is pressed
 */
const LessonReviewScreen = ({
  title = 'Review',
  description = "Let's review what you've learned in this lesson. This will help you remember the new words and phrases.",
  vocabulary = [],
  onContinue,
  onClose,
}) => {
  const router = useRouter();
  const { theme } = useTheme();
  const [playingAudio, setPlayingAudio] = useState(null);
  const [sound, setSound] = useState(null);

  // Play audio for a vocabulary item
  const playAudio = async (audioUrl, itemId) => {
    try {
      // Stop any currently playing audio
      if (sound) {
        await sound.stopAsync();
        await sound.unloadAsync();
      }

      // Load and play the new audio
      const { sound: newSound } = await Audio.Sound.createAsync(
        { uri: audioUrl },
        { shouldPlay: true }
      );

      setSound(newSound);
      setPlayingAudio(itemId);

      // When audio finishes playing
      newSound.setOnPlaybackStatusUpdate((status) => {
        if (status.didJustFinish) {
          setPlayingAudio(null);
        }
      });
    } catch (error) {
      console.error('Error playing audio:', error);
      setPlayingAudio(null);
    }
  };

  // Render a vocabulary item
  const renderVocabularyItem = (item, index) => {
    const isPlaying = playingAudio === item.id;

    return (
      <View key={item.id || index} style={styles.vocabularyItem}>
        <TouchableOpacity
          style={styles.audioButton}
          onPress={() => playAudio(item.audioUrl, item.id)}
        >
          <Ionicons
            name={isPlaying ? "volume-high" : "volume-medium"}
            size={24}
            color={BRAND_COLORS.EXPLORER_TEAL}
          />
        </TouchableOpacity>

        <View style={styles.vocabularyContent}>
          <Text style={styles.koreanText}>{item.korean}</Text>
          <Text style={styles.englishText}>{item.english}</Text>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.closeButton}
          onPress={onClose || (() => router.back())}
        >
          <Ionicons name="close" size={24} color="#000" />
        </TouchableOpacity>

        <View style={styles.titleContainer}>
          <Text style={styles.title}>{title}</Text>
        </View>

        <View style={styles.headerRight} />
      </View>

      <ScrollView style={styles.content}>
        {/* Description */}
        <View style={styles.descriptionContainer}>
          <Text style={styles.lessonTitle}>Lesson Review</Text>
          <Text style={styles.description}>{description}</Text>
        </View>

        {/* Vocabulary section */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Vocabulary</Text>

          <View style={styles.vocabularyList}>
            {vocabulary.length > 0 ? (
              vocabulary.map(renderVocabularyItem)
            ) : (
              // Sample vocabulary items for preview
              [
                { id: '1', korean: '안녕하세요', english: 'Hello', audioUrl: 'https://example.com/audio1.mp3' },
                { id: '2', korean: '안녕히 가세요', english: 'Goodbye', audioUrl: 'https://example.com/audio2.mp3' },
                { id: '3', korean: '감사합니다', english: 'Thank you', audioUrl: 'https://example.com/audio3.mp3' },
                { id: '4', korean: '실례합니다', english: 'Excuse me', audioUrl: 'https://example.com/audio4.mp3' },
                { id: '5', korean: '네', english: 'Yes', audioUrl: 'https://example.com/audio5.mp3' },
                { id: '6', korean: '아니오', english: 'No', audioUrl: 'https://example.com/audio6.mp3' },
              ].map(renderVocabularyItem)
            )}
          </View>
        </View>
      </ScrollView>

      {/* Continue button */}
      <View style={styles.continueButtonContainer}>
        <ModernButton
          text="Continue"
          onPress={onContinue || (() => router.push('/'))}
          style={styles.continueButton}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#EFEFEF',
  },
  closeButton: {
    padding: 8,
  },
  titleContainer: {
    flex: 1,
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
  },
  headerRight: {
    width: 40,
  },
  content: {
    flex: 1,
  },
  descriptionContainer: {
    padding: 20,
  },
  lessonTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  description: {
    fontSize: 16,
    color: '#555',
    lineHeight: 24,
  },
  sectionContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 16,
  },
  vocabularyList: {
    backgroundColor: '#F9F9F9',
    borderRadius: 12,
    padding: 16,
  },
  vocabularyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#EFEFEF',
  },
  audioButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F0F0F0',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  vocabularyContent: {
    flex: 1,
  },
  koreanText: {
    fontSize: 18,
    fontWeight: '500',
    marginBottom: 4,
  },
  englishText: {
    fontSize: 14,
    color: '#6FC935', // Primary green color
  },
  continueButtonContainer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#EFEFEF',
  },
  continueButton: {
    backgroundColor: '#6FC935', // Primary green color
  },
});

export default LessonReviewScreen;
