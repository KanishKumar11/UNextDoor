import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Text, Heading, ModernCard, ModernProgressBar, Spacer, Row, Column } from '../../../shared/components';
import modernTheme from '../../../shared/styles/modernTheme';
import { pronunciationService } from '../services/pronunciationService';

/**
 * PronunciationFeedback component
 * Displays detailed feedback on pronunciation analysis
 * 
 * @param {Object} props - Component props
 * @param {Object} props.analysis - Pronunciation analysis results
 * @param {Function} props.onClose - Function to call when closing the feedback
 * @param {Function} props.onTryAgain - Function to call when trying again
 */
const PronunciationFeedback = ({ analysis, onClose, onTryAgain }) => {
  const [expandedSection, setExpandedSection] = useState(null);
  
  // If no analysis is provided, return null
  if (!analysis) return null;
  
  // Get feedback based on accuracy
  const feedback = pronunciationService.getFeedbackForAccuracy(analysis.accuracy);
  
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
      {/* Overall score */}
      <ModernCard style={styles.scoreCard}>
        <Heading level="h3" align="center" gutterBottom>
          Pronunciation Score
        </Heading>
        
        <View style={styles.scoreCircle}>
          <Text size="xxl" weight="bold" color={feedback.color}>
            {analysis.accuracy}%
          </Text>
        </View>
        
        <Text align="center" color={feedback.color} weight="semibold" style={styles.feedbackText}>
          <Ionicons name={feedback.icon} size={16} color={feedback.color} /> {feedback.message}
        </Text>
        
        <Spacer size="md" />
        
        <Row>
          <Column flex={1}>
            <Text weight="semibold">You said:</Text>
            <Text color="neutral.700" style={styles.transcribedText}>
              {analysis.transcribedText}
            </Text>
          </Column>
          
          <Column flex={1}>
            <Text weight="semibold">Target:</Text>
            <Text color="neutral.700" style={styles.targetText}>
              {analysis.targetText}
            </Text>
          </Column>
        </Row>
      </ModernCard>
      
      {/* Accent feedback */}
      <ModernCard style={styles.feedbackCard}>
        <TouchableOpacity 
          style={styles.sectionHeader}
          onPress={() => toggleSection('accent')}
          activeOpacity={0.7}
        >
          <Heading level="h4">Accent Feedback</Heading>
          <Ionicons 
            name={expandedSection === 'accent' ? 'chevron-up' : 'chevron-down'} 
            size={20} 
            color={modernTheme.colors.neutral[600]}
          />
        </TouchableOpacity>
        
        {expandedSection === 'accent' && (
          <View style={styles.sectionContent}>
            <Text color="neutral.700">{analysis.accentFeedback}</Text>
          </View>
        )}
      </ModernCard>
      
      {/* Difficult sounds */}
      {analysis.difficultSounds && analysis.difficultSounds.length > 0 && (
        <ModernCard style={styles.feedbackCard}>
          <TouchableOpacity 
            style={styles.sectionHeader}
            onPress={() => toggleSection('difficultSounds')}
            activeOpacity={0.7}
          >
            <Heading level="h4">Sounds to Practice</Heading>
            <Ionicons 
              name={expandedSection === 'difficultSounds' ? 'chevron-up' : 'chevron-down'} 
              size={20} 
              color={modernTheme.colors.neutral[600]}
            />
          </TouchableOpacity>
          
          {expandedSection === 'difficultSounds' && (
            <View style={styles.sectionContent}>
              {analysis.difficultSounds.map((sound, index) => (
                <View key={index} style={styles.soundItem}>
                  <Text weight="semibold" color="error.500">{sound}</Text>
                </View>
              ))}
            </View>
          )}
        </ModernCard>
      )}
      
      {/* Phoneme analysis */}
      {analysis.phonemeAnalysis && analysis.phonemeAnalysis.length > 0 && (
        <ModernCard style={styles.feedbackCard}>
          <TouchableOpacity 
            style={styles.sectionHeader}
            onPress={() => toggleSection('phonemeAnalysis')}
            activeOpacity={0.7}
          >
            <Heading level="h4">Detailed Analysis</Heading>
            <Ionicons 
              name={expandedSection === 'phonemeAnalysis' ? 'chevron-up' : 'chevron-down'} 
              size={20} 
              color={modernTheme.colors.neutral[600]}
            />
          </TouchableOpacity>
          
          {expandedSection === 'phonemeAnalysis' && (
            <View style={styles.sectionContent}>
              {analysis.phonemeAnalysis.map((item, index) => (
                <View key={index} style={styles.phonemeItem}>
                  <Row justify="space-between" align="center" style={styles.phonemeHeader}>
                    <Text weight="semibold">{item.phoneme}</Text>
                    <Text 
                      weight="semibold" 
                      color={item.accuracy >= 80 ? 'success.500' : item.accuracy >= 60 ? 'warning.500' : 'error.500'}
                    >
                      {item.accuracy}%
                    </Text>
                  </Row>
                  
                  <ModernProgressBar 
                    progress={item.accuracy} 
                    height={6}
                    color={item.accuracy >= 80 ? modernTheme.colors.success.main : 
                           item.accuracy >= 60 ? modernTheme.colors.warning.main : 
                           modernTheme.colors.error.main}
                    style={styles.phonemeProgress}
                  />
                  
                  <Text color="neutral.700" style={styles.phonemeIssue}>{item.issue}</Text>
                  <Text color="primary.600" style={styles.phonemeImprovement}>{item.improvement}</Text>
                </View>
              ))}
            </View>
          )}
        </ModernCard>
      )}
      
      {/* Improvement tips */}
      {analysis.improvementTips && analysis.improvementTips.length > 0 && (
        <ModernCard style={styles.feedbackCard}>
          <TouchableOpacity 
            style={styles.sectionHeader}
            onPress={() => toggleSection('improvementTips')}
            activeOpacity={0.7}
          >
            <Heading level="h4">Tips for Improvement</Heading>
            <Ionicons 
              name={expandedSection === 'improvementTips' ? 'chevron-up' : 'chevron-down'} 
              size={20} 
              color={modernTheme.colors.neutral[600]}
            />
          </TouchableOpacity>
          
          {expandedSection === 'improvementTips' && (
            <View style={styles.sectionContent}>
              {analysis.improvementTips.map((tip, index) => (
                <View key={index} style={styles.tipItem}>
                  <Ionicons name="bulb-outline" size={16} color={modernTheme.colors.primary[500]} style={styles.tipIcon} />
                  <Text color="neutral.700" style={styles.tipText}>{tip}</Text>
                </View>
              ))}
            </View>
          )}
        </ModernCard>
      )}
      
      {/* Strengths */}
      {analysis.strengths && analysis.strengths.length > 0 && (
        <ModernCard style={styles.feedbackCard}>
          <TouchableOpacity 
            style={styles.sectionHeader}
            onPress={() => toggleSection('strengths')}
            activeOpacity={0.7}
          >
            <Heading level="h4">Your Strengths</Heading>
            <Ionicons 
              name={expandedSection === 'strengths' ? 'chevron-up' : 'chevron-down'} 
              size={20} 
              color={modernTheme.colors.neutral[600]}
            />
          </TouchableOpacity>
          
          {expandedSection === 'strengths' && (
            <View style={styles.sectionContent}>
              {analysis.strengths.map((strength, index) => (
                <View key={index} style={styles.strengthItem}>
                  <Ionicons name="checkmark-circle-outline" size={16} color={modernTheme.colors.success.main} style={styles.strengthIcon} />
                  <Text color="neutral.700" style={styles.strengthText}>{strength}</Text>
                </View>
              ))}
            </View>
          )}
        </ModernCard>
      )}
      
      {/* Practice exercises */}
      {analysis.practiceExercises && analysis.practiceExercises.length > 0 && (
        <ModernCard style={styles.feedbackCard}>
          <TouchableOpacity 
            style={styles.sectionHeader}
            onPress={() => toggleSection('practiceExercises')}
            activeOpacity={0.7}
          >
            <Heading level="h4">Practice Exercises</Heading>
            <Ionicons 
              name={expandedSection === 'practiceExercises' ? 'chevron-up' : 'chevron-down'} 
              size={20} 
              color={modernTheme.colors.neutral[600]}
            />
          </TouchableOpacity>
          
          {expandedSection === 'practiceExercises' && (
            <View style={styles.sectionContent}>
              {analysis.practiceExercises.map((exercise, index) => (
                <View key={index} style={styles.exerciseItem}>
                  <Text weight="semibold" color="primary.600" style={styles.exerciseNumber}>Exercise {index + 1}</Text>
                  <Text color="neutral.700" style={styles.exerciseText}>{exercise}</Text>
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
  scoreCard: {
    marginBottom: 16,
    padding: 16,
  },
  scoreCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: modernTheme.colors.neutral[100],
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    marginVertical: 16,
  },
  feedbackText: {
    marginTop: 8,
  },
  transcribedText: {
    marginTop: 4,
  },
  targetText: {
    marginTop: 4,
  },
  feedbackCard: {
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
  soundItem: {
    marginBottom: 8,
    padding: 8,
    backgroundColor: modernTheme.colors.error[50],
    borderRadius: 4,
  },
  phonemeItem: {
    marginBottom: 16,
  },
  phonemeHeader: {
    marginBottom: 4,
  },
  phonemeProgress: {
    marginBottom: 8,
  },
  phonemeIssue: {
    marginBottom: 4,
  },
  phonemeImprovement: {
    fontStyle: 'italic',
  },
  tipItem: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  tipIcon: {
    marginRight: 8,
    marginTop: 2,
  },
  tipText: {
    flex: 1,
  },
  strengthItem: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  strengthIcon: {
    marginRight: 8,
    marginTop: 2,
  },
  strengthText: {
    flex: 1,
  },
  exerciseItem: {
    marginBottom: 12,
  },
  exerciseNumber: {
    marginBottom: 4,
  },
  exerciseText: {
    marginLeft: 8,
  },
});

export default PronunciationFeedback;
