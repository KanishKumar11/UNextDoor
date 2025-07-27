/**
 * Analytics Card Component
 * Displays individual analytics metrics in a card format
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { BRAND_COLORS } from '../../constants/colors';
import { getFontFamily } from '../../utils/fontUtils';

const AnalyticsCard = ({ 
  title, 
  value, 
  subtitle, 
  icon, 
  style,
  valueColor = BRAND_COLORS.PRIMARY,
  backgroundColor = BRAND_COLORS.CARD_BACKGROUND
}) => {
  return (
    <View style={[styles.card, { backgroundColor }, style]}>
      {icon && (
        <Text style={styles.icon}>{icon}</Text>
      )}
      
      <View style={styles.content}>
        <Text style={styles.title}>{title}</Text>
        <Text style={[styles.value, { color: valueColor }]}>
          {value || 'N/A'}
        </Text>
        {subtitle && (
          <Text style={styles.subtitle}>{subtitle}</Text>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    padding: 16,
    elevation: 0,
    minHeight: 100,
    justifyContent: 'center',
  },
  icon: {
    fontSize: 24,
    marginBottom: 8,
    textAlign: 'center',
  },
  content: {
    alignItems: 'center',
  },
  title: {
    fontSize: 14,
    fontFamily: getFontFamily('medium'),
    color: BRAND_COLORS.TEXT_SECONDARY,
    marginBottom: 4,
    textAlign: 'center',
  },
  value: {
    fontSize: 20,
    fontFamily: getFontFamily('bold'),
    marginBottom: 2,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 12,
    fontFamily: getFontFamily('regular'),
    color: BRAND_COLORS.TEXT_SECONDARY,
    textAlign: 'center',
  },
});

export default AnalyticsCard;
