import { useState, useEffect } from "react";
import { StyleSheet } from "react-native";
import { Spinner, Center } from "@gluestack-ui/themed";
import ModernHome from "./modern-home";
import modernTheme from "../../shared/styles/modernTheme";
import ThemeUsageExample from "../../shared/examples/ThemeUsageExample";
import LessonDemoScreen from "./tutor/lesson-demo";
import CurriculumScreen from "./tutor/curriculum";
import ProgressDetails from "./tutor/progress";
import LessonsPage from "./tutor/lessons";
import CurriculumMap from "../../features/curriculum/components/CurriculumMap";

export default function Home() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return (
      <Center style={styles.loadingContainer}>
        <Spinner size="large" />
      </Center>
    );
  }

  return <ModernHome />;
  // return <ProgressDetails />;
  // return <VapiTest />;
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: modernTheme.colors.background,
  },
});
