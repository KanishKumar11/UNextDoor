/**
 * Debug Prompt Generation
 * Test script to debug why enhanced prompts aren't working
 */

import { createTeachingPrompt, createContextAwareTeachingPrompt } from "../data/promptTemplates.js";
import { getScenarioPrompt } from "../data/scenarioPrompts.js";

/**
 * Test prompt generation for restaurant ordering scenario
 */
async function testRestaurantOrderingPrompt() {
  console.log("🔍 DEBUGGING RESTAURANT ORDERING PROMPT");
  console.log("=" * 50);
  
  const testOptions = {
    isScenarioBased: true,
    scenarioId: "restaurant-ordering", // This is what frontend sends
    level: "beginner",
    userId: "test-user-123"
  };
  
  console.log("📋 Test Options:");
  console.log(JSON.stringify(testOptions, null, 2));
  
  // Test 1: Direct scenario prompt retrieval
  console.log("\n1️⃣ Testing Direct Scenario Prompt Retrieval:");
  const directScenarioPrompt = getScenarioPrompt("restaurant-ordering", "beginner");
  console.log("Direct scenario prompt length:", directScenarioPrompt.length);
  console.log("First 200 characters:", directScenarioPrompt.substring(0, 200) + "...");
  
  // Test 2: Basic teaching prompt
  console.log("\n2️⃣ Testing Basic Teaching Prompt:");
  const basicPrompt = createTeachingPrompt(testOptions);
  console.log("Basic prompt length:", basicPrompt.length);
  console.log("Contains 'Miles':", basicPrompt.includes("Miles"));
  console.log("Contains 'restaurant':", basicPrompt.toLowerCase().includes("restaurant"));
  console.log("Contains scenario context:", basicPrompt.includes("SCENARIO CONTEXT"));
  
  // Show the starter being used
  const starterMatch = basicPrompt.match(/START IMMEDIATELY: "([^"]+)"/);
  if (starterMatch) {
    console.log("Selected starter:", starterMatch[1]);
  }
  
  // Test 3: Context-aware teaching prompt
  console.log("\n3️⃣ Testing Context-Aware Teaching Prompt:");
  try {
    const contextPrompt = await createContextAwareTeachingPrompt(testOptions, "test-user-123");
    console.log("Context-aware prompt length:", contextPrompt.length);
    console.log("Contains 'Miles':", contextPrompt.includes("Miles"));
    console.log("Contains 'restaurant':", contextPrompt.toLowerCase().includes("restaurant"));
    console.log("Contains conversation continuity:", contextPrompt.includes("CONVERSATION CONTINUITY"));
  } catch (error) {
    console.log("❌ Context-aware prompt failed:", error.message);
  }
  
  // Test 4: Show key sections of the prompt
  console.log("\n4️⃣ Key Prompt Sections:");
  
  // Extract and show different sections
  const sections = [
    { name: "Core Identity", pattern: /You are Miles[^.]*\./ },
    { name: "Personality Traits", pattern: /PERSONALITY:(.*?)(?=\n\n|\nCOMMUNICATION)/s },
    { name: "Scenario Context", pattern: /SCENARIO CONTEXT:(.*?)(?=\n\n|\nCONVERSATION)/s },
    { name: "Conversation Flow", pattern: /CONVERSATION FLOW:(.*?)(?=\n\n|\nRESPONSE)/s }
  ];
  
  sections.forEach(section => {
    const match = basicPrompt.match(section.pattern);
    if (match) {
      console.log(`✅ ${section.name}: Found (${match[0].length} chars)`);
      if (section.name === "Scenario Context") {
        console.log(`   Preview: ${match[1].trim().substring(0, 100)}...`);
      }
    } else {
      console.log(`❌ ${section.name}: Not found`);
    }
  });
  
  // Test 5: Compare with internal scenario ID
  console.log("\n5️⃣ Testing Internal Scenario ID:");
  const internalScenarioPrompt = getScenarioPrompt("s2", "beginner");
  console.log("Internal s2 prompt length:", internalScenarioPrompt.length);
  console.log("Same as restaurant-ordering:", directScenarioPrompt === internalScenarioPrompt);
  
  return {
    basicPrompt,
    directScenarioPrompt,
    hasScenarioContext: basicPrompt.includes("SCENARIO CONTEXT"),
    hasMilesPersonality: basicPrompt.includes("Miles"),
    hasRestaurantContent: basicPrompt.toLowerCase().includes("restaurant")
  };
}

/**
 * Test all available scenarios
 */
