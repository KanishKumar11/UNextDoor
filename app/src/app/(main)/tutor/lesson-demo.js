import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import LessonScreen from '../../../features/tutor/components/LessonScreen';
import LessonReviewScreen from '../../../features/tutor/components/LessonReviewScreen';
import { AI_TUTOR_NAME } from '../../../shared/constants/appConstants';

/**
 * LessonDemoScreen
 * Demonstrates the lesson and review screens
 */
export default function LessonDemoScreen() {
  const router = useRouter();
  const [showReview, setShowReview] = useState(false);
  
  // Sample messages for the lesson
  const sampleMessages = [
    {
      id: '1',
      sender: 'ai',
      text: "Let's learn how to say hello in Korean. In Korean, we say 'annyeonghaseyo'",
    },
    {
      id: '2',
      sender: 'ai',
      text: "안녕하세요 (annyeonghaseyo)",
    },
    {
      id: '3',
      sender: 'user',
      text: "안녕하세요",
    },
    {
      id: '4',
      sender: 'ai',
      text: "Great job! Now, let's practice saying it with the correct pronunciation.",
    },
  ];
  
  // Sample vocabulary for the review
  const sampleVocabulary = [
    { id: '1', korean: '안녕하세요', english: 'Hello', audioUrl: 'https://example.com/audio1.mp3' },
    { id: '2', korean: '안녕히 가세요', english: 'Goodbye', audioUrl: 'https://example.com/audio2.mp3' },
    { id: '3', korean: '감사합니다', english: 'Thank you', audioUrl: 'https://example.com/audio3.mp3' },
    { id: '4', korean: '실례합니다', english: 'Excuse me', audioUrl: 'https://example.com/audio4.mp3' },
    { id: '5', korean: '네', english: 'Yes', audioUrl: 'https://example.com/audio5.mp3' },
    { id: '6', korean: '아니오', english: 'No', audioUrl: 'https://example.com/audio6.mp3' },
  ];
  
  // Handle practice button press
  const handlePractice = () => {
    setShowReview(true);
  };
  
  // Handle continue button press
  const handleContinue = () => {
    router.back();
  };
  
  // Handle close button press
  const handleClose = () => {
    router.back();
  };
  
  return (
    <View style={styles.container}>
      {showReview ? (
        <LessonReviewScreen
          title="Review"
          description="Let's review what you've learned in this lesson. This will help you remember the new words and phrases."
          vocabulary={sampleVocabulary}
          onContinue={handleContinue}
          onClose={handleClose}
        />
      ) : (
        <LessonScreen
          title="Lesson 1"
          subtitle="Lesson 1: Greetings"
          messages={sampleMessages}
          onPractice={handlePractice}
          onClose={handleClose}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
