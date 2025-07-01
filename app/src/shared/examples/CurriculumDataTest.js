/**
 * Curriculum Data Test Component
 * Tests the data integration between backend and frontend
 */

import React, { useState, useEffect } from "react";
import { View, ScrollView, Alert } from "react-native";
import { useTheme } from "../context/ThemeContext";
import Text from "../components/typography/Text";
import Heading from "../components/typography/Heading";
import ModernCard from "../components/ModernCard";
import { curriculumApi, achievementsApi } from "../services/api";

const CurriculumDataTest = () => {
  const { theme } = useTheme();
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState({
    levels: [],
    modules: [],
    lessons: [],
    achievements: [],
    userProgress: null,
  });
  const [errors, setErrors] = useState({});

  // Test API endpoints
  const testEndpoints = async () => {
    setLoading(true);
    setErrors({});
    const newData = { ...data };
    const newErrors = {};

    try {
      // Test 1: Get curriculum levels
      console.log("Testing curriculum levels...");
      try {
        const levelsResponse = await curriculumApi.getLevels();
        newData.levels = levelsResponse.data?.levels || [];
        console.log("✅ Levels loaded:", newData.levels.length);
      } catch (error) {
        console.error("❌ Levels error:", error);
        newErrors.levels = error.message;
      }

      // Test 2: Get modules for beginner level
      if (newData.levels.length > 0) {
        const beginnerLevel = newData.levels.find(l => l.id === 'beginner');
        if (beginnerLevel) {
          try {
            console.log("Testing level modules...");
            const modulesResponse = await curriculumApi.getLevelModules(beginnerLevel.id);
            newData.modules = modulesResponse.data?.modules || [];
            console.log("✅ Modules loaded:", newData.modules.length);
          } catch (error) {
            console.error("❌ Modules error:", error);
            newErrors.modules = error.message;
          }
        }
      }

      // Test 3: Get lessons from first module
      if (newData.modules.length > 0) {
        const firstModule = newData.modules[0];
        try {
          console.log("Testing module lessons...");
          const moduleResponse = await curriculumApi.getModule(firstModule.id);
          newData.lessons = moduleResponse.data?.module?.lessons || [];
          console.log("✅ Lessons loaded:", newData.lessons.length);
        } catch (error) {
          console.error("❌ Lessons error:", error);
          newErrors.lessons = error.message;
        }
      }

      // Test 4: Get achievements
      try {
        console.log("Testing achievements...");
        const achievementsResponse = await achievementsApi.getAchievements();
        newData.achievements = achievementsResponse.data?.achievements || [];
        console.log("✅ Achievements loaded:", newData.achievements.length);
      } catch (error) {
        console.error("❌ Achievements error:", error);
        newErrors.achievements = error.message;
      }

      // Test 5: Get user progress (requires authentication)
      try {
        console.log("Testing user progress...");
        const progressResponse = await curriculumApi.getUserProgress();
        newData.userProgress = progressResponse.data?.progress || null;
        console.log("✅ User progress loaded");
      } catch (error) {
        console.error("❌ User progress error:", error);
        newErrors.userProgress = error.message;
      }

    } catch (error) {
      console.error("❌ General error:", error);
      newErrors.general = error.message;
    }

    setData(newData);
    setErrors(newErrors);
    setLoading(false);

    // Show summary
    const successCount = Object.keys(newErrors).length;
    const totalTests = 5;
    Alert.alert(
      "Test Results",
      `${totalTests - successCount}/${totalTests} tests passed\n\n` +
      `Levels: ${newData.levels.length}\n` +
      `Modules: ${newData.modules.length}\n` +
      `Lessons: ${newData.lessons.length}\n` +
      `Achievements: ${newData.achievements.length}\n` +
      `User Progress: ${newData.userProgress ? 'Loaded' : 'Failed'}`
    );
  };

  // Auto-test on mount
  useEffect(() => {
    testEndpoints();
  }, []);

  return (
    <ScrollView style={{ flex: 1, backgroundColor: theme.colors.background.default }}>
      <View style={{ padding: theme.spacing.lg }}>
        
        <Heading level="h1" gutterBottom>
          Curriculum Data Integration Test
        </Heading>
        
        <Text style={{ marginBottom: theme.spacing.lg, color: theme.colors.text.secondary }}>
          Testing the data flow between backend and frontend for curriculum system.
        </Text>

        {/* Test Results Summary */}
        <ModernCard style={{ marginBottom: theme.spacing.lg }}>
          <Heading level="h3" gutterBottom>
            Test Results Summary
          </Heading>
          
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: theme.spacing.sm }}>
            <Text>Status:</Text>
            <Text weight="semibold" style={{ color: loading ? theme.colors.warning[500] : theme.colors.success[500] }}>
              {loading ? 'Testing...' : 'Complete'}
            </Text>
          </View>
          
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: theme.spacing.sm }}>
            <Text>Errors:</Text>
            <Text weight="semibold" style={{ color: Object.keys(errors).length > 0 ? theme.colors.error[500] : theme.colors.success[500] }}>
              {Object.keys(errors).length}
            </Text>
          </View>
        </ModernCard>

        {/* Levels Data */}
        <ModernCard style={{ marginBottom: theme.spacing.lg }}>
          <Heading level="h3" gutterBottom>
            Curriculum Levels ({data.levels.length})
          </Heading>
          
          {errors.levels && (
            <Text style={{ color: theme.colors.error[500], marginBottom: theme.spacing.sm }}>
              Error: {errors.levels}
            </Text>
          )}
          
          {data.levels.map((level, index) => (
            <View key={level.id || index} style={{ marginBottom: theme.spacing.sm }}>
              <Text weight="semibold">{level.name || 'Unknown'}</Text>
              <Text size="sm" style={{ color: theme.colors.text.secondary }}>
                {level.description || 'No description'}
              </Text>
            </View>
          ))}
        </ModernCard>

        {/* Modules Data */}
        <ModernCard style={{ marginBottom: theme.spacing.lg }}>
          <Heading level="h3" gutterBottom>
            Modules ({data.modules.length})
          </Heading>
          
          {errors.modules && (
            <Text style={{ color: theme.colors.error[500], marginBottom: theme.spacing.sm }}>
              Error: {errors.modules}
            </Text>
          )}
          
          {data.modules.map((module, index) => (
            <View key={module.id || index} style={{ marginBottom: theme.spacing.sm }}>
              <Text weight="semibold">{module.name || 'Unknown'}</Text>
              <Text size="sm" style={{ color: theme.colors.text.secondary }}>
                Lessons: {module.lessonCount || 0}
              </Text>
            </View>
          ))}
        </ModernCard>

        {/* Lessons Data */}
        <ModernCard style={{ marginBottom: theme.spacing.lg }}>
          <Heading level="h3" gutterBottom>
            Lessons ({data.lessons.length})
          </Heading>
          
          {errors.lessons && (
            <Text style={{ color: theme.colors.error[500], marginBottom: theme.spacing.sm }}>
              Error: {errors.lessons}
            </Text>
          )}
          
          {data.lessons.slice(0, 3).map((lesson, index) => (
            <View key={lesson.id || index} style={{ marginBottom: theme.spacing.sm }}>
              <Text weight="semibold">{lesson.name || 'Unknown'}</Text>
              <Text size="sm" style={{ color: theme.colors.text.secondary }}>
                Duration: {lesson.estimatedDuration || 0} min | XP: {lesson.xpReward || 0}
              </Text>
            </View>
          ))}
          
          {data.lessons.length > 3 && (
            <Text size="sm" style={{ color: theme.colors.text.secondary }}>
              ... and {data.lessons.length - 3} more lessons
            </Text>
          )}
        </ModernCard>

        {/* Achievements Data */}
        <ModernCard style={{ marginBottom: theme.spacing.lg }}>
          <Heading level="h3" gutterBottom>
            Achievements ({data.achievements.length})
          </Heading>
          
          {errors.achievements && (
            <Text style={{ color: theme.colors.error[500], marginBottom: theme.spacing.sm }}>
              Error: {errors.achievements}
            </Text>
          )}
          
          {data.achievements.slice(0, 3).map((achievement, index) => (
            <View key={achievement._id || index} style={{ marginBottom: theme.spacing.sm }}>
              <Text weight="semibold">{achievement.title || 'Unknown'}</Text>
              <Text size="sm" style={{ color: theme.colors.text.secondary }}>
                {achievement.description || 'No description'}
              </Text>
            </View>
          ))}
          
          {data.achievements.length > 3 && (
            <Text size="sm" style={{ color: theme.colors.text.secondary }}>
              ... and {data.achievements.length - 3} more achievements
            </Text>
          )}
        </ModernCard>

        {/* User Progress Data */}
        <ModernCard>
          <Heading level="h3" gutterBottom>
            User Progress
          </Heading>
          
          {errors.userProgress && (
            <Text style={{ color: theme.colors.error[500], marginBottom: theme.spacing.sm }}>
              Error: {errors.userProgress}
            </Text>
          )}
          
          {data.userProgress ? (
            <View>
              <Text>Level: {data.userProgress.level || 'Unknown'}</Text>
              <Text>Total XP: {data.userProgress.totalExperience || 0}</Text>
              <Text>Lessons Completed: {data.userProgress.lessonsCompleted || 0}</Text>
              <Text>Current Lesson: {data.userProgress.currentCurriculum?.currentLessonId || 'None'}</Text>
            </View>
          ) : (
            <Text style={{ color: theme.colors.text.secondary }}>
              No user progress data available
            </Text>
          )}
        </ModernCard>
        
      </View>
    </ScrollView>
  );
};

export default CurriculumDataTest;
