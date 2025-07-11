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

const { width } = Dimensions.get("window");

const LearningModulesGrid = ({ fadeAnim, scaleAnim }) => {
  const { theme } = useTheme();
  const router = useRouter();

  const styles = StyleSheet.create({
    gameCard: {
      width: (width - 48) / 2,
      backgroundColor: "#F9F9F9",
      borderRadius: 12,
      padding: 16,
      marginBottom: 16,
      marginHorizontal: 4,
      position: "relative",
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
            Learning
          </Text>
          <Heading
            level="h3"
            style={{
              color: theme.colors.brandNavy,
              fontFamily: theme.typography.fontFamily.bold,
              fontSize: 20,
            }}
          >
            Modules & Games
          </Heading>
        </Column>
        <TouchableOpacity
          onPress={() => router.push("/tutor/lessons")}
          style={{
            backgroundColor: theme.colors.brandGreen + "15",
            paddingHorizontal: 12,
            paddingVertical: 6,
            borderRadius: 16,
            borderWidth: 1,
            borderColor: theme.colors.brandGreen + "30",
          }}
        >
          <Text
            weight="semibold"
            style={{
              color: theme.colors.brandGreen,
              fontFamily: theme.typography.fontFamily.semibold,
              fontSize: 12,
            }}
          >
            View All
          </Text>
        </TouchableOpacity>
      </Row>
      
      {/* 2x2 Grid Layout for Learning Modules */}
      <View
        style={{
          flexDirection: "row",
          flexWrap: "wrap",
          justifyContent: "space-between",
          marginHorizontal: -theme.spacing.xs,
        }}
      >
        {/* Lessons Module */}
        <TouchableOpacity
          onPress={() => router.push("/tutor/lessons")}
          style={[
            styles.gameCard,
            {
              backgroundColor: theme.colors.brandWhite,
              borderWidth: 1,
              borderColor: theme.colors.brandGreen + "30",
            },
          ]}
        >
          <View
            style={[
              styles.gameIconContainer,
              { backgroundColor: theme.colors.brandGreen + "15" },
            ]}
          >
            <Ionicons
              name="book-outline"
              size={32}
              color={theme.colors.brandGreen}
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
            Lessons
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
            Structured learning modules
          </Text>
        </TouchableOpacity>

        {/* Vocabulary Module */}
        <TouchableOpacity
          onPress={() => router.push("/vocabulary")}
          style={[
            styles.gameCard,
            {
              backgroundColor: theme.colors.brandWhite,
              borderWidth: 1,
              borderColor: "#2196F3" + "30",
            },
          ]}
        >
          <View
            style={[
              styles.gameIconContainer,
              { backgroundColor: "#2196F3" + "15" },
            ]}
          >
            <Ionicons name="library-outline" size={32} color="#2196F3" />
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
            Vocabulary
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
            Learn new words and phrases
          </Text>
        </TouchableOpacity>

        {/* Games Module */}
        <TouchableOpacity
          onPress={() => router.push("/games")}
          style={[
            styles.gameCard,
            {
              backgroundColor: theme.colors.brandWhite,
              borderWidth: 1,
              borderColor: "#FF9800" + "30",
            },
          ]}
        >
          <View
            style={[
              styles.gameIconContainer,
              { backgroundColor: "#FF9800" + "15" },
            ]}
          >
            <Ionicons name="game-controller-outline" size={32} color="#FF9800" />
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
            Games
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
            Fun learning activities
          </Text>
        </TouchableOpacity>

        {/* AI Tutor Module */}
        <TouchableOpacity
          onPress={() => router.push("/tutor/scenarios")}
          style={[
            styles.gameCard,
            {
              backgroundColor: theme.colors.brandWhite,
              borderWidth: 1,
              borderColor: "#9C27B0" + "30",
            },
          ]}
        >
          <View
            style={[
              styles.gameIconContainer,
              { backgroundColor: "#9C27B0" + "15" },
            ]}
          >
            <Ionicons name="chatbubbles-outline" size={32} color="#9C27B0" />
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
            AI Tutor
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
            Practice conversations
          </Text>
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
};

export default LearningModulesGrid;
