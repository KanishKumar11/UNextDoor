/**
 * Realtime Conversation Screen Route
 *
 * This file exports the RealtimeConversationScreen component as the default export
 * for the route, making it accessible through Expo Router.
 */

// React is required for JSX transformation
import RealtimeConversationScreen from "../../features/tutor/screens/RealtimeConversationScreen";

/**
 * Realtime Conversation Route
 * @returns {JSX.Element} Component JSX
 */
export default function RealtimeConversationRoute() {
  return <RealtimeConversationScreen />;
}
