import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Text, Heading, ModernCard, Spacer, Row } from '../../../shared/components';
import modernTheme from '../../../shared/styles/modernTheme';
import { pronunciationService } from '../services/pronunciationService';

/**
 * PronunciationGuide component
 * Displays pronunciation guides and common challenges
 */
const PronunciationGuide = () => {
  // State
  const [phonemes, setPhonemes] = useState(null);
  const [commonChallenges, setCommonChallenges] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('vowels');
  const [expandedChallenge, setExpandedChallenge] = useState(null);
  
  // Load pronunciation challenges
  useEffect(() => {
    const loadPronunciationChallenges = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // Get pronunciation challenges from service
        const result = await pronunciationService.getPronunciationChallenges();
        
        if (result.success) {
          setPhonemes(result.phonemes);
          setCommonChallenges(result.commonChallenges);
        } else {
          // If API fails, use sample data
          const sampleData = pronunciationService.getSamplePronunciationChallenges();
          setPhonemes(sampleData.phonemes);
          setCommonChallenges(sampleData.commonChallenges);
          setError('Using sample data. ' + (result.error || 'Failed to load pronunciation challenges'));
        }
      } catch (err) {
        console.error('Error loading pronunciation challenges:', err);
        
        // Use sample data as fallback
        const sampleData = pronunciationService.getSamplePronunciationChallenges();
        setPhonemes(sampleData.phonemes);
        setCommonChallenges(sampleData.commonChallenges);
        setError('Using sample data. Failed to load pronunciation challenges');
      } finally {
        setIsLoading(false);
      }
    };
    
    loadPronunciationChallenges();
  }, []);
  
  // Toggle challenge expansion
  const toggleChallenge = (index) => {
    if (expandedChallenge === index) {
      setExpandedChallenge(null);
    } else {
      setExpandedChallenge(index);
    }
  };
  
  // Loading state
  if (isLoading) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color={modernTheme.colors.primary[500]} />
        <Text style={styles.loadingText}>Loading pronunciation guides...</Text>
      </View>
    );
  }
  
  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {error && (
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={20} color={modernTheme.colors.warning[500]} />
          <Text color="warning.500" style={styles.errorText}>
            {error}
          </Text>
        </View>
      )}
      
      <ModernCard style={styles.card}>
        <Heading level="h3" gutterBottom>
          Korean Pronunciation Guide
        </Heading>
        
        <Text color="neutral.700" style={styles.introText}>
          Korean pronunciation can be challenging for English speakers. This guide will help you understand the sounds of Korean and how to pronounce them correctly.
        </Text>
        
        <Spacer size="md" />
        
        {/* Tabs for vowels and consonants */}
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'vowels' && styles.activeTab]}
            onPress={() => setActiveTab('vowels')}
            activeOpacity={0.7}
          >
            <Text
              weight={activeTab === 'vowels' ? 'semibold' : 'regular'}
              color={activeTab === 'vowels' ? 'primary.700' : 'neutral.600'}
            >
              Vowels
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.tab, activeTab === 'consonants' && styles.activeTab]}
            onPress={() => setActiveTab('consonants')}
            activeOpacity={0.7}
          >
            <Text
              weight={activeTab === 'consonants' ? 'semibold' : 'regular'}
              color={activeTab === 'consonants' ? 'primary.700' : 'neutral.600'}
            >
              Consonants
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.tab, activeTab === 'challenges' && styles.activeTab]}
            onPress={() => setActiveTab('challenges')}
            activeOpacity={0.7}
          >
            <Text
              weight={activeTab === 'challenges' ? 'semibold' : 'regular'}
              color={activeTab === 'challenges' ? 'primary.700' : 'neutral.600'}
            >
              Common Challenges
            </Text>
          </TouchableOpacity>
        </View>
        
        <Spacer size="md" />
        
        {/* Vowels tab content */}
        {activeTab === 'vowels' && phonemes && phonemes.vowels && (
          <View style={styles.tabContent}>
            <Text weight="semibold" style={styles.sectionTitle}>
              Korean Vowels
            </Text>
            
            {phonemes.vowels.map((vowel, index) => (
              <View key={index} style={styles.phonemeItem}>
                <Row>
                  <View style={styles.phonemeChar}>
                    <Text size="xl" weight="bold">
                      {vowel.char}
                    </Text>
                  </View>
                  
                  <View style={styles.phonemeDetails}>
                    <Text weight="semibold">Romanized: {vowel.romanized}</Text>
                    <Text color="neutral.600" style={styles.commonIssues}>
                      {vowel.commonIssues}
                    </Text>
                  </View>
                </Row>
              </View>
            ))}
          </View>
        )}
        
        {/* Consonants tab content */}
        {activeTab === 'consonants' && phonemes && phonemes.consonants && (
          <View style={styles.tabContent}>
            <Text weight="semibold" style={styles.sectionTitle}>
              Korean Consonants
            </Text>
            
            {phonemes.consonants.map((consonant, index) => (
              <View key={index} style={styles.phonemeItem}>
                <Row>
                  <View style={styles.phonemeChar}>
                    <Text size="xl" weight="bold">
                      {consonant.char}
                    </Text>
                  </View>
                  
                  <View style={styles.phonemeDetails}>
                    <Text weight="semibold">Romanized: {consonant.romanized}</Text>
                    <Text color="neutral.600" style={styles.commonIssues}>
                      {consonant.commonIssues}
                    </Text>
                  </View>
                </Row>
              </View>
            ))}
          </View>
        )}
        
        {/* Common challenges tab content */}
        {activeTab === 'challenges' && commonChallenges && (
          <View style={styles.tabContent}>
            <Text weight="semibold" style={styles.sectionTitle}>
              Common Pronunciation Challenges
            </Text>
            
            {commonChallenges.map((challenge, index) => (
              <TouchableOpacity
                key={index}
                style={styles.challengeItem}
                onPress={() => toggleChallenge(index)}
                activeOpacity={0.7}
              >
                <Row justify="space-between" align="center">
                  <Text weight="semibold" style={styles.challengeTitle}>
                    {challenge.challenge}
                  </Text>
                  <Ionicons
                    name={expandedChallenge === index ? 'chevron-up' : 'chevron-down'}
                    size={20}
                    color={modernTheme.colors.neutral[600]}
                  />
                </Row>
                
                {expandedChallenge === index && (
                  <View style={styles.challengeTip}>
                    <Text color="primary.700">{challenge.tip}</Text>
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </View>
        )}
      </ModernCard>
      
      <Spacer size="xl" />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    margin: 16,
    padding: 12,
    backgroundColor: modernTheme.colors.warning[50],
    borderRadius: 8,
  },
  errorText: {
    marginLeft: 8,
  },
  card: {
    margin: 16,
    padding: 16,
  },
  introText: {
    lineHeight: 22,
  },
  tabContainer: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: modernTheme.colors.neutral[200],
  },
  tab: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginRight: 8,
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: modernTheme.colors.primary[500],
  },
  tabContent: {
    marginTop: 16,
  },
  sectionTitle: {
    marginBottom: 16,
  },
  phonemeItem: {
    marginBottom: 16,
    padding: 12,
    backgroundColor: modernTheme.colors.neutral[50],
    borderRadius: 8,
  },
  phonemeChar: {
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: modernTheme.colors.primary[100],
    borderRadius: 8,
    marginRight: 16,
  },
  phonemeDetails: {
    flex: 1,
    justifyContent: 'center',
  },
  commonIssues: {
    marginTop: 4,
  },
  challengeItem: {
    marginBottom: 12,
    padding: 16,
    backgroundColor: modernTheme.colors.neutral[50],
    borderRadius: 8,
  },
  challengeTitle: {
    flex: 1,
    marginRight: 8,
  },
  challengeTip: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: modernTheme.colors.neutral[200],
  },
});

export default PronunciationGuide;
