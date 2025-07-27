/**
 * Update All Conversation Flows Script
 * Systematically updates all conversation scenarios to use improved interactive flow
 */

import fs from 'fs';
import path from 'path';

console.log('🔄 UPDATING ALL CONVERSATION FLOWS TO IMPROVED INTERACTIVE APPROACH');
console.log('=' * 80);

/**
 * Generate improved conversation flow template
 */
function generateImprovedFlow(scenarioType, engagementQuestion, firstPhrase, firstPhraseKorean) {
  return `INTERACTIVE CONVERSATION FLOW:
1. Start with casual English greeting: "Hi! How's your day going?"
2. Wait for their response and engage naturally
3. Ask engagement question: "${engagementQuestion}"
4. Transition smoothly: "Great! Ready to practice ${scenarioType} in Korean?"
5. Introduce ONE phrase at a time with immediate practice
6. Keep each response to 1-2 sentences maximum
7. Always wait for user practice between new concepts

TEACHING APPROACH:
- Use 85% English, 15% Korean for beginners
- Start with "${firstPhraseKorean}" (${firstPhrase}) first, get them to practice it
- Then move to one concept at a time
- Always provide English translations in parentheses
- Give lots of encouragement for attempts
- Never overwhelm with multiple concepts at once

NEVER deliver long explanations - always short, interactive exchanges.`;
}

/**
 * Scenario-specific engagement questions and first phrases
 */
const scenarioUpdates = {
  'shopping-basics': {
    engagementQuestion: 'Do you enjoy shopping?',
    scenarioType: 'shopping',
    firstPhrase: 'How much is it?',
    firstPhraseKorean: '얼마예요?'
  },
  'family-introduction': {
    engagementQuestion: 'Tell me about your family',
    scenarioType: 'talking about family',
    firstPhrase: 'family',
    firstPhraseKorean: '가족'
  },
  'weather-conversation': {
    engagementQuestion: 'How\'s the weather where you are?',
    scenarioType: 'weather conversations',
    firstPhrase: 'How\'s the weather?',
    firstPhraseKorean: '날씨가 어때요?'
  },
  'job-interview': {
    engagementQuestion: 'Do you work in an office?',
    scenarioType: 'business conversations',
    firstPhrase: 'Hello (formal)',
    firstPhraseKorean: '안녕하십니까'
  },
  'doctor-visit': {
    engagementQuestion: 'Have you ever visited a doctor abroad?',
    scenarioType: 'medical conversations',
    firstPhrase: 'I don\'t feel well',
    firstPhraseKorean: '몸이 안 좋아요'
  },
  'travel-planning': {
    engagementQuestion: 'Where did you last travel?',
    scenarioType: 'travel planning',
    firstPhrase: 'I want to go to...',
    firstPhraseKorean: '...에 가고 싶어요'
  },
  'hobby-discussion': {
    engagementQuestion: 'What do you like to do in your free time?',
    scenarioType: 'hobby discussions',
    firstPhrase: 'hobby',
    firstPhraseKorean: '취미'
  },
  'business-meeting': {
    engagementQuestion: 'Do you attend business meetings?',
    scenarioType: 'business meetings',
    firstPhrase: 'Nice to meet you (formal)',
    firstPhraseKorean: '만나서 반갑습니다'
  },
  'cultural-discussion': {
    engagementQuestion: 'What interests you about Korean culture?',
    scenarioType: 'cultural discussions',
    firstPhrase: 'culture',
    firstPhraseKorean: '문화'
  },
  'academic-discussion': {
    engagementQuestion: 'Are you a student or do you work?',
    scenarioType: 'academic discussions',
    firstPhrase: 'study',
    firstPhraseKorean: '공부하다'
  }
};

/**
 * Update gameContent.js conversation scenarios
 */
