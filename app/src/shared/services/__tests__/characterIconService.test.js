/**
 * Character Icon Service Tests
 * Tests for the dynamic character icon selection system
 */

import characterIconService from '../characterIconService';

describe('CharacterIconService', () => {
  beforeEach(() => {
    // Clear any cached data before each test
    characterIconService.clearSessionCharacters();
  });

  describe('getAllCharacters', () => {
    it('should return all available character icons', () => {
      const characters = characterIconService.getAllCharacters();
      expect(Object.keys(characters)).toHaveLength(3);
      expect(characters).toHaveProperty('character1');
      expect(characters).toHaveProperty('character2');
      expect(characters).toHaveProperty('character3');
    });
  });

  describe('getCharacterProfiles', () => {
    it('should return character profiles with metadata', () => {
      const profiles = characterIconService.getCharacterProfiles();
      expect(Object.keys(profiles)).toHaveLength(3);
      
      // Check character1 profile
      expect(profiles.character1).toHaveProperty('name', 'Miles (Friendly)');
      expect(profiles.character1).toHaveProperty('personality', 'friendly');
      expect(profiles.character1.bestFor).toContain('beginner');
    });
  });

  describe('getRandomCharacter', () => {
    it('should return a random character', () => {
      const character = characterIconService.getRandomCharacter();
      expect(character).toHaveProperty('icon');
      expect(character).toHaveProperty('profile');
      expect(character).toHaveProperty('id');
      expect(['character1', 'character2', 'character3']).toContain(character.id);
    });

    it('should exclude specified character IDs', () => {
      const character = characterIconService.getRandomCharacter(['character1', 'character2']);
      expect(character.id).toBe('character3');
    });

    it('should return first character when all are excluded', () => {
      const character = characterIconService.getRandomCharacter(['character1', 'character2', 'character3']);
      expect(character.id).toBe('character1');
    });
  });

  describe('getCharacterForContext', () => {
    it('should return appropriate character for beginner level', () => {
      const character = characterIconService.getCharacterForContext('beginner', 'lesson');
      expect(character).toHaveProperty('icon');
      expect(character).toHaveProperty('profile');
      expect(character.profile.bestFor).toContain('beginner');
    });

    it('should return appropriate character for games context', () => {
      const character = characterIconService.getCharacterForContext('intermediate', 'games');
      expect(character).toHaveProperty('icon');
      expect(character).toHaveProperty('profile');
      // Should prefer character3 (energetic) for games
      expect(character.id).toBe('character3');
    });

    it('should maintain consistency with session ID', () => {
      const sessionId = 'test-session-123';
      const character1 = characterIconService.getCharacterForContext('beginner', 'lesson', sessionId);
      const character2 = characterIconService.getCharacterForContext('beginner', 'lesson', sessionId);
      
      expect(character1.id).toBe(character2.id);
    });
  });

  describe('getCharacterForScenario', () => {
    it('should return professional character for business scenario', () => {
      const character = characterIconService.getCharacterForScenario('business');
      expect(character.id).toBe('character2');
      expect(character.profile.personality).toBe('professional');
    });

    it('should return friendly character for casual scenario', () => {
      const character = characterIconService.getCharacterForScenario('casual');
      expect(character.id).toBe('character1');
      expect(character.profile.personality).toBe('friendly');
    });

    it('should return energetic character for games scenario', () => {
      const character = characterIconService.getCharacterForScenario('games');
      expect(character.id).toBe('character3');
      expect(character.profile.personality).toBe('energetic');
    });

    it('should fallback gracefully for unknown scenario', () => {
      const character = characterIconService.getCharacterForScenario('unknown-scenario');
      expect(character).toHaveProperty('icon');
      expect(character).toHaveProperty('profile');
      expect(['character1', 'character2', 'character3']).toContain(character.id);
    });
  });

  describe('getCharacterForTimeOfDay', () => {
    it('should return different characters based on time', () => {
      // Mock different times
      const originalDate = Date;
      
      // Morning (9 AM)
      global.Date = jest.fn(() => ({ getHours: () => 9 }));
      const morningCharacter = characterIconService.getCharacterForTimeOfDay();
      expect(morningCharacter.id).toBe('character3'); // Energetic
      
      // Afternoon (2 PM)
      global.Date = jest.fn(() => ({ getHours: () => 14 }));
      const afternoonCharacter = characterIconService.getCharacterForTimeOfDay();
      expect(afternoonCharacter.id).toBe('character2'); // Professional
      
      // Evening (8 PM)
      global.Date = jest.fn(() => ({ getHours: () => 20 }));
      const eveningCharacter = characterIconService.getCharacterForTimeOfDay();
      expect(eveningCharacter.id).toBe('character1'); // Friendly
      
      // Restore original Date
      global.Date = originalDate;
    });
  });

  describe('session management', () => {
    it('should clear specific session characters', () => {
      const sessionId = 'test-session';
      characterIconService.getCharacterForContext('beginner', 'lesson', sessionId);
      
      characterIconService.clearSessionCharacters(sessionId);
      
      // Should get a new character (potentially different) since session was cleared
      const newCharacter = characterIconService.getCharacterForContext('beginner', 'lesson', sessionId);
      expect(newCharacter).toHaveProperty('icon');
    });

    it('should clear all session characters', () => {
      characterIconService.getCharacterForContext('beginner', 'lesson', 'session1');
      characterIconService.getCharacterForContext('intermediate', 'games', 'session2');
      
      characterIconService.clearSessionCharacters();
      
      // Both sessions should be cleared
      const char1 = characterIconService.getCharacterForContext('beginner', 'lesson', 'session1');
      const char2 = characterIconService.getCharacterForContext('intermediate', 'games', 'session2');
      
      expect(char1).toHaveProperty('icon');
      expect(char2).toHaveProperty('icon');
    });
  });

  describe('getRotatedCharacter', () => {
    it('should return different character when excluding last used', () => {
      const character1 = characterIconService.getRandomCharacter();
      const character2 = characterIconService.getRotatedCharacter(character1.id);
      
      expect(character2.id).not.toBe(character1.id);
    });
  });

  describe('current character management', () => {
    it('should set and get current character', () => {
      characterIconService.setCurrentCharacter('character2');
      const current = characterIconService.getCurrentCharacter();
      
      expect(current.id).toBe('character2');
      expect(current.profile.personality).toBe('professional');
    });

    it('should return random character if no current character set', () => {
      const current = characterIconService.getCurrentCharacter();
      expect(current).toHaveProperty('icon');
      expect(current).toHaveProperty('profile');
      expect(['character1', 'character2', 'character3']).toContain(current.id);
    });
  });
});
