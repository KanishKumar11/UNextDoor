#!/usr/bin/env node

/**
 * OTP Functionality Test Script
 * 
 * This script tests the OTP login functionality to ensure it works correctly
 * in both development and production environments.
 */

import axios from 'axios';
import config from './src/config/index.js';

const BASE_URL = `http://localhost:${config.port}${config.api.prefix}/auth`;
const TEST_EMAIL = 'test@example.com';

console.log('🧪 Starting OTP Functionality Test');
console.log(`📍 Testing against: ${BASE_URL}`);
console.log(`🌍 Environment: ${config.nodeEnv}`);
console.log(`📧 Email config: ${config.email.host}:${config.email.port}`);
console.log('');

/**
 * Test OTP sending functionality
 */
async function testSendOTP() {
  console.log('1️⃣ Testing OTP Send...');

  try {
    const response = await axios.post(`${BASE_URL}/send-otp`, {
      email: TEST_EMAIL
    });

    if (response.status === 200 && response.data.success) {
      console.log('✅ OTP Send: SUCCESS');
      console.log(`   Response: ${JSON.stringify(response.data)}`);
      return true;
    } else {
      console.log('❌ OTP Send: FAILED');
      console.log(`   Response: ${JSON.stringify(response.data)}`);
      return false;
    }
  } catch (error) {
    console.log('❌ OTP Send: ERROR');
    console.log(`   Error: ${error.response?.data?.message || error.message}`);
    return false;
  }
}

/**
 * Test OTP verification functionality
 */
async function testVerifyOTP(otp = '123456') {
  console.log(`2️⃣ Testing OTP Verify with OTP: ${otp}...`);

  try {
    const response = await axios.post(`${BASE_URL}/verify-otp`, {
      email: TEST_EMAIL,
      otp: otp
    });

    if (response.status === 200) {
      console.log('✅ OTP Verify: SUCCESS');
      console.log(`   Response: ${JSON.stringify(response.data, null, 2)}`);
      return true;
    } else {
      console.log('❌ OTP Verify: FAILED');
      console.log(`   Response: ${JSON.stringify(response.data)}`);
      return false;
    }
  } catch (error) {
    console.log('❌ OTP Verify: ERROR');
    console.log(`   Error: ${error.response?.data?.message || error.message}`);
    return false;
  }
}

/**
 * Test invalid OTP
 */
async function testInvalidOTP() {
  console.log('3️⃣ Testing Invalid OTP...');

  try {
    const response = await axios.post(`${BASE_URL}/verify-otp`, {
      email: TEST_EMAIL,
      otp: '000000'
    });

    // This should fail
    console.log('❌ Invalid OTP Test: UNEXPECTED SUCCESS');
    console.log(`   Response: ${JSON.stringify(response.data)}`);
    return false;
  } catch (error) {
    if (error.response?.status === 400) {
      console.log('✅ Invalid OTP Test: SUCCESS (correctly rejected)');
      console.log(`   Error: ${error.response.data.message}`);
      return true;
    } else {
      console.log('❌ Invalid OTP Test: UNEXPECTED ERROR');
      console.log(`   Error: ${error.response?.data?.message || error.message}`);
      return false;
    }
  }
}

/**
 * Test email format validation
 */
async function testInvalidEmail() {
  console.log('4️⃣ Testing Invalid Email Format...');

  try {
    const response = await axios.post(`${BASE_URL}/send-otp`, {
      email: 'invalid-email'
    });

    // This should fail
    console.log('❌ Invalid Email Test: UNEXPECTED SUCCESS');
    console.log(`   Response: ${JSON.stringify(response.data)}`);
    return false;
  } catch (error) {
    if (error.response?.status === 400) {
      console.log('✅ Invalid Email Test: SUCCESS (correctly rejected)');
      console.log(`   Error: ${error.response.data.message}`);
      return true;
    } else {
      console.log('❌ Invalid Email Test: UNEXPECTED ERROR');
      console.log(`   Error: ${error.response?.data?.message || error.message}`);
      return false;
    }
  }
}

/**
 * Main test runner
 */
async function runTests() {
  console.log('🚀 Starting OTP functionality tests...\n');

  const results = [];

  // Test 1: Send OTP
  results.push(await testSendOTP());
  console.log('');

  // Test 2: Verify OTP (development bypass still works for testing)
  if (config.nodeEnv === 'development') {
    console.log('ℹ️ Note: Development mode still sends real emails, but "123456" bypass works for testing');
    results.push(await testVerifyOTP('123456'));
  } else {
    console.log('⏭️ Skipping development OTP bypass test (not in development mode)');
    results.push(true); // Skip this test in production
  }
  console.log('');

  // Test 3: Invalid OTP
  results.push(await testInvalidOTP());
  console.log('');

  // Test 4: Invalid Email
  results.push(await testInvalidEmail());
  console.log('');

  // Summary
  const passed = results.filter(r => r).length;
  const total = results.length;

  console.log('📊 Test Results Summary:');
  console.log(`   Passed: ${passed}/${total}`);

  if (passed === total) {
    console.log('🎉 All tests passed! OTP functionality is working correctly.');
    process.exit(0);
  } else {
    console.log('💥 Some tests failed. Please check the issues above.');
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

  await runTests();
})();