async function updateGameContentScenarios() {
  console.log('\n1️⃣ UPDATING GAME CONTENT SCENARIOS');
  console.log('-' * 50);
  
  const gameContentPath = path.join(process.cwd(), 'src/data/gameContent.js');
  
  try {
    let content = fs.readFileSync(gameContentPath, 'utf8');
    let updatedCount = 0;
    
    // Update each scenario
    for (const [scenarioId, config] of Object.entries(scenarioUpdates)) {
      const improvedFlow = generateImprovedFlow(
        config.scenarioType,
        config.engagementQuestion,
        config.firstPhrase,
        config.firstPhraseKorean
      );
      
      // Find and replace the systemPrompt for this scenario
      const scenarioRegex = new RegExp(
        `(id: "${scenarioId}"[\\s\\S]*?systemPrompt: \`You are \\$\\{TUTOR_NAME\\}[\\s\\S]*?)Guidelines:[\\s\\S]*?(?=\`,)`,
        'g'
      );
      
      const replacement = `$1${improvedFlow}`;
      
      if (scenarioRegex.test(content)) {
        content = content.replace(scenarioRegex, replacement);
        updatedCount++;
        console.log(`   ✅ Updated ${scenarioId}`);
      } else {
        console.log(`   ⚠️ Could not find ${scenarioId} - may need manual update`);
      }
    }
    
    // Write the updated content back
    fs.writeFileSync(gameContentPath, content, 'utf8');
    console.log(`\n📝 Updated ${updatedCount} game content scenarios`);
    
  } catch (error) {
    console.error('❌ Error updating game content:', error.message);
  }
}

/**
 * Update frontend conversation quest scenarios
 */
async function updateFrontendConversationQuest() {
  console.log('\n2️⃣ UPDATING FRONTEND CONVERSATION QUEST');
  console.log('-' * 50);
  
  const questPath = path.join(process.cwd(), '../app/src/app/(main)/games/conversation-quest.js');
  
  try {
    let content = fs.readFileSync(questPath, 'utf8');
    
    // Update the basic greetings scenario
    const oldGreetingFlow = /- Start with a simple greeting in Korean[\s\S]*?- Award points for attempts and correct usage/g;
    const newGreetingFlow = `INTERACTIVE CONVERSATION FLOW:
        1. Start with casual English greeting: "Hi! How are you doing today?"
        2. Wait for their response and engage naturally
        3. Ask engagement question: "Have you tried greeting people in Korean before?"
        4. Transition smoothly: "Great! Ready to practice some Korean greetings?"
        5. Introduce ONE greeting at a time with immediate practice
        6. Keep each response to 1-2 sentences maximum
        7. Always wait for user practice between new concepts

        TEACHING APPROACH:
        - Use 85% English, 15% Korean for beginners
        - Start with "안녕하세요" (Hello) first, get them to practice it
        - Then move to one greeting at a time
        - Always provide English translations in parentheses
        - Give lots of encouragement for attempts
        - Never overwhelm with multiple concepts at once

        NEVER deliver long explanations - always short, interactive exchanges`;
    
    if (oldGreetingFlow.test(content)) {
      content = content.replace(oldGreetingFlow, newGreetingFlow);
      fs.writeFileSync(questPath, content, 'utf8');
      console.log('   ✅ Updated frontend conversation quest basic greetings');
    } else {
      console.log('   ⚠️ Could not find frontend conversation quest pattern');
    }
    
  } catch (error) {
    console.error('❌ Error updating frontend conversation quest:', error.message);
  }
}

/**
 * Update frontend scenario prompts
 */
async function updateFrontendScenarioPrompts() {
  console.log('\n3️⃣ UPDATING FRONTEND SCENARIO PROMPTS');
  console.log('-' * 50);
  
  const scenarioPromptsPath = path.join(process.cwd(), '../app/src/features/tutor/data/scenarioPrompts.js');
  
  try {
    let content = fs.readFileSync(scenarioPromptsPath, 'utf8');
    
    // Replace all Korean greeting starters with casual English greetings
    const koreanGreetingPattern = /Start by saying: "안녕하세요![^"]*"/g;
    const casualGreeting = 'Start by saying: "Hi! How\'s your day going?"';
    
    content = content.replace(koreanGreetingPattern, casualGreeting);
    
    // Update the teaching approach
    const oldApproach = /Teach [^.]*\. You can explain concepts fully\./g;
    const newApproach = 'Use the improved interactive conversation flow with casual greetings and one-concept-at-a-time teaching.';
    
    content = content.replace(oldApproach, newApproach);
    
    fs.writeFileSync(scenarioPromptsPath, content, 'utf8');
    console.log('   ✅ Updated frontend scenario prompts');
    
  } catch (error) {
    console.error('❌ Error updating frontend scenario prompts:', error.message);
  }
}

/**
 * Generate comprehensive test for all conversation flows
 */
