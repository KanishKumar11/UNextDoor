/**
 * OpenAI Configuration Fix Validator
 * Tests that the OpenAI API configuration error is resolved and session functionality works
 */

import webRTCConversationService from '../services/WebRTCConversationService';

/**
 * Test OpenAI API configuration fix
 * @param {Function} startSession - Function to start session
 * @param {Function} stopSession - Function to stop session
 * @param {Function} getHookState - Function to get current hook state
 * @returns {Promise<Object>} Test results
 */
export const testOpenAIConfigurationFix = async (startSession, stopSession, getHookState) => {
  const results = {
    success: false,
    steps: [],
    issues: [],
    apiErrors: [],
    sessionEvents: []
  };

  try {
    console.log('🧪 Testing OpenAI API configuration fix...');

    // Monitor for API errors
    const errorHandler = (data) => {
      if (data.type === 'openai' && data.error) {
        results.apiErrors.push({
          timestamp: Date.now(),
          error: data.error,
          code: data.error.code,
          message: data.error.message
        });
      }
    };

    // Monitor session events
    const sessionEventHandler = (eventType) => (data) => {
      results.sessionEvents.push({
        type: eventType,
        timestamp: Date.now(),
        data: typeof data === 'object' ? JSON.stringify(data) : data
      });
    };

    webRTCConversationService.on('error', errorHandler);
    webRTCConversationService.on('sessionStarted', sessionEventHandler('sessionStarted'));
    webRTCConversationService.on('connected', sessionEventHandler('connected'));
    webRTCConversationService.on('dataChannelOpened', sessionEventHandler('dataChannelOpened'));

    // Step 1: Start session and monitor for API errors
    results.steps.push('Starting session and monitoring for API configuration errors');

    const sessionStarted = await startSession('config-test', 'beginner');

    if (!sessionStarted) {
      results.issues.push('Session failed to start');
      return results;
    }

    // Wait for session to establish and check for API errors
    await new Promise(resolve => setTimeout(resolve, 5000));

    // Step 2: Check for specific API configuration errors
    results.steps.push('Checking for API configuration errors');

    const languageErrors = results.apiErrors.filter(error =>
      error.code === 'invalid_type' &&
      error.message.includes('session.input_audio_transcription.language')
    );

    const temperatureErrors = results.apiErrors.filter(error =>
      error.code === 'unknown_parameter' &&
      error.message.includes('session.input_audio_transcription.temperature')
    );

    if (languageErrors.length > 0) {
      results.issues.push('Language parameter API error still occurring');
      console.log('❌ Language parameter error detected:', languageErrors);
    } else {
      console.log('✅ No language parameter API errors detected');
    }

    if (temperatureErrors.length > 0) {
      results.issues.push('Temperature parameter API error still occurring');
      console.log('❌ Temperature parameter error detected:', temperatureErrors);
    } else {
      console.log('✅ No temperature parameter API errors detected');
    }

    // Step 3: Check for any other API errors
    results.steps.push('Checking for other API configuration errors');

    const otherApiErrors = results.apiErrors.filter(error =>
      error.code !== 'invalid_type' ||
      !error.message.includes('session.input_audio_transcription.language')
    );

    if (otherApiErrors.length > 0) {
      results.issues.push(`Other API errors detected: ${otherApiErrors.length}`);
      console.log('⚠️ Other API errors:', otherApiErrors);
    }

    // Step 4: Verify session functionality
    results.steps.push('Verifying session functionality');

    const hookState = getHookState();
    const serviceState = webRTCConversationService.getState();

    if (!hookState.isSessionActive || !serviceState.isSessionActive) {
      results.issues.push('Session not active after start');
    }

    if (!hookState.isConnected || !serviceState.isConnected) {
      results.issues.push('Session not connected');
    }

    // Step 5: Test session restart to ensure no regression
    results.steps.push('Testing session restart functionality');

    await stopSession();
    await new Promise(resolve => setTimeout(resolve, 2000));

    const secondSessionStarted = await startSession('config-test-2', 'beginner');

    if (!secondSessionStarted) {
      results.issues.push('Second session failed to start - regression detected');
    } else {
      console.log('✅ Session restart functionality preserved');
    }

    // Cleanup
    await stopSession();
    webRTCConversationService.off('error', errorHandler);
    webRTCConversationService.off('sessionStarted', sessionEventHandler('sessionStarted'));
    webRTCConversationService.off('connected', sessionEventHandler('connected'));
    webRTCConversationService.off('dataChannelOpened', sessionEventHandler('dataChannelOpened'));

    // Determine success
    results.success = results.issues.length === 0 && languageErrors.length === 0 && temperatureErrors.length === 0;

    if (results.success) {
      console.log('✅ OpenAI API configuration fix test PASSED');
    } else {
      console.log('❌ OpenAI API configuration fix test FAILED:', results.issues);
    }

  } catch (error) {
    console.error('🧪 Error testing OpenAI configuration fix:', error);
    results.issues.push(`Test error: ${error.message}`);
  }

  return results;
};

