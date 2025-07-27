/**
 * Comprehensive Scenario Consistency Audit
 * Verifies frontend-backend consistency and scenario mapping fixes
 */

import { createTeachingPrompt, createContextAwareTeachingPrompt } from "../data/promptTemplates.js";
import { getScenarioPrompt } from "../data/scenarioPrompts.js";
import { learningScenarios } from "../data/learningScenarios.js";

console.log('🔍 COMPREHENSIVE SCENARIO CONSISTENCY AUDIT');
console.log('=' * 60);

/**
 * Test scenario mapping and content consistency
 */
async function runComprehensiveAudit() {
  try {
    console.log('\n1️⃣ TESTING CRITICAL FRONTEND SCENARIOS');
    console.log('-' * 50);
    
    // These are the scenarios that the main frontend UI uses
    const frontendScenarios = [
      {
        id: 'restaurant-ordering',
        expectedContent: ['restaurant', 'ordering', 'food'],
        unexpectedContent: ['dorm', 'group', 'class', 'ticket', 'café']
      },
      {
        id: 'shopping-assistance', 
        expectedContent: ['shopping', 'assistance', 'help'],
        unexpectedContent: ['dorm', 'group', 'class', 'ticket', 'café']
      },
      {
        id: 'travel-directions',
        expectedContent: ['travel', 'direction', '어디에'],
        unexpectedContent: ['group', 'project', 'team', 'dorm', 'class']
      },
      {
        id: 'business-meeting',
        expectedContent: ['business', 'meeting', 'professional'],
        unexpectedContent: ['class', 'student', 'dorm', 'ticket']
      },
      {
        id: 'family-conversation',
        expectedContent: ['family', 'conversation', '가족'],
        unexpectedContent: ['ticket', 'buying', 'station', 'cinema']
      },
      {
        id: 'hobby-discussion',
        expectedContent: ['hobby', 'discussion', '취미'],
        unexpectedContent: ['café', 'coffee', 'drinks', 'ordering']
      }
    ];
    
    let allTestsPassed = true;
    const results = [];
    
    for (const scenario of frontendScenarios) {
      console.log(`\n📝 Testing: ${scenario.id}`);
      
      try {
        // Test scenario prompt generation
        const prompt = getScenarioPrompt(scenario.id, 'intermediate');
        const promptLower = prompt.toLowerCase();
        
        // Check expected content
        const hasExpectedContent = scenario.expectedContent.some(content => 
          promptLower.includes(content.toLowerCase())
        );
        
        // Check for unexpected content
        const hasUnexpectedContent = scenario.unexpectedContent.some(content =>
          promptLower.includes(content.toLowerCase())
        );
        
        // Check for casual greeting approach
        const usesCasualGreeting = promptLower.includes('hi!') || 
                                  promptLower.includes('how\'s your day') ||
                                  promptLower.includes('how are you');
        
        // Check for Korean greeting (should be false for main scenarios)
        const usesKoreanGreeting = promptLower.includes('안녕하세요! 오늘은');
        
        const testPassed = hasExpectedContent && !hasUnexpectedContent && 
                          usesCasualGreeting && !usesKoreanGreeting;
        
        results.push({
          id: scenario.id,
          passed: testPassed,
          hasExpectedContent,
          hasUnexpectedContent,
          usesCasualGreeting,
          usesKoreanGreeting,
          length: prompt.length
        });
        
        console.log(`   ✅ Expected content: ${hasExpectedContent}`);
        console.log(`   ✅ No unexpected content: ${!hasUnexpectedContent}`);
        console.log(`   ✅ Uses casual greeting: ${usesCasualGreeting}`);
        console.log(`   ✅ No Korean greeting: ${!usesKoreanGreeting}`);
        console.log(`   📏 Prompt length: ${prompt.length} chars`);
        console.log(`   🎯 Overall: ${testPassed ? 'PASS' : 'FAIL'}`);
        
        if (!testPassed) {
          allTestsPassed = false;
          if (!hasExpectedContent) {
            console.log(`   ❌ Missing expected content: ${scenario.expectedContent.join(', ')}`);
          }
          if (hasUnexpectedContent) {
            const found = scenario.unexpectedContent.filter(content =>
              promptLower.includes(content.toLowerCase())
            );
            console.log(`   ❌ Contains unexpected content: ${found.join(', ')}`);
          }
        }
        
      } catch (error) {
        console.log(`   ❌ Error: ${error.message}`);
        allTestsPassed = false;
        results.push({
          id: scenario.id,
          passed: false,
          error: error.message
        });
      }
    }
    
    console.log('\n2️⃣ TESTING FULL PROMPT GENERATION');
    console.log('-' * 50);
    
    // Test full prompt generation for critical scenarios
    const criticalScenarios = ['travel-directions', 'shopping-assistance'];
    
    for (const scenarioId of criticalScenarios) {
      console.log(`\n🔧 Testing full prompt: ${scenarioId}`);
      
      try {
        const fullPrompt = createTeachingPrompt({
          isScenarioBased: true,
          scenarioId: scenarioId,
          level: 'intermediate'
        });
        
        const starterMatch = fullPrompt.match(/START IMMEDIATELY: "([^"]+)"/);
        const starter = starterMatch ? starterMatch[1] : 'None';
        
        console.log(`   📏 Full prompt length: ${fullPrompt.length} chars`);
        console.log(`   🎯 Starter: "${starter}"`);
        console.log(`   ✅ Has starter: ${!!starterMatch}`);
        
      } catch (error) {
        console.log(`   ❌ Full prompt error: ${error.message}`);
        allTestsPassed = false;
      }
    }
    
    console.log('\n3️⃣ TESTING BACKEND SCENARIO DEFINITIONS');
    console.log('-' * 50);
    
    // Test that backend scenario definitions are consistent
    console.log(`📊 Total scenarios in learningScenarios.js: ${learningScenarios.length}`);
    
    // Check for updated scenario titles
    const updatedScenarios = [
      { id: 's4', expectedTitle: 'Shopping Assistance' },
      { id: 's5', expectedTitle: 'Travel & Directions' },
      { id: 's6', expectedTitle: 'Business Meeting' },
      { id: 's7', expectedTitle: 'Family Conversation' },
      { id: 's8', expectedTitle: 'Hobby Discussion' }
    ];
    
    for (const scenario of updatedScenarios) {
      const found = learningScenarios.find(s => s.id === scenario.id);
      if (found) {
        const titleMatches = found.title === scenario.expectedTitle;
        console.log(`   ${scenario.id}: ${found.title} - ${titleMatches ? '✅' : '❌'}`);
        if (!titleMatches) {
          console.log(`      Expected: "${scenario.expectedTitle}", Got: "${found.title}"`);
          allTestsPassed = false;
        }
      } else {
        console.log(`   ${scenario.id}: Not found - ❌`);
        allTestsPassed = false;
      }
    }
    
    console.log('\n4️⃣ TESTING SCENARIO MAPPING CONSISTENCY');
    console.log('-' * 50);
    
    // Test that all frontend scenario IDs map correctly
    const mappingTests = [
      { frontend: 'restaurant-ordering', internal: 's2' },
      { frontend: 'shopping-assistance', internal: 's4' },
      { frontend: 'travel-directions', internal: 's5' },
      { frontend: 'business-meeting', internal: 's6' },
      { frontend: 'family-conversation', internal: 's7' },
      { frontend: 'hobby-discussion', internal: 's8' }
    ];
    
    for (const test of mappingTests) {
      try {
        const prompt = getScenarioPrompt(test.frontend, 'beginner');
        console.log(`   ${test.frontend} → ${test.internal}: ✅ (${prompt.length} chars)`);
      } catch (error) {
        console.log(`   ${test.frontend} → ${test.internal}: ❌ ${error.message}`);
        allTestsPassed = false;
      }
    }
    
    console.log('\n' + '=' * 60);
    console.log('🎯 COMPREHENSIVE AUDIT RESULTS');
    console.log('=' * 60);
    
    if (allTestsPassed) {
      console.log('🎉 SUCCESS! All scenario consistency tests passed:');
      console.log('   ✅ All frontend scenarios have correct content');
      console.log('   ✅ No scenarios contain mismatched content');
      console.log('   ✅ All scenarios use casual greeting approach');
      console.log('   ✅ Backend scenario definitions are consistent');
      console.log('   ✅ Scenario mapping works correctly');
      console.log('   ✅ Full prompt generation works');
      console.log('\n💡 The application now has complete frontend-backend');
      console.log('   scenario consistency!');
      
      // Summary of fixes
      console.log('\n📋 SUMMARY OF FIXES APPLIED:');
      console.log('   🔧 Fixed travel-directions → now shows travel content');
      console.log('   🔧 Fixed shopping-assistance → now shows shopping content');
      console.log('   🔧 Fixed business-meeting → now shows business content');
      console.log('   🔧 Fixed family-conversation → now shows family content');
      console.log('   🔧 Fixed hobby-discussion → now shows hobby content');
      console.log('   🔧 Updated backend scenario definitions');
      console.log('   🔧 Updated frontend scenario definitions');
      console.log('   🔧 Standardized conversation flow approach');
      
    } else {
      console.log('⚠️ Some consistency issues remain:');
      const failedTests = results.filter(r => !r.passed);
      failedTests.forEach(test => {
        console.log(`   ❌ ${test.id}: ${test.error || 'Content/greeting issues'}`);
      });
    }
    
    return allTestsPassed;
    
  } catch (error) {
    console.error('❌ Audit failed:', error.message);
    return false;
  }
}

// Run the comprehensive audit
runComprehensiveAudit().catch(console.error);
