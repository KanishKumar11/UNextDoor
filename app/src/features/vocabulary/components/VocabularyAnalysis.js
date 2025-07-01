import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Text, Heading, ModernCard, Spacer, Row, Column } from '../../../shared/components';
import modernTheme from '../../../shared/styles/modernTheme';
import { vocabularyAnalysisService } from '../services/vocabularyAnalysisService';

/**
 * VocabularyAnalysis component
 * Displays detailed analysis of vocabulary in text
 * 
 * @param {Object} props - Component props
 * @param {Object} props.analysis - Vocabulary analysis results
 * @param {string} props.userLevel - User's proficiency level
 */
const VocabularyAnalysis = ({ analysis, userLevel = 'beginner' }) => {
  const [expandedSection, setExpandedSection] = useState(null);
  
  // If no analysis is provided, return null
  if (!analysis) return null;
  
  // Get feedback based on text level
  const feedback = vocabularyAnalysisService.getFeedbackForLevel(analysis.textLevel, userLevel);
  
  // Toggle section expansion
  const toggleSection = (section) => {
    if (expandedSection === section) {
      setExpandedSection(null);
    } else {
      setExpandedSection(section);
    }
  };
  
  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Overall level */}
      <ModernCard style={styles.levelCard}>
        <Heading level="h3" align="center" gutterBottom>
          Vocabulary Analysis
        </Heading>
        
        <View style={styles.levelBadge}>
          <Text size="lg" weight="bold" color={feedback.color}>
            {analysis.textLevel.toUpperCase()}
          </Text>
        </View>
        
        <Text align="center" color={feedback.color} weight="semibold" style={styles.feedbackText}>
          <Ionicons name={feedback.icon} size={16} color={feedback.color} /> {feedback.message}
        </Text>
        
        <Spacer size="md" />
        
        <Text weight="semibold">Analyzed Text:</Text>
        <Text color="neutral.700" style={styles.analyzedText}>
          {analysis.text}
        </Text>
      </ModernCard>
      
      {/* Words */}
      {analysis.words && analysis.words.length > 0 && (
        <ModernCard style={styles.sectionCard}>
          <TouchableOpacity 
            style={styles.sectionHeader}
            onPress={() => toggleSection('words')}
            activeOpacity={0.7}
          >
            <Heading level="h4">Words Used</Heading>
            <Ionicons 
              name={expandedSection === 'words' ? 'chevron-up' : 'chevron-down'} 
              size={20} 
              color={modernTheme.colors.neutral[600]}
            />
          </TouchableOpacity>
          
          {expandedSection === 'words' && (
            <View style={styles.sectionContent}>
              {analysis.words.map((word, index) => (
                <View key={index} style={styles.wordItem}>
                  <Row justify="space-between" align="center">
                    <Text weight="semibold" size="lg">
                      {word.word}
                    </Text>
                    <View style={[
                      styles.levelBadgeSmall,
                      word.level === 'beginner' ? styles.beginnerLevel :
                      word.level === 'intermediate' ? styles.intermediateLevel :
                      styles.advancedLevel
                    ]}>
                      <Text 
                        size="xs" 
                        weight="semibold" 
                        color="white"
                        style={styles.levelText}
                      >
                        {word.level.toUpperCase()}
                      </Text>
                    </View>
                  </Row>
                  
                  <Text color="neutral.700" style={styles.meaningText}>
                    {word.meaning}
                  </Text>
                  
                  <Row style={styles.wordDetails}>
                    <Text size="sm" color="neutral.600" style={styles.partOfSpeech}>
                      {word.partOfSpeech}
                    </Text>
                    
                    {word.usage && (
                      <Text size="sm" color="primary.600" style={styles.usageText}>
                        {word.usage}
                      </Text>
                    )}
                  </Row>
                </View>
              ))}
            </View>
          )}
        </ModernCard>
      )}
      
      {/* Suggestions */}
      {analysis.suggestions && analysis.suggestions.length > 0 && (
        <ModernCard style={styles.sectionCard}>
          <TouchableOpacity 
            style={styles.sectionHeader}
            onPress={() => toggleSection('suggestions')}
            activeOpacity={0.7}
          >
            <Heading level="h4">Vocabulary Suggestions</Heading>
            <Ionicons 
              name={expandedSection === 'suggestions' ? 'chevron-up' : 'chevron-down'} 
              size={20} 
              color={modernTheme.colors.neutral[600]}
            />
          </TouchableOpacity>
          
          {expandedSection === 'suggestions' && (
            <View style={styles.sectionContent}>
              {analysis.suggestions.map((suggestion, index) => (
                <View key={index} style={styles.suggestionItem}>
                  <Row>
                    <Column flex={1}>
                      <Text weight="semibold">Original:</Text>
                      <Text color="neutral.700" style={styles.suggestionText}>
                        {suggestion.original}
                      </Text>
                    </Column>
                    
                    <Column flex={1}>
                      <Text weight="semibold">Alternative:</Text>
                      <Text color="success.600" style={styles.suggestionText}>
                        {suggestion.alternative}
                      </Text>
                    </Column>
                  </Row>
                  
                  <Text weight="semibold" style={styles.reasonLabel}>Reason:</Text>
                  <Text color="neutral.700" style={styles.reasonText}>
                    {suggestion.reason}
                  </Text>
                </View>
              ))}
            </View>
          )}
        </ModernCard>
      )}
      
      {/* Strengths and Weaknesses */}
      <ModernCard style={styles.sectionCard}>
        <TouchableOpacity 
          style={styles.sectionHeader}
          onPress={() => toggleSection('strengthsWeaknesses')}
          activeOpacity={0.7}
        >
          <Heading level="h4">Strengths & Weaknesses</Heading>
          <Ionicons 
            name={expandedSection === 'strengthsWeaknesses' ? 'chevron-up' : 'chevron-down'} 
            size={20} 
            color={modernTheme.colors.neutral[600]}
          />
        </TouchableOpacity>
        
        {expandedSection === 'strengthsWeaknesses' && (
          <View style={styles.sectionContent}>
            <Row>
              <Column flex={1} style={styles.strengthsColumn}>
                <Text weight="semibold" color="success.600" style={styles.columnHeader}>
                  Strengths
                </Text>
                
                {analysis.strengths && analysis.strengths.length > 0 ? (
                  analysis.strengths.map((strength, index) => (
                    <View key={index} style={styles.listItem}>
                      <Ionicons 
                        name="checkmark-circle" 
                        size={16} 
                        color={modernTheme.colors.success.main} 
                        style={styles.listIcon}
                      />
                      <Text color="neutral.700" style={styles.listText}>
                        {strength}
                      </Text>
                    </View>
                  ))
                ) : (
                  <Text color="neutral.600" style={styles.emptyText}>
                    No strengths identified
                  </Text>
                )}
              </Column>
              
              <Column flex={1} style={styles.weaknessesColumn}>
                <Text weight="semibold" color="error.600" style={styles.columnHeader}>
                  Weaknesses
                </Text>
                
                {analysis.weaknesses && analysis.weaknesses.length > 0 ? (
                  analysis.weaknesses.map((weakness, index) => (
                    <View key={index} style={styles.listItem}>
                      <Ionicons 
                        name="alert-circle" 
                        size={16} 
                        color={modernTheme.colors.error.main} 
                        style={styles.listIcon}
                      />
                      <Text color="neutral.700" style={styles.listText}>
                        {weakness}
                      </Text>
                    </View>
                  ))
                ) : (
                  <Text color="neutral.600" style={styles.emptyText}>
                    No weaknesses identified
                  </Text>
                )}
              </Column>
            </Row>
          </View>
        )}
      </ModernCard>
      
      {/* New Words */}
      {analysis.newWords && analysis.newWords.length > 0 && (
        <ModernCard style={styles.sectionCard}>
          <TouchableOpacity 
            style={styles.sectionHeader}
            onPress={() => toggleSection('newWords')}
            activeOpacity={0.7}
          >
            <Heading level="h4">New Words for Your Level</Heading>
            <Ionicons 
              name={expandedSection === 'newWords' ? 'chevron-up' : 'chevron-down'} 
              size={20} 
              color={modernTheme.colors.neutral[600]}
            />
          </TouchableOpacity>
          
          {expandedSection === 'newWords' && (
            <View style={styles.sectionContent}>
              <Row style={styles.newWordsContainer}>
                {analysis.newWords.map((word, index) => (
                  <View key={index} style={styles.newWordBadge}>
                    <Text weight="semibold" size="sm">
                      {word}
                    </Text>
                  </View>
                ))}
              </Row>
            </View>
          )}
        </ModernCard>
      )}
      
      {/* Recommended Vocabulary */}
      {analysis.recommendedVocabulary && analysis.recommendedVocabulary.length > 0 && (
        <ModernCard style={styles.sectionCard}>
          <TouchableOpacity 
            style={styles.sectionHeader}
            onPress={() => toggleSection('recommendedVocabulary')}
            activeOpacity={0.7}
          >
            <Heading level="h4">Recommended Vocabulary</Heading>
            <Ionicons 
              name={expandedSection === 'recommendedVocabulary' ? 'chevron-up' : 'chevron-down'} 
              size={20} 
              color={modernTheme.colors.neutral[600]}
            />
          </TouchableOpacity>
          
          {expandedSection === 'recommendedVocabulary' && (
            <View style={styles.sectionContent}>
              {analysis.recommendedVocabulary.map((vocab, index) => (
                <View key={index} style={styles.recommendedItem}>
                  <Row justify="space-between" align="center">
                    <Text weight="semibold">
                      {vocab.word}
                    </Text>
                    <Text color="neutral.600">
                      {vocab.meaning}
                    </Text>
                  </Row>
                  
                  {vocab.example && (
                    <Text color="primary.600" style={styles.exampleText}>
                      Example: {vocab.example}
                    </Text>
                  )}
                </View>
              ))}
            </View>
          )}
        </ModernCard>
      )}
      
      <Spacer size="xl" />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  levelCard: {
    marginBottom: 16,
    padding: 16,
  },
  levelBadge: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: modernTheme.colors.neutral[100],
    alignSelf: 'center',
    marginVertical: 16,
  },
  feedbackText: {
    marginTop: 8,
  },
  analyzedText: {
    marginTop: 8,
    padding: 8,
    backgroundColor: modernTheme.colors.neutral[50],
    borderRadius: 4,
  },
  sectionCard: {
    marginBottom: 16,
    padding: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionContent: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: modernTheme.colors.neutral[200],
  },
  wordItem: {
    marginBottom: 16,
    padding: 12,
    backgroundColor: modernTheme.colors.neutral[50],
    borderRadius: 8,
  },
  levelBadgeSmall: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  beginnerLevel: {
    backgroundColor: modernTheme.colors.success.main,
  },
  intermediateLevel: {
    backgroundColor: modernTheme.colors.warning.main,
  },
  advancedLevel: {
    backgroundColor: modernTheme.colors.error.main,
  },
  levelText: {
    fontSize: 10,
  },
  meaningText: {
    marginTop: 4,
    marginBottom: 8,
  },
  wordDetails: {
    marginTop: 4,
  },
  partOfSpeech: {
    fontStyle: 'italic',
    marginRight: 8,
  },
  usageText: {
    flex: 1,
  },
  suggestionItem: {
    marginBottom: 16,
    padding: 12,
    backgroundColor: modernTheme.colors.neutral[50],
    borderRadius: 8,
  },
  suggestionText: {
    marginTop: 4,
    marginBottom: 8,
  },
  reasonLabel: {
    marginTop: 4,
    marginBottom: 4,
  },
  reasonText: {
    fontStyle: 'italic',
  },
  strengthsColumn: {
    marginRight: 8,
  },
  weaknessesColumn: {
    marginLeft: 8,
  },
  columnHeader: {
    marginBottom: 8,
  },
  listItem: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  listIcon: {
    marginRight: 8,
    marginTop: 2,
  },
  listText: {
    flex: 1,
  },
  emptyText: {
    fontStyle: 'italic',
  },
  newWordsContainer: {
    flexWrap: 'wrap',
  },
  newWordBadge: {
    backgroundColor: modernTheme.colors.primary[100],
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    margin: 4,
  },
  recommendedItem: {
    marginBottom: 12,
    padding: 12,
    backgroundColor: modernTheme.colors.neutral[50],
    borderRadius: 8,
  },
  exampleText: {
    marginTop: 8,
    fontStyle: 'italic',
  },
});

export default VocabularyAnalysis;
