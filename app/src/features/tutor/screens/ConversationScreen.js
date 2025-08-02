import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import SafeAreaWrapper from '../../../shared/components/SafeAreaWrapper';
import {
  Container,
  Heading,
  Text,
  ModernButton,
  ModernCard,
  Row,
  Column,
  Spacer
} from '../../../shared/components';
import PersistentConversationView from '../components/PersistentConversationView';
import { tutorService } from '../services/tutorService';
import { BRAND_COLORS } from '../../../shared/constants/colors';
import { useTheme } from '../../../shared/context/ThemeContext';
import { Ionicons } from '@expo/vector-icons';

/**
 * ConversationScreen component
 * Displays a single conversation with the AI tutor
 * 
 * @param {Object} props
 * @param {string} props.conversationId - ID of the conversation to display
 * @param {Object} props.params - Additional parameters from the URL
 */
const ConversationScreen = ({ conversationId, params = {} }) => {
  const router = useRouter();
  const theme = useTheme();
  const [conversation, setConversation] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // If no conversationId is provided, check if it's in params
  const id = conversationId || params?.id;

  // Get scenario from params if available
  const scenarioId = params?.scenarioId;
  const scenarioTitle = params?.title || 'Conversation';

  // Load conversation data
  useEffect(() => {
    const loadConversation = async () => {
      try {
        setIsLoading(true);
        setError(null);

        if (id) {
          // Load existing conversation
          const data = await tutorService.getConversation(id);
          setConversation(data);
        } else if (scenarioId) {
          // Create a new conversation based on scenario
          const data = await tutorService.createConversation(scenarioId);
          setConversation(data);
        } else {
          // No ID or scenario provided
          setError('No conversation ID or scenario provided');
        }

        setIsLoading(false);
      } catch (err) {
        console.error('Error loading conversation:', err);
        setError('Failed to load conversation. Please try again.');
        setIsLoading(false);
      }
    };

    loadConversation();
  }, [id, scenarioId]);

  // Handle errors in the conversation component
  const handleError = (error) => {
    console.error('Conversation error:', error);
    setError(`Error: ${error.message || 'Unknown error'}`);
  };

  // Handle back button press
  const handleBack = () => {
    router.back();
  };

  // Render loading state
  if (isLoading) {
    return (
      <SafeAreaWrapper>
        <Container withPadding>
          <Column align="center" justify="center" style={{ flex: 1 }}>
            <ActivityIndicator size="large" color={BRAND_COLORS.EXPLORER_TEAL} />
            <Spacer size="md" />
            <Text>Loading conversation...</Text>
          </Column>
        </Container>
      </SafeAreaWrapper>
    );
  }

  // Render error state
  if (error) {
    return (
      <SafeAreaWrapper>
        <Container withPadding>
          <Column align="center" justify="center" style={{ flex: 1 }}>
            <Ionicons
              name="alert-circle-outline"
              size={48}
              color={BRAND_COLORS.WARM_CORAL}
            />
            <Spacer size="md" />
            <Text>{error}</Text>
            <Spacer size="lg" />
            <ModernButton
              text="Go Back"
              variant="primary"
              onPress={handleBack}
            />
          </Column>
        </Container>
      </SafeAreaWrapper>
    );
  }

  // If we have a conversation or scenario, render the RealtimeConversation component
  return (
    <SafeAreaWrapper>
      <Container>
        <View style={styles.header}>
          <ModernButton
            icon="arrow-back"
            variant="ghost"
            onPress={handleBack}
            style={styles.backButton}
          />
          <Heading level="h2">{conversation?.title || scenarioTitle}</Heading>
        </View>

        <View style={styles.conversationContainer}>
          <PersistentConversationView
            scenarioId={scenarioId}
            level="beginner"
            user={null} // TODO: Pass user information when available
            onSessionEnd={() => {
              console.log("Session ended");
            }}
          />
        </View>
      </Container>
    </SafeAreaWrapper>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: BRAND_COLORS.CARD_BACKGROUND,
    borderBottomWidth: 2,
    borderBottomColor: BRAND_COLORS.EXPLORER_TEAL + '20',
  },
  backButton: {
    marginRight: 16,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: BRAND_COLORS.SHADOW_GREY + '20',
    alignItems: 'center',
    justifyContent: 'center',
  },
  conversationContainer: {
    flex: 1,
    backgroundColor: BRAND_COLORS.CARD_BACKGROUND,
  },
});

export default ConversationScreen;
