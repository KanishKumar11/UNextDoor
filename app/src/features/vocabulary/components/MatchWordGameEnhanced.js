import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Platform,
  Easing,
  Vibration,
} from "react-native";
import { Text, ModernCard, ModernButton } from "../../../shared/components";
import { Ionicons } from "@expo/vector-icons";
import modernTheme from "../../../shared/styles/modernTheme";
import { vocabularyService } from "../services/vocabularyService";
import { BRAND_COLORS } from "../../../shared/constants/colors";

/**
 * MatchWordGame component - Enhanced version
 * A simple game to match Korean words with their English translations
 *
 * @param {Object} props
 * @param {Array} props.wordPairs - Array of {korean, english} word pairs
 * @param {string} props.difficulty - 'beginner', 'intermediate', or 'advanced'
 * @param {Function} props.onComplete - Callback when game is completed
 * @param {Function} props.onScore - Callback with score when game is completed
 */
const MatchWordGameEnhanced = ({
  wordPairs = [],
  difficulty = "beginner",
  onComplete,
  onScore,
}) => {
  // Game state
  const [cards, setCards] = useState([]);
  const [flippedIndices, setFlippedIndices] = useState([]);
  const [matchedPairs, setMatchedPairs] = useState([]);
  const [moves, setMoves] = useState(0);
  const [gameComplete, setGameComplete] = useState(false);
  const [score, setScore] = useState(0);
  const [wordResults, setWordResults] = useState([]);

  // Animation values for card flipping
  const flipAnimations = React.useRef(
    Array(wordPairs.length * 2)
      .fill()
      .map(() => new Animated.Value(0))
  ).current;

  // Initialize game
  useEffect(() => {
    if (wordPairs.length === 0) return;

    // Create cards from word pairs
    const newCards = [];
    wordPairs.forEach((pair, index) => {
      // Add Korean card
      newCards.push({
        id: `korean-${index}`,
        text: pair.korean,
        type: "korean",
        pairId: index,
      });

      // Add English card
      newCards.push({
        id: `english-${index}`,
        text: pair.english,
        type: "english",
        pairId: index,
      });
    });

    // Shuffle cards
    const shuffledCards = shuffleArray(newCards);
    setCards(shuffledCards);

    // Reset game state
    setFlippedIndices([]);
    setMatchedPairs([]);
    setMoves(0);
    setGameComplete(false);
    setScore(0);
  }, [wordPairs]);

  // Handle card flip
  const handleCardPress = useCallback(
    (index) => {
      // Ignore if card is already flipped or matched
      if (
        flippedIndices.includes(index) ||
        matchedPairs.includes(cards[index].pairId)
      ) {
        return;
      }

      // Ignore if two cards are already flipped
      if (flippedIndices.length === 2) {
        return;
      }

      // Add vibration feedback for better user experience
      try {
        // Use short vibration for card flip
        Vibration.vibrate(20);
      } catch (error) {
        // Ignore vibration errors - not critical
        console.log("Vibration not available");
      }

      // Flip the card with animation
      Animated.timing(flipAnimations[index], {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
        easing: Easing.out(Easing.back(1.5)), // Add spring effect for more natural feel
      }).start();

      // Add to flipped cards
      const newFlippedIndices = [...flippedIndices, index];
      setFlippedIndices(newFlippedIndices);

      // Check for match if two cards are flipped
      if (newFlippedIndices.length === 2) {
        const [firstIndex, secondIndex] = newFlippedIndices;
        const firstCard = cards[firstIndex];
        const secondCard = cards[secondIndex];

        // Increment moves
        setMoves(moves + 1);

        // Check if cards match (same pairId but different types)
        if (
          firstCard.pairId === secondCard.pairId &&
          firstCard.type !== secondCard.type
        ) {
          // Match found - add vibration feedback
          try {
            // Use medium vibration for match found
            Vibration.vibrate(50);
          } catch (error) {
            // Ignore vibration errors
          }

          // Match found - add animation for matched cards
          Animated.sequence([
            // Small bounce effect
            Animated.timing(flipAnimations[firstIndex], {
              toValue: 1.1,
              duration: 100,
              useNativeDriver: true,
            }),
            Animated.timing(flipAnimations[firstIndex], {
              toValue: 1,
              duration: 100,
              useNativeDriver: true,
            }),
          ]).start();

          Animated.sequence([
            // Small bounce effect
            Animated.timing(flipAnimations[secondIndex], {
              toValue: 1.1,
              duration: 100,
              useNativeDriver: true,
            }),
            Animated.timing(flipAnimations[secondIndex], {
              toValue: 1,
              duration: 100,
              useNativeDriver: true,
            }),
          ]).start();

          // Update matched pairs
          const newMatchedPairs = [...matchedPairs, firstCard.pairId];
          setMatchedPairs(newMatchedPairs);
          setFlippedIndices([]);

          // Calculate score based on moves and difficulty
          const basePoints = 10;
          const difficultyMultiplier =
            difficulty === "beginner"
              ? 1
              : difficulty === "intermediate"
                ? 1.5
                : 2;

          const newScore =
            score + Math.round(basePoints * difficultyMultiplier);
          setScore(newScore);

          // Track word result for vocabulary mastery
          const wordPair = wordPairs[firstCard.pairId];
          setWordResults((prev) => [
            ...prev,
            {
              wordData: {
                word: wordPair.korean,
                translation: wordPair.english,
                category: "game",
                level: difficulty,
              },
              isCorrect: true,
            },
          ]);

          // Check if game is complete
          if (newMatchedPairs.length === wordPairs.length) {
            // Add a small delay before showing completion screen
            setTimeout(() => {
              setGameComplete(true);

              // Calculate final score with bonus for fewer moves
              const movesBonus = Math.max(0, 100 - moves * 5);
              const finalScore = newScore + movesBonus;
              setScore(finalScore);

              // Save vocabulary mastery data
              try {
                vocabularyService.saveWordResults("match-word", wordResults);
              } catch (error) {
                console.error("Error saving vocabulary mastery:", error);
              }

              // Call completion callbacks
              onComplete && onComplete();
              onScore && onScore(finalScore);

              // Add success vibration feedback
              try {
                // Use pattern vibration for game completion
                Vibration.vibrate([0, 100, 100, 100, 100, 100]);
              } catch (error) {
                // Ignore vibration errors
              }
            }, 500);
          }
        } else {
          // No match - add vibration feedback
          try {
            // Use short double vibration for no match
            Vibration.vibrate([0, 30, 30, 30]);
          } catch (error) {
            // Ignore vibration errors
          }

          // No match, flip cards back after delay
          setTimeout(() => {
            Animated.parallel([
              Animated.timing(flipAnimations[firstIndex], {
                toValue: 0,
                duration: 300,
                useNativeDriver: true,
                easing: Easing.out(Easing.ease),
              }),
              Animated.timing(flipAnimations[secondIndex], {
                toValue: 0,
                duration: 300,
                useNativeDriver: true,
                easing: Easing.out(Easing.ease),
              }),
            ]).start();

            setFlippedIndices([]);
          }, 1000);
        }
      }
    },
    [
      cards,
      flippedIndices,
      matchedPairs,
      moves,
      score,
      difficulty,
      flipAnimations,
      onComplete,
      onScore,
      wordPairs.length,
    ]
  );

  // Render a card
  const renderCard = (card, index) => {
    const isFlipped = flippedIndices.includes(index);
    const isMatched = matchedPairs.includes(card.pairId);

    // Interpolate flip animation
    const flipRotation = flipAnimations[index].interpolate({
      inputRange: [0, 1],
      outputRange: ["0deg", "180deg"],
    });

    // Determine card color based on type and state
    const cardColor = isMatched
      ? modernTheme.colors.success[100]
      : card.type === "korean"
        ? modernTheme.colors.primary[100]
        : modernTheme.colors.secondary[100];

    // Determine text color based on type and state
    const textColor = isMatched
      ? modernTheme.colors.success[700]
      : card.type === "korean"
        ? modernTheme.colors.primary[700]
        : modernTheme.colors.secondary[700];

    // Add a border for matched cards
    const borderStyle = isMatched
      ? {
        borderWidth: 2,
        borderColor: modernTheme.colors.success[500],
      }
      : {};

    // Add a shadow for better visual feedback
    const shadowStyle = {
      shadowColor: "#4F4F4F", // Shadow Grey
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 2,
    };

    return (
      <TouchableOpacity
        key={card.id}
        onPress={() => handleCardPress(index)}
        disabled={isFlipped || isMatched || gameComplete}
        style={[styles.cardContainer, shadowStyle]}
        activeOpacity={0.7}
      >
        <Animated.View
          style={[
            styles.cardInner,
            {
              transform: [{ rotateY: flipRotation }],
            },
          ]}
        >
          {/* Card Back */}
          <View
            style={[
              styles.cardFace,
              styles.cardBack,
              isMatched && styles.cardMatched,
            ]}
          >
            <View style={styles.cardBackContent}>
              <Ionicons
                name="card-outline"
                size={32}
                color={modernTheme.colors.primary[400]}
              />
              <Text
                variant="caption"
                weight="medium"
                align="center"
                style={{ marginTop: 4 }}
              >
                Tap to flip
              </Text>
            </View>
          </View>

          {/* Card Front */}
          <View
            style={[
              styles.cardFace,
              styles.cardFront,
              { backgroundColor: cardColor },
              borderStyle,
            ]}
          >
            <Text
              weight="semibold"
              align="center"
              style={{ color: textColor, fontSize: 16 }}
            >
              {card.text}
            </Text>

            {isMatched && (
              <View style={styles.matchedBadge}>
                <Ionicons
                  name="checkmark-circle"
                  size={20}
                  color={modernTheme.colors.success[500]}
                />
              </View>
            )}
          </View>
        </Animated.View>
      </TouchableOpacity>
    );
  };

  // Shuffle array helper function
  const shuffleArray = (array) => {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
  };

  // Render game completion overlay
  const renderGameComplete = () => {
    if (!gameComplete) return null;

    return (
      <View style={styles.gameCompleteContainer}>
        <ModernCard style={styles.gameCompleteCard}>
          <Ionicons
            name="trophy"
            size={64}
            color={modernTheme.colors.warning[500]}
          />
          <Text weight="bold" size="xl" align="center">
            Game Complete!
          </Text>
          <Text style={styles.scoreText}>{score}</Text>
          <Text align="center">You completed the game in {moves} moves</Text>
          <View style={{ marginTop: 24, width: "100%" }}>
            <ModernButton
              text="Play Again"
              variant="primary"
              onPress={() => {
                // Reset game
                setGameComplete(false);
                setMatchedPairs([]);
                setFlippedIndices([]);
                setMoves(0);
                setScore(0);

                // Reset animations
                flipAnimations.forEach((anim) => anim.setValue(0));

                // Shuffle cards
                setCards(shuffleArray([...cards]));
              }}
            />
          </View>
        </ModernCard>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Game header */}
      <View style={styles.header}>
        <Text weight="semibold">Moves: {moves}</Text>
        <Text weight="semibold">Score: {score}</Text>
      </View>

      {/* Game board */}
      <View style={styles.board}>
        {cards.map((card, index) => renderCard(card, index))}
      </View>

      {/* Game completion overlay */}
      {renderGameComplete()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
    paddingHorizontal: 8,
  },
  board: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    marginTop: 16,
  },
  cardContainer: {
    width: "30%",
    aspectRatio: 0.7,
    margin: "1.5%",
    perspective: 1000,
    borderRadius: 12,
  },
  cardInner: {
    width: "100%",
    height: "100%",
    position: "relative",
    transformStyle: "preserve-3d",
    borderRadius: 12,
  },
  cardFace: {
    width: "100%",
    height: "100%",
    position: "absolute",
    backfaceVisibility: "hidden",
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    padding: 8,
  },
  cardBack: {
    backgroundColor: modernTheme.colors.neutral[100],
    borderWidth: 1,
    borderColor: modernTheme.colors.neutral[300],
  },
  cardBackContent: {
    alignItems: "center",
    justifyContent: "center",
  },
  cardFront: {
    transform: [{ rotateY: "180deg" }],
    borderWidth: 1,
    borderColor: "transparent",
  },
  cardMatched: {
    backgroundColor: modernTheme.colors.success[50],
    borderWidth: 2,
    borderColor: modernTheme.colors.success[500],
  },
  matchedBadge: {
    position: "absolute",
    top: 8,
    right: 8,
  },
  gameCompleteContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: BRAND_COLORS.CARD_BACKGROUND + "E6", // Using constant with transparency
    justifyContent: "center",
    alignItems: "center",
    zIndex: 10,
  },
  gameCompleteCard: {
    padding: 24,
    borderRadius: 16,
    width: "80%",
    alignItems: "center",
    backgroundColor: "white",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  scoreText: {
    fontSize: 48,
    fontWeight: "bold",
    color: modernTheme.colors.primary[500],
    marginVertical: 16,
  },
});

export default MatchWordGameEnhanced;
