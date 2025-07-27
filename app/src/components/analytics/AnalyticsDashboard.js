/**
 * Analytics Dashboard Component
 * Displays user learning analytics and progress insights
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  RefreshControl,
  ActivityIndicator,
  Alert
} from 'react-native';
import { BRAND_COLORS } from '../../constants/colors';
import { getFontFamily } from '../../utils/fontUtils';
import analyticsService from '../../services/analyticsService';
import AnalyticsCard from './AnalyticsCard';
import ProgressChart from './ProgressChart';
import QualityInsights from './QualityInsights';

const AnalyticsDashboard = () => {
  const [analyticsData, setAnalyticsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  /**
   * Load analytics data
   */
  const loadAnalytics = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      
      setError(null);
      
      const data = await analyticsService.getDashboardAnalytics();
      setAnalyticsData(data);
      
    } catch (err) {
      console.error('Error loading analytics:', err);
      setError(err.message);
      
      if (!isRefresh) {
        Alert.alert(
          'Analytics Error',
          'Unable to load your learning analytics. Please try again.',
          [{ text: 'OK' }]
        );
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  /**
   * Handle refresh
   */
  const handleRefresh = () => {
    loadAnalytics(true);
  };

  /**
   * Load data on component mount
   */
  useEffect(() => {
    loadAnalytics();
  }, []);

  /**
   * Render loading state
   */
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={BRAND_COLORS.PRIMARY} />
        <Text style={styles.loadingText}>Loading your analytics...</Text>
      </View>
    );
  }

  /**
   * Render error state
   */
  if (error && !analyticsData) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorTitle}>Analytics Unavailable</Text>
        <Text style={styles.errorText}>
          We couldn't load your learning analytics right now. 
          Please check your connection and try again.
        </Text>
      </View>
    );
  }

  const { user, progress, quality } = analyticsData || {};

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={handleRefresh}
          colors={[BRAND_COLORS.PRIMARY]}
          tintColor={BRAND_COLORS.PRIMARY}
        />
      }
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Your Learning Analytics</Text>
        <Text style={styles.subtitle}>
          Track your Korean learning progress and insights
        </Text>
      </View>

      {/* Summary Cards */}
      {user?.summary && (
        <View style={styles.summarySection}>
          <Text style={styles.sectionTitle}>This Week's Summary</Text>
          
          <View style={styles.cardRow}>
            <AnalyticsCard
              title="Sessions"
              value={user.summary.totalSessions}
              subtitle="conversations"
              icon="💬"
              style={styles.halfCard}
            />
            <AnalyticsCard
              title="Quality Score"
              value={user.summary.averageQuality}
              subtitle="average"
              icon="⭐"
              style={styles.halfCard}
            />
          </View>
          
          <View style={styles.cardRow}>
            <AnalyticsCard
              title="Engagement"
              value={user.summary.averageEngagement}
              subtitle="participation"
              icon="🎯"
              style={styles.halfCard}
            />
            <AnalyticsCard
              title="Study Time"
              value={user.summary.averageDuration}
              subtitle="per session"
              icon="⏱️"
              style={styles.halfCard}
            />
          </View>
        </View>
      )}

      {/* Progress Chart */}
      {progress && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Learning Progress</Text>
          <ProgressChart data={progress} />
        </View>
      )}

      {/* Quality Insights */}
      {quality && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quality Insights</Text>
          <QualityInsights data={quality} />
        </View>
      )}

      {/* Recent Sessions */}
      {user?.recentSessions && user.recentSessions.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent Sessions</Text>
          {user.recentSessions.slice(0, 5).map((session, index) => (
            <View key={session.id || index} style={styles.sessionCard}>
              <View style={styles.sessionHeader}>
                <Text style={styles.sessionDate}>{session.date}</Text>
                <Text style={styles.sessionQuality}>{session.quality}</Text>
              </View>
              <View style={styles.sessionDetails}>
                <Text style={styles.sessionDetail}>
                  {session.messages} messages • {session.duration}
                </Text>
                <Text style={styles.sessionDetail}>
                  Engagement: {session.engagement}
                </Text>
              </View>
            </View>
          ))}
        </View>
      )}

      {/* Trends */}
      {user?.trends && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Your Trends</Text>
          
          <View style={styles.trendCard}>
            <View style={styles.trendItem}>
              <Text style={styles.trendLabel}>Quality Improvement</Text>
              <Text style={[
                styles.trendValue,
                { color: user.trends.qualityImprovement.color }
              ]}>
                {user.trends.qualityImprovement.value}
              </Text>
            </View>
            
            <View style={styles.trendItem}>
              <Text style={styles.trendLabel}>Engagement Trend</Text>
              <Text style={[
                styles.trendValue,
                { color: user.trends.engagementImprovement.color }
              ]}>
                {user.trends.engagementImprovement.value}
              </Text>
            </View>
          </View>
        </View>
      )}

      {/* No Data Message */}
      {!user && !progress && !quality && (
        <View style={styles.noDataContainer}>
          <Text style={styles.noDataTitle}>Start Your Learning Journey!</Text>
          <Text style={styles.noDataText}>
            Have conversations with Miles to see your learning analytics and progress insights here.
          </Text>
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BRAND_COLORS.BACKGROUND,
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 100, // Space for tab bar
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: BRAND_COLORS.BACKGROUND,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: BRAND_COLORS.TEXT_SECONDARY,
    fontFamily: getFontFamily('regular'),
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
    backgroundColor: BRAND_COLORS.BACKGROUND,
  },
  errorTitle: {
    fontSize: 20,
    fontFamily: getFontFamily('bold'),
    color: BRAND_COLORS.TEXT_PRIMARY,
    marginBottom: 8,
    textAlign: 'center',
  },
  errorText: {
    fontSize: 16,
    fontFamily: getFontFamily('regular'),
    color: BRAND_COLORS.TEXT_SECONDARY,
    textAlign: 'center',
    lineHeight: 24,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontFamily: getFontFamily('bold'),
    color: BRAND_COLORS.TEXT_PRIMARY,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    fontFamily: getFontFamily('regular'),
    color: BRAND_COLORS.TEXT_SECONDARY,
  },
  summarySection: {
    marginBottom: 24,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontFamily: getFontFamily('semibold'),
    color: BRAND_COLORS.TEXT_PRIMARY,
    marginBottom: 16,
  },
  cardRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  halfCard: {
    flex: 0.48,
  },
  sessionCard: {
    backgroundColor: BRAND_COLORS.CARD_BACKGROUND,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    elevation: 0,
  },
  sessionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  sessionDate: {
    fontSize: 16,
    fontFamily: getFontFamily('medium'),
    color: BRAND_COLORS.TEXT_PRIMARY,
  },
  sessionQuality: {
    fontSize: 16,
    fontFamily: getFontFamily('semibold'),
    color: BRAND_COLORS.PRIMARY,
  },
  sessionDetails: {
    gap: 4,
  },
  sessionDetail: {
    fontSize: 14,
    fontFamily: getFontFamily('regular'),
    color: BRAND_COLORS.TEXT_SECONDARY,
  },
  trendCard: {
    backgroundColor: BRAND_COLORS.CARD_BACKGROUND,
    borderRadius: 16,
    padding: 16,
    elevation: 0,
  },
  trendItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  trendLabel: {
    fontSize: 16,
    fontFamily: getFontFamily('regular'),
    color: BRAND_COLORS.TEXT_PRIMARY,
  },
  trendValue: {
    fontSize: 16,
    fontFamily: getFontFamily('semibold'),
  },
  noDataContainer: {
    alignItems: 'center',
    padding: 32,
    marginTop: 32,
  },
  noDataTitle: {
    fontSize: 20,
    fontFamily: getFontFamily('bold'),
    color: BRAND_COLORS.TEXT_PRIMARY,
    marginBottom: 8,
    textAlign: 'center',
  },
  noDataText: {
    fontSize: 16,
    fontFamily: getFontFamily('regular'),
    color: BRAND_COLORS.TEXT_SECONDARY,
    textAlign: 'center',
    lineHeight: 24,
  },
});

export default AnalyticsDashboard;
