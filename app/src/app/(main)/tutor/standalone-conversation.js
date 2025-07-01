import React from 'react';
import { useLocalSearchParams } from 'expo-router';
import StandaloneConversationScreen from '../../../features/tutor/screens/StandaloneConversationScreen';

/**
 * Standalone Conversation route
 * This route renders the StandaloneConversationScreen component with parameters from the URL
 */
export default function StandaloneConversationRoute() {
  const params = useLocalSearchParams();
  
  return <StandaloneConversationScreen params={params} />;
}
