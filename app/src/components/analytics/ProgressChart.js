/**
 * Progress Chart Component
 * Displays learning progress trends in a simple visual format
 */

import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { BRAND_COLORS } from '../../constants/colors';
import { getFontFamily } from '../../utils/fontUtils';

const { width: screenWidth } = Dimensions.get('window');
const chartWidth = screenWidth - 64; // Account for padding

const ProgressChart = ({ data }) => {
  if (!data || !data.progressTrend || data.progressTrend.length === 0) {
    return (
      <View style={styles.noDataContainer}>
        <Text style={styles.noDataText}>
          Complete more conversations to see your progress trends
        </Text>
      </View>
    );
  }

  const { progressTrend, summary } = data;
  
  // Get last 7 days of data
  const recentData = progressTrend.slice(-7);
  
  // Find max values for scaling
  const maxQuality = Math.max(...recentData.map(d => d.averageQuality || 0), 100);
  const maxEngagement = Math.max(...recentData.map(d => d.averageEngagement || 0), 1);
  
  return (
    <View style={styles.container}>
      {/* Summary Stats */}
      {summary && (
        <View style={styles.summaryContainer}>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Average Quality</Text>
            <Text style={styles.summaryValue}>{summary.averageQuality}/100</Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Average Engagement</Text>
            <Text style={styles.summaryValue}>{Math.round(summary.averageEngagement * 100)}%</Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Total Vocabulary</Text>
            <Text style={styles.summaryValue}>{summary.totalVocabularyLearned || 0}</Text>
          </View>
        </View>
      )}
      
      {/* Simple Progress Bars */}
      <View style={styles.chartContainer}>
        <Text style={styles.chartTitle}>Recent Progress (Last 7 Days)</Text>
        
        {recentData.map((day, index) => (
          <View key={day.date || index} style={styles.dayContainer}>
            <View style={styles.dayHeader}>
              <Text style={styles.dayLabel}>
                {formatDayLabel(day.date, index, recentData.length)}
              </Text>
              <Text style={styles.sessionCount}>
                {day.sessionCount || 0} session{day.sessionCount !== 1 ? 's' : ''}
              </Text>
            </View>
            
            {day.sessionCount > 0 && (
              <View style={styles.barsContainer}>
                {/* Quality Bar */}
                <View style={styles.barRow}>
                  <Text style={styles.barLabel}>Quality</Text>
                  <View style={styles.barTrack}>
                    <View 
                      style={[
                        styles.barFill,
                        styles.qualityBar,
                        { width: `${(day.averageQuality / maxQuality) * 100}%` }
                      ]} 
                    />
                  </View>
                  <Text style={styles.barValue}>{Math.round(day.averageQuality || 0)}</Text>
                </View>
                
                {/* Engagement Bar */}
                <View style={styles.barRow}>
                  <Text style={styles.barLabel}>Engagement</Text>
                  <View style={styles.barTrack}>
                    <View 
                      style={[
                        styles.barFill,
                        styles.engagementBar,
                        { width: `${(day.averageEngagement / maxEngagement) * 100}%` }
                      ]} 
                    />
                  </View>
                  <Text style={styles.barValue}>{Math.round((day.averageEngagement || 0) * 100)}%</Text>
                </View>
              </View>
            )}
          </View>
        ))}
      </View>
    </View>
  );
};

/**
 * Format day label for display
 */
const formatDayLabel = (dateString, index, totalDays) => {
  if (!dateString) return `Day ${index + 1}`;
  
  const date = new Date(dateString);
  const today = new Date();
  const diffTime = Math.abs(today - date);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays <= 1) return 'Today';
  if (diffDays === 2) return 'Yesterday';
  if (diffDays <= 7) return `${diffDays - 1} days ago`;
  
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
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
  summaryContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: BRAND_COLORS.BORDER,
  },
  summaryItem: {
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: 12,
    fontFamily: getFontFamily('regular'),
    color: BRAND_COLORS.TEXT_SECONDARY,
    marginBottom: 4,
  },
  summaryValue: {
    fontSize: 16,
    fontFamily: getFontFamily('bold'),
    color: BRAND_COLORS.PRIMARY,
  },
  chartContainer: {
    gap: 12,
  },
  chartTitle: {
    fontSize: 16,
    fontFamily: getFontFamily('semibold'),
    color: BRAND_COLORS.TEXT_PRIMARY,
    marginBottom: 8,
  },
  dayContainer: {
    marginBottom: 8,
  },
  dayHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  dayLabel: {
    fontSize: 14,
    fontFamily: getFontFamily('medium'),
    color: BRAND_COLORS.TEXT_PRIMARY,
  },
  sessionCount: {
    fontSize: 12,
    fontFamily: getFontFamily('regular'),
    color: BRAND_COLORS.TEXT_SECONDARY,
  },
  barsContainer: {
    gap: 6,
  },
  barRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  barLabel: {
    fontSize: 12,
    fontFamily: getFontFamily('regular'),
    color: BRAND_COLORS.TEXT_SECONDARY,
    width: 70,
  },
  barTrack: {
    flex: 1,
    height: 6,
    backgroundColor: BRAND_COLORS.BORDER,
    borderRadius: 3,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    borderRadius: 3,
  },
  qualityBar: {
    backgroundColor: BRAND_COLORS.PRIMARY,
  },
  engagementBar: {
    backgroundColor: '#4ECDC4',
  },
  barValue: {
    fontSize: 12,
    fontFamily: getFontFamily('medium'),
    color: BRAND_COLORS.TEXT_PRIMARY,
    width: 35,
    textAlign: 'right',
  },
});

export default ProgressChart;
