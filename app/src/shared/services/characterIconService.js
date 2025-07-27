/**
 * Character Icon Service
 * Manages dynamic character icon selection for AI tutor conversations
 * Provides different selection strategies based on context and user preferences
 */

// Import character icons
const characterIcons = {
  character1: require('../../assets/character/1.png'),
  character2: require('../../assets/character/2.png'),
  character3: require('../../assets/character/3.png'),
};

// Character icon metadata for different contexts
const characterProfiles = {
  character1: {
    id: 'character1',
    name: 'Miles (Friendly)',
    personality: 'friendly',
    mood: 'cheerful',
    bestFor: ['beginner', 'casual', 'encouragement'],
    description: 'A warm and encouraging tutor perfect for beginners',
  },
  character2: {
    id: 'character2', 
    name: 'Miles (Professional)',
    personality: 'professional',
    mood: 'focused',
    bestFor: ['intermediate', 'business', 'formal'],
    description: 'A professional and focused tutor for serious learning',
  },
  character3: {
    id: 'character3',
    name: 'Miles (Energetic)',
    personality: 'energetic',
    mood: 'excited',
    bestFor: ['advanced', 'games', 'practice'],
    description: 'An energetic and dynamic tutor for active learning',
  },
};

class CharacterIconService {
  constructor() {
    this.currentCharacter = null;
    this.sessionCharacters = new Map(); // Track characters per session
    this.userPreferences = null;
  }

  /**
   * Get all available character icons
   * @returns {Object} Object containing all character icons
   */
  getAllCharacters() {
    return characterIcons;
  }

  /**
   * Get character profiles with metadata
   * @returns {Object} Object containing character profiles
   */
  getCharacterProfiles() {
    return characterProfiles;
  }

  /**
   * Get a random character icon
   * @param {Array} excludeIds - Character IDs to exclude from selection
   * @returns {Object} Character icon and profile
   */
  getRandomCharacter(excludeIds = []) {
    const availableCharacters = Object.keys(characterIcons).filter(
      id => !excludeIds.includes(id)
    );
    
    if (availableCharacters.length === 0) {
      // If all characters are excluded, return the first one
      const firstCharacterId = Object.keys(characterIcons)[0];
      return {
        icon: characterIcons[firstCharacterId],
        profile: characterProfiles[firstCharacterId],
        id: firstCharacterId,
      };
    }

    const randomIndex = Math.floor(Math.random() * availableCharacters.length);
    const selectedId = availableCharacters[randomIndex];
    
    return {
      icon: characterIcons[selectedId],
      profile: characterProfiles[selectedId],
      id: selectedId,
    };
  }

  /**
   * Get character based on user level and context
   * @param {string} level - User proficiency level (beginner, intermediate, advanced)
   * @param {string} context - Context type (lesson, scenario, game, practice)
   * @param {string} sessionId - Optional session ID for consistency
   * @returns {Object} Character icon and profile
   */
  getCharacterForContext(level = 'beginner', context = 'lesson', sessionId = null) {
    // If we have a session ID, try to maintain consistency
    if (sessionId && this.sessionCharacters.has(sessionId)) {
      const sessionCharacter = this.sessionCharacters.get(sessionId);
      return {
        icon: characterIcons[sessionCharacter.id],
        profile: characterProfiles[sessionCharacter.id],
        id: sessionCharacter.id,
      };
    }

    // Find characters that match the context
    const suitableCharacters = Object.entries(characterProfiles).filter(([id, profile]) => {
      return profile.bestFor.includes(level) || profile.bestFor.includes(context);
    });

    let selectedCharacter;
    
    if (suitableCharacters.length > 0) {
      // Select from suitable characters
      const randomIndex = Math.floor(Math.random() * suitableCharacters.length);
      const [selectedId, profile] = suitableCharacters[randomIndex];
      selectedCharacter = {
        icon: characterIcons[selectedId],
        profile: profile,
        id: selectedId,
      };
    } else {
      // Fallback to random selection
      selectedCharacter = this.getRandomCharacter();
    }

    // Store for session consistency if sessionId provided
    if (sessionId) {
      this.sessionCharacters.set(sessionId, selectedCharacter);
    }

    return selectedCharacter;
  }

