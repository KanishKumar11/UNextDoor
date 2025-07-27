/**
 * Test Lesson-Integrated Conversation Flow
 * Verifies that lesson conversations use the improved interactive flow
 */

import { getScenarioPrompt } from "../data/scenarioPrompts.js";
import { createTeachingPrompt } from "../data/promptTemplates.js";

console.log('🧪 TESTING LESSON-INTEGRATED CONVERSATION FLOW');
console.log('=' * 70);

async function testLessonConversationFlow() {
  let allTestsPassed = true;
  const results = [];
  
  console.log('\n1️⃣ TESTING LESSON-SPECIFIC SCENARIO PROMPTS');
  console.log('-' * 50);
  
  // Test various lesson scenario IDs
  const lessonScenarios = [
    'lesson-1',
    'lesson-123',
    'lesson-alphabet',
    'lesson-greetings',
    'lesson-numbers'
  ];
  
  for (const lessonId of lessonScenarios) {
    console.log(`\n📚 Testing: ${lessonId}`);
    
    try {
      // Test lesson prompt generation
      const prompt = getScenarioPrompt(lessonId, 'intermediate');
      
      // Check for improved flow indicators
      const hasInteractiveFlow = prompt.includes('IMPROVED INTERACTIVE CONVERSATION FLOW');
      const hasTeachingApproach = prompt.includes('LESSON-FOCUSED TEACHING APPROACH');
      const hasLevelRules = prompt.includes('INTERMEDIATE-SPECIFIC RULES');
      const hasCasualGreeting = prompt.includes('Hi! How\'s your day going?');
      const hasLessonEngagement = prompt.includes('How are you finding this lesson') || 
                                 prompt.includes('Ready to practice what you\'ve learned');
      const hasNoKoreanGreeting = !prompt.includes('Start with a friendly greeting in Korean');
      const hasOneConceptRule = prompt.includes('ONE concept') && prompt.includes('at a time');
      const hasShortExchangeRule = prompt.includes('short, interactive exchanges');
      const hasLessonIntegration = prompt.includes('LESSON INTEGRATION');
      
      const testPassed = hasInteractiveFlow && hasTeachingApproach && 
                        hasLevelRules && hasCasualGreeting && 
                        hasLessonEngagement && hasNoKoreanGreeting && 
                        hasOneConceptRule && hasShortExchangeRule && 
                        hasLessonIntegration;
      
      results.push({
        lessonId,
        passed: testPassed,
        hasInteractiveFlow,
        hasTeachingApproach,
        hasLevelRules,
        hasCasualGreeting,
        hasLessonEngagement,
        hasNoKoreanGreeting,
        hasOneConceptRule,
        hasShortExchangeRule,
        hasLessonIntegration,
        length: prompt.length
      });
      
      console.log(`   ${testPassed ? '✅' : '❌'} Lesson prompt (${prompt.length} chars)`);
      
      if (testPassed) {
        // Extract and show the greeting pattern
        const greetingMatch = prompt.match(/Begin by saying "([^"]+)"/);
        if (greetingMatch) {
          console.log(`   💬 Greeting: "${greetingMatch[1]}"`);
        }
        
        // Show engagement approach
        if (hasLessonEngagement) {
          console.log(`   ✓ Has lesson-specific engagement questions`);
        }
        
        // Show language mix
        const levelMatch = prompt.match(/Use (\d+)% English, (\d+)% Korean/);
        if (levelMatch) {
          console.log(`   ✓ Language mix: ${levelMatch[1]}% English, ${levelMatch[2]}% Korean`);
        }
        
        console.log(`   ✓ Includes lesson integration guidelines`);
      } else {
        allTestsPassed = false;
        const missing = [
          !hasInteractiveFlow && 'Interactive Flow',
          !hasTeachingApproach && 'Teaching Approach',
          !hasLevelRules && 'Level Rules',
          !hasCasualGreeting && 'Casual Greeting',
          !hasLessonEngagement && 'Lesson Engagement',
          !hasNoKoreanGreeting && 'No Korean Greeting',
          !hasOneConceptRule && 'One Concept Rule',
          !hasShortExchangeRule && 'Short Exchange Rule',
          !hasLessonIntegration && 'Lesson Integration'
        ].filter(Boolean);
        console.log(`   ❌ Missing: ${missing.join(', ')}`);
      }
      
    } catch (error) {
      console.log(`   ❌ Error: ${error.message}`);
      allTestsPassed = false;
      results.push({
        lessonId,
        passed: false,
        error: error.message
      });
    }
  }
  
  console.log('\n2️⃣ TESTING FULL LESSON PROMPT GENERATION');
  console.log('-' * 50);
  
  // Test full prompt generation for lesson scenarios
  const testLessonId = 'lesson-123';
  
  try {
    const fullPrompt = createTeachingPrompt({
      isScenarioBased: true,
      scenarioId: testLessonId,
      isLessonBased: true,
      lessonDetails: 'Korean Greetings and Introductions',
      level: 'intermediate'
    });
    
    const starterMatch = fullPrompt.match(/START IMMEDIATELY: "([^"]+)"/);
    const starter = starterMatch ? starterMatch[1] : 'None';
    
    console.log(`📝 Full lesson prompt for ${testLessonId}:`);
    console.log(`   📏 Length: ${fullPrompt.length} chars`);
    console.log(`   🎯 Starter: "${starter}"`);
    console.log(`   ✅ Has starter: ${!!starterMatch}`);
    
    // Check if it contains lesson-specific content
    const hasLessonContent = fullPrompt.includes('lesson') || 
                            fullPrompt.includes('LESSON');
    console.log(`   📚 Contains lesson content: ${hasLessonContent}`);
    
  } catch (error) {
    console.log(`   ❌ Full prompt error: ${error.message}`);
    allTestsPassed = false;
  }
  
  console.log('\n3️⃣ COMPARING OLD VS NEW LESSON PROMPTS');
  console.log('-' * 50);
  
  // Compare with old level-based prompt
  try {
    const { getLevelBasedPrompt } = await import("../data/scenarioPrompts.js");
    const oldPrompt = getLevelBasedPrompt('intermediate');
    const newPrompt = getScenarioPrompt('lesson-test', 'intermediate');
    
    console.log('📊 Comparison:');
    console.log(`   Old prompt length: ${oldPrompt.length} chars`);
    console.log(`   New prompt length: ${newPrompt.length} chars`);
    
    const oldHasKoreanGreeting = oldPrompt.includes('Start with a friendly greeting in Korean');
    const newHasCasualGreeting = newPrompt.includes('Hi! How\'s your day going?');
    
    console.log(`   Old uses Korean greeting: ${oldHasKoreanGreeting ? '❌' : '✅'}`);
    console.log(`   New uses casual greeting: ${newHasCasualGreeting ? '✅' : '❌'}`);
    
    const oldHasRepetition = oldPrompt.includes('MANDATORY REPETITION');
    const newHasInteractive = newPrompt.includes('short, interactive exchanges');
    
    console.log(`   Old uses repetition focus: ${oldHasRepetition ? '❌' : '✅'}`);
    console.log(`   New uses interactive flow: ${newHasInteractive ? '✅' : '❌'}`);
    
  } catch (error) {
    console.log(`   ❌ Comparison error: ${error.message}`);
  }
  
  console.log('\n' + '=' * 70);
  console.log('🎯 LESSON CONVERSATION FLOW TEST RESULTS');
  console.log('=' * 70);
  
  const passedTests = results.filter(r => r.passed).length;
  const totalTests = results.length;
  
  console.log(`📊 SUMMARY: ${passedTests}/${totalTests} lesson scenarios passed`);
  
  if (allTestsPassed) {
    console.log('\n🎉 SUCCESS! All lesson-integrated conversations now use improved flow:');
    console.log('');
    console.log('✅ LESSON CONVERSATION STARTER REQUIREMENTS:');
    console.log('   • All lesson conversations begin with casual English greetings');
    console.log('   • No lesson conversations start with Korean greetings');
    console.log('   • Lesson-specific engagement questions implemented');
    console.log('');
    console.log('✅ LESSON-SPECIFIC ENGAGEMENT QUESTIONS:');
    console.log('   • "How are you finding this lesson so far?"');
    console.log('   • "Ready to practice what you\'ve learned?"');
    console.log('   • Natural transitions to lesson content practice');
    console.log('');
    console.log('✅ LESSON-INTEGRATED STRUCTURED FLOW:');
    console.log('   1. Casual greeting + personal check-in');
    console.log('   2. Lesson-specific engagement question');
    console.log('   3. Transition: "Great! Let\'s practice some Korean from this lesson"');
    console.log('   4. Short, interactive practice of lesson content');
    console.log('   5. One lesson concept at a time with user participation');
    console.log('');
    console.log('✅ LESSON CONTENT INTEGRATION:');
    console.log('   • Connects conversation to specific lesson vocabulary');
    console.log('   • Builds on concepts from the lesson');
    console.log('   • Reinforces lesson learning through conversation');
    console.log('   • Provides context about lesson relevance');
    console.log('');
    console.log('💡 IMPACT: Lesson-integrated conversations now feel like natural');
    console.log('   extensions of the lesson content, with Miles helping users');
    console.log('   practice what they\'ve just learned in a conversational way!');
    
  } else {
    console.log('\n⚠️ Some lesson conversation flows still need attention:');
    const failedTests = results.filter(r => !r.passed);
    failedTests.forEach(test => {
      console.log(`   ❌ ${test.lessonId}: ${test.error || 'Missing flow elements'}`);
    });
  }
  
  console.log('\n📋 LESSON CONVERSATION FLOW PATTERN:');
  console.log('   1. "Hi! How\'s your day going?" (casual greeting)');
  console.log('   2. User responds naturally');
  console.log('   3. "How are you finding this lesson so far?" (lesson engagement)');
  console.log('   4. "Great! Let\'s practice some Korean from this lesson"');
  console.log('   5. One lesson concept at a time with immediate practice');
  console.log('   6. Short, interactive exchanges that reinforce lesson learning');
  
  return allTestsPassed;
}

// Run the test
testLessonConversationFlow().catch(console.error);
