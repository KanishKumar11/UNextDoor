/**
 * Character Icon Demo Component
 * Demonstrates the dynamic character icon selection system
 * This component can be used for testing and showcasing character variety
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Platform,
} from 'react-native';
import { BRAND_COLORS } from '../../../shared/constants/colors';
import { useTheme } from '../../../shared/context/ThemeContext';
import {
  Text,
  Row,
  Column,
  ModernCard,
  ModernButton,
} from '../../../shared/components';
import characterIconService from '../../../shared/services/characterIconService';

// Helper function for cross-platform font families
const getFontFamily = (weight = 'regular') => {
  if (Platform.OS === 'web') {
    return 'Montserrat, sans-serif';
  }

  const fontMap = {
    light: 'Montserrat-Light',
    regular: 'Montserrat-Regular',
    medium: 'Montserrat-Medium',
    semibold: 'Montserrat-SemiBold',
    bold: 'Montserrat-Bold',
    extrabold: 'Montserrat-ExtraBold',
  };

  return fontMap[weight] || fontMap.regular;
};

const CharacterIconDemo = () => {
  const theme = useTheme();
  const [selectedCharacter, setSelectedCharacter] = useState(null);
  const [allCharacters, setAllCharacters] = useState({});
  const [characterProfiles, setCharacterProfiles] = useState({});

  useEffect(() => {
    // Load all characters and profiles
    setAllCharacters(characterIconService.getAllCharacters());
    setCharacterProfiles(characterIconService.getCharacterProfiles());

    // Set initial character
    setSelectedCharacter(characterIconService.getCurrentCharacter());
  }, []);

  const handleRandomSelection = () => {
    const randomChar = characterIconService.getRandomCharacter();
    setSelectedCharacter(randomChar);
  };

  const handleScenarioSelection = (scenario) => {
    const scenarioChar = characterIconService.getCharacterForScenario(scenario);
    setSelectedCharacter(scenarioChar);
  };

  const handleContextSelection = (level, context) => {
    const contextChar = characterIconService.getCharacterForContext(level, context);
    setSelectedCharacter(contextChar);
  };

  const handleTimeBasedSelection = () => {
    const timeChar = characterIconService.getCharacterForTimeOfDay();
    setSelectedCharacter(timeChar);
  };

  const scenarios = [
    { id: 'business', name: 'Business Meeting' },
    { id: 'casual', name: 'Casual Chat' },
    { id: 'games', name: 'Language Games' },
    { id: 'travel', name: 'Travel Conversation' },
    { id: 'restaurant', name: 'Restaurant Order' },
  ];

  const contexts = [
    { level: 'beginner', context: 'lesson', name: 'Beginner Lesson' },
    { level: 'intermediate', context: 'practice', name: 'Intermediate Practice' },
    { level: 'advanced', context: 'games', name: 'Advanced Games' },
  ];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      {/* Current Character Display */}
      <ModernCard style={styles.currentCharacterCard}>
        <Column align="center">
          <Text style={styles.sectionTitle}>Current Character</Text>
          {selectedCharacter && (
            <>
              <View style={styles.characterDisplay}>
                <Image
                  source={selectedCharacter.icon}
                  style={styles.characterIcon}
                  resizeMode="contain"
                />
              </View>
              <Text style={styles.characterName}>{selectedCharacter.profile.name}</Text>
              <Text style={styles.characterDescription}>
                {selectedCharacter.profile.description}
              </Text>
              <Row style={styles.characterMeta}>
                <Text style={styles.metaLabel}>Personality:</Text>
                <Text style={styles.metaValue}>{selectedCharacter.profile.personality}</Text>
              </Row>
              <Row style={styles.characterMeta}>
                <Text style={styles.metaLabel}>Mood:</Text>
                <Text style={styles.metaValue}>{selectedCharacter.profile.mood}</Text>
              </Row>
            </>
          )}
        </Column>
      </ModernCard>

      {/* Selection Methods */}
      <ModernCard style={styles.selectionCard}>
        <Text style={styles.sectionTitle}>Selection Methods</Text>

        {/* Random Selection */}
        <ModernButton
          text="Random Character"
          variant="primary"
          onPress={handleRandomSelection}
          style={styles.selectionButton}
        />

        {/* Time-based Selection */}
        <ModernButton
          text="Time-based Character"
          variant="secondary"
          onPress={handleTimeBasedSelection}
          style={styles.selectionButton}
        />
      </ModernCard>

      {/* Scenario-based Selection */}
      <ModernCard style={styles.selectionCard}>
        <Text style={styles.sectionTitle}>Scenario-based Selection</Text>
        <View style={styles.buttonGrid}>
          {scenarios.map((scenario) => (
            <TouchableOpacity
              key={scenario.id}
              style={styles.scenarioButton}
              onPress={() => handleScenarioSelection(scenario.id)}
            >
              <Text style={styles.scenarioButtonText}>{scenario.name}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ModernCard>

      {/* Context-based Selection */}
      <ModernCard style={styles.selectionCard}>
        <Text style={styles.sectionTitle}>Context-based Selection</Text>
        <View style={styles.buttonGrid}>
          {contexts.map((item, index) => (
            <TouchableOpacity
              key={index}
              style={styles.contextButton}
              onPress={() => handleContextSelection(item.level, item.context)}
            >
              <Text style={styles.contextButtonText}>{item.name}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ModernCard>

      {/* All Characters Preview */}
      <ModernCard style={styles.selectionCard}>
        <Text style={styles.sectionTitle}>All Available Characters</Text>
        <Row justify="space-around" style={styles.allCharactersRow}>
          {Object.entries(allCharacters).map(([id, icon]) => (
            <TouchableOpacity
              key={id}
              style={styles.characterPreview}
              onPress={() => setSelectedCharacter({ id, icon, profile: characterProfiles[id] })}
            >
              <Image
                source={icon}
                style={styles.previewIcon}
                resizeMode="contain"
              />
              <Text style={styles.previewName}>
                {characterProfiles[id]?.name.split(' ')[1] || id}
              </Text>
            </TouchableOpacity>
          ))}
        </Row>
      </ModernCard>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BRAND_COLORS.CARD_BACKGROUND,
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 100,
  },
  currentCharacterCard: {
    marginBottom: 16,
    padding: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: BRAND_COLORS.OCEAN_BLUE,
    marginBottom: 16,
    fontFamily: getFontFamily('bold'),
  },
  characterDisplay: {
    width: 100,
    height: 100,
    marginBottom: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  characterIcon: {
    width: 90,
    height: 90,
  },
  characterName: {
    fontSize: 20,
    fontWeight: '600',
    color: BRAND_COLORS.OCEAN_BLUE,
    marginBottom: 8,
    fontFamily: getFontFamily('semibold'),
  },
  characterDescription: {
    fontSize: 14,
    color: BRAND_COLORS.SHADOW_GREY,
    textAlign: 'center',
    marginBottom: 16,
    fontFamily: getFontFamily('regular'),
  },
  characterMeta: {
    marginBottom: 4,
  },
  metaLabel: {
    fontSize: 12,
    color: BRAND_COLORS.SHADOW_GREY,
    marginRight: 8,
    fontFamily: getFontFamily('medium'),
  },
  metaValue: {
    fontSize: 12,
    color: BRAND_COLORS.EXPLORER_TEAL,
    fontFamily: getFontFamily('semibold'),
    textTransform: 'capitalize',
  },
  selectionCard: {
    marginBottom: 16,
    padding: 20,
  },
  selectionButton: {
    marginBottom: 8,
  },
  buttonGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  scenarioButton: {
    backgroundColor: BRAND_COLORS.EXPLORER_TEAL + '20',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    marginBottom: 8,
  },
  scenarioButtonText: {
    fontSize: 12,
    color: BRAND_COLORS.EXPLORER_TEAL,
    fontFamily: getFontFamily('medium'),
  },
  contextButton: {
    backgroundColor: BRAND_COLORS.OCEAN_BLUE + '20',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    marginBottom: 8,
  },
  contextButtonText: {
    fontSize: 12,
    color: BRAND_COLORS.OCEAN_BLUE,
    fontFamily: getFontFamily('medium'),
  },
  allCharactersRow: {
    marginTop: 8,
  },
  characterPreview: {
    alignItems: 'center',
    padding: 8,
  },
  previewIcon: {
    width: 40,
    height: 40,
    marginBottom: 4,
  },
  previewName: {
    fontSize: 10,
    color: BRAND_COLORS.SHADOW_GREY,
    fontFamily: getFontFamily('medium'),
  },
});

export default CharacterIconDemo;
