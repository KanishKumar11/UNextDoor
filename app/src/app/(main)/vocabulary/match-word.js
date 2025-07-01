import React from 'react';
import { Stack } from 'expo-router';
import MatchWordGameScreen from '../../../features/vocabulary/screens/MatchWordGameScreen';

/**
 * Match Word Game Route
 * Route for the Match the Word vocabulary game
 */
const MatchWordRoute = () => {
  return (
    <>
      <Stack.Screen
        options={{
          title: 'Match the Word',
          headerShown: true,
        }}
      />
      <MatchWordGameScreen />
    </>
  );
};

export default MatchWordRoute;
