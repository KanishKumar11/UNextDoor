/**
 * Quality Insights Component
 * Displays conversation quality insights and recommendations
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { BRAND_COLORS } from '../../constants/colors';
import { getFontFamily } from '../../utils/fontUtils';

const QualityInsights = ({ data }) => {
  if (!data) {
    return (
      <View style={styles.noDataContainer}>
        <Text style={styles.noDataText}>
          Quality insights will appear after you have more conversations
        </Text>
      </View>
    );
  }

  const {
    averageQuality = 0,
    averageEngagement = 0,
    qualityDistribution = {},
    recommendations = []
  } = data;

  // Calculate quality level
  const getQualityLevel = (score) => {
    if (score >= 90) return { level: 'Excellent', color: '#6FC935', emoji: '🌟' };
    if (score >= 70) return { level: 'Good', color: '#4ECDC4', emoji: '👍' };
    if (score >= 50) return { level: 'Fair', color: '#FFB74D', emoji: '📈' };
    return { level: 'Needs Work', color: '#FF6B6B', emoji: '💪' };
  };

  const qualityInfo = getQualityLevel(averageQuality);
  const engagementPercentage = Math.round(averageEngagement * 100);

  return (
    <View style={styles.container}>
      {/* Overall Quality Score */}
      <View style={styles.scoreSection}>
        <View style={styles.scoreCard}>
          <Text style={styles.scoreEmoji}>{qualityInfo.emoji}</Text>
          <Text style={styles.scoreValue}>{Math.round(averageQuality)}/100</Text>
          <Text style={[styles.scoreLevel, { color: qualityInfo.color }]}>
            {qualityInfo.level}
          </Text>
          <Text style={styles.scoreLabel}>Average Quality</Text>
        </View>
        
        <View style={styles.scoreCard}>
          <Text style={styles.scoreEmoji}>🎯</Text>
          <Text style={styles.scoreValue}>{engagementPercentage}%</Text>
          <Text style={[styles.scoreLevel, { color: getEngagementColor(averageEngagement) }]}>
            {getEngagementLevel(averageEngagement)}
          </Text>
          <Text style={styles.scoreLabel}>Engagement</Text>
        </View>
      </View>

      {/* Quality Distribution */}
      {Object.keys(qualityDistribution).length > 0 && (
        <View style={styles.distributionSection}>
          <Text style={styles.sectionTitle}>Session Quality Breakdown</Text>
          
          <View style={styles.distributionGrid}>
            <DistributionItem
              label="Excellent (90+)"
              count={qualityDistribution.excellent || 0}
              color="#6FC935"
            />
            <DistributionItem
              label="Good (70-89)"
              count={qualityDistribution.good || 0}
              color="#4ECDC4"
            />
            <DistributionItem
              label="Fair (50-69)"
              count={qualityDistribution.fair || 0}
              color="#FFB74D"
            />
            <DistributionItem
              label="Needs Work (<50)"
              count={qualityDistribution.needsImprovement || 0}
              color="#FF6B6B"
            />
          </View>
        </View>
      )}

      {/* Recommendations */}
      {recommendations.length > 0 && (
        <View style={styles.recommendationsSection}>
          <Text style={styles.sectionTitle}>Personalized Recommendations</Text>
          
          {recommendations.map((recommendation, index) => (
            <View key={index} style={styles.recommendationCard}>
              <Text style={styles.recommendationIcon}>💡</Text>
              <Text style={styles.recommendationText}>{recommendation}</Text>
            </View>
          ))}
        </View>
      )}

      {/* Motivational Message */}
      <View style={styles.motivationSection}>
        <Text style={styles.motivationText}>
          {getMotivationalMessage(averageQuality, averageEngagement)}
        </Text>
      </View>
    </View>
  );
};

/**
 * Distribution Item Component
 */
const DistributionItem = ({ label, count, color }) => (
  <View style={styles.distributionItem}>
    <View style={[styles.distributionDot, { backgroundColor: color }]} />
    <Text style={styles.distributionLabel}>{label}</Text>
    <Text style={styles.distributionCount}>{count}</Text>
  </View>
);

