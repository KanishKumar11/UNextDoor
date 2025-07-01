import React, { useState, useEffect } from "react";
import { View, StyleSheet, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { useTheme } from "../../../shared/context/ThemeContext";
import { useAuth } from "../../../features/auth/hooks/useAuth";
import {
  Container,
  Column,
  Text,
  Heading,
  ModernButton,
  ModernHeader,
} from "../../../shared/components";
import { Ionicons } from "@expo/vector-icons";
import {
  PROFICIENCY_LEVELS,
  PROFICIENCY_LEVEL_DESCRIPTIONS,
} from "../../../shared/constants/appConstants";
import { updateUserProfile } from "../../../shared/api/authApi";

/**
 * Language Level Screen
 * Allows users to select their proficiency level in Korean
 */
export default function LanguageLevelScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const { user, updateUser } = useAuth();

  // State for selected level
  const [selectedLevel, setSelectedLevel] = useState(
    user?.preferences?.languageLevel || PROFICIENCY_LEVELS.BEGINNER
  );
  const [isLoading, setIsLoading] = useState(false);

  // Handle level selection
  const handleLevelSelect = (level) => {
    setSelectedLevel(level);
  };

  // Handle continue button press
  const handleContinue = async () => {
    try {
      setIsLoading(true);

      // Update user profile with selected language level
      const updatedUser = await updateUserProfile({
        preferences: {
          ...user?.preferences,
          languageLevel: selectedLevel,
        },
      });

      // Update local user state
      if (updatedUser) {
        updateUser(updatedUser);
      }

      // Navigate back to profile
      router.back();
    } catch (error) {
      console.error("Failed to update language level:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Render level option
  const renderLevelOption = (level, label, description) => {
    const isSelected = selectedLevel === level;

    return (
      <TouchableOpacity
        key={level}
        style={[styles.levelOption, isSelected && styles.selectedOption]}
        onPress={() => handleLevelSelect(level)}
      >
        <View style={styles.levelContent}>
          <View>
            <Text weight="semibold" style={styles.levelLabel}>
              {label}
            </Text>
            <Text
              color={theme.colors.text.secondary}
              style={styles.levelDescription}
            >
              {description}
            </Text>
          </View>

          <View
            style={[
              styles.radioButton,
              isSelected && styles.selectedRadioButton,
            ]}
          >
            {isSelected && <View style={styles.radioButtonInner} />}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <ModernHeader
        title="Your level"
        showBackButton
        onBackPress={() => router.back()}
      />

      <Container>
        <Column style={styles.content}>
          <Heading level="h1" style={styles.title}>
            What's your current level in Korean?
          </Heading>

          <View style={styles.optionsContainer}>
            {renderLevelOption(
              PROFICIENCY_LEVELS.BEGINNER,
              "Beginner",
              PROFICIENCY_LEVEL_DESCRIPTIONS[PROFICIENCY_LEVELS.BEGINNER]
            )}

            {renderLevelOption(
              PROFICIENCY_LEVELS.INTERMEDIATE,
              "Intermediate",
              PROFICIENCY_LEVEL_DESCRIPTIONS[PROFICIENCY_LEVELS.INTERMEDIATE]
            )}

            {renderLevelOption(
              PROFICIENCY_LEVELS.ADVANCED,
              "Advanced",
              PROFICIENCY_LEVEL_DESCRIPTIONS[PROFICIENCY_LEVELS.ADVANCED]
            )}
          </View>

          <ModernButton
            text="Continue"
            onPress={handleContinue}
            isLoading={isLoading}
            style={styles.continueButton}
          />
        </Column>
      </Container>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  content: {
    flex: 1,
    padding: 20,
  },
  title: {
    marginBottom: 30,
    fontSize: 28,
    fontWeight: "bold",
  },
  optionsContainer: {
    marginBottom: 40,
  },
  levelOption: {
    borderWidth: 1,
    borderColor: "#E5E5E5",
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
  },
  selectedOption: {
    borderColor: "#6FC935", // Primary green color
  },
  levelContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  levelLabel: {
    fontSize: 18,
    marginBottom: 4,
  },
  levelDescription: {
    fontSize: 14,
  },
  radioButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#E5E5E5",
    justifyContent: "center",
    alignItems: "center",
  },
  selectedRadioButton: {
    borderColor: "#6FC935", // Primary green color
  },
  radioButtonInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "#6FC935", // Primary green color
  },
  continueButton: {
    marginTop: "auto",
  },
});
