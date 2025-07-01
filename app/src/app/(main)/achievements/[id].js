import React from "react";
import { Stack } from "expo-router";
import AchievementDetailScreen from "../../../features/achievements/screens/AchievementDetailScreen";

/**
 * Achievement detail screen route
 * @returns {JSX.Element} Achievement detail screen route component
 */
const AchievementDetailRoute = () => {
  return (
    <>
      <Stack.Screen
        options={{
          headerShown: false,
          title: "Achievement Detail",
        }}
      />
      <AchievementDetailScreen />
    </>
  );
};

export default AchievementDetailRoute;
