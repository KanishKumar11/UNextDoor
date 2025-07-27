/**
 * Lesson Game Activity Component
 * Integrates games into the lesson flow for enhanced learning
 */

import React, { useState } from 'react';
import { View, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../../shared/context/ThemeContext';
import { Text, ModernCard, ModernButton } from '../../../shared/components';
import { BRAND_COLORS } from '../../../shared/constants/colors';
import MatchWordGame from '../../games/components/MatchWordGame';
import SentenceScrambleGame from '../../games/components/SentenceScrambleGame';
import PronunciationChallengeGame from '../../games/components/PronunciationChallengeGame';

/**
 * Game activity component for lessons
 * @param {Object} props - Component props
 * @param {string} props.lessonId - Current lesson ID
 * @param {string} props.gameType - Type of game to show
 * @param {Array} props.content - Lesson-specific content for the game
 * @param {Function} props.onComplete - Callback when game is completed
 * @param {Function} props.onSkip - Callback when game is skipped
 * @param {boolean} props.isOptional - Whether the game is optional
 */
const LessonGameActivity = ({
  lessonId,
  gameType,
  content = [],
  onComplete,
  onSkip,
  isOptional = true
}) => {
  const { theme } = useTheme();
  const [showGame, setShowGame] = useState(false);
  const [gameResults, setGameResults] = useState(null);

  // Game configuration
  const gameConfig = {
    'match-word': {
      title: 'Match the Word',
      description: 'Practice the vocabulary from this lesson',
      icon: 'grid-outline',
      color: BRAND_COLORS.EXPLORER_TEAL,
      component: MatchWordGame
    },
    'sentence-scramble': {
      title: 'Sentence Scramble',
      description: 'Arrange words to form correct sentences',
      icon: 'shuffle-outline',
      color: BRAND_COLORS.OCEAN_BLUE,
      component: SentenceScrambleGame
    },
    'pronunciation-challenge': {
      title: 'Pronunciation Challenge',
      description: 'Practice speaking the phrases from this lesson',
      icon: 'mic-outline',
      color: BRAND_COLORS.DEEP_PURPLE,
      component: PronunciationChallengeGame
    }
  };

  const config = gameConfig[gameType];
  if (!config) {
    console.warn(`Unknown game type: ${gameType}`);
    return null;
  }

  const GameComponent = config.component;

  // Handle game start
  const handleStartGame = () => {
    setShowGame(true);
  };

  // Handle game completion
  const handleGameComplete = (results) => {
    setGameResults(results);
    setShowGame(false);

    // Call parent completion handler
    if (onComplete) {
      onComplete(results);
    }
  };

  // Handle game close
  const handleGameClose = () => {
    setShowGame(false);
  };

  // Handle skip game
  const handleSkipGame = () => {
    if (isOptional) {
      if (onSkip) {
        onSkip();
      }
    } else {
      Alert.alert(
        'Game Required',
        'This game activity is required to complete the lesson.',
        [{ text: 'OK' }]
      );
    }
  };

  // If game is active, show the game component
  if (showGame) {
    return (
      <GameComponent
        lessonId={lessonId}
        words={gameType === 'match-word' ? content : undefined}
        sentences={gameType === 'sentence-scramble' ? content : undefined}
        phrases={gameType === 'pronunciation-challenge' ? content : undefined}
        onComplete={handleGameComplete}
        onClose={handleGameClose}
      />
    );
  }

  // Show game completion results
  if (gameResults) {
    return (
      <View style={{ padding: theme.spacing.lg }}>
        <ModernCard
          style={{
            padding: theme.spacing.lg,
            alignItems: 'center',
            backgroundColor: theme.colors.brandGreen + '10',
            borderColor: theme.colors.brandGreen,
            borderWidth: 1,
          }}
        >
          <View
            style={{
              width: 60,
              height: 60,
              borderRadius: 30,
              backgroundColor: theme.colors.brandGreen,
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: theme.spacing.md,
            }}
          >
            <Ionicons
              name="checkmark"
              size={30}
              color={theme.colors.brandWhite}
            />
          </View>

          <Text
            style={{
              fontSize: 20,
              fontFamily: theme.typography.fontFamily.bold,
              color: theme.colors.brandNavy,
              marginBottom: theme.spacing.sm,
              textAlign: 'center',
            }}
          >
            Game Completed!
          </Text>

          <Text
            style={{
              fontSize: 16,
              color: theme.colors.neutral[600],
              textAlign: 'center',
              marginBottom: theme.spacing.lg,
            }}
          >
            {config.title} - Score: {gameResults.score}
          </Text>

          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-around',
              width: '100%',
              marginBottom: theme.spacing.md,
            }}
          >
            <View style={{ alignItems: 'center' }}>
              <Text
                style={{
                  fontSize: 24,
                  fontFamily: theme.typography.fontFamily.bold,
                  color: theme.colors.brandGreen,
                }}
              >
                {gameResults.accuracy}%
              </Text>
              <Text
                style={{
                  fontSize: 12,
                  color: theme.colors.neutral[500],
                }}
              >
                Accuracy
              </Text>
            </View>

            <View style={{ alignItems: 'center' }}>
              <Text
                style={{
                  fontSize: 24,
                  fontFamily: theme.typography.fontFamily.bold,
                  color: theme.colors.brandGreen,
                }}
              >
                {gameResults.correctAnswers}/{gameResults.totalQuestions}
              </Text>
              <Text
                style={{
                  fontSize: 12,
                  color: theme.colors.neutral[500],
                }}
              >
                Correct
              </Text>
            </View>
          </View>

          <ModernButton
            title="Continue Lesson"
            onPress={() => {
              if (onComplete) {
                onComplete(gameResults);
              }
            }}
            style={{
              backgroundColor: theme.colors.brandGreen,
              width: '100%',
            }}
            textStyle={{ color: theme.colors.brandWhite }}
          />
        </ModernCard>
      </View>
    );
  }

  // Show game introduction card
  return (
    <View style={{ padding: theme.spacing.lg }}>
      <ModernCard
        style={{
          padding: theme.spacing.lg,
          borderColor: config.color,
          borderWidth: 1,
        }}
      >
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            marginBottom: theme.spacing.md,
          }}
        >
          <View
            style={{
              width: 50,
              height: 50,
              borderRadius: 25,
              backgroundColor: config.color + '20',
              alignItems: 'center',
              justifyContent: 'center',
              marginRight: theme.spacing.md,
            }}
          >
            <Ionicons
              name={config.icon}
              size={24}
              color={config.color}
            />
          </View>

          <View style={{ flex: 1 }}>
            <Text
              style={{
                fontSize: 18,
                fontFamily: theme.typography.fontFamily.bold,
                color: theme.colors.brandNavy,
                marginBottom: 4,
              }}
            >
              {config.title}
            </Text>
            <Text
              style={{
                fontSize: 14,
                color: theme.colors.neutral[600],
              }}
            >
              {config.description}
            </Text>
          </View>

          {isOptional && (
            <TouchableOpacity
              onPress={handleSkipGame}
              style={{
                padding: theme.spacing.sm,
              }}
            >
              <Text
                style={{
                  fontSize: 14,
                  color: BRAND_COLORS.SHADOW_GREY,
                  textDecorationLine: 'underline',
                }}
              >
                Skip
              </Text>
            </TouchableOpacity>
          )}
        </View>

        <Text
          style={{
            fontSize: 14,
            color: BRAND_COLORS.SHADOW_GREY,
            marginBottom: theme.spacing.lg,
            lineHeight: 20,
          }}
        >
          Practice what you've learned with this interactive game.
          {content.length > 0
            ? ` This game uses content from your current lesson.`
            : ` This game will use content appropriate for your level.`
          }
        </Text>

        <ModernButton
          title="Start Game"
          onPress={handleStartGame}
          style={{
            backgroundColor: config.color,
            width: '100%',
          }}
          textStyle={{ color: BRAND_COLORS.WHISPER_WHITE }}
        />
      </ModernCard>
    </View>
  );
};

export default LessonGameActivity;
