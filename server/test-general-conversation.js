import { getScenarioPrompt } from './src/data/scenarioPrompts.js';

console.log('🧪 Testing General Conversation Improvements...\n');

try {
  // Test the new general-conversation scenario
  const prompt = getScenarioPrompt('general-conversation', 'beginner');

  console.log('✅ General Conversation Prompt Generated Successfully');
  console.log('Length:', prompt.length, 'characters');

  // Check if it contains the key improvements
  const improvements = [
    'ask what they\'d like to practice',
    'WAIT for their response',
    'offer 3-4 specific suggestions',
    'Don\'t immediately jump into teaching'
  ];

  console.log('\n🔍 Checking for key improvements:');
  improvements.forEach(improvement => {
    const found = prompt.toLowerCase().includes(improvement.toLowerCase());
    console.log(`${found ? '✅' : '❌'} ${improvement}: ${found ? 'FOUND' : 'MISSING'}`);
  });

  console.log('\n📝 First 300 characters of prompt:');
  console.log('─'.repeat(50));
  console.log(prompt.substring(0, 300) + '...');
  console.log('─'.repeat(50));

} catch (error) {
  console.error('❌ Error testing prompt:', error.message);
}
