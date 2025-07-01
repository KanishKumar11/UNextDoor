import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '../../../shared/context/ThemeContext';
import SafeAreaWrapper from '../../../shared/components/SafeAreaWrapper';
import { 
  Container, 
  Row, 
  Column, 
  Spacer, 
  Text, 
  Heading, 
  ModernCard, 
  ModernButton 
} from '../../../shared/components';
import { Ionicons } from '@expo/vector-icons';

/**
 * New Conversation Screen
 * Allows users to start a new conversation with the AI tutor
 */
export default function NewConversationScreen() {
  const router = useRouter();
  const { theme } = useTheme();

  // Sample conversation topics
  const conversationTopics = [
    {
      id: 'daily',
      title: 'Daily Conversations',
      description: 'Practice everyday conversations and small talk',
      icon: 'cafe-outline',
      color: theme.colors.primary[500],
    },
    {
      id: 'travel',
      title: 'Travel & Directions',
      description: 'Learn how to navigate and ask for directions',
      icon: 'map-outline',
      color: theme.colors.secondary[500],
    },
    {
      id: 'business',
      title: 'Business & Work',
      description: 'Professional conversations for the workplace',
      icon: 'briefcase-outline',
      color: theme.colors.accent[500],
    },
    {
      id: 'custom',
      title: 'Custom Topic',
      description: 'Choose your own conversation topic',
      icon: 'create-outline',
      color: theme.colors.info[500],
    },
  ];

  // Handle topic selection
  const handleSelectTopic = (topicId) => {
    if (topicId === 'custom') {
      // Navigate to custom topic screen
      router.push('/tutor/custom');
    } else {
      // Navigate to conversation with selected topic
      router.push({
        pathname: '/tutor/conversation',
        params: { topicId },
      });
    }
  };

  return (
    <SafeAreaWrapper>
      <Container withPadding>
        <Column>
          <Heading level="h1" gutterBottom>Start a New Conversation</Heading>
          <Text color="neutral.600" gutterBottom>
            Choose a topic to practice with our AI tutor
          </Text>
          
          <Spacer size="lg" />
          
          {/* Topic cards */}
          {conversationTopics.map((topic) => (
            <ModernCard
              key={topic.id}
              interactive
              onPress={() => handleSelectTopic(topic.id)}
              style={{ marginBottom: theme.spacing.md }}
            >
              <Row align="center">
                <View
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: 24,
                    backgroundColor: topic.color,
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginRight: theme.spacing.md,
                  }}
                >
                  <Ionicons name={topic.icon} size={24} color="white" />
                </View>
                
                <Column style={{ flex: 1 }}>
                  <Text weight="semibold">{topic.title}</Text>
                  <Text variant="caption" color="neutral.600">
                    {topic.description}
                  </Text>
                </Column>
                
                <Ionicons
                  name="chevron-forward"
                  size={20}
                  color={theme.colors.neutral[400]}
                />
              </Row>
            </ModernCard>
          ))}
          
          <Spacer size="lg" />
          
          <ModernButton
            text="Back to Conversations"
            variant="outline"
            iconName="arrow-back-outline"
            onPress={() => router.back()}
          />
        </Column>
      </Container>
    </SafeAreaWrapper>
  );
}