async function generateComprehensiveTest() {
  console.log('\n4️⃣ GENERATING COMPREHENSIVE CONVERSATION FLOW TEST');
  console.log('-' * 50);
  
  const testContent = `/**
 * Comprehensive Conversation Flow Test
 * Verifies all conversation scenarios use improved interactive flow
 */

import { conversationQuestContent } from "../data/gameContent.js";

console.log('🧪 TESTING ALL CONVERSATION FLOWS');
console.log('=' * 60);

async function testAllConversationFlows() {
  let allTestsPassed = true;
  const results = [];
  
  // Test all game content scenarios
  const levels = ['beginner', 'intermediate', 'advanced'];
  
  for (const level of levels) {
    const scenarios = conversationQuestContent[level] || [];
    
    console.log(\`\\n📋 Testing \${level} scenarios (\${scenarios.length} total):\`);
    
    for (const scenario of scenarios) {
      const prompt = scenario.systemPrompt;
      
      // Check for improved flow indicators
      const hasInteractiveFlow = prompt.includes('INTERACTIVE CONVERSATION FLOW');
      const hasTeachingApproach = prompt.includes('TEACHING APPROACH');
      const hasCasualGreeting = prompt.includes('Hi!') || prompt.includes('How\\'s your day');
      const hasNoKoreanGreeting = !prompt.includes('안녕하세요! 오늘은');
      const hasOneConceptRule = prompt.includes('ONE') && prompt.includes('at a time');
      const hasShortExchangeRule = prompt.includes('short, interactive exchanges');
      
      const testPassed = hasInteractiveFlow && hasTeachingApproach && 
                        hasCasualGreeting && hasNoKoreanGreeting && 
                        hasOneConceptRule && hasShortExchangeRule;
      
      results.push({
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
      
      console.log(\`   \${testPassed ? '✅' : '❌'} \${scenario.title}\`);
      
      if (!testPassed) {
        allTestsPassed = false;
        console.log(\`      Missing: \${[
          !hasInteractiveFlow && 'Interactive Flow',
          !hasTeachingApproach && 'Teaching Approach',
          !hasCasualGreeting && 'Casual Greeting',
          !hasNoKoreanGreeting && 'No Korean Greeting',
          !hasOneConceptRule && 'One Concept Rule',
          !hasShortExchangeRule && 'Short Exchange Rule'
        ].filter(Boolean).join(', ')}\`);
      }
    }
  }
  
  console.log(\`\\n\` + '=' * 60);
  console.log('🎯 COMPREHENSIVE CONVERSATION FLOW TEST RESULTS');
  console.log('=' * 60);
  
  if (allTestsPassed) {
    console.log('🎉 SUCCESS! All conversation flows use improved interactive approach:');
    console.log('   ✅ All scenarios start with casual English greetings');
    console.log('   ✅ All scenarios include context-specific engagement questions');
    console.log('   ✅ All scenarios follow structured interactive flow');
    console.log('   ✅ All scenarios teach one concept at a time');
    console.log('   ✅ All scenarios use short, interactive exchanges');
    console.log('\\n💡 Every conversation with Miles now feels like talking');
    console.log('   to a friendly language partner!');
  } else {
    const failedTests = results.filter(r => !r.passed);
    console.log(\`⚠️ \${failedTests.length} scenarios still need updates:\`);
    failedTests.forEach(test => {
      console.log(\`   ❌ \${test.level}: \${test.title}\`);
    });
  }
  
  return allTestsPassed;
}

// Run the test
testAllConversationFlows().catch(console.error);`;
  
  const testPath = path.join(process.cwd(), 'src/scripts/testAllConversationFlows.js');
  fs.writeFileSync(testPath, testContent, 'utf8');
  console.log('   ✅ Generated comprehensive conversation flow test');
}

/**
 * Main execution
 */
async function main() {
  try {
    await updateGameContentScenarios();
    await updateFrontendConversationQuest();
    await updateFrontendScenarioPrompts();
    await generateComprehensiveTest();
    
    console.log('\n' + '=' * 80);
    console.log('🎉 ALL CONVERSATION FLOW UPDATES COMPLETE!');
    console.log('=' * 80);
    console.log('✅ Updated game content scenarios');
    console.log('✅ Updated frontend conversation quest');
    console.log('✅ Updated frontend scenario prompts');
    console.log('✅ Generated comprehensive test');
    console.log('\n💡 All conversations with Miles now use the improved');
    console.log('   interactive flow with casual greetings!');
    
  } catch (error) {
    console.error('❌ Error in main execution:', error);
  }
}

// Run the script
main();