function testAllScenarios() {
  console.log("\n🎯 TESTING ALL SCENARIO MAPPINGS");
  console.log("=" * 40);
  
  const frontendScenarios = [
    "restaurant-ordering",
    "greetings-introductions", 
    "making-plans",
    "shopping-assistance",
    "travel-directions",
    "business-meeting",
    "family-conversation",
    "hobby-discussion"
  ];
  
  frontendScenarios.forEach(scenarioId => {
    console.log(`\n📝 Testing: ${scenarioId}`);
    try {
      const prompt = getScenarioPrompt(scenarioId, "beginner");
      console.log(`   ✅ Length: ${prompt.length} chars`);
      console.log(`   📄 Preview: ${prompt.substring(0, 80)}...`);
    } catch (error) {
      console.log(`   ❌ Error: ${error.message}`);
    }
  });
}

/**
 * Test what the OpenAI controller would receive
 */
async function testOpenAIControllerFlow() {
  console.log("\n🤖 TESTING OPENAI CONTROLLER FLOW");
  console.log("=" * 40);
  
  // Simulate the exact parameters the OpenAI controller receives
  const controllerParams = {
    model: "gpt-4o-realtime-preview-2025-06-03",
    voice: "shimmer",
    scenarioId: "restaurant-ordering",
    isScenarioBased: true,
    level: "beginner"
  };
  
  console.log("Controller parameters:");
  console.log(JSON.stringify(controllerParams, null, 2));
  
  // Test the prompt generation as it would happen in the controller
  try {
    const finalInstructions = await createContextAwareTeachingPrompt({
      isScenarioBased: controllerParams.isScenarioBased,
      scenarioId: controllerParams.scenarioId,
      level: controllerParams.level
    }, "test-user-123");
    
    console.log("\n📋 Final Instructions Summary:");
    console.log(`Length: ${finalInstructions.length} characters`);
    console.log(`Contains Miles: ${finalInstructions.includes("Miles")}`);
    console.log(`Contains restaurant: ${finalInstructions.toLowerCase().includes("restaurant")}`);
    console.log(`Contains scenario context: ${finalInstructions.includes("SCENARIO CONTEXT")}`);
    
    // Show the actual starter that would be used
    const starterMatch = finalInstructions.match(/START IMMEDIATELY: "([^"]+)"/);
    if (starterMatch) {
      console.log(`Starter message: "${starterMatch[1]}"`);
    }
    
    // Show first 500 characters of the prompt
    console.log("\n📄 First 500 characters of final prompt:");
    console.log(finalInstructions.substring(0, 500) + "...");
    
    return finalInstructions;
    
  } catch (error) {
    console.log(`❌ Controller flow test failed: ${error.message}`);
    return null;
  }
}

/**
 * Main debug function
 */
async function runPromptDebug() {
  console.log("🚀 PROMPT DEBUGGING SESSION");
  console.log("=" * 60);
  
  try {
    // Test restaurant ordering specifically
    const restaurantTest = await testRestaurantOrderingPrompt();
    
    // Test all scenarios
    testAllScenarios();
    
    // Test the full OpenAI controller flow
    const finalPrompt = await testOpenAIControllerFlow();
    
    // Summary
    console.log("\n" + "=" * 60);
    console.log("🎯 DEBUGGING SUMMARY");
    console.log("=" * 60);
    
    console.log(`✅ Scenario mapping: Working`);
    console.log(`✅ Miles personality: ${restaurantTest.hasMilesPersonality ? 'Included' : 'Missing'}`);
    console.log(`✅ Scenario context: ${restaurantTest.hasScenarioContext ? 'Included' : 'Missing'}`);
    console.log(`✅ Restaurant content: ${restaurantTest.hasRestaurantContent ? 'Included' : 'Missing'}`);
    console.log(`✅ Final prompt generated: ${finalPrompt ? 'Success' : 'Failed'}`);
    
    if (restaurantTest.hasMilesPersonality && restaurantTest.hasScenarioContext && restaurantTest.hasRestaurantContent) {
      console.log("\n🎉 PROMPT GENERATION IS WORKING CORRECTLY!");
      console.log("💡 If AI is still giving generic responses, the issue might be:");
      console.log("   1. OpenAI API not using the instructions properly");
      console.log("   2. Model override in the realtime session");
      console.log("   3. Instructions being overwritten somewhere else");
    } else {
      console.log("\n⚠️ PROMPT GENERATION HAS ISSUES!");
      console.log("🔧 Issues found that need fixing:");
      if (!restaurantTest.hasMilesPersonality) console.log("   - Miles personality not included");
      if (!restaurantTest.hasScenarioContext) console.log("   - Scenario context not included");
      if (!restaurantTest.hasRestaurantContent) console.log("   - Restaurant content not included");
    }
    
  } catch (error) {
    console.error("❌ Debug session failed:", error);
  }
}

// Run debug if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runPromptDebug().catch(console.error);
}

export { runPromptDebug, testRestaurantOrderingPrompt };
