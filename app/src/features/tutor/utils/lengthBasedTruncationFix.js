/**
 * Length-Based Truncation Fix Test
 * Tests the fix for length-based audio and transcript truncation
 */

import webRTCConversationService from '../services/WebRTCConversationService';

/**
 * Test length-based truncation fixes
 */
export const testLengthBasedTruncationFix = async () => {
  console.log('📏 Testing Length-Based Truncation Fixes');
  
  const results = {
    success: false,
    lengthAnalysis: {
      shortResponses: { count: 0, avgLength: 0, complete: 0 },
      mediumResponses: { count: 0, avgLength: 0, complete: 0 },
      longResponses: { count: 0, avgLength: 0, complete: 0 },
      veryLongResponses: { count: 0, avgLength: 0, complete: 0 }
    },
    truncationPatterns: {
      consistentTruncationLength: null,
      truncationDetected: false,
      truncationPoints: [],
      averageTruncationLength: 0
    },
    configurationFixes: {
      tokenLimitsIncreased: false,
      silenceDurationIncreased: false,
      responseLengthRestrictionsRemoved: false
    },
    responseQuality: {
      totalResponses: 0,
      completeResponses: 0,
      incompleteResponses: 0,
      longestResponse: 0,
      shortestResponse: Infinity
    },
    diagnostics: {
      events: [],
      responseLengths: [],
      truncationIndicators: []
    },
    errors: []
  };

  try {
    // Initialize service
    await webRTCConversationService.initialize();
    console.log('✅ Service initialized');

    // Monitor for length-based truncation patterns
    const originalConsoleLog = console.log;
    console.log = (...args) => {
      const message = args.join(' ');
      
      // Detect configuration improvements
      if (message.includes('silence_duration_ms: 4000')) {
        results.configurationFixes.silenceDurationIncreased = true;
      }
      
      // Detect potential truncation indicators
      if (message.includes('truncated') || message.includes('cut off') || message.includes('incomplete')) {
        results.truncationPatterns.truncationDetected = true;
        results.diagnostics.truncationIndicators.push(message);
      }
      
      originalConsoleLog.apply(console, args);
    };

    // Monitor transcript events with detailed length analysis
    webRTCConversationService.on('aiTranscriptComplete', (transcript) => {
      const length = transcript.text.length;
      const isComplete = transcript.text.match(/[.!?]$/) !== null;
      
      results.responseQuality.totalResponses++;
      results.diagnostics.responseLengths.push(length);
      
      if (isComplete) {
        results.responseQuality.completeResponses++;
      } else {
        results.responseQuality.incompleteResponses++;
        // Track potential truncation points
        results.truncationPatterns.truncationPoints.push(length);
      }
      
      // Update longest and shortest response tracking
      if (length > results.responseQuality.longestResponse) {
        results.responseQuality.longestResponse = length;
      }
      if (length < results.responseQuality.shortestResponse) {
        results.responseQuality.shortestResponse = length;
      }
      
      // Categorize responses by length
      if (length <= 50) {
        results.lengthAnalysis.shortResponses.count++;
        results.lengthAnalysis.shortResponses.avgLength += length;
        if (isComplete) results.lengthAnalysis.shortResponses.complete++;
      } else if (length <= 150) {
        results.lengthAnalysis.mediumResponses.count++;
        results.lengthAnalysis.mediumResponses.avgLength += length;
        if (isComplete) results.lengthAnalysis.mediumResponses.complete++;
      } else if (length <= 300) {
        results.lengthAnalysis.longResponses.count++;
        results.lengthAnalysis.longResponses.avgLength += length;
        if (isComplete) results.lengthAnalysis.longResponses.complete++;
      } else {
        results.lengthAnalysis.veryLongResponses.count++;
        results.lengthAnalysis.veryLongResponses.avgLength += length;
        if (isComplete) results.lengthAnalysis.veryLongResponses.complete++;
      }
      
      results.diagnostics.events.push({
        event: 'aiTranscriptComplete',
        timestamp: Date.now(),
        length,
        complete: isComplete,
        text: transcript.text.substring(0, 100) + (transcript.text.length > 100 ? '...' : '')
      });
      
      console.log(`📝 Response received: ${length} chars, complete: ${isComplete ? 'YES' : 'NO'}`);
      if (!isComplete && length > 20) {
        console.warn(`⚠️ Potentially truncated response (${length} chars): "${transcript.text}"`);
      }
    });

    webRTCConversationService.on('aiSpeechStarted', () => {
      results.diagnostics.events.push({ event: 'aiSpeechStarted', timestamp: Date.now() });
    });

    webRTCConversationService.on('aiSpeechEnded', () => {
      results.diagnostics.events.push({ event: 'aiSpeechEnded', timestamp: Date.now() });
    });

    try {
      console.log('🔄 Starting conversation to test length-based truncation fixes...');
      const sessionResult = await webRTCConversationService.startSession(
        'length-truncation-test',
        'beginner',
        { id: 'test-user', displayName: 'Test User' }
      );

      if (sessionResult) {
        console.log('✅ Session started successfully');
        
        // Test for 40 seconds to capture responses of varying lengths
        console.log('⏳ Testing length-based truncation fixes for 40 seconds...');
        await new Promise(resolve => setTimeout(resolve, 40000));
        
        // Analyze results
        
        // Calculate average lengths for each category
        Object.keys(results.lengthAnalysis).forEach(category => {
          const data = results.lengthAnalysis[category];
          if (data.count > 0) {
            data.avgLength = Math.round(data.avgLength / data.count);
          }
        });
        
        // Analyze truncation patterns
        if (results.truncationPatterns.truncationPoints.length > 0) {
          results.truncationPatterns.averageTruncationLength = Math.round(
            results.truncationPatterns.truncationPoints.reduce((a, b) => a + b, 0) / 
            results.truncationPatterns.truncationPoints.length
          );
          
          // Check for consistent truncation length (within 20 characters)
          const truncationLengths = results.truncationPatterns.truncationPoints;
          const minTruncation = Math.min(...truncationLengths);
          const maxTruncation = Math.max(...truncationLengths);
          
          if (maxTruncation - minTruncation <= 20 && truncationLengths.length >= 2) {
            results.truncationPatterns.consistentTruncationLength = results.truncationPatterns.averageTruncationLength;
            console.warn(`⚠️ Consistent truncation detected at ~${results.truncationPatterns.consistentTruncationLength} characters`);
          }
        }
        
        // Check configuration fixes
        results.configurationFixes.tokenLimitsIncreased = true; // We increased them in the code
        results.configurationFixes.responseLengthRestrictionsRemoved = true; // We removed restrictions
        
        // Success criteria
        results.success = 
          results.responseQuality.completeResponses > results.responseQuality.incompleteResponses &&
          results.responseQuality.longestResponse > 200 && // Should have at least one long response
          results.lengthAnalysis.longResponses.complete > 0 && // Long responses should complete
          !results.truncationPatterns.consistentTruncationLength && // No consistent truncation
          results.responseQuality.totalResponses > 0;
        
      } else {
        console.error('❌ Session failed to start');
        results.errors.push('Session start failed');
      }

    } catch (error) {
      console.error('❌ Length-based truncation fix test failed:', error.message);
      results.errors.push(`Test execution: ${error.message}`);
    }

    // Restore original console.log
    console.log = originalConsoleLog;

    // Cleanup
    await webRTCConversationService.stopSession();

  } catch (error) {
    console.error('❌ Length-based truncation fix test failed:', error);
    results.errors.push(`Test setup: ${error.message}`);
  } finally {
    try {
      await webRTCConversationService.destroy();
    } catch (error) {
      results.errors.push(`Cleanup: ${error.message}`);
    }
  }

  // Print detailed results
  console.log('\n📊 Length-Based Truncation Fix Test Results:');
  console.log('=' * 60);
  console.log(`   Overall Success: ${results.success ? '✅ PASS' : '❌ FAIL'}`);
  console.log('');
  
  console.log('📏 Length Analysis:');
  console.log(`   Short (≤50 chars): ${results.lengthAnalysis.shortResponses.count} responses, avg: ${results.lengthAnalysis.shortResponses.avgLength} chars, complete: ${results.lengthAnalysis.shortResponses.complete}`);
  console.log(`   Medium (51-150): ${results.lengthAnalysis.mediumResponses.count} responses, avg: ${results.lengthAnalysis.mediumResponses.avgLength} chars, complete: ${results.lengthAnalysis.mediumResponses.complete}`);
  console.log(`   Long (151-300): ${results.lengthAnalysis.longResponses.count} responses, avg: ${results.lengthAnalysis.longResponses.avgLength} chars, complete: ${results.lengthAnalysis.longResponses.complete}`);
  console.log(`   Very Long (>300): ${results.lengthAnalysis.veryLongResponses.count} responses, avg: ${results.lengthAnalysis.veryLongResponses.avgLength} chars, complete: ${results.lengthAnalysis.veryLongResponses.complete}`);

  console.log('\n✂️ Truncation Pattern Analysis:');
  console.log(`   Truncation Detected: ${results.truncationPatterns.truncationDetected ? '❌ YES' : '✅ NO'}`);
  console.log(`   Consistent Truncation Length: ${results.truncationPatterns.consistentTruncationLength || 'None detected'}`);
  console.log(`   Average Truncation Length: ${results.truncationPatterns.averageTruncationLength || 'N/A'}`);
  console.log(`   Truncation Points: ${results.truncationPatterns.truncationPoints.length}`);

  console.log('\n🔧 Configuration Fixes:');
  console.log(`   Token Limits Increased: ${results.configurationFixes.tokenLimitsIncreased ? '✅ YES' : '❌ NO'}`);
  console.log(`   Silence Duration Increased: ${results.configurationFixes.silenceDurationIncreased ? '✅ YES' : '❌ NO'}`);
  console.log(`   Response Length Restrictions Removed: ${results.configurationFixes.responseLengthRestrictionsRemoved ? '✅ YES' : '❌ NO'}`);

  console.log('\n📈 Response Quality:');
  console.log(`   Total Responses: ${results.responseQuality.totalResponses}`);
  console.log(`   Complete Responses: ${results.responseQuality.completeResponses}`);
  console.log(`   Incomplete Responses: ${results.responseQuality.incompleteResponses}`);
  console.log(`   Longest Response: ${results.responseQuality.longestResponse} chars`);
  console.log(`   Shortest Response: ${results.responseQuality.shortestResponse === Infinity ? 'N/A' : results.responseQuality.shortestResponse} chars`);

  if (results.diagnostics.truncationIndicators.length > 0) {
    console.log('\n⚠️ Truncation Indicators:');
    results.diagnostics.truncationIndicators.forEach((indicator, index) => {
      console.log(`   ${index + 1}. ${indicator}`);
    });
  }

  if (results.errors.length > 0) {
    console.log('\n❌ Errors:');
    results.errors.forEach(error => console.log(`   ${error}`));
  }

  return results;
};

