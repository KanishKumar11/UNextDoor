import React, { useState } from 'react';
import { View, StyleSheet, TextInput } from 'react-native';
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
 * Custom Conversation Screen
 * Allows users to create a custom conversation topic
 */
export default function CustomConversationScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const [topic, setTopic] = useState('');
  const [level, setLevel] = useState('Beginner');
  const [goal, setGoal] = useState('');

  // Sample difficulty levels
  const difficultyLevels = [
    { id: 'beginner', label: 'Beginner' },
    { id: 'intermediate', label: 'Intermediate' },
    { id: 'advanced', label: 'Advanced' },
  ];

  // Handle start conversation
  const handleStartConversation = () => {
    if (!topic.trim()) {
      // Show error or validation message
      return;
    }

    // Navigate to conversation with custom topic
    router.push({
      pathname: '/tutor/conversation',
      params: { 
        title: topic,
        level,
        goal,
        isCustom: true 
      },
    });
  };

  return (
    <SafeAreaWrapper>
      <Container withPadding>
        <Column>
          <Heading level="h1" gutterBottom>Custom Conversation</Heading>
          <Text color="neutral.600" gutterBottom>
            Create your own conversation topic to practice with our AI tutor
          </Text>
          
          <Spacer size="lg" />
          
          {/* Topic input */}
          <ModernCard style={{ marginBottom: theme.spacing.md }}>
            <Heading level="h4" gutterBottom>Conversation Topic</Heading>
            <Text color="neutral.600" gutterBottom>
              What would you like to talk about?
            </Text>
            
            <TextInput
              style={{
                borderWidth: 1,
                borderColor: theme.colors.neutral[300],
                borderRadius: theme.borderRadius.md,
                padding: theme.spacing.md,
                marginTop: theme.spacing.sm,
                fontSize: theme.typography.fontSize.md,
              }}
              placeholder="Enter a topic (e.g., Ordering coffee)"
              value={topic}
              onChangeText={setTopic}
            />
          </ModernCard>
          
          {/* Difficulty level */}
          <ModernCard style={{ marginBottom: theme.spacing.md }}>
            <Heading level="h4" gutterBottom>Difficulty Level</Heading>
            <Text color="neutral.600" gutterBottom>
              Select the difficulty level for this conversation
            </Text>
            
            <Row wrap justify="flex-start" style={{ marginTop: theme.spacing.sm }}>
              {difficultyLevels.map((item) => (
                <TouchableOpacity
                  key={item.id}
                  style={{
                    borderWidth: 1,
                    borderColor: level === item.label 
                      ? theme.colors.primary[500] 
                      : theme.colors.neutral[300],
                    backgroundColor: level === item.label 
                      ? theme.colors.primary[50] 
                      : 'transparent',
                    borderRadius: theme.borderRadius.full,
                    paddingHorizontal: theme.spacing.md,
                    paddingVertical: theme.spacing.sm,
                    marginRight: theme.spacing.sm,
                    marginBottom: theme.spacing.sm,
                  }}
                  onPress={() => setLevel(item.label)}
                >
                  <Text 
                    color={level === item.label ? 'primary.500' : 'neutral.700'}
                    weight={level === item.label ? 'medium' : 'regular'}
                  >
                    {item.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </Row>
          </ModernCard>
          
          {/* Learning goal */}
          <ModernCard style={{ marginBottom: theme.spacing.md }}>
            <Heading level="h4" gutterBottom>Learning Goal (Optional)</Heading>
            <Text color="neutral.600" gutterBottom>
              What would you like to achieve with this conversation?
            </Text>
            
            <TextInput
              style={{
                borderWidth: 1,
                borderColor: theme.colors.neutral[300],
                borderRadius: theme.borderRadius.md,
                padding: theme.spacing.md,
                marginTop: theme.spacing.sm,
                fontSize: theme.typography.fontSize.md,
                height: 100,
                textAlignVertical: 'top',
              }}
              placeholder="Enter your learning goal (e.g., Learn how to order different types of coffee)"
              value={goal}
              onChangeText={setGoal}
              multiline
            />
          </ModernCard>
          
          <Spacer size="lg" />
          
          {/* Action buttons */}
          <Row justify="space-between">
            <ModernButton
              text="Cancel"
              variant="outline"
              iconName="close-outline"
              onPress={() => router.back()}
              style={{ flex: 1, marginRight: theme.spacing.sm }}
            />
            
            <ModernButton
              text="Start Conversation"
              variant="solid"
              iconName="chatbubble-outline"
              iconPosition="right"
              onPress={handleStartConversation}
              style={{ flex: 1, marginLeft: theme.spacing.sm }}
              disabled={!topic.trim()}
            />
          </Row>
        </Column>
      </Container>
    </SafeAreaWrapper>
  );
}
