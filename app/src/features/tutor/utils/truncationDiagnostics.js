/**
 * Truncation Diagnostics - Precise Measurement Tool
 * Measures exact truncation points, timing, and identifies the real root cause
 */

import webRTCConversationService from '../services/WebRTCConversationService';

/**
 * Measure exact truncation behavior with precise timing
 */
export const measureTruncationBehavior = async () => {
  console.log('🔬 Measuring Exact Truncation Behavior');
  
  const results = {
    measurements: {
      responses: [],
      averageLength: 0,
      averageDuration: 0,
      truncationPoints: [],
      completionSources: []
    },
    timing: {
      eventSequence: [],
      completionDelays: [],
      stateChanges: []
    },
    rootCause: {
      prematureCompletions: 0,
      stateResetIssues: 0,
      completionRaceConditions: 0,
      actualPlaybackTime: []
    },
    comparison: {
      beforeFix: null,
      afterFix: null,
      improvementFactor: 0
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
    console.log('✅ Service initialized for truncation measurement');

    // Capture ALL completion-related logs
    const originalConsoleLog = console.log;
    const originalConsoleWarn = console.warn;
    
    console.log = (...args) => {
      const message = args.join(' ');
      const timestamp = Date.now();
      
      results.diagnostics.logs.push({ timestamp, level: 'log', message });
      
      // Detect completion sources
      if (message.includes('audio_data_triggered_completion')) {
        results.measurements.completionSources.push({ source: 'audio_data', timestamp });
        results.rootCause.prematureCompletions++;
      }
      
      if (message.includes('transcript_triggered_completion')) {
        results.measurements.completionSources.push({ source: 'transcript', timestamp });
        results.rootCause.prematureCompletions++;
      }
      
      if (message.includes('natural_completion')) {
        results.measurements.completionSources.push({ source: 'natural', timestamp });
      }
      
      if (message.includes('fallback_timeout')) {
        results.measurements.completionSources.push({ source: 'fallback', timestamp });
      }
      
      // Detect state reset issues
      if (message.includes('this.isAISpeaking = false')) {
        results.rootCause.stateResetIssues++;
        results.timing.stateChanges.push({ event: 'isAISpeaking_reset', timestamp });
      }
      
      // Detect race conditions
      if (message.includes('All completion conditions met')) {
        results.rootCause.completionRaceConditions++;
      }
      
      originalConsoleLog.apply(console, args);
    };
    
    console.warn = (...args) => {
      const message = args.join(' ');
      const timestamp = Date.now();
      
      results.diagnostics.logs.push({ timestamp, level: 'warn', message });
      originalConsoleWarn.apply(console, args);
    };

    // Precise timing measurements
    let responseStartTime = null;
    let responseCount = 0;
    
    webRTCConversationService.on('aiSpeechStarted', () => {
      responseStartTime = Date.now();
      responseCount++;
      
      results.timing.eventSequence.push({
        event: 'aiSpeechStarted',
        timestamp: responseStartTime,
        responseNumber: responseCount
      });
      
      console.log(`🎤 [MEASUREMENT] AI speech started (response #${responseCount})`);
    });

    webRTCConversationService.on('aiSpeechEnded', () => {
      const endTime = Date.now();
      const duration = responseStartTime ? endTime - responseStartTime : 0;
      
      results.timing.eventSequence.push({
        event: 'aiSpeechEnded',
        timestamp: endTime,
        duration,
        responseNumber: responseCount
      });
      
      results.rootCause.actualPlaybackTime.push(duration);
      
      console.log(`🎤 [MEASUREMENT] AI speech ended (response #${responseCount}, duration: ${duration}ms)`);
    });

    webRTCConversationService.on('aiTranscriptComplete', (transcript) => {
      const timestamp = Date.now();
      const length = transcript.text.length;
      const isComplete = transcript.text.match(/[.!?]$/) !== null;
      
      results.measurements.responses.push({
        responseNumber: responseCount,
        length,
        isComplete,
        text: transcript.text,
        timestamp,
        duration: responseStartTime ? timestamp - responseStartTime : 0
      });
      
      if (!isComplete && length > 10) {
        results.measurements.truncationPoints.push({
          responseNumber: responseCount,
          truncationPoint: length,
          text: transcript.text,
          timestamp
        });
      }
      
      results.timing.eventSequence.push({
        event: 'aiTranscriptComplete',
        timestamp,
        length,
        isComplete,
        responseNumber: responseCount
      });
      
      console.log(`📝 [MEASUREMENT] Transcript: ${length} chars, complete: ${isComplete ? 'YES' : 'NO'}`);
      if (!isComplete) {
        console.warn(`⚠️ [MEASUREMENT] TRUNCATED at ${length} chars: "${transcript.text}"`);
      }
    });

    // Monitor OpenAI events
    webRTCConversationService.on('responseCompleted', () => {
      results.timing.eventSequence.push({
        event: 'responseCompleted',
        timestamp: Date.now(),
        responseNumber: responseCount
      });
    });

    webRTCConversationService.on('outputAudioBufferStopped', () => {
      results.timing.eventSequence.push({
        event: 'outputAudioBufferStopped',
        timestamp: Date.now(),
        responseNumber: responseCount
      });
    });

    try {
      console.log('🔄 Starting measurement session...');
      const sessionResult = await webRTCConversationService.startSession(
        'truncation-measurement',
        'beginner',
        { id: 'test-user', displayName: 'Measurement User' }
      );

      if (sessionResult) {
        console.log('✅ Measurement session started');
        
        // Measure for 30 seconds to get multiple responses
        console.log('⏳ Measuring truncation behavior for 30 seconds...');
        await new Promise(resolve => setTimeout(resolve, 30000));
        
        // Calculate statistics
        if (results.measurements.responses.length > 0) {
          results.measurements.averageLength = Math.round(
            results.measurements.responses.reduce((sum, r) => sum + r.length, 0) / 
            results.measurements.responses.length
          );
          
          const durations = results.measurements.responses.map(r => r.duration).filter(d => d > 0);
          if (durations.length > 0) {
            results.measurements.averageDuration = Math.round(
              durations.reduce((sum, d) => sum + d, 0) / durations.length
            );
          }
        }
        
        if (results.timing.eventSequence.length > 0) {
          // Analyze completion delays
          const completionEvents = results.timing.eventSequence.filter(e => 
            e.event === 'aiSpeechEnded'
          );
          
          completionEvents.forEach(event => {
            const startEvent = results.timing.eventSequence.find(e => 
              e.event === 'aiSpeechStarted' && e.responseNumber === event.responseNumber
            );
            
            if (startEvent) {
              results.timing.completionDelays.push(event.timestamp - startEvent.timestamp);
            }
          });
        }
        
      } else {
        console.error('❌ Measurement session failed to start');
        results.diagnostics.errors.push('Session start failed');
      }

    } catch (error) {
      console.error('❌ Measurement failed:', error.message);
      results.diagnostics.errors.push(`Measurement execution: ${error.message}`);
    }

    // Restore original console methods
    console.log = originalConsoleLog;
    console.warn = originalConsoleWarn;

    // Cleanup
    await webRTCConversationService.stopSession();

  } catch (error) {
    console.error('❌ Truncation measurement failed:', error);
    results.diagnostics.errors.push(`Setup: ${error.message}`);
  } finally {
    try {
      await webRTCConversationService.destroy();
    } catch (error) {
      results.diagnostics.errors.push(`Cleanup: ${error.message}`);
    }
  }

  // Print detailed measurement results
  console.log('\n🔬 Truncation Behavior Measurement Results:');
  console.log('=' * 70);
  
  console.log('\n📊 Response Measurements:');
  console.log(`   Total Responses: ${results.measurements.responses.length}`);
  console.log(`   Average Length: ${results.measurements.averageLength} characters`);
  console.log(`   Average Duration: ${results.measurements.averageDuration}ms`);
  console.log(`   Truncation Points: ${results.measurements.truncationPoints.length}`);
  
  if (results.measurements.truncationPoints.length > 0) {
    console.log('\n⚠️ Truncation Analysis:');
    results.measurements.truncationPoints.forEach((truncation, index) => {
      console.log(`   Truncation #${index + 1}: ${truncation.truncationPoint} chars`);
      console.log(`     Text: "${truncation.text.substring(0, 80)}..."`);
    });
  }
  
  console.log('\n🔍 Root Cause Analysis:');
  console.log(`   Premature Completions: ${results.rootCause.prematureCompletions}`);
  console.log(`   State Reset Issues: ${results.rootCause.stateResetIssues}`);
  console.log(`   Race Conditions: ${results.rootCause.completionRaceConditions}`);
  
  console.log('\n⏱️ Completion Sources:');
  const sourceCount = {};
  results.measurements.completionSources.forEach(source => {
    sourceCount[source.source] = (sourceCount[source.source] || 0) + 1;
  });
  Object.entries(sourceCount).forEach(([source, count]) => {
    console.log(`   ${source}: ${count} times`);
  });
  
  if (results.timing.completionDelays.length > 0) {
    const avgDelay = Math.round(
      results.timing.completionDelays.reduce((sum, d) => sum + d, 0) / 
      results.timing.completionDelays.length
    );
    console.log(`\n⏱️ Average Completion Delay: ${avgDelay}ms`);
  }

  if (results.diagnostics.errors.length > 0) {
    console.log('\n❌ Errors:');
    results.diagnostics.errors.forEach(error => console.log(`   ${error}`));
  }

  return results;
};

/**
 * Quick truncation measurement
 */
export const quickTruncationMeasurement = async () => {
  console.log('⚡ Quick Truncation Measurement');
  
  try {
    const result = await measureTruncationBehavior();
    
    console.log('\n📋 Quick Summary:');
    console.log(`   Responses measured: ${result.measurements.responses.length}`);
    console.log(`   Average length: ${result.measurements.averageLength} chars`);
    console.log(`   Truncations detected: ${result.measurements.truncationPoints.length}`);
    console.log(`   Premature completions: ${result.rootCause.prematureCompletions}`);
    
    const truncationRate = result.measurements.responses.length > 0 ? 
      (result.measurements.truncationPoints.length / result.measurements.responses.length * 100).toFixed(1) : 0;
    console.log(`   Truncation rate: ${truncationRate}%`);
    
    return result;
  } catch (error) {
    console.error('❌ Quick truncation measurement failed:', error);
    return null;
  }
};

export default {
  measureTruncationBehavior,
  quickTruncationMeasurement
};