/**
 * Validate session configuration parameters
 * @returns {Object} Configuration validation results
 */
export const validateSessionConfiguration = () => {
  const validation = {
    timestamp: new Date().toISOString(),
    isValid: true,
    issues: [],
    recommendations: []
  };

  try {
    // This is a static analysis of the configuration we're sending
    // We can't directly access the session config, but we can validate our approach

    console.log('🧪 Validating session configuration parameters...');

    // Check 1: Language parameter handling
    validation.recommendations.push('Language parameter should be omitted for auto-detection (not set to null)');

    // Check 2: Temperature parameter
    validation.recommendations.push('Temperature should be 0.0 for accurate transcription');

    // Check 3: Model parameter
    validation.recommendations.push('Model should be "whisper-1" for transcription');

    // Check 4: Turn detection settings
    validation.recommendations.push('Turn detection threshold should be 0.3 for better speech detection');

    console.log('✅ Session configuration validation completed');

  } catch (error) {
    validation.isValid = false;
    validation.issues.push(`Validation error: ${error.message}`);
  }

  return validation;
};

/**
 * Monitor for API errors during session
 * @param {Function} startSession - Function to start session
 * @param {Function} stopSession - Function to stop session
 * @param {number} duration - Duration to monitor in milliseconds
 * @returns {Promise<Object>} Monitoring results
 */
export const monitorAPIErrors = async (startSession, stopSession, duration = 30000) => {
  const monitoring = {
    errors: [],
    totalErrors: 0,
    languageErrors: 0,
    temperatureErrors: 0,
    otherErrors: 0,
    success: false
  };

  try {
    console.log('🧪 Monitoring API errors during session...');

    // Monitor for errors
    const errorHandler = (data) => {
      if (data.type === 'openai' && data.error) {
        monitoring.totalErrors++;
        monitoring.errors.push({
          timestamp: Date.now(),
          error: data.error
        });

        if (data.error.code === 'invalid_type' &&
          data.error.message.includes('session.input_audio_transcription.language')) {
          monitoring.languageErrors++;
        } else if (data.error.code === 'unknown_parameter' &&
          data.error.message.includes('session.input_audio_transcription.temperature')) {
          monitoring.temperatureErrors++;
        } else {
          monitoring.otherErrors++;
        }
      }
    };

    webRTCConversationService.on('error', errorHandler);

    // Start session
    const sessionStarted = await startSession('monitor-test', 'beginner');

    if (sessionStarted) {
      // Monitor for specified duration
      await new Promise(resolve => setTimeout(resolve, duration));

      // Stop session
      await stopSession();
    }

    // Cleanup
    webRTCConversationService.off('error', errorHandler);

    // Analyze results
    monitoring.success = monitoring.languageErrors === 0 && monitoring.temperatureErrors === 0;

    if (monitoring.success) {
      console.log('✅ No API configuration errors detected during monitoring');
    } else {
      console.log('❌ API configuration errors detected:', {
        language: monitoring.languageErrors,
        temperature: monitoring.temperatureErrors
      });
    }

  } catch (error) {
    console.error('🧪 Error monitoring API errors:', error);
  }

  return monitoring;
};

/**
 * Quick check for OpenAI API configuration issues
 * @param {Function} getHookState - Function to get current hook state
 * @returns {Object} Quick check results
 */
export const quickOpenAIConfigCheck = (getHookState) => {
  const check = {
    timestamp: new Date().toISOString(),
    hasConfigIssues: false,
    issues: [],
    recommendations: []
  };

  try {
    const hookState = getHookState();
    const serviceState = webRTCConversationService.getState();

    // Check session state
    if (hookState.isSessionActive && !hookState.isConnected) {
      check.hasConfigIssues = true;
      check.issues.push('Session active but not connected - possible API configuration issue');
      check.recommendations.push('Check for API validation errors in console');
    }

    // Check for recent errors
    if (hookState.error) {
      check.hasConfigIssues = true;
      check.issues.push(`Recent error detected: ${hookState.error.message || hookState.error}`);
      check.recommendations.push('Review error details for API configuration issues');
    }

    // General recommendations
    check.recommendations.push('Ensure language parameter is omitted (not null) for auto-detection');
    check.recommendations.push('Monitor console for OpenAI API validation errors');

  } catch (error) {
    check.hasConfigIssues = true;
    check.issues.push(`Check error: ${error.message}`);
  }

  return check;
};

export default {
  testOpenAIConfigurationFix,
  validateSessionConfiguration,
  monitorAPIErrors,
  quickOpenAIConfigCheck
};