/**
 * Get engagement level text
 */
const getEngagementLevel = (engagement) => {
  if (engagement >= 0.8) return 'Highly Engaged';
  if (engagement >= 0.6) return 'Well Engaged';
  if (engagement >= 0.4) return 'Moderately Engaged';
  return 'Low Engagement';
};

/**
 * Get engagement color
 */
const getEngagementColor = (engagement) => {
  if (engagement >= 0.8) return '#6FC935';
  if (engagement >= 0.6) return '#4ECDC4';
  if (engagement >= 0.4) return '#FFB74D';
  return '#FF6B6B';
};

/**
 * Get motivational message based on performance
 */
const getMotivationalMessage = (quality, engagement) => {
  if (quality >= 80 && engagement >= 0.8) {
    return "Outstanding work! You're mastering Korean with excellent quality and engagement. Keep up this fantastic momentum! 🚀";
  }
  
  if (quality >= 70 && engagement >= 0.6) {
    return "Great progress! Your conversations are showing solid quality and good engagement. You're on the right track! 📈";
  }
  
  if (quality >= 50) {
    return "You're making steady progress! Focus on active participation and don't hesitate to ask questions to improve your conversation quality. 💪";
  }
  
  return "Every conversation is a step forward! Remember, making mistakes is part of learning. Stay consistent and you'll see improvement! 🌱";
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: BRAND_COLORS.CARD_BACKGROUND,
    borderRadius: 16,
    padding: 16,
    elevation: 0,
  },
  noDataContainer: {
    backgroundColor: BRAND_COLORS.CARD_BACKGROUND,
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    elevation: 0,
  },
  noDataText: {
    fontSize: 16,
    fontFamily: getFontFamily('regular'),
    color: BRAND_COLORS.TEXT_SECONDARY,
    textAlign: 'center',
  },
  scoreSection: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 24,
  },
  scoreCard: {
    alignItems: 'center',
    flex: 1,
  },
  scoreEmoji: {
    fontSize: 32,
    marginBottom: 8,
  },
  scoreValue: {
    fontSize: 24,
    fontFamily: getFontFamily('bold'),
    color: BRAND_COLORS.TEXT_PRIMARY,
    marginBottom: 4,
  },
  scoreLevel: {
    fontSize: 14,
    fontFamily: getFontFamily('semibold'),
    marginBottom: 4,
  },
  scoreLabel: {
    fontSize: 12,
    fontFamily: getFontFamily('regular'),
    color: BRAND_COLORS.TEXT_SECONDARY,
  },
  distributionSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: getFontFamily('semibold'),
    color: BRAND_COLORS.TEXT_PRIMARY,
    marginBottom: 12,
  },
  distributionGrid: {
    gap: 8,
  },
  distributionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
  },
  distributionDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 12,
  },
  distributionLabel: {
    flex: 1,
    fontSize: 14,
    fontFamily: getFontFamily('regular'),
    color: BRAND_COLORS.TEXT_PRIMARY,
  },
  distributionCount: {
    fontSize: 14,
    fontFamily: getFontFamily('semibold'),
    color: BRAND_COLORS.TEXT_PRIMARY,
    minWidth: 24,
    textAlign: 'right',
  },
  recommendationsSection: {
    marginBottom: 24,
  },
  recommendationCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: BRAND_COLORS.BACKGROUND,
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
  },
  recommendationIcon: {
    fontSize: 16,
    marginRight: 8,
    marginTop: 2,
  },
  recommendationText: {
    flex: 1,
    fontSize: 14,
    fontFamily: getFontFamily('regular'),
    color: BRAND_COLORS.TEXT_PRIMARY,
    lineHeight: 20,
  },
  motivationSection: {
    backgroundColor: BRAND_COLORS.BACKGROUND,
    borderRadius: 12,
    padding: 16,
  },
  motivationText: {
    fontSize: 14,
    fontFamily: getFontFamily('regular'),
    color: BRAND_COLORS.TEXT_PRIMARY,
    lineHeight: 20,
    textAlign: 'center',
  },
});

export default QualityInsights;
