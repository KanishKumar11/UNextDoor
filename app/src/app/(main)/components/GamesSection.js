import React from 'react';
import { View, TouchableOpacity, Animated, StyleSheet, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../../shared/context/ThemeContext';
import {
  Text,
  Heading,
  Row,
  Column
} from '../../../shared/components';
import { useRouter } from 'expo-router';
import { BRAND_COLORS } from '../../../shared/constants/colors';

const { width } = Dimensions.get("window");

const GamesSection = ({ fadeAnim, scaleAnim }) => {
  const { theme } = useTheme();
  const router = useRouter();

  const styles = StyleSheet.create({
    gameCard: {
      width: (width - 48) / 2,
      backgroundColor: BRAND_COLORS.CARD_BACKGROUND,
      borderRadius: 12,
      padding: 16,
      marginBottom: 16,
      marginHorizontal: 4,
      position: "relative",
      elevation: 0,
    },
    gameIconContainer: {
      width: 56,
      height: 56,
      borderRadius: 28,
      justifyContent: "center",
      alignItems: "center",
      marginBottom: 12,
    },
    gameName: {
      fontSize: 16,
      marginBottom: 8,
    },
    gameDescription: {
      fontSize: 12,
      lineHeight: 18,
      marginBottom: 8,
    },
    xpBadge: {
      position: "absolute",
      top: 8,
      right: 8,
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 12,
    },
    xpText: {
      color: "white",
      fontSize: 10,
      fontWeight: "bold",
    },
  });

  return (
    <Animated.View
      style={{
        opacity: fadeAnim,
        transform: [{ scale: scaleAnim }],
        paddingHorizontal: theme.spacing.md,
      }}
    >
      <Row
        justify="space-between"
        align="center"
        style={{ marginBottom: theme.spacing.lg }}
      >
        <Column>
          <Text
            variant="caption"
            weight="medium"
            style={{
              color: theme.colors.neutral[500],
              fontFamily: theme.typography.fontFamily.medium,
              textTransform: "uppercase",
              letterSpacing: 0.5,
              fontSize: 11,
              marginBottom: -18,
            }}
          >
            Games
          </Text>
          <Heading
            level="h3"
            style={{
              color: theme.colors.oceanBlue,
              fontFamily: theme.typography.fontFamily.bold,
              fontSize: 20,
            }}
          >
            Play and Learn
          </Heading>
        </Column>
        <TouchableOpacity
          onPress={() => router.push("/games")}
          style={{
            backgroundColor: theme.colors.explorerTeal + "15",
            paddingHorizontal: 12,
            paddingVertical: 6,
            borderRadius: 16,
            borderWidth: 1,
            borderColor: theme.colors.explorerTeal + "30",
          }}
        >
          <Text
            weight="semibold"
            style={{
              color: theme.colors.explorerTeal,
              fontFamily: theme.typography.fontFamily.semibold,
              fontSize: 12,
            }}
          >
            View All
          </Text>
        </TouchableOpacity>
      </Row>

      {/* 2x2 Grid Layout for Games */}
      <View
        style={{
          flexDirection: "row",
          flexWrap: "wrap",
          justifyContent: "space-between",
          marginHorizontal: -theme.spacing.xs,
        }}
      >
        {/* Match the Word */}
        <TouchableOpacity
          onPress={() => router.push("/games/match-word")}
          style={[
            styles.gameCard,
            {
              borderWidth: 1,
              borderColor: theme.colors.explorerTeal + "30",
            },
          ]}
        >
          <View
            style={[
              styles.gameIconContainer,
              { backgroundColor: theme.colors.explorerTeal + "15" },
            ]}
          >
            <Ionicons
              name="link-outline"
              size={32}
              color={theme.colors.explorerTeal}
            />
          </View>
          <Text
            weight="bold"
            style={[
              styles.gameName,
              {
                color: theme.colors.oceanBlue,
                fontFamily: theme.typography.fontFamily.semibold,
              },
            ]}
          >
            Match the Word
          </Text>
          <Text
            style={[
              styles.gameDescription,
              {
                color: theme.colors.neutral[600],
                fontFamily: theme.typography.fontFamily.regular,
              },
            ]}
          >
            Match Korean words with meanings
          </Text>
          <View style={[styles.xpBadge, { backgroundColor: BRAND_COLORS.OCEAN_BLUE }]}>
            <Text style={styles.xpText}>+25 XP</Text>
          </View>
        </TouchableOpacity>

        {/* Sentence Scramble */}
        <TouchableOpacity
          onPress={() => router.push("/games/sentence-scramble")}
          style={[
            styles.gameCard,
            {
              borderWidth: 1,
              borderColor: BRAND_COLORS.RUCKSACK_BROWN + "30",
            },
          ]}
        >
          <View
            style={[
              styles.gameIconContainer,
              { backgroundColor: BRAND_COLORS.RUCKSACK_BROWN + "15" },
            ]}
          >
            <Ionicons name="shuffle-outline" size={32} color={BRAND_COLORS.RUCKSACK_BROWN} />
          </View>
          <Text
            weight="bold"
            style={[
              styles.gameName,
              {
                color: theme.colors.brandNavy,
                fontFamily: theme.typography.fontFamily.semibold,
              },
            ]}
          >
            Sentence Scramble
          </Text>
          <Text
            style={[
              styles.gameDescription,
              {
                color: theme.colors.neutral[600],
                fontFamily: theme.typography.fontFamily.regular,
              },
            ]}
          >
            Arrange words to form sentences
          </Text>
          <View style={[styles.xpBadge, { backgroundColor: BRAND_COLORS.OCEAN_BLUE }]}>
            <Text style={styles.xpText}>+30 XP</Text>
          </View>
        </TouchableOpacity>

        {/* Pronunciation Challenge */}
        <TouchableOpacity
          onPress={() => router.push("/games/pronunciation-challenge")}
          style={[
            styles.gameCard,
            {
              borderWidth: 1,
              borderColor: BRAND_COLORS.SKY_AQUA + "30",
            },
          ]}
        >
          <View
            style={[
              styles.gameIconContainer,
              { backgroundColor: BRAND_COLORS.SKY_AQUA + "15" },
            ]}
          >
            <Ionicons name="mic-outline" size={32} color={BRAND_COLORS.SKY_AQUA} />
          </View>
          <Text
            weight="bold"
            style={[
              styles.gameName,
              {
                color: theme.colors.brandNavy,
                fontFamily: theme.typography.fontFamily.semibold,
              },
            ]}
          >
            Pronunciation
          </Text>
          <Text
            style={[
              styles.gameDescription,
              {
                color: theme.colors.neutral[600],
                fontFamily: theme.typography.fontFamily.regular,
              },
            ]}
          >
            Practice speaking correctly
          </Text>
          <View style={[styles.xpBadge, { backgroundColor: BRAND_COLORS.OCEAN_BLUE }]}>
            <Text style={styles.xpText}>+35 XP</Text>
          </View>
        </TouchableOpacity>

        {/* Conversation Quest */}
        <TouchableOpacity
          onPress={() =>
            router.push({
              pathname: "/tutor/standalone-conversation",
              params: {
                scenarioId: "general-conversation",
                title: "Conversation Quest",
                level: "Advanced",
              },
            })
          }
          style={[
            styles.gameCard,
            {
              borderWidth: 1,
              borderColor: BRAND_COLORS.EXPLORER_TEAL + "30",
            },
          ]}
        >
          <View
            style={[
              styles.gameIconContainer,
              { backgroundColor: BRAND_COLORS.EXPLORER_TEAL + "15" },
            ]}
          >
            <Ionicons
              name="chatbubbles-outline"
              size={32}
              color={BRAND_COLORS.EXPLORER_TEAL}
            />
          </View>
          <Text
            weight="bold"
            style={[
              styles.gameName,
              {
                color: theme.colors.brandNavy,
                fontFamily: theme.typography.fontFamily.semibold,
              },
            ]}
          >
            Conversation Quest
          </Text>
          <Text
            style={[
              styles.gameDescription,
              {
                color: theme.colors.neutral[600],
                fontFamily: theme.typography.fontFamily.regular,
              },
            ]}
          >
            Interactive conversation scenarios
          </Text>
          <View style={[styles.xpBadge, { backgroundColor: BRAND_COLORS.OCEAN_BLUE }]}>
            <Text style={styles.xpText}>+40 XP</Text>
          </View>
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
};

export default GamesSection;
