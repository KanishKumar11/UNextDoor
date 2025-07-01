import React, { useState, useEffect } from "react";
import {
  FlatList,
  TouchableOpacity,
  View,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../../../shared/context/ThemeContext";
// import * as tutorService from '../services/tutorService';

// Import modern components
import {
  Container,
  Row,
  Column,
  Spacer,
  Text,
  Heading,
  ModernCard,
  ModernBadge,
  FadeIn,
} from "../../../shared/components";

/**
 * ModernConversationListScreen component
 * A modern implementation of the conversation list screen
 */
const ModernConversationListScreen = () => {
  const router = useRouter();
  const { theme } = useTheme();

  // State
  const [conversations, setConversations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch conversations on mount
  useEffect(() => {
    const fetchConversations = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Fetch conversations from API
        // const data = await tutorService.getConversations();

        // // Use sample data if API returns empty
        // setConversations(data?.length > 0 ? data : sampleConversations);
      } catch (err) {
        console.error("Error fetching conversations:", err);
        setError("Failed to load conversations. Please try again.");
        setConversations(sampleConversations);
      } finally {
        setIsLoading(false);
      }
    };

    fetchConversations();
  }, []);

  // Sample conversations for development
  const sampleConversations = [
    {
      id: "1",
      title: "Greetings & Introductions",
      level: "Beginner",
      lastMessage: "Hello, how are you today?",
      timestamp: new Date(Date.now() - 3600000),
      scenarioId: "1",
    },
    {
      id: "2",
      title: "Ordering Food",
      level: "Beginner",
      lastMessage: "I would like to order a coffee, please.",
      timestamp: new Date(Date.now() - 86400000),
      scenarioId: "2",
    },
    {
      id: "3",
      title: "Making Plans",
      level: "Intermediate",
      lastMessage: "Would you like to go to the movies this weekend?",
      timestamp: new Date(Date.now() - 172800000),
      scenarioId: "3",
    },
    {
      id: "4",
      title: "Job Interview",
      level: "Advanced",
      lastMessage: "Can you tell me about your previous work experience?",
      timestamp: new Date(Date.now() - 259200000),
      scenarioId: "4",
    },
  ];

  // Delete conversation
  const handleDeleteConversation = async (id) => {
    try {
      // Optimistic update
      setConversations((prev) => prev.filter((conv) => conv.id !== id));

      // Delete from API
      // await tutorService.deleteConversation(id);
    } catch (err) {
      console.error("Error deleting conversation:", err);

      // Revert on error
      const fetchConversations = async () => {
        try {
          // const data = await tutorService.getConversations();
          // setConversations(data?.length > 0 ? data : sampleConversations);
        } catch (fetchErr) {
          console.error(
            "Error fetching conversations after delete error:",
            fetchErr
          );
        }
      };

      fetchConversations();
    }
  };

  // Format timestamp
  const formatTimestamp = (timestamp) => {
    const now = new Date();
    const date = new Date(timestamp);
    const diffMs = now - date;
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
      if (diffHours === 0) {
        const diffMinutes = Math.floor(diffMs / (1000 * 60));
        return `${diffMinutes}m ago`;
      }
      return `${diffHours}h ago`;
    } else if (diffDays === 1) {
      return "Yesterday";
    } else if (diffDays < 7) {
      return `${diffDays}d ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  // Render conversation item
  const renderConversationItem = ({ item, index }) => (
    <FadeIn delay={index * 100}>
      <ModernCard
        interactive
        onPress={() =>
          router.push({
            pathname: "/tutor/conversation",
            params: {
              conversationId: item.id,
              title: item.title,
              level: item.level,
              scenarioId: item.scenarioId,
            },
          })
        }
        style={styles.conversationCard}
      >
        <Row align="center">
          <View style={styles.conversationAvatar}>
            <Ionicons
              name="chatbubbles-outline"
              size={20}
              color={theme.colors.primary[500]}
            />
          </View>

          <Column style={{ flex: 1, marginLeft: theme.spacing.md }}>
            <Row align="center">
              <Text weight="semibold">{item.title}</Text>
              <ModernBadge
                variant="subtle"
                color={
                  item.level === "Beginner"
                    ? "success"
                    : item.level === "Intermediate"
                    ? "warning"
                    : "error"
                }
                size="sm"
                style={{ marginLeft: theme.spacing.xs }}
              >
                {item.level}
              </ModernBadge>
            </Row>

            <Text
              variant="caption"
              numberOfLines={1}
              ellipsizeMode="tail"
              style={{ marginTop: 2 }}
            >
              {item.lastMessage}
            </Text>
          </Column>

          <Column align="flex-end">
            <Text variant="caption" color={theme.colors.text.secondary}>
              {formatTimestamp(item.timestamp)}
            </Text>

            <TouchableOpacity
              style={styles.deleteButton}
              onPress={() => handleDeleteConversation(item.id)}
            >
              <Ionicons
                name="trash-outline"
                size={16}
                color={theme.colors.error.main}
              />
            </TouchableOpacity>
          </Column>
        </Row>
      </ModernCard>
    </FadeIn>
  );

  return (
    <Container useSafeArea={true}>
      {/* Removed ModernHeader to avoid duplicate headers */}

      {isLoading ? (
        <Column align="center" justify="center" style={{ flex: 1 }}>
          <ActivityIndicator size="large" color={theme.colors.primary[500]} />
        </Column>
      ) : error ? (
        <Column
          align="center"
          justify="center"
          style={{ flex: 1, padding: 16 }}
        >
          <Ionicons
            name="alert-circle-outline"
            size={48}
            color={theme.colors.error.main}
          />
          <Text
            align="center"
            color={theme.colors.error.main}
            style={{ marginTop: 16 }}
          >
            {error}
          </Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={() => {
              setIsLoading(true);
              // Retry fetching conversations
              setTimeout(() => {
                setConversations(sampleConversations);
                setIsLoading(false);
                setError(null);
              }, 1000);
            }}
          >
            <Text color={theme.colors.primary[500]}>Retry</Text>
          </TouchableOpacity>
        </Column>
      ) : conversations.length === 0 ? (
        <Column
          align="center"
          justify="center"
          style={{ flex: 1, padding: 16 }}
        >
          <Ionicons
            name="chatbubbles-outline"
            size={48}
            color={theme.colors.neutral[300]}
          />
          <Text
            align="center"
            color={theme.colors.text.secondary}
            style={{ marginTop: 16, marginBottom: 24 }}
          >
            You don't have any conversations yet. Start a new conversation to
            begin practicing.
          </Text>
          <TouchableOpacity
            style={styles.startButton}
            onPress={() => router.push("/tutor/new")}
          >
            <Text color="white">Start New Conversation</Text>
          </TouchableOpacity>
        </Column>
      ) : (
        <FlatList
          data={conversations}
          renderItem={renderConversationItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={[styles.listContent, { paddingBottom: 80 }]}
          showsVerticalScrollIndicator={false}
        />
      )}
    </Container>
  );
};

const styles = StyleSheet.create({
  listContent: {
    padding: 16,
  },
  conversationCard: {
    marginBottom: 12,
  },
  conversationAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(0, 123, 255, 0.1)",
    alignItems: "center",
    justifyContent: "center",
  },
  deleteButton: {
    padding: 4,
    marginTop: 4,
  },
  newButton: {
    padding: 8,
  },
  retryButton: {
    marginTop: 16,
    padding: 8,
  },
  startButton: {
    backgroundColor: "#007BFF",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
});

export default ModernConversationListScreen;
