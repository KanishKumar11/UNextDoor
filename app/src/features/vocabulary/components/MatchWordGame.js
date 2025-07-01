import React, { useState, useEffect, useCallback } from "react";
import { View, StyleSheet, TouchableOpacity, Animated } from "react-native";
import { Text, ModernCard } from "../../../shared/components";
import { Ionicons } from "@expo/vector-icons";
import modernTheme from "../../../shared/styles/modernTheme";

/**
 * MatchWordGame component
 * A simple game to match Korean words with their English translations
 *
 * @param {Object} props
 * @param {Array} props.wordPairs - Array of {korean, english} word pairs
 * @param {string} props.difficulty - 'beginner', 'intermediate', or 'advanced'
 * @param {Function} props.onComplete - Callback when game is completed
 * @param {Function} props.onScore - Callback with score when game is completed
 */
const MatchWordGame = ({
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

      // Flip the card with animation
      Animated.timing(flipAnimations[index], {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
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
          // Match found
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

          // Check if game is complete
          if (newMatchedPairs.length === wordPairs.length) {
            setGameComplete(true);

            // Calculate final score with bonus for fewer moves
            const movesBonus = Math.max(0, 100 - moves * 5);
            const finalScore = newScore + movesBonus;
            setScore(finalScore);

            // Call completion callbacks
            onComplete && onComplete();
            onScore && onScore(finalScore);
          }
        } else {
          // No match, flip cards back after delay
          setTimeout(() => {
            Animated.parallel([
              Animated.timing(flipAnimations[firstIndex], {
                toValue: 0,
                duration: 300,
                useNativeDriver: true,
              }),
              Animated.timing(flipAnimations[secondIndex], {
                toValue: 0,
                duration: 300,
                useNativeDriver: true,
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
      shadowColor: "#000",
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
    backgroundColor: "rgba(255, 255, 255, 0.9)",
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

export default MatchWordGame;
