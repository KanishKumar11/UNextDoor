/**
 * OpenAI Token Limit Fix Test
 * Tests the actual root cause fix - OpenAI API token limits causing truncation
 */

import webRTCConversationService from '../services/WebRTCConversationService';

/**
 * Test OpenAI token limit fix (the actual root cause)
 */
export const testOpenAITokenLimitFix = async () => {
  console.log('🔧 Testing OpenAI Token Limit Fix (Actual Root Cause)');
  
  const results = {
    success: false,
    tokenLimitFix: {
      sessionTokenLimitSet: false,
      responseTokenLimitSet: false,
      serverTokenLimitSet: false,
      configurationCorrect: false
    },
    responseQuality: {
      responses: [],
      averageLength: 0,
      longestResponse: 0,
      completeResponses: 0,
      truncatedResponses: 0
    },
    beforeAfterComparison: {
      beforeFix: {
        averageLength: 111, // Based on the "annyeong" truncation example
        truncationRate: 100
      },
      afterFix: {
        averageLength: 0,
        truncationRate: 0
      },
      improvement: 0
    },
    diagnostics: {
      events: [],
      configurationDetected: [],
      truncationPrevented: 0
    },
    errors: []
  };

  try {
    // Initialize service
    await webRTCConversationService.initialize();
    console.log('✅ Service initialized');

    // Monitor for token limit configuration
    const originalConsoleLog = console.log;
    console.log = (...args) => {
      const message = args.join(' ');
      
      // Detect token limit fixes
      if (message.includes('max_response_output_tokens: 1500')) {
        results.tokenLimitFix.sessionTokenLimitSet = true;
        results.diagnostics.configurationDetected.push('session_token_limit_1500');
      }
      
      if (message.includes('response.create') && message.includes('max_response_output_tokens')) {
        results.tokenLimitFix.responseTokenLimitSet = true;
        results.diagnostics.configurationDetected.push('response_token_limit_set');
      }
      
      // Detect configuration improvements
      if (message.includes('CRITICAL FIX: Increased from 150 to 1500')) {
        results.tokenLimitFix.configurationCorrect = true;
        results.diagnostics.configurationDetected.push('token_limit_increased');
      }
      
      // Detect longer responses (improvement indicator)
      if (message.includes('characters') && message.includes('complete')) {
        const match = message.match(/(\d+)\s+characters/);
        if (match && parseInt(match[1]) > 200) {
          results.diagnostics.truncationPrevented++;
        }
      }
      
      originalConsoleLog.apply(console, args);
    };

    // Monitor audio events with length tracking
    let responseCount = 0;
    
    webRTCConversationService.on('aiSpeechStarted', () => {
      responseCount++;
      results.diagnostics.events.push({ 
        event: 'aiSpeechStarted', 
        timestamp: Date.now(),
        responseNumber: responseCount
      });
      console.log(`🎤 AI speech started (response #${responseCount})`);
    });

    webRTCConversationService.on('aiSpeechEnded', () => {
      results.diagnostics.events.push({ 
        event: 'aiSpeechEnded', 
        timestamp: Date.now(),
        responseNumber: responseCount
      });
      console.log(`🎤 AI speech ended (response #${responseCount})`);
    });

    webRTCConversationService.on('aiTranscriptComplete', (transcript) => {
      const length = transcript.text.length;
      const isComplete = transcript.text.match(/[.!?]$/) !== null;
      
      results.responseQuality.responses.push({
        responseNumber: responseCount,
        length,
        isComplete,
        text: transcript.text,
        timestamp: Date.now()
      });
      
      if (length > results.responseQuality.longestResponse) {
        results.responseQuality.longestResponse = length;
      }
      
      if (isComplete) {
        results.responseQuality.completeResponses++;
        console.log(`✅ COMPLETE response (${length} chars): "${transcript.text.substring(0, 80)}..."`);
      } else {
        results.responseQuality.truncatedResponses++;
        console.warn(`⚠️ TRUNCATED response (${length} chars): "${transcript.text}"`);
      }
      
      // Check for specific improvement over the "annyeong" truncation
      if (length > 111) {
        console.log(`🎯 IMPROVEMENT: Response longer than previous truncation point (${length} vs 111 chars)`);
      }
    });

    try {
      console.log('🔄 Starting session to test OpenAI token limit fix...');
      const sessionResult = await webRTCConversationService.startSession(
        'openai-token-limit-fix-test',
        'beginner',
        { id: 'test-user', displayName: 'Token Limit Test User' }
      );

      if (sessionResult) {
        console.log('✅ Session started successfully');
        
        // Test for 30 seconds to capture multiple responses
        console.log('⏳ Testing token limit fix for 30 seconds...');
        await new Promise(resolve => setTimeout(resolve, 30000));
        
        // Calculate statistics
        if (results.responseQuality.responses.length > 0) {
          results.responseQuality.averageLength = Math.round(
            results.responseQuality.responses.reduce((sum, r) => sum + r.length, 0) / 
            results.responseQuality.responses.length
          );
          
          // Calculate improvement
          results.beforeAfterComparison.afterFix.averageLength = results.responseQuality.averageLength;
          results.beforeAfterComparison.afterFix.truncationRate = Math.round(
            (results.responseQuality.truncatedResponses / results.responseQuality.responses.length) * 100
          );
          
          results.beforeAfterComparison.improvement = 
            results.responseQuality.averageLength - results.beforeAfterComparison.beforeFix.averageLength;
        }
        
        // Success criteria for token limit fix
        results.success = 
          results.tokenLimitFix.sessionTokenLimitSet &&
          results.tokenLimitFix.configurationCorrect &&
          results.responseQuality.averageLength > 150 && // Should be longer than previous 111 char truncation
          results.responseQuality.completeResponses > results.responseQuality.truncatedResponses &&
          results.responseQuality.longestResponse > 200; // Should support longer responses
        
      } else {
        console.error('❌ Session failed to start');
        results.errors.push('Session start failed');
      }

    } catch (error) {
      console.error('❌ Token limit fix test failed:', error.message);
      results.errors.push(`Test execution: ${error.message}`);
    }

    // Restore original console.log
    console.log = originalConsoleLog;

    // Cleanup
    await webRTCConversationService.stopSession();

  } catch (error) {
    console.error('❌ OpenAI token limit fix test failed:', error);
    results.errors.push(`Test setup: ${error.message}`);
  } finally {
    try {
      await webRTCConversationService.destroy();
    } catch (error) {
      results.errors.push(`Cleanup: ${error.message}`);
    }
  }

  // Print detailed results
  console.log('\n🔧 OpenAI Token Limit Fix Test Results:');
  console.log('=' * 70);
  console.log(`   Overall Success: ${results.success ? '✅ PASS' : '❌ FAIL'}`);
  console.log('');
  
  console.log('🔧 Token Limit Configuration:');
  console.log(`   Session Token Limit Set: ${results.tokenLimitFix.sessionTokenLimitSet ? '✅ YES' : '❌ NO'}`);
  console.log(`   Response Token Limit Set: ${results.tokenLimitFix.responseTokenLimitSet ? '✅ YES' : '❌ NO'}`);
  console.log(`   Configuration Correct: ${results.tokenLimitFix.configurationCorrect ? '✅ YES' : '❌ NO'}`);
  
  console.log('\n📊 Response Quality:');
  console.log(`   Total Responses: ${results.responseQuality.responses.length}`);
  console.log(`   Average Length: ${results.responseQuality.averageLength} characters`);
  console.log(`   Longest Response: ${results.responseQuality.longestResponse} characters`);
  console.log(`   Complete Responses: ${results.responseQuality.completeResponses}`);
  console.log(`   Truncated Responses: ${results.responseQuality.truncatedResponses}`);
  
  console.log('\n📈 Before/After Comparison:');
  console.log(`   Before Fix (annyeong truncation): ${results.beforeAfterComparison.beforeFix.averageLength} chars`);
  console.log(`   After Fix: ${results.beforeAfterComparison.afterFix.averageLength} chars`);
  console.log(`   Improvement: +${results.beforeAfterComparison.improvement} characters`);
  console.log(`   Truncation Rate: ${results.beforeAfterComparison.beforeFix.truncationRate}% → ${results.beforeAfterComparison.afterFix.truncationRate}%`);
  
  console.log('\n🎯 Root Cause Analysis:');
  console.log(`   Token Limit was: 150 tokens (causing truncation at ~111 chars)`);
  console.log(`   Token Limit now: 1500 tokens (allowing ~1200+ chars)`);
  console.log(`   Truncation Prevention: ${results.diagnostics.truncationPrevented} instances`);

  if (results.diagnostics.configurationDetected.length > 0) {
    console.log('\n✅ Configuration Changes Detected:');
    results.diagnostics.configurationDetected.forEach(config => {
      console.log(`   ${config}`);
    });
  }

  if (results.errors.length > 0) {
    console.log('\n❌ Errors:');
    results.errors.forEach(error => console.log(`   ${error}`));
  }

  return results;
};

