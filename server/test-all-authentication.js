#!/usr/bin/env node

/**
 * Comprehensive Authentication Test Script
 * 
 * Tests all three authentication methods:
 * 1. OTP Authentication (including app store review test case)
 * 2. Google OAuth Authentication
 * 3. Apple Sign-In Authentication
 */

import axios from 'axios';
import config from './src/config/index.js';

const BASE_URL = `http://localhost:${config.port}${config.api.prefix}/auth`;
const TEST_EMAIL = 'test@example.com';
const APP_STORE_EMAIL = 'xtshivam1@gmail.com';

console.log('🧪 Starting Comprehensive Authentication Test');
console.log(`📍 Testing against: ${BASE_URL}`);
console.log(`🌍 Environment: ${config.nodeEnv}`);
console.log('');

/**
 * Test OTP Authentication
 */
async function testOTPAuthentication() {
  console.log('1️⃣ Testing OTP Authentication...');
  
  try {
    // Test 1: Regular OTP send
    console.log('   📧 Testing regular OTP send...');
    const sendResponse = await axios.post(`${BASE_URL}/send-otp`, {
      email: TEST_EMAIL
    });
    
    if (sendResponse.status === 200 && sendResponse.data.success) {
      console.log('   ✅ Regular OTP Send: SUCCESS');
    } else {
      console.log('   ❌ Regular OTP Send: FAILED');
      return false;
    }

    // Test 2: Development bypass OTP
    if (config.nodeEnv === 'development') {
      console.log('   🔓 Testing development OTP bypass (123456)...');
      const devVerifyResponse = await axios.post(`${BASE_URL}/verify-otp`, {
        email: TEST_EMAIL,
        otp: '123456'
      });
      
      if (devVerifyResponse.status === 200) {
        console.log('   ✅ Development OTP Bypass: SUCCESS');
      } else {
        console.log('   ❌ Development OTP Bypass: FAILED');
        return false;
      }
    }

    // Test 3: App Store Review OTP
    console.log('   🏪 Testing app store review OTP send...');
    const appStoreOTPResponse = await axios.post(`${BASE_URL}/send-otp`, {
      email: APP_STORE_EMAIL
    });
    
    if (appStoreOTPResponse.status === 200 && appStoreOTPResponse.data.success) {
      console.log('   ✅ App Store OTP Send: SUCCESS');
    } else {
      console.log('   ❌ App Store OTP Send: FAILED');
      return false;
    }

    console.log('   🔑 Testing app store review OTP verification (999999)...');
    const appStoreVerifyResponse = await axios.post(`${BASE_URL}/verify-otp`, {
      email: APP_STORE_EMAIL,
      otp: '999999'
    });
    
    if (appStoreVerifyResponse.status === 200) {
      console.log('   ✅ App Store OTP Verification: SUCCESS');
      console.log(`   📋 Response: ${JSON.stringify(appStoreVerifyResponse.data, null, 2)}`);
    } else {
      console.log('   ❌ App Store OTP Verification: FAILED');
      return false;
    }

    return true;
  } catch (error) {
    console.log('   ❌ OTP Authentication: ERROR');
    console.log(`   Error: ${error.response?.data?.message || error.message}`);
    return false;
  }
}

/**
 * Test Google OAuth Configuration
 */
async function testGoogleOAuthConfig() {
  console.log('2️⃣ Testing Google OAuth Configuration...');
  
  try {
    // Check if Google OAuth is configured
    if (!config.google?.clientId || !config.google?.clientSecret) {
      console.log('   ❌ Google OAuth: NOT CONFIGURED');
      console.log('   Missing GOOGLE_CLIENT_ID or GOOGLE_CLIENT_SECRET');
      return false;
    }

    console.log('   ✅ Google OAuth Configuration: FOUND');
    console.log(`   Client ID: ${config.google.clientId.substring(0, 20)}...`);
    console.log(`   Client Secret: ${config.google.clientSecret.substring(0, 10)}...`);

    // Test with a mock token (this will fail but we can check the error)
    console.log('   🔍 Testing Google OAuth endpoint...');
    try {
      await axios.post(`${BASE_URL}/google`, {
        token: 'mock-invalid-token'
      });
    } catch (error) {
      if (error.response?.status === 400 && error.response?.data?.message?.includes('Invalid Google token')) {
        console.log('   ✅ Google OAuth Endpoint: WORKING (correctly rejected invalid token)');
        return true;
      } else {
        console.log('   ❌ Google OAuth Endpoint: UNEXPECTED ERROR');
        console.log(`   Error: ${error.response?.data?.message || error.message}`);
        return false;
      }
    }

    return true;
  } catch (error) {
    console.log('   ❌ Google OAuth Configuration: ERROR');
    console.log(`   Error: ${error.message}`);
    return false;
  }
}

