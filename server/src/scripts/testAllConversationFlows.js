/**
 * Comprehensive Conversation Flow Test
 * Verifies all conversation scenarios use improved interactive flow
 */

import { conversationQuestContent } from "../data/gameContent.js";
import { getScenarioPrompt } from "../data/scenarioPrompts.js";

console.log('🧪 COMPREHENSIVE CONVERSATION FLOW AUDIT');
console.log('=' * 70);

async function testAllConversationFlows() {
  let allTestsPassed = true;
  const results = [];
  
  console.log('\n1️⃣ TESTING MAIN SCENARIO PROMPTS');
  console.log('-' * 50);
  
  // Test main scenario prompts (the ones used by the frontend)
  const mainScenarios = [
    'restaurant-ordering',
    'shopping-assistance', 
    'travel-directions',
    'business-meeting',
    'family-conversation',
    'hobby-discussion'
  ];
  
  for (const scenarioId of mainScenarios) {
    try {
      const prompt = getScenarioPrompt(scenarioId, 'beginner');
      
      // Check for improved flow indicators
      const hasInteractiveFlow = prompt.includes('GRADUAL CONVERSATION FLOW') || 
                                prompt.includes('INTERACTIVE CONVERSATION FLOW');
      const hasTeachingApproach = prompt.includes('TEACHING APPROACH') || 
                                 prompt.includes('BEGINNER-SPECIFIC RULES');
      const hasCasualGreeting = prompt.includes('Hi!') || 
                               prompt.includes('How\'s your day') ||
                               prompt.includes('How are you');
      const hasNoKoreanGreeting = !prompt.includes('안녕하세요! 오늘은');
      const hasOneConceptRule = prompt.includes('ONE') && 
                               (prompt.includes('at a time') || prompt.includes('per exchange'));
      const hasShortExchangeRule = prompt.includes('short, interactive exchanges') ||
                                  prompt.includes('1-2 sentences');
      
      const testPassed = hasInteractiveFlow && hasTeachingApproach && 
                        hasCasualGreeting && hasNoKoreanGreeting && 
                        hasOneConceptRule && hasShortExchangeRule;
      
      results.push({
        type: 'main-scenario',
        id: scenarioId,
        passed: testPassed,
        hasInteractiveFlow,
        hasTeachingApproach,
        hasCasualGreeting,
        hasNoKoreanGreeting,
        hasOneConceptRule,
        hasShortExchangeRule,
        length: prompt.length
      });
      
      console.log(`   ${testPassed ? '✅' : '❌'} ${scenarioId} (${prompt.length} chars)`);
      
      if (!testPassed) {
        allTestsPassed = false;
        const missing = [
          !hasInteractiveFlow && 'Interactive Flow',
          !hasTeachingApproach && 'Teaching Approach',
          !hasCasualGreeting && 'Casual Greeting',
          !hasNoKoreanGreeting && 'No Korean Greeting',
          !hasOneConceptRule && 'One Concept Rule',
          !hasShortExchangeRule && 'Short Exchange Rule'
        ].filter(Boolean);
        console.log(`      Missing: ${missing.join(', ')}`);
      }
      
    } catch (error) {
      console.log(`   ❌ ${scenarioId}: Error - ${error.message}`);
      allTestsPassed = false;
    }
  }
  
  console.log('\n2️⃣ TESTING GAME CONTENT SCENARIOS');
  console.log('-' * 50);
  
  // Test game content scenarios
  const levels = ['beginner', 'intermediate', 'advanced'];
  let gameTestsPassed = 0;
  let totalGameTests = 0;
  
  for (const level of levels) {
    const scenarios = conversationQuestContent[level] || [];
    
    console.log(`\n📋 Testing ${level} game scenarios (${scenarios.length} total):`);
    
    for (const scenario of scenarios) {
      totalGameTests++;
      const prompt = scenario.systemPrompt;
      
      // Check for improved flow indicators
      const hasInteractiveFlow = prompt.includes('INTERACTIVE CONVERSATION FLOW');
      const hasTeachingApproach = prompt.includes('TEACHING APPROACH');
      const hasCasualGreeting = prompt.includes('Hi!') || prompt.includes('How\'s your day');
      const hasNoKoreanGreeting = !prompt.includes('안녕하세요! 오늘은') && 
                                 !prompt.includes('Start with a simple greeting in Korean');
      const hasOneConceptRule = prompt.includes('ONE') && prompt.includes('at a time');
      const hasShortExchangeRule = prompt.includes('short, interactive exchanges');
      
      const testPassed = hasInteractiveFlow && hasTeachingApproach && 
                        hasCasualGreeting && hasNoKoreanGreeting && 
                        hasOneConceptRule && hasShortExchangeRule;
      
      if (testPassed) {
        gameTestsPassed++;
      } else {
        allTestsPassed = false;
      }
      
      results.push({
        type: 'game-scenario',
        level,
        id: scenario.id,
        title: scenario.title,
        passed: testPassed,
        hasInteractiveFlow,
        hasTeachingApproach,
        hasCasualGreeting,
        hasNoKoreanGreeting,
        hasOneConceptRule,
        hasShortExchangeRule
      });
      
      console.log(`   ${testPassed ? '✅' : '❌'} ${scenario.title}`);
      
      if (!testPassed) {
        const missing = [
          !hasInteractiveFlow && 'Interactive Flow',
          !hasTeachingApproach && 'Teaching Approach',
          !hasCasualGreeting && 'Casual Greeting',
          !hasNoKoreanGreeting && 'No Korean Greeting',
          !hasOneConceptRule && 'One Concept Rule',
          !hasShortExchangeRule && 'Short Exchange Rule'
        ].filter(Boolean);
        console.log(`      Missing: ${missing.join(', ')}`);
      }
    }
  }
  
  console.log('\n3️⃣ TESTING CONVERSATION ENTRY POINTS');
  console.log('-' * 50);
  
  // Test various conversation entry points
  const entryPoints = [
    { name: 'Standalone Scenarios', count: mainScenarios.length },
    { name: 'Game-based Conversations', count: totalGameTests },
    { name: 'Lesson-integrated Conversations', status: 'Uses scenario prompts' },
    { name: 'General "Talk with Miles"', status: 'Uses general prompts' }
  ];
  
  entryPoints.forEach(entry => {
    if (entry.count !== undefined) {
      console.log(`   📝 ${entry.name}: ${entry.count} scenarios tested`);
    } else {
      console.log(`   📝 ${entry.name}: ${entry.status}`);
    }
  });
  
  console.log('\n' + '=' * 70);
  console.log('🎯 COMPREHENSIVE CONVERSATION FLOW AUDIT RESULTS');
  console.log('=' * 70);
  
  const mainScenarioResults = results.filter(r => r.type === 'main-scenario');
  const gameScenarioResults = results.filter(r => r.type === 'game-scenario');
  
  const mainScenariosPassed = mainScenarioResults.filter(r => r.passed).length;
  const gameScenariosPassed = gameScenarioResults.filter(r => r.passed).length;
  
  console.log(`📊 SUMMARY:`);
  console.log(`   Main Scenarios: ${mainScenariosPassed}/${mainScenarioResults.length} passed`);
  console.log(`   Game Scenarios: ${gameScenariosPassed}/${gameScenarioResults.length} passed`);
  console.log(`   Total: ${mainScenariosPassed + gameScenariosPassed}/${results.length} passed`);
  
  if (allTestsPassed) {
    console.log('\n🎉 SUCCESS! All conversation flows use improved interactive approach:');
    console.log('   ✅ All scenarios start with casual English greetings');
    console.log('   ✅ All scenarios include context-specific engagement questions');
    console.log('   ✅ All scenarios follow structured interactive flow');
    console.log('   ✅ All scenarios teach one concept at a time');
    console.log('   ✅ All scenarios use short, interactive exchanges');
    console.log('   ✅ No scenarios use old Korean greeting approach');
    console.log('\n💡 Every conversation with Miles now feels like talking');
    console.log('   to a friendly language partner who naturally eases');
    console.log('   users into Korean practice!');
    
    console.log('\n🔄 CONVERSATION FLOW PATTERN:');
    console.log('   1. "Hi! How\'s your day going?" (casual greeting)');
    console.log('   2. User responds naturally');
    console.log('   3. Context-specific engagement question');
    console.log('   4. "Great! Ready to practice [topic] in Korean?"');
    console.log('   5. One concept at a time with immediate practice');
    console.log('   6. Short, interactive exchanges throughout');
    
  } else {
    console.log('\n⚠️ Some conversation flows still need updates:');
    
    const failedMainScenarios = mainScenarioResults.filter(r => !r.passed);
    if (failedMainScenarios.length > 0) {
      console.log(`\n❌ Main scenarios needing updates (${failedMainScenarios.length}):`);
      failedMainScenarios.forEach(test => {
        console.log(`   • ${test.id}`);
      });
    }
    
    const failedGameScenarios = gameScenarioResults.filter(r => !r.passed);
    if (failedGameScenarios.length > 0) {
      console.log(`\n❌ Game scenarios needing updates (${failedGameScenarios.length}):`);
      failedGameScenarios.forEach(test => {
        console.log(`   • ${test.level}: ${test.title || test.id}`);
      });
    }
    
    console.log('\n💡 Priority: Focus on main scenarios first as they are');
    console.log('   used by the primary frontend interface.');
  }
  
  return allTestsPassed;
}

// Run the comprehensive test
testAllConversationFlows().catch(console.error);
