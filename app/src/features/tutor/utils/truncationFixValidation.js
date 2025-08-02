/**
 * Truncation Fix Validation Test
 * Validates that the root cause fix resolves the audio truncation issue
 */

import webRTCConversationService from '../services/WebRTCConversationService';

/**
 * Validate that the truncation fix works correctly
 */
export const validateTruncationFix = async () => {
  console.log('✅ Validating Truncation Fix');
  
  const results = {
    success: false,
    improvements: {
      longerResponses: 0,
      completeResponses: 0,
      reducedTruncations: 0,
      properTimeouts: 0
    },
    measurements: {
      responses: [],
      averageLength: 0,
      longestResponse: 0,
      completionSources: []
    },
    validation: {
      noEarlyCompletions: true,
      properTimeoutUsage: true,
      naturalFlow: true,
      stateManagement: true
    },
    diagnostics: {
      events: [],
      logs: [],
      errors: []
    }
  };

  try {
    // Initialize service
    await webRTCConversationService.initialize();
    console.log('✅ Service initialized for validation');

    // Monitor for problematic patterns (should NOT appear)
    const originalConsoleLog = console.log;
    console.log = (...args) => {
      const message = args.join(' ');
      const timestamp = Date.now();
      
      results.diagnostics.logs.push({ timestamp, message });
      
      // Detect problematic early completion patterns (should NOT happen)
      if (message.includes('audio_data_triggered_completion') ||
          message.includes('transcript_triggered_completion') ||
          message.includes('natural_completion')) {
        results.validation.noEarlyCompletions = false;
        console.warn('⚠️ VALIDATION FAILED: Early completion detected');
      }
      
      // Detect proper timeout usage (should happen)
      if (message.includes('Completing AI response after extended delay')) {
        results.improvements.properTimeouts++;
        results.measurements.completionSources.push({ source: 'proper_timeout', timestamp });
      }
      
      // Detect very long responses (improvement indicator)
      if (message.includes('extending delay further')) {
        results.improvements.longerResponses++;
      }
      
      originalConsoleLog.apply(console, args);
    };

    // Monitor audio events
    let responseCount = 0;
    let audioStartTime = null;
    
    webRTCConversationService.on('aiSpeechStarted', () => {
      audioStartTime = Date.now();
      responseCount++;
      results.diagnostics.events.push({ 
        event: 'aiSpeechStarted', 
        timestamp: audioStartTime,
        responseNumber: responseCount
      });
      console.log(`🎤 AI speech started (response #${responseCount})`);
    });

    webRTCConversationService.on('aiSpeechEnded', () => {
      const endTime = Date.now();
      const duration = audioStartTime ? endTime - audioStartTime : 0;
      
      results.diagnostics.events.push({ 
        event: 'aiSpeechEnded', 
        timestamp: endTime, 
        duration,
        responseNumber: responseCount
      });
      
      console.log(`🎤 AI speech ended (response #${responseCount}, duration: ${duration}ms)`);
    });

    webRTCConversationService.on('aiTranscriptComplete', (transcript) => {
      const length = transcript.text.length;
      const isComplete = transcript.text.match(/[.!?]$/) !== null;
      
      results.measurements.responses.push({
        responseNumber: responseCount,
        length,
        isComplete,
        text: transcript.text,
        timestamp: Date.now()
      });
      
      if (length > results.measurements.longestResponse) {
        results.measurements.longestResponse = length;
      }
      
      if (isComplete) {
        results.improvements.completeResponses++;
      } else {
        results.improvements.reducedTruncations++;
      }
      
      console.log(`📝 Response: ${length} chars, complete: ${isComplete ? 'YES' : 'NO'}`);
      if (length > 200) {
        console.log(`✅ IMPROVEMENT: Long response (${length} chars) - would have been truncated before`);
      }
    });

    try {
      console.log('🔄 Starting validation session...');
      const sessionResult = await webRTCConversationService.startSession(
        'truncation-fix-validation',
        'beginner',
        { id: 'test-user', displayName: 'Validation User' }
      );

      if (sessionResult) {
        console.log('✅ Validation session started');
        
        // Test for 30 seconds to validate the fix
        console.log('⏳ Validating fix for 30 seconds...');
        await new Promise(resolve => setTimeout(resolve, 30000));
        
        // Calculate statistics
        if (results.measurements.responses.length > 0) {
          results.measurements.averageLength = Math.round(
            results.measurements.responses.reduce((sum, r) => sum + r.length, 0) / 
            results.measurements.responses.length
          );
        }
        
        // Validation criteria
        const hasLongResponses = results.measurements.longestResponse > 200;
        const hasCompleteResponses = results.improvements.completeResponses > 0;
        const noEarlyCompletions = results.validation.noEarlyCompletions;
        const usesProperTimeouts = results.improvements.properTimeouts > 0;
        
        results.success = 
          hasLongResponses &&
          hasCompleteResponses &&
          noEarlyCompletions &&
          usesProperTimeouts &&
          results.measurements.responses.length > 0;
        
      } else {
        console.error('❌ Validation session failed to start');
        results.diagnostics.errors.push('Session start failed');
      }

    } catch (error) {
      console.error('❌ Validation failed:', error.message);
      results.diagnostics.errors.push(`Validation execution: ${error.message}`);
    }

    // Restore original console.log
    console.log = originalConsoleLog;

    // Cleanup
    await webRTCConversationService.stopSession();

  } catch (error) {
    console.error('❌ Truncation fix validation failed:', error);
    results.diagnostics.errors.push(`Setup: ${error.message}`);
  } finally {
    try {
      await webRTCConversationService.destroy();
    } catch (error) {
      results.diagnostics.errors.push(`Cleanup: ${error.message}`);
    }
  }

  // Print validation results
  console.log('\n✅ Truncation Fix Validation Results:');
  console.log('=' * 70);
  console.log(`   Overall Success: ${results.success ? '✅ PASS' : '❌ FAIL'}`);
  console.log('');
  
  console.log('📈 Improvements Detected:');
  console.log(`   Longer Responses: ${results.improvements.longerResponses}`);
  console.log(`   Complete Responses: ${results.improvements.completeResponses}`);
  console.log(`   Proper Timeouts Used: ${results.improvements.properTimeouts}`);
  
  console.log('\n📊 Response Measurements:');
  console.log(`   Total Responses: ${results.measurements.responses.length}`);
  console.log(`   Average Length: ${results.measurements.averageLength} characters`);
  console.log(`   Longest Response: ${results.measurements.longestResponse} characters`);
  
  console.log('\n🔍 Validation Checks:');
  console.log(`   No Early Completions: ${results.validation.noEarlyCompletions ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`   Proper Timeout Usage: ${results.improvements.properTimeouts > 0 ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`   Long Response Support: ${results.measurements.longestResponse > 200 ? '✅ PASS' : '❌ FAIL'}`);

  if (results.diagnostics.errors.length > 0) {
    console.log('\n❌ Errors:');
    results.diagnostics.errors.forEach(error => console.log(`   ${error}`));
  }

  return results;
};

/**
 * Quick validation test
 */
export const quickValidationTest = async () => {
  console.log('⚡ Quick Truncation Fix Validation');
  
  try {
    const result = await validateTruncationFix();
    
    if (result.success) {
      console.log('✅ Truncation fix validation PASSED');
      console.log(`   Longest response: ${result.measurements.longestResponse} chars`);
      console.log(`   Complete responses: ${result.improvements.completeResponses}`);
      console.log(`   No early completions: ${result.validation.noEarlyCompletions ? 'YES' : 'NO'}`);
      return true;
    } else {
      console.log('❌ Truncation fix validation FAILED');
      console.log(`   Early completions detected: ${!result.validation.noEarlyCompletions}`);
      console.log(`   Longest response: ${result.measurements.longestResponse} chars`);
      console.log(`   Proper timeouts: ${result.improvements.properTimeouts}`);
      return false;
    }
  } catch (error) {
    console.error('❌ Quick validation test failed:', error);
    return false;
  }
};

export default {
  validateTruncationFix,
  quickValidationTest
};