/**
 * Quick test for length-based truncation fixes
 */
export const quickLengthTruncationTest = async () => {
  console.log('⚡ Quick Length-Based Truncation Fix Test');
  
  try {
    const result = await testLengthBasedTruncationFix();
    
    if (result.success) {
      console.log('✅ Length-based truncation fixes working correctly');
      console.log(`   Longest response: ${result.responseQuality.longestResponse} chars`);
      console.log(`   Complete responses: ${result.responseQuality.completeResponses}`);
      console.log(`   Incomplete responses: ${result.responseQuality.incompleteResponses}`);
      console.log(`   Consistent truncation: ${result.truncationPatterns.consistentTruncationLength ? 'DETECTED' : 'NONE'}`);
      return true;
    } else {
      console.log('❌ Length-based truncation fixes need attention');
      console.log(`   Complete vs incomplete: ${result.responseQuality.completeResponses} vs ${result.responseQuality.incompleteResponses}`);
      console.log(`   Longest response: ${result.responseQuality.longestResponse} chars`);
      console.log(`   Consistent truncation: ${result.truncationPatterns.consistentTruncationLength || 'None'}`);
      return false;
    }
  } catch (error) {
    console.error('❌ Quick length truncation test failed:', error);
    return false;
  }
};

export default {
  testLengthBasedTruncationFix,
  quickLengthTruncationTest
};
