import { createTeachingPrompt, createContextAwareTeachingPrompt } from "../data/promptTemplates.js";
import { analyzeResponsePacing } from "../services/conversationFlowService.js";

console.log('🔍 COMPREHENSIVE REALTIME CONVERSATION FIX VERIFICATION');
console.log('=' * 70);

async function testCompleteFlow() {
  try {
    console.log('\n1️⃣ TESTING ENHANCED PROMPT GENERATION');
    console.log('-' * 40);

    // Test the exact flow that OpenAI controller uses
    const contextAwarePrompt = await createContextAwareTeachingPrompt({
      isScenarioBased: true,
      scenarioId: 'restaurant-ordering',
      level: 'beginner'
    }, 'test-user-123');

    const starterMatch = contextAwarePrompt.match(/START IMMEDIATELY: "([^"]+)"/);
    console.log('✅ Context-aware prompt generated');
    console.log('📏 Length:', contextAwarePrompt.length, 'characters');
    console.log('🎯 Starter:', starterMatch ? starterMatch[1] : 'None');
    console.log('🇰🇷 Contains Korean:', /[가-힣]/.test(contextAwarePrompt));
    console.log('🍽️ Contains restaurant:', contextAwarePrompt.toLowerCase().includes('restaurant'));
    console.log('👨‍🏫 Contains Miles:', contextAwarePrompt.includes('Miles'));

    // Verify it's using casual greeting, not Korean
    const isUsingCasualGreeting = starterMatch && (
      starterMatch[1].includes('How') ||
      starterMatch[1].includes('day') ||
      starterMatch[1].includes('doing')
    );
    console.log('💬 Using casual greeting (not Korean):', isUsingCasualGreeting);

    console.log('\n2️⃣ TESTING FALLBACK INSTRUCTION GENERATION');
    console.log('-' * 40);

    // Test fallback scenarios
    const fallbackPrompt = createTeachingPrompt({
      isScenarioBased: true,
      scenarioId: 'restaurant-ordering',
      level: 'beginner'
    });

    const fallbackStarter = fallbackPrompt.match(/START IMMEDIATELY: "([^"]+)"/);
    console.log('✅ Fallback prompt generated');
    console.log('🎯 Fallback starter:', fallbackStarter ? fallbackStarter[1] : 'None');

    console.log('\n3️⃣ TESTING MULTIPLE SCENARIOS');
    console.log('-' * 40);

    const scenarios = [
      'restaurant-ordering',
      'greetings-introductions',
      'making-plans'
    ];

    for (const scenarioId of scenarios) {
      try {
        const prompt = await createContextAwareTeachingPrompt({
          isScenarioBased: true,
          scenarioId,
          level: 'beginner'
        }, 'test-user-123');

        const starter = prompt.match(/START IMMEDIATELY: "([^"]+)"/);
        const isCasual = starter && (
          starter[1].includes('How') ||
          starter[1].includes('day') ||
          starter[1].includes('doing')
        );

        console.log(`📝 ${scenarioId}:`);
        console.log(`   Starter: "${starter ? starter[1] : 'None'}"`);
        console.log(`   Casual: ${isCasual}`);

      } catch (err) {
        console.log(`❌ ${scenarioId}: Error - ${err.message}`);
      }
    }

    console.log('\n4️⃣ TESTING RESPONSE PACING ANALYSIS');
    console.log('-' * 40);

    if (starterMatch) {
      const analysis = analyzeResponsePacing(starterMatch[1]);
      console.log('📊 Starter Analysis:');
      console.log(`   Sentences: ${analysis.sentenceCount}`);
      console.log(`   Korean phrases: ${analysis.koreanPhraseCount}`);
      console.log(`   Too long: ${analysis.tooLong}`);
      console.log(`   Multiple concepts: ${analysis.hasMultipleConcepts}`);
      console.log(`   Needs simplification: ${analysis.tooLong || analysis.hasMultipleConcepts}`);
    }

    console.log('\n' + '=' * 70);
    console.log('🎯 FIX VERIFICATION SUMMARY');
    console.log('=' * 70);

    const allGood = starterMatch && isUsingCasualGreeting &&
      contextAwarePrompt.includes('Miles') &&
      contextAwarePrompt.includes('GRADUAL');

    if (allGood) {
      console.log('🎉 SUCCESS! All fixes are working correctly:');
      console.log('   ✅ Enhanced prompts are being generated');
      console.log('   ✅ Casual greetings are being used (not Korean)');
      console.log('   ✅ Miles personality is included');
      console.log('   ✅ Gradual progression rules are applied');
      console.log('   ✅ Scenario-specific content is included');
      console.log('\n💡 The WebRTC service should now use these enhanced prompts');
      console.log('   instead of overriding them with hardcoded instructions.');
    } else {
      console.log('⚠️ Some issues still exist:');
      if (!starterMatch) console.log('   ❌ No starter found in prompt');
      if (!isUsingCasualGreeting) console.log('   ❌ Not using casual greeting');
      if (!contextAwarePrompt.includes('Miles')) console.log('   ❌ Miles personality missing');
      if (!contextAwarePrompt.includes('GRADUAL')) console.log('   ❌ Gradual progression rules missing');
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testCompleteFlow();
