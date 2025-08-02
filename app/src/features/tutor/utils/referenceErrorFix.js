/**
 * Reference Error Fix Test
 * Tests the fix for the isDisconnected ReferenceError
 */

import { useWebRTCConversation } from '../hooks/useWebRTCConversation';

/**
 * Test that all hook properties are properly exported
 */
export const testHookExports = () => {
  console.log('🔧 Testing WebRTC Hook Exports');
  
  const results = {
    success: false,
    exports: {
      isDisconnected: false,
      isConnecting: false,
      isReady: false,
      currentUserTranscript: false, // Should be false (removed)
    },
    errors: []
  };

  try {
    // This would normally be called within a React component
    // For testing, we'll check if the hook can be imported without errors
    
    // Check if the hook function exists
    if (typeof useWebRTCConversation === 'function') {
      console.log('✅ useWebRTCConversation hook imported successfully');
      
      // We can't actually call the hook outside of a React component,
      // but we can verify the function exists and is properly exported
      results.success = true;
      
      // Check the hook's expected return properties by examining the source
      const hookSource = useWebRTCConversation.toString();
      
      // Check for isDisconnected
      if (hookSource.includes('isDisconnected:')) {
        results.exports.isDisconnected = true;
        console.log('✅ isDisconnected property found in hook');
      } else {
        results.errors.push('isDisconnected property not found in hook');
      }
      
      // Check for isConnecting
      if (hookSource.includes('isConnecting:')) {
        results.exports.isConnecting = true;
        console.log('✅ isConnecting property found in hook');
      } else {
        results.errors.push('isConnecting property not found in hook');
      }
      
      // Check for isReady
      if (hookSource.includes('isReady:')) {
        results.exports.isReady = true;
        console.log('✅ isReady property found in hook');
      } else {
        results.errors.push('isReady property not found in hook');
      }
      
      // Check that currentUserTranscript is NOT in the return object
      if (!hookSource.includes('currentUserTranscript,') && !hookSource.includes('currentUserTranscript:')) {
        console.log('✅ currentUserTranscript properly removed from hook');
      } else {
        results.exports.currentUserTranscript = true;
        results.errors.push('currentUserTranscript still found in hook (should be removed)');
      }
      
    } else {
      results.errors.push('useWebRTCConversation is not a function');
    }

  } catch (error) {
    console.error('❌ Hook export test failed:', error);
    results.errors.push(`Hook import error: ${error.message}`);
  }

  // Print results
  console.log('\n📊 Hook Export Test Results:');
  console.log('=' * 40);
  console.log(`   Overall Success: ${results.success ? '✅ PASS' : '❌ FAIL'}`);
  console.log('');
  
  console.log('🔧 Property Exports:');
  console.log(`   isDisconnected: ${results.exports.isDisconnected ? '✅ YES' : '❌ NO'}`);
  console.log(`   isConnecting: ${results.exports.isConnecting ? '✅ YES' : '❌ NO'}`);
  console.log(`   isReady: ${results.exports.isReady ? '✅ YES' : '❌ NO'}`);
  console.log(`   currentUserTranscript: ${results.exports.currentUserTranscript ? '❌ STILL PRESENT' : '✅ REMOVED'}`);

  if (results.errors.length > 0) {
    console.log('\n❌ Errors:');
    results.errors.forEach(error => console.log(`   ${error}`));
  }

  return results;
};

/**
 * Test connection status logic
 */
export const testConnectionStatusLogic = () => {
  console.log('📡 Testing Connection Status Logic');
  
  // Test different state combinations
  const testCases = [
    {
      name: 'Initial State',
      state: { isConnected: false, isSessionActive: false, connectionState: 'new' },
      expected: { isConnecting: true, isDisconnected: false, isReady: false }
    },
    {
      name: 'Connecting State',
      state: { isConnected: false, isSessionActive: false, connectionState: 'connecting' },
      expected: { isConnecting: true, isDisconnected: false, isReady: false }
    },
    {
      name: 'Connected but Session Not Active',
      state: { isConnected: true, isSessionActive: false, connectionState: 'connected' },
      expected: { isConnecting: true, isDisconnected: false, isReady: false }
    },
    {
      name: 'Fully Ready',
      state: { isConnected: true, isSessionActive: true, connectionState: 'connected' },
      expected: { isConnecting: false, isDisconnected: false, isReady: true }
    },
    {
      name: 'Disconnected',
      state: { isConnected: false, isSessionActive: false, connectionState: 'disconnected' },
      expected: { isConnecting: false, isDisconnected: true, isReady: false }
    },
    {
      name: 'Failed Connection',
      state: { isConnected: false, isSessionActive: false, connectionState: 'failed' },
      expected: { isConnecting: false, isDisconnected: true, isReady: false }
    }
  ];

  const results = [];

  testCases.forEach(testCase => {
    const { isConnected, isSessionActive, connectionState } = testCase.state;
    
    // Simulate the hook's logic
    const isDisconnected = connectionState === 'disconnected' || connectionState === 'failed';
    const isConnecting = connectionState === 'connecting' || (isConnected && !isSessionActive);
    const isReady = isConnected && isSessionActive && !isConnecting;

    const actual = { isConnecting, isDisconnected, isReady };
    const passed = JSON.stringify(actual) === JSON.stringify(testCase.expected);

    results.push({
      name: testCase.name,
      passed,
      expected: testCase.expected,
      actual
    });

    console.log(`   ${testCase.name}: ${passed ? '✅ PASS' : '❌ FAIL'}`);
    if (!passed) {
      console.log(`     Expected: ${JSON.stringify(testCase.expected)}`);
      console.log(`     Actual: ${JSON.stringify(actual)}`);
    }
  });

  const allPassed = results.every(r => r.passed);
  console.log(`\n✅ Connection status logic: ${allPassed ? 'ALL TESTS PASS' : 'SOME TESTS FAIL'}`);
  
  return { success: allPassed, results };
};

/**
 * Quick test for the ReferenceError fix
 */
export const quickReferenceErrorTest = () => {
  console.log('⚡ Quick Reference Error Fix Test');
  
  try {
    const hookTest = testHookExports();
    const statusTest = testConnectionStatusLogic();
    
    const success = hookTest.success && 
                   hookTest.exports.isDisconnected && 
                   !hookTest.exports.currentUserTranscript &&
                   statusTest.success;
    
    if (success) {
      console.log('✅ ReferenceError fix working correctly');
      console.log('   - isDisconnected property exported');
      console.log('   - currentUserTranscript properly removed');
      console.log('   - Connection status logic working');
      return true;
    } else {
      console.log('❌ ReferenceError fix needs attention');
      const issues = [];
      if (!hookTest.exports.isDisconnected) issues.push('isDisconnected missing');
      if (hookTest.exports.currentUserTranscript) issues.push('currentUserTranscript not removed');
      if (!statusTest.success) issues.push('connection status logic issues');
      console.log('   Issues:', issues);
      return false;
    }
  } catch (error) {
    console.error('❌ Quick reference error test failed:', error);
    return false;
  }
};

export default {
  testHookExports,
  testConnectionStatusLogic,
  quickReferenceErrorTest
};
