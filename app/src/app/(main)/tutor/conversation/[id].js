import React from 'react';
import { useLocalSearchParams } from 'expo-router';
import ConversationScreen from '../../../../features/tutor/screens/ConversationScreen';

/**
 * Conversation route with ID parameter
 * This route renders the ConversationScreen component with the specified conversation ID
 */
export default function ConversationRoute() {
  const { id, ...params } = useLocalSearchParams();
  
  return <ConversationScreen conversationId={id} params={params} />;
}
