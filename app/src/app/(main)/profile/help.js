import React from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
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
 * Help & Support Screen
 * Provides help resources and support options for users
 */
export default function HelpScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  
  // Sample FAQ items
  const faqItems = [
    {
      id: 'faq1',
      question: 'How do I start a conversation with the AI tutor?',
      answer: 'To start a conversation with the AI tutor, go to the Home tab and tap on "Talk with Cooper" or select a learning scenario. You can also start a new conversation from the Chats tab by tapping the "+" button.',
    },
    {
      id: 'faq2',
      question: 'How do I change my profile picture?',
      answer: 'To change your profile picture, go to the Profile tab and tap on "Edit Profile". Then tap on your profile picture or the camera icon to select a new image from your device.',
    },
    {
      id: 'faq3',
      question: 'Can I use the app offline?',
      answer: 'The app requires an internet connection to communicate with the AI tutor. However, you can access previously downloaded learning materials offline.',
    },
    {
      id: 'faq4',
      question: 'How do I reset my password?',
      answer: 'To reset your password, go to the login screen and tap on "Forgot Password". Enter your email address and follow the instructions sent to your email.',
    },
    {
      id: 'faq5',
      question: 'How do I delete my account?',
      answer: 'To delete your account, go to the Profile tab, then to Privacy & Security settings, and tap on "Delete Account". Please note that this action is irreversible.',
    },
  ];
  
  // Sample support options
  const supportOptions = [
    {
      id: 'contact',
      title: 'Contact Support',
      description: 'Get help from our support team',
      icon: 'mail-outline',
      action: () => console.log('Contact support'),
    },
    {
      id: 'feedback',
      title: 'Send Feedback',
      description: 'Help us improve the app',
      icon: 'chatbubble-outline',
      action: () => console.log('Send feedback'),
    },
    {
      id: 'report',
      title: 'Report a Bug',
      description: 'Let us know if something isn\'t working',
      icon: 'bug-outline',
      action: () => console.log('Report bug'),
    },
  ];
  
  // Render an FAQ item
  const renderFaqItem = (item, isExpanded, onToggle) => (
    <ModernCard 
      key={item.id} 
      style={{ marginBottom: theme.spacing.md }}
      interactive
      onPress={() => onToggle(item.id)}
    >
      <Row justify="space-between" align="center">
        <Text weight="semibold" style={{ flex: 1 }}>
          {item.question}
        </Text>
        
        <Ionicons
          name={isExpanded ? 'chevron-up' : 'chevron-down'}
          size={20}
          color={theme.colors.neutral[500]}
        />
      </Row>
      
      {isExpanded && (
        <View style={{ marginTop: theme.spacing.md }}>
          <Text color="neutral.700">{item.answer}</Text>
        </View>
      )}
    </ModernCard>
  );
  
  // State for expanded FAQ items
  const [expandedFaqs, setExpandedFaqs] = React.useState([]);
  
  // Toggle FAQ expansion
  const toggleFaq = (id) => {
    if (expandedFaqs.includes(id)) {
      setExpandedFaqs(expandedFaqs.filter(item => item !== id));
    } else {
      setExpandedFaqs([...expandedFaqs, id]);
    }
  };
  
  return (
    <SafeAreaWrapper>
      <Container>
        <ScrollView showsVerticalScrollIndicator={false}>
          <Column style={{ padding: theme.spacing.lg }}>
            <Heading level="h1" gutterBottom>Help & Support</Heading>
            <Text color="neutral.600" gutterBottom>
              Find answers to common questions or contact our support team
            </Text>
            
            <Spacer size="lg" />
            
            {/* Support options */}
            <Heading level="h2" gutterBottom>Support Options</Heading>
            
            <Row wrap justify="space-between">
              {supportOptions.map(option => (
                <ModernCard
                  key={option.id}
                  interactive
                  onPress={option.action}
                  style={{ 
                    width: '48%', 
                    marginBottom: theme.spacing.md,
                    padding: theme.spacing.md,
                  }}
                >
                  <View
                    style={{
                      width: 48,
                      height: 48,
                      borderRadius: 24,
                      backgroundColor: theme.colors.primary[100],
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginBottom: theme.spacing.sm,
                    }}
                  >
                    <Ionicons
                      name={option.icon}
                      size={24}
                      color={theme.colors.primary[500]}
                    />
                  </View>
                  
                  <Text weight="semibold">{option.title}</Text>
                  <Text variant="caption" color="neutral.600">
                    {option.description}
                  </Text>
                </ModernCard>
              ))}
            </Row>
            
            <Spacer size="lg" />
            
            {/* FAQ section */}
            <Heading level="h2" gutterBottom>Frequently Asked Questions</Heading>
            
            {faqItems.map(item => renderFaqItem(
              item, 
              expandedFaqs.includes(item.id),
              toggleFaq
            ))}
            
            <Spacer size="lg" />
            
            {/* Documentation */}
            <ModernCard style={{ marginBottom: theme.spacing.lg }}>
              <Heading level="h3" gutterBottom>Documentation</Heading>
              <Text color="neutral.600" gutterBottom>
                Check out our comprehensive documentation for detailed guides and tutorials
              </Text>
              
              <ModernButton
                text="View Documentation"
                variant="outline"
                iconName="document-text-outline"
                onPress={() => console.log('View documentation')}
                style={{ marginTop: theme.spacing.md }}
              />
            </ModernCard>
            
            <ModernButton
              text="Back to Profile"
              variant="outline"
              iconName="arrow-back-outline"
              onPress={() => router.back()}
            />
          </Column>
        </ScrollView>
      </Container>
    </SafeAreaWrapper>
  );
}
