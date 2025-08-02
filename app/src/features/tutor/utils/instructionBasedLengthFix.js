/**
 * Instruction-Based Response Length Fix Test
 * Tests the correct approach for controlling response length in OpenAI Realtime API
 */

import webRTCConversationService from '../services/WebRTCConversationService';

/**
 * Test instruction-based response length control (correct approach for Realtime API)
 */
export const testInstructionBasedLengthFix = async () => {
  console.log('🔧 Testing Instruction-Based Response Length Fix');
  
  const results = {
    success: false,
    instructionFix: {
      invalidParametersRemoved: false,
      instructionBasedControlAdded: false,
      responseCompletionGuidanceAdded: false,
      configurationCorrect: false
    },
    responseQuality: {
      responses: [],
      averageLength: 0,
      longestResponse: 0,
      completeResponses: 0,
      truncatedResponses: 0,
      completeSentences: 0
    },
    beforeAfterComparison: {
      beforeFix: {
        averageLength: 111, // Based on the "annyeong" truncation example
        truncationRate: 100,
        completionRate: 0
      },
      afterFix: {
        averageLength: 0,
        truncationRate: 0,
        completionRate: 0
      },
      improvement: 0
    },
    diagnostics: {
      events: [],
      configurationDetected: [],
      apiErrors: [],
      instructionEffectiveness: 0
    },
    errors: []
  };

  try {
    // Initialize service
    await webRTCConversationService.initialize();
    console.log('✅ Service initialized');

    // Monitor for instruction-based configuration and API errors
    const originalConsoleLog = console.log;
    const originalConsoleError = console.error;
    
    console.log = (...args) => {
      const message = args.join(' ');
      
      // Detect removal of invalid parameters
      if (message.includes('OpenAI Realtime API doesn\'t support max_response_output_tokens')) {
        results.instructionFix.invalidParametersRemoved = true;
        results.diagnostics.configurationDetected.push('invalid_parameters_removed');
      }
      
      // Detect instruction-based control
      if (message.includes('Response length is controlled through instructions')) {
        results.instructionFix.instructionBasedControlAdded = true;
        results.diagnostics.configurationDetected.push('instruction_based_control');
      }
      
      // Detect response completion guidance
      if (message.includes('complete your full response') || message.includes('never stop mid-sentence')) {
        results.instructionFix.responseCompletionGuidanceAdded = true;
        results.diagnostics.configurationDetected.push('completion_guidance_added');
      }
      
      // Detect longer responses (improvement indicator)
      if (message.includes('characters') && message.includes('complete')) {
        const match = message.match(/(\d+)\s+characters/);
        if (match && parseInt(match[1]) > 200) {
          results.diagnostics.instructionEffectiveness++;
        }
      }
      
      originalConsoleLog.apply(console, args);
    };
    
    console.error = (...args) => {
      const message = args.join(' ');
      
      // Detect API errors (should not happen with correct approach)
      if (message.includes('unknown_parameter') || message.includes('max_response_output_tokens')) {
        results.diagnostics.apiErrors.push({
          timestamp: Date.now(),
          error: message
        });
      }
      
      originalConsoleError.apply(console, args);
    };

    // Monitor audio events with detailed analysis
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
      const isCompleteSentence = transcript.text.includes('.') || transcript.text.includes('!') || transcript.text.includes('?');
      
      results.responseQuality.responses.push({
        responseNumber: responseCount,
        length,
        isComplete,
        isCompleteSentence,
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
      
      if (isCompleteSentence) {
        results.responseQuality.completeSentences++;
      }
      
      // Check for specific improvement over the "annyeong" truncation
      if (length > 111) {
        console.log(`🎯 IMPROVEMENT: Response longer than previous truncation point (${length} vs 111 chars)`);
      }
      
      // Check for complete Korean greetings (should not be truncated like "annyeong")
      if (transcript.text.includes('annyeonghaseyo') || transcript.text.includes('안녕하세요')) {
        console.log(`✅ COMPLETE Korean greeting detected - no truncation!`);
      }
    });

    try {
      console.log('🔄 Starting session to test instruction-based length fix...');
      const sessionResult = await webRTCConversationService.startSession(
        'instruction-based-length-fix-test',
        'beginner',
        { id: 'test-user', displayName: 'Instruction Test User' }
      );

      if (sessionResult) {
        console.log('✅ Session started successfully');
        
        // Test for 30 seconds to capture multiple responses
        console.log('⏳ Testing instruction-based length fix for 30 seconds...');
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
          results.beforeAfterComparison.afterFix.completionRate = Math.round(
            (results.responseQuality.completeResponses / results.responseQuality.responses.length) * 100
          );
          
          results.beforeAfterComparison.improvement = 
            results.responseQuality.averageLength - results.beforeAfterComparison.beforeFix.averageLength;
        }
        
        // Check configuration correctness
        results.instructionFix.configurationCorrect = 
          results.instructionFix.invalidParametersRemoved &&
          results.instructionFix.instructionBasedControlAdded &&
          results.diagnostics.apiErrors.length === 0;
        
        // Success criteria for instruction-based fix
        results.success = 
          results.instructionFix.configurationCorrect &&
          results.responseQuality.averageLength > 150 && // Should be longer than previous 111 char truncation
          results.responseQuality.completeResponses > results.responseQuality.truncatedResponses &&
          results.responseQuality.longestResponse > 200 && // Should support longer responses
          results.diagnostics.apiErrors.length === 0; // No API errors
        
      } else {
        console.error('❌ Session failed to start');
        results.errors.push('Session start failed');
      }

    } catch (error) {
      console.error('❌ Instruction-based length fix test failed:', error.message);
      results.errors.push(`Test execution: ${error.message}`);
    }

    // Restore original console methods
    console.log = originalConsoleLog;
    console.error = originalConsoleError;

    // Cleanup
    await webRTCConversationService.stopSession();

  } catch (error) {
    console.error('❌ Instruction-based length fix test failed:', error);
    results.errors.push(`Test setup: ${error.message}`);
  } finally {
    try {
      await webRTCConversationService.destroy();
    } catch (error) {
      results.errors.push(`Cleanup: ${error.message}`);
    }
  }

  // Print detailed results
  console.log('\n🔧 Instruction-Based Response Length Fix Test Results:');
  console.log('=' * 70);
  console.log(`   Overall Success: ${results.success ? '✅ PASS' : '❌ FAIL'}`);
  console.log('');
  
  console.log('🔧 Configuration Fix:');
  console.log(`   Invalid Parameters Removed: ${results.instructionFix.invalidParametersRemoved ? '✅ YES' : '❌ NO'}`);
  console.log(`   Instruction-Based Control: ${results.instructionFix.instructionBasedControlAdded ? '✅ YES' : '❌ NO'}`);
  console.log(`   Response Completion Guidance: ${results.instructionFix.responseCompletionGuidanceAdded ? '✅ YES' : '❌ NO'}`);
  console.log(`   Configuration Correct: ${results.instructionFix.configurationCorrect ? '✅ YES' : '❌ NO'}`);
  
  console.log('\n📊 Response Quality:');
  console.log(`   Total Responses: ${results.responseQuality.responses.length}`);
  console.log(`   Average Length: ${results.responseQuality.averageLength} characters`);
  console.log(`   Longest Response: ${results.responseQuality.longestResponse} characters`);
  console.log(`   Complete Responses: ${results.responseQuality.completeResponses}`);
  console.log(`   Truncated Responses: ${results.responseQuality.truncatedResponses}`);
  console.log(`   Complete Sentences: ${results.responseQuality.completeSentences}`);
  
  console.log('\n📈 Before/After Comparison:');
  console.log(`   Before Fix (annyeong truncation): ${results.beforeAfterComparison.beforeFix.averageLength} chars`);
  console.log(`   After Fix: ${results.beforeAfterComparison.afterFix.averageLength} chars`);
  console.log(`   Improvement: +${results.beforeAfterComparison.improvement} characters`);
  console.log(`   Truncation Rate: ${results.beforeAfterComparison.beforeFix.truncationRate}% → ${results.beforeAfterComparison.afterFix.truncationRate}%`);
  console.log(`   Completion Rate: ${results.beforeAfterComparison.beforeFix.completionRate}% → ${results.beforeAfterComparison.afterFix.completionRate}%`);
  
  console.log('\n🎯 Root Cause Analysis:');
  console.log(`   Problem: Invalid max_response_output_tokens parameter causing API errors`);
  console.log(`   Solution: Instruction-based response length control`);
  console.log(`   API Errors: ${results.diagnostics.apiErrors.length} (should be 0)`);
  console.log(`   Instruction Effectiveness: ${results.diagnostics.instructionEffectiveness} long responses`);

  if (results.diagnostics.configurationDetected.length > 0) {
    console.log('\n✅ Configuration Changes Detected:');
    results.diagnostics.configurationDetected.forEach(config => {
      console.log(`   ${config}`);
    });
  }

  if (results.diagnostics.apiErrors.length > 0) {
    console.log('\n❌ API Errors (should be empty):');
    results.diagnostics.apiErrors.forEach(error => {
      console.log(`   ${error.error}`);
    });
  }

  if (results.errors.length > 0) {
    console.log('\n❌ Test Errors:');
    results.errors.forEach(error => console.log(`   ${error}`));
  }

  return results;
};

