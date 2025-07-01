import React from 'react';
import { useLocalSearchParams } from 'expo-router';
import ConversationScreen from '../../../../features/tutor/screens/ConversationScreen';

/**
 * Conversation route
 * This route renders the ConversationScreen component with parameters from the URL
 */
export default function ConversationRoute() {
  const params = useLocalSearchParams();
  
  return <ConversationScreen params={params} />;
}