/**
 * Test Apple Sign-In Configuration
 */
async function testAppleSignInConfig() {
  console.log('3️⃣ Testing Apple Sign-In Configuration...');
  
  try {
    // Check if Apple Sign-In is configured
    if (!config.apple?.teamId || !config.apple?.keyId || !config.apple?.privateKey || !config.apple?.bundleId) {
      console.log('   ❌ Apple Sign-In: NOT CONFIGURED');
      console.log('   Missing APPLE_TEAM_ID, APPLE_KEY_ID, APPLE_PRIVATE_KEY, or APPLE_BUNDLE_ID');
      return false;
    }

    console.log('   ✅ Apple Sign-In Configuration: FOUND');
    console.log(`   Team ID: ${config.apple.teamId}`);
    console.log(`   Key ID: ${config.apple.keyId}`);
    console.log(`   Bundle ID: ${config.apple.bundleId}`);
    console.log(`   Private Key: ${config.apple.privateKey.substring(0, 50)}...`);

    // Test with a mock token (this will fail but we can check the error)
    console.log('   🔍 Testing Apple Sign-In endpoint...');
    try {
      await axios.post(`${BASE_URL}/apple`, {
        token: 'mock-invalid-token'
      });
    } catch (error) {
      if (error.response?.status === 400 && error.response?.data?.message?.includes('Invalid Apple token')) {
        console.log('   ✅ Apple Sign-In Endpoint: WORKING (correctly rejected invalid token)');
        return true;
      } else {
        console.log('   ❌ Apple Sign-In Endpoint: UNEXPECTED ERROR');
        console.log(`   Error: ${error.response?.data?.message || error.message}`);
        return false;
      }
    }

    return true;
  } catch (error) {
    console.log('   ❌ Apple Sign-In Configuration: ERROR');
    console.log(`   Error: ${error.message}`);
    return false;
  }
}

/**
 * Test Authentication Routes
 */
async function testAuthRoutes() {
  console.log('4️⃣ Testing Authentication Routes...');
  
  const routes = [
    { path: '/send-otp', method: 'POST', name: 'Send OTP' },
    { path: '/verify-otp', method: 'POST', name: 'Verify OTP' },
    { path: '/google', method: 'POST', name: 'Google OAuth' },
    { path: '/apple', method: 'POST', name: 'Apple Sign-In' },
  ];

  let allRoutesWorking = true;

  for (const route of routes) {
    try {
      // Send a request without required parameters to test route existence
      await axios.post(`${BASE_URL}${route.path}`, {});
    } catch (error) {
      if (error.response?.status === 400) {
        console.log(`   ✅ ${route.name} Route: EXISTS (validation working)`);
      } else if (error.response?.status === 404) {
        console.log(`   ❌ ${route.name} Route: NOT FOUND`);
        allRoutesWorking = false;
      } else {
        console.log(`   ⚠️ ${route.name} Route: UNEXPECTED RESPONSE (${error.response?.status})`);
      }
    }
  }

  return allRoutesWorking;
}

/**
 * Main test runner
 */
async function runAllTests() {
  console.log('🚀 Starting comprehensive authentication tests...\n');
  
  const results = [];
  
  // Test 1: OTP Authentication
  results.push(await testOTPAuthentication());
  console.log('');
  
  // Test 2: Google OAuth Configuration
  results.push(await testGoogleOAuthConfig());
  console.log('');
  
  // Test 3: Apple Sign-In Configuration
  results.push(await testAppleSignInConfig());
  console.log('');
  
  // Test 4: Authentication Routes
  results.push(await testAuthRoutes());
  console.log('');
  
  // Summary
  const passed = results.filter(r => r).length;
  const total = results.length;
  
  console.log('📊 Test Results Summary:');
  console.log(`   Passed: ${passed}/${total}`);
  
  if (passed === total) {
    console.log('🎉 All authentication tests passed!');
    console.log('');
    console.log('✅ OTP Authentication: Working (including app store review)');
    console.log('✅ Google OAuth: Configured and working');
    console.log('✅ Apple Sign-In: Configured and working');
    console.log('✅ All authentication routes: Available');
    process.exit(0);
  } else {
    console.log('💥 Some authentication tests failed. Please check the issues above.');
    process.exit(1);
  }
}

// Check if server is running
async function checkServerHealth() {
  try {
    const response = await axios.get(`http://localhost:${config.port}/health`);
    return response.status === 200;
  } catch (error) {
    return false;
  }
}

// Main execution
(async () => {
  // Check if server is running
  const serverRunning = await checkServerHealth();
  if (!serverRunning) {
    console.log('❌ Server is not running or not responding');
    console.log(`   Please start the server first: npm start`);
    console.log(`   Expected server at: http://localhost:${config.port}`);
    process.exit(1);
  }
  
  await runAllTests();
})();