/**
 * Quick test for instruction-based length fix
 */
export const quickInstructionBasedTest = async () => {
  console.log('⚡ Quick Instruction-Based Length Fix Test');
  
  try {
    const result = await testInstructionBasedLengthFix();
    
    if (result.success) {
      console.log('✅ Instruction-based length fix working correctly');
      console.log(`   Average response length: ${result.responseQuality.averageLength} chars (was 111)`);
      console.log(`   Longest response: ${result.responseQuality.longestResponse} chars`);
      console.log(`   Complete responses: ${result.responseQuality.completeResponses}`);
      console.log(`   API errors: ${result.diagnostics.apiErrors.length} (should be 0)`);
      console.log(`   Improvement: +${result.beforeAfterComparison.improvement} characters`);
      return true;
    } else {
      console.log('❌ Instruction-based length fix needs attention');
      console.log(`   Configuration correct: ${result.instructionFix.configurationCorrect}`);
      console.log(`   Average length: ${result.responseQuality.averageLength} chars`);
      console.log(`   API errors: ${result.diagnostics.apiErrors.length}`);
      console.log(`   Complete vs truncated: ${result.responseQuality.completeResponses} vs ${result.responseQuality.truncatedResponses}`);
      return false;
    }
  } catch (error) {
    console.error('❌ Quick instruction-based test failed:', error);
    return false;
  }
};

export default {
  testInstructionBasedLengthFix,
  quickInstructionBasedTest
};
