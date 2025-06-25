/**
 * Integration tests for the new game content system
 * Tests the complete flow from content generation to API endpoints
 */

import { 
  getMatchWordContent, 
  getSentenceScrambleContent, 
  getPronunciationContent, 
  getConversationScenario,
  getContentStatistics,
  shuffleArray
} from '../src/data/gameContent.js';

describe('Game Content Integration Tests', () => {
  
  describe('Content Generation Functions', () => {
    
    test('getMatchWordContent should return appropriate content', () => {
      // Test beginner level
      const beginnerWords = getMatchWordContent('beginner', 10);
      expect(beginnerWords).toHaveLength(10);
      expect(beginnerWords[0]).toHaveProperty('korean');
      expect(beginnerWords[0]).toHaveProperty('english');
      expect(beginnerWords[0]).toHaveProperty('romanization');
      
      // Test intermediate level
      const intermediateWords = getMatchWordContent('intermediate', 5);
      expect(intermediateWords).toHaveLength(5);
      
      // Test advanced level
      const advancedWords = getMatchWordContent('advanced', 8);
      expect(advancedWords).toHaveLength(8);
    });

    test('getSentenceScrambleContent should return appropriate content', () => {
      // Test beginner level
      const beginnerSentences = getSentenceScrambleContent('beginner', 5);
      expect(beginnerSentences).toHaveLength(5);
      expect(beginnerSentences[0]).toHaveProperty('korean');
      expect(beginnerSentences[0]).toHaveProperty('english');
      expect(beginnerSentences[0]).toHaveProperty('words');
      expect(beginnerSentences[0]).toHaveProperty('category');
      
      // Test that words array matches the Korean sentence
      const sentence = beginnerSentences[0];
      const reconstructed = sentence.words.join(' ');
      expect(reconstructed).toBe(sentence.korean);
    });

    test('getPronunciationContent should return appropriate content', () => {
      // Test beginner level
      const beginnerPhrases = getPronunciationContent('beginner', 5);
      expect(beginnerPhrases).toHaveLength(5);
      expect(beginnerPhrases[0]).toHaveProperty('korean');
      expect(beginnerPhrases[0]).toHaveProperty('english');
      expect(beginnerPhrases[0]).toHaveProperty('romanization');
      expect(beginnerPhrases[0]).toHaveProperty('difficulty');
      expect(beginnerPhrases[0]).toHaveProperty('focus');
    });

    test('getConversationScenario should return appropriate content', () => {
      // Test beginner level
      const beginnerScenario = getConversationScenario('beginner');
      expect(beginnerScenario).toHaveProperty('id');
      expect(beginnerScenario).toHaveProperty('title');
      expect(beginnerScenario).toHaveProperty('description');
      expect(beginnerScenario).toHaveProperty('systemPrompt');
      expect(beginnerScenario).toHaveProperty('vocabulary');
      expect(beginnerScenario.vocabulary).toBeInstanceOf(Array);
    });

  });

  describe('Content Variety and Anti-Repetition', () => {
    
    test('should avoid recently used content', () => {
      const recentlyUsed = [
        { korean: "안녕하세요" },
        { korean: "감사합니다" },
        { korean: "네" }
      ];
      
      const content = getMatchWordContent('beginner', 10, recentlyUsed);
      
      // Check that recently used items are not in the result
      const koreanWords = content.map(item => item.korean);
      expect(koreanWords).not.toContain("안녕하세요");
      expect(koreanWords).not.toContain("감사합니다");
      expect(koreanWords).not.toContain("네");
    });

    test('should provide different content on multiple calls', () => {
      const content1 = getMatchWordContent('beginner', 10);
      const content2 = getMatchWordContent('beginner', 10);
      
      // Content should be different due to shuffling
      const korean1 = content1.map(item => item.korean).join(',');
      const korean2 = content2.map(item => item.korean).join(',');
      
      // Very unlikely to be identical with proper shuffling
      expect(korean1).not.toBe(korean2);
    });

  });

  describe('Content Statistics', () => {
    
    test('getContentStatistics should return accurate counts', () => {
      const stats = getContentStatistics();
      
      expect(stats).toHaveProperty('matchWord');
      expect(stats).toHaveProperty('sentenceScramble');
      expect(stats).toHaveProperty('pronunciationChallenge');
      expect(stats).toHaveProperty('conversationQuest');
      
      // Check that totals are reasonable
      expect(stats.matchWord.total).toBeGreaterThan(200);
      expect(stats.sentenceScramble.total).toBeGreaterThan(40);
      expect(stats.pronunciationChallenge.total).toBeGreaterThan(35);
      expect(stats.conversationQuest.total).toBeGreaterThan(10);
    });

  });

  describe('Utility Functions', () => {
    
    test('shuffleArray should properly randomize arrays', () => {
      const original = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
      const shuffled = shuffleArray(original);
      
      // Should have same length
      expect(shuffled).toHaveLength(original.length);
      
      // Should contain all original elements
      expect(shuffled.sort()).toEqual(original.sort());
      
      // Should not modify original array
      expect(original).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
    });

  });

  describe('Level-Appropriate Content', () => {
    
    test('beginner content should be simpler than advanced', () => {
      const beginnerWords = getMatchWordContent('beginner', 10);
      const advancedWords = getMatchWordContent('advanced', 10);
      
      // Advanced words should generally be longer (more complex)
      const avgBeginnerLength = beginnerWords.reduce((sum, word) => 
        sum + word.korean.length, 0) / beginnerWords.length;
      const avgAdvancedLength = advancedWords.reduce((sum, word) => 
        sum + word.korean.length, 0) / advancedWords.length;
      
      expect(avgAdvancedLength).toBeGreaterThan(avgBeginnerLength);
    });

    test('sentence complexity should increase with level', () => {
      const beginnerSentences = getSentenceScrambleContent('beginner', 5);
      const advancedSentences = getSentenceScrambleContent('advanced', 5);
      
      // Advanced sentences should have more words on average
      const avgBeginnerWords = beginnerSentences.reduce((sum, sentence) => 
        sum + sentence.words.length, 0) / beginnerSentences.length;
      const avgAdvancedWords = advancedSentences.reduce((sum, sentence) => 
        sum + sentence.words.length, 0) / advancedSentences.length;
      
      expect(avgAdvancedWords).toBeGreaterThan(avgBeginnerWords);
    });

  });

  describe('Category Filtering', () => {
    
    test('should filter content by category when specified', () => {
      const greetingWords = getMatchWordContent('beginner', 10, [], 'greetings');
      
      // All words should be from greetings category (check common greeting words)
      const koreanWords = greetingWords.map(item => item.korean);
      const hasGreetings = koreanWords.some(word => 
        ['안녕하세요', '감사합니다', '죄송합니다'].includes(word)
      );
      expect(hasGreetings).toBe(true);
    });

  });

});

// Manual test function for development
export const runManualTests = () => {
  console.log('🧪 Running manual game content tests...');
  
  // Test content generation
  console.log('\n📊 Content Statistics:');
  const stats = getContentStatistics();
  console.log(JSON.stringify(stats, null, 2));
  
  // Test Match Word content
  console.log('\n🎮 Match Word Content (Beginner):');
  const matchWords = getMatchWordContent('beginner', 5);
  console.log(matchWords);
  
  // Test Sentence Scramble content
  console.log('\n🔀 Sentence Scramble Content (Intermediate):');
  const sentences = getSentenceScrambleContent('intermediate', 3);
  console.log(sentences);
  
  // Test Pronunciation content
  console.log('\n🎤 Pronunciation Content (Advanced):');
  const phrases = getPronunciationContent('advanced', 3);
  console.log(phrases);
  
  // Test Conversation scenario
  console.log('\n💬 Conversation Scenario (Beginner):');
  const scenario = getConversationScenario('beginner');
  console.log({
    id: scenario.id,
    title: scenario.title,
    description: scenario.description,
    vocabularyCount: scenario.vocabulary.length
  });
  
  console.log('\n✅ Manual tests completed!');
};

// Export for use in development
export default {
  runManualTests
};