/**
 * Quick test for OpenAI token limit fix
 */
export const quickTokenLimitTest = async () => {
  console.log('⚡ Quick OpenAI Token Limit Fix Test');
  
  try {
    const result = await testOpenAITokenLimitFix();
    
    if (result.success) {
      console.log('✅ OpenAI token limit fix working correctly');
      console.log(`   Average response length: ${result.responseQuality.averageLength} chars (was 111)`);
      console.log(`   Longest response: ${result.responseQuality.longestResponse} chars`);
      console.log(`   Complete responses: ${result.responseQuality.completeResponses}`);
      console.log(`   Improvement: +${result.beforeAfterComparison.improvement} characters`);
      return true;
    } else {
      console.log('❌ OpenAI token limit fix needs attention');
      console.log(`   Token limit set: ${result.tokenLimitFix.sessionTokenLimitSet}`);
      console.log(`   Average length: ${result.responseQuality.averageLength} chars`);
      console.log(`   Complete vs truncated: ${result.responseQuality.completeResponses} vs ${result.responseQuality.truncatedResponses}`);
      return false;
    }
  } catch (error) {
    console.error('❌ Quick token limit test failed:', error);
    return false;
  }
};

export default {
  testOpenAITokenLimitFix,
  quickTokenLimitTest
};
