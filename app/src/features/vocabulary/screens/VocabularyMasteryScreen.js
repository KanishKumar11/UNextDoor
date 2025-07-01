import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import SafeAreaWrapper from '../../../shared/components/SafeAreaWrapper';
import {
  Container,
  Heading,
  Text,
  ModernButton,
  ModernCard,
  Row,
  Column,
  Spacer,
  ModernProgressBar,
} from '../../../shared/components';
import modernTheme from '../../../shared/styles/modernTheme';
import { vocabularyService } from '../services/vocabularyService';

/**
 * VocabularyMasteryScreen
 * Screen for displaying vocabulary mastery progress
 */
const VocabularyMasteryScreen = () => {
  const router = useRouter();
  
  // State
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState(null);
  const [masteryData, setMasteryData] = useState(null);
  const [reviewWords, setReviewWords] = useState([]);
  
  // Load vocabulary mastery data
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // Load vocabulary statistics
        const statsResponse = await vocabularyService.getVocabularyStatistics();
        if (statsResponse.success) {
          setStats(statsResponse.statistics);
        } else {
          setError('Failed to load vocabulary statistics');
        }
        
        // Load vocabulary mastery
        const masteryResponse = await vocabularyService.getVocabularyMastery();
        if (masteryResponse.success) {
          setMasteryData(masteryResponse.vocabularyMastery);
        }
        
        // Load words due for review
        const reviewResponse = await vocabularyService.getWordsForReview(5);
        if (reviewResponse.success) {
          setReviewWords(reviewResponse.words);
        }
        
        setIsLoading(false);
      } catch (err) {
        console.error('Error loading vocabulary mastery:', err);
        setError('Failed to load vocabulary data. Please try again.');
        setIsLoading(false);
      }
    };
    
    loadData();
  }, []);
  
  // Navigate to Match the Word game
  const handlePlayMatchWord = (difficulty) => {
    router.push(`/vocabulary/match-word?difficulty=${difficulty}`);
  };
  
  // Render loading state
  if (isLoading) {
    return (
      <SafeAreaWrapper>
        <Container withPadding>
          <Column align="center" justify="center" style={{ flex: 1 }}>
            <ActivityIndicator size="large" color={modernTheme.colors.primary[500]} />
            <Spacer size="md" />
            <Text>Loading vocabulary data...</Text>
          </Column>
        </Container>
      </SafeAreaWrapper>
    );
  }
  
  // Render error state
  if (error) {
    return (
      <SafeAreaWrapper>
        <Container withPadding>
          <Column align="center" justify="center" style={{ flex: 1 }}>
            <Ionicons
              name="alert-circle-outline"
              size={48}
              color={modernTheme.colors.error[500]}
            />
            <Spacer size="md" />
            <Text>{error}</Text>
            <Spacer size="lg" />
            <ModernButton
              text="Try Again"
              variant="primary"
              onPress={() => router.reload()}
            />
          </Column>
        </Container>
      </SafeAreaWrapper>
    );
  }
  
  return (
    <SafeAreaWrapper>
      <Container>
        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Header */}
          <View style={styles.header}>
            <Heading level="h1">Vocabulary Mastery</Heading>
            <Text color="neutral.600">
              Track your progress in learning Korean vocabulary
            </Text>
          </View>
          
          {/* Overall progress */}
          <ModernCard style={styles.card}>
            <Heading level="h3">Overall Progress</Heading>
            <Spacer size="sm" />
            
            <Row justify="space-between" align="center">
              <Text weight="semibold">Total Words</Text>
              <Text>{stats?.totalWords || 0}</Text>
            </Row>
            
            <Row justify="space-between" align="center">
              <Text weight="semibold">Mastered Words</Text>
              <Text>{stats?.masteredWords || 0}</Text>
            </Row>
            
            <Spacer size="sm" />
            
            <ModernProgressBar
              progress={stats?.masteryPercentage || 0}
              height={8}
              color={modernTheme.colors.primary[500]}
            />
            
            <Text size="sm" align="right" style={{ marginTop: 4 }}>
              {Math.round(stats?.masteryPercentage || 0)}% Mastered
            </Text>
          </ModernCard>
          
          {/* Progress by level */}
          <ModernCard style={styles.card}>
            <Heading level="h3">Progress by Level</Heading>
            <Spacer size="md" />
            
            {/* Beginner */}
            <View style={styles.levelContainer}>
              <Row justify="space-between" align="center">
                <Text weight="semibold" color="success.700">Beginner</Text>
                <Text>
                  {stats?.byLevel?.beginner?.mastered || 0} of{' '}
                  {stats?.byLevel?.beginner?.total || 0} words
                </Text>
              </Row>
              
              <Spacer size="xs" />
              
              <ModernProgressBar
                progress={stats?.byLevel?.beginner?.percentage || 0}
                height={8}
                color={modernTheme.colors.success[500]}
              />
              
              <Spacer size="xs" />
              
              <ModernButton
                text="Practice Beginner Words"
                variant="outline"
                size="sm"
                onPress={() => handlePlayMatchWord('beginner')}
              />
            </View>
            
            <Spacer size="md" />
            
            {/* Intermediate */}
            <View style={styles.levelContainer}>
              <Row justify="space-between" align="center">
                <Text weight="semibold" color="warning.700">Intermediate</Text>
                <Text>
                  {stats?.byLevel?.intermediate?.mastered || 0} of{' '}
                  {stats?.byLevel?.intermediate?.total || 0} words
                </Text>
              </Row>
              
              <Spacer size="xs" />
              
              <ModernProgressBar
                progress={stats?.byLevel?.intermediate?.percentage || 0}
                height={8}
                color={modernTheme.colors.warning[500]}
              />
              
              <Spacer size="xs" />
              
              <ModernButton
                text="Practice Intermediate Words"
                variant="outline"
                size="sm"
                onPress={() => handlePlayMatchWord('intermediate')}
              />
            </View>
            
            <Spacer size="md" />
            
            {/* Advanced */}
            <View style={styles.levelContainer}>
              <Row justify="space-between" align="center">
                <Text weight="semibold" color="error.700">Advanced</Text>
                <Text>
                  {stats?.byLevel?.advanced?.mastered || 0} of{' '}
                  {stats?.byLevel?.advanced?.total || 0} words
                </Text>
              </Row>
              
              <Spacer size="xs" />
              
              <ModernProgressBar
                progress={stats?.byLevel?.advanced?.percentage || 0}
                height={8}
                color={modernTheme.colors.error[500]}
              />
              
              <Spacer size="xs" />
              
              <ModernButton
                text="Practice Advanced Words"
                variant="outline"
                size="sm"
                onPress={() => handlePlayMatchWord('advanced')}
              />
            </View>
          </ModernCard>
          
          {/* Words due for review */}
          {reviewWords.length > 0 && (
            <ModernCard style={styles.card}>
              <Heading level="h3">Words Due for Review</Heading>
              <Spacer size="sm" />
              
              {reviewWords.map((word, index) => (
                <View key={index} style={styles.wordItem}>
                  <Row justify="space-between" align="center">
                    <Text weight="semibold">{word.word}</Text>
                    <Text>{word.translation}</Text>
                  </Row>
                  
                  <Row justify="space-between" align="center">
                    <Text size="sm" color="neutral.500">
                      Familiarity: {word.familiarity.toFixed(1)}/5
                    </Text>
                    <Text size="sm" color="neutral.500">
                      Last practiced: {new Date(word.lastPracticed).toLocaleDateString()}
                    </Text>
                  </Row>
                  
                  {index < reviewWords.length - 1 && <View style={styles.divider} />}
                </View>
              ))}
              
              <Spacer size="md" />
              
              <ModernButton
                text="Review All Words"
                variant="primary"
                onPress={() => handlePlayMatchWord('beginner')}
              />
            </ModernCard>
          )}
        </ScrollView>
      </Container>
    </SafeAreaWrapper>
  );
};

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  card: {
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 16,
  },
  levelContainer: {
    width: '100%',
  },
  wordItem: {
    marginBottom: 8,
  },
  divider: {
    height: 1,
    backgroundColor: modernTheme.colors.neutral[200],
    marginVertical: 8,
  },
});

export default VocabularyMasteryScreen;