  /**
   * Get character based on scenario type
   * @param {string} scenarioType - Type of scenario (business, casual, travel, etc.)
   * @param {string} sessionId - Optional session ID for consistency
   * @returns {Object} Character icon and profile
   */
  getCharacterForScenario(scenarioType = 'casual', sessionId = null) {
    const scenarioMapping = {
      business: 'character2', // Professional
      formal: 'character2',   // Professional
      casual: 'character1',   // Friendly
      travel: 'character1',   // Friendly
      shopping: 'character1', // Friendly
      restaurant: 'character1', // Friendly
      games: 'character3',    // Energetic
      practice: 'character3', // Energetic
      advanced: 'character3', // Energetic
    };

    const preferredCharacterId = scenarioMapping[scenarioType.toLowerCase()];
    
    if (preferredCharacterId && characterIcons[preferredCharacterId]) {
      const selectedCharacter = {
        icon: characterIcons[preferredCharacterId],
        profile: characterProfiles[preferredCharacterId],
        id: preferredCharacterId,
      };

      // Store for session consistency if sessionId provided
      if (sessionId) {
        this.sessionCharacters.set(sessionId, selectedCharacter);
      }

      return selectedCharacter;
    }

    // Fallback to context-based selection
    return this.getCharacterForContext('beginner', scenarioType, sessionId);
  }

  /**
   * Get character based on time of day (for variety)
   * @returns {Object} Character icon and profile
   */
  getCharacterForTimeOfDay() {
    const hour = new Date().getHours();
    
    if (hour >= 6 && hour < 12) {
      // Morning - Energetic character
      return {
        icon: characterIcons.character3,
        profile: characterProfiles.character3,
        id: 'character3',
      };
    } else if (hour >= 12 && hour < 18) {
      // Afternoon - Professional character
      return {
        icon: characterIcons.character2,
        profile: characterProfiles.character2,
        id: 'character2',
      };
    } else {
      // Evening/Night - Friendly character
      return {
        icon: characterIcons.character1,
        profile: characterProfiles.character1,
        id: 'character1',
      };
    }
  }

  /**
   * Set current character for the session
   * @param {string} characterId - Character ID to set as current
   */
  setCurrentCharacter(characterId) {
    if (characterIcons[characterId]) {
      this.currentCharacter = {
        icon: characterIcons[characterId],
        profile: characterProfiles[characterId],
        id: characterId,
      };
    }
  }

  /**
   * Get current character or select a new one
   * @returns {Object} Character icon and profile
   */
  getCurrentCharacter() {
    if (!this.currentCharacter) {
      this.currentCharacter = this.getRandomCharacter();
    }
    return this.currentCharacter;
  }

  /**
   * Clear session character cache
   * @param {string} sessionId - Optional specific session to clear
   */
  clearSessionCharacters(sessionId = null) {
    if (sessionId) {
      this.sessionCharacters.delete(sessionId);
    } else {
      this.sessionCharacters.clear();
    }
  }

  /**
   * Get character with rotation strategy (different each time)
   * @param {string} lastCharacterId - Last used character ID to avoid repetition
   * @returns {Object} Character icon and profile
   */
  getRotatedCharacter(lastCharacterId = null) {
    const excludeIds = lastCharacterId ? [lastCharacterId] : [];
    return this.getRandomCharacter(excludeIds);
  }
}

// Create and export singleton instance
const characterIconService = new CharacterIconService();

export default characterIconService;

// Export individual functions for convenience
export const {
  getAllCharacters,
  getCharacterProfiles,
  getRandomCharacter,
  getCharacterForContext,
  getCharacterForScenario,
  getCharacterForTimeOfDay,
  getCurrentCharacter,
  setCurrentCharacter,
  clearSessionCharacters,
  getRotatedCharacter,
} = characterIconService;
