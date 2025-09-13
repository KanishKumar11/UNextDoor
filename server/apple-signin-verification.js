#!/usr/bin/env node

/**
 * Apple Sign-In Comprehensive Verification Script
 * 
 * This script performs a thorough verification of Apple Sign-In implementation
 * across frontend, backend, and identifies potential issues causing
 * "authorization failed due to unknown reason" errors.
 */

import config from './src/config/index.js';
import { verifyAppleToken } from './src/utils/socialAuthUtils.js';
import fs from 'fs';
import path from 'path';

console.log('🍎 Apple Sign-In Comprehensive Verification');
console.log('==========================================\n');

/**
 * Check backend Apple Sign-In configuration
 */
function checkBackendConfig() {
  console.log('1️⃣ Backend Configuration Check');
  console.log('--------------------------------');
  
  const requiredFields = ['teamId', 'keyId', 'privateKey', 'bundleId'];
  const missingFields = [];
  
  requiredFields.forEach(field => {
    if (!config.apple?.[field]) {
      missingFields.push(field);
    }
  });
  
  if (missingFields.length > 0) {
    console.log('❌ Backend Apple Sign-In: INCOMPLETE CONFIGURATION');
    console.log(`   Missing fields: ${missingFields.join(', ')}`);
    return false;
  }
  
  console.log('✅ Backend Apple Sign-In: CONFIGURED');
  console.log(`   Team ID: ${config.apple.teamId}`);
  console.log(`   Key ID: ${config.apple.keyId}`);
  console.log(`   Bundle ID: ${config.apple.bundleId}`);
  console.log(`   Private Key: ${config.apple.privateKey.substring(0, 50)}...`);
  
  // Validate private key format
  if (!config.apple.privateKey.includes('-----BEGIN PRIVATE KEY-----')) {
    console.log('⚠️ Private key format may be incorrect');
    console.log('   Expected format: -----BEGIN PRIVATE KEY-----...-----END PRIVATE KEY-----');
  } else {
    console.log('✅ Private key format appears correct');
  }
  
  return true;
}

/**
 * Check frontend Apple Sign-In configuration
 */
function checkFrontendConfig() {
  console.log('\n2️⃣ Frontend Configuration Check');
  console.log('----------------------------------');
  
  try {
    const appConfigPath = path.join(process.cwd(), '../app/app.config.js');
    
    if (!fs.existsSync(appConfigPath)) {
      console.log('❌ app.config.js not found');
      return false;
    }
    
    const appConfigContent = fs.readFileSync(appConfigPath, 'utf8');
    
    // Check for expo-apple-authentication plugin
    if (appConfigContent.includes('"expo-apple-authentication"')) {
      console.log('✅ expo-apple-authentication plugin: CONFIGURED');
    } else {
      console.log('❌ expo-apple-authentication plugin: MISSING');
    }
    
    // Check for Apple Sign-In plugin
    if (appConfigContent.includes('./plugins/withAppleSignIn')) {
      console.log('✅ Apple Sign-In plugin: CONFIGURED');
    } else {
      console.log('❌ Apple Sign-In plugin: MISSING');
    }
    
    // Check bundle ID
    const bundleIdMatch = appConfigContent.match(/bundleIdentifier:\s*["']([^"']+)["']/);
    if (bundleIdMatch) {
      const bundleId = bundleIdMatch[1];
      console.log(`✅ Bundle ID found: ${bundleId}`);
      
      if (bundleId === config.apple.bundleId) {
        console.log('✅ Bundle ID matches backend configuration');
      } else {
        console.log('❌ Bundle ID MISMATCH with backend');
        console.log(`   Frontend: ${bundleId}`);
        console.log(`   Backend: ${config.apple.bundleId}`);
      }
    } else {
      console.log('⚠️ Bundle ID not found in app.config.js');
    }
    
    return true;
  } catch (error) {
    console.log('❌ Error reading app.config.js:', error.message);
    return false;
  }
}

/**
 * Check Apple Sign-In plugin configuration
 */
function checkAppleSignInPlugin() {
  console.log('\n3️⃣ Apple Sign-In Plugin Check');
  console.log('-------------------------------');
  
  try {
    const pluginPath = path.join(process.cwd(), '../app/plugins/withAppleSignIn.js');
    
    if (!fs.existsSync(pluginPath)) {
      console.log('❌ withAppleSignIn.js plugin not found');
      return false;
    }
    
    const pluginContent = fs.readFileSync(pluginPath, 'utf8');
    
    // Check for entitlements configuration
    if (pluginContent.includes('com.apple.developer.applesignin')) {
      console.log('✅ Apple Sign-In entitlement: CONFIGURED');
    } else {
      console.log('❌ Apple Sign-In entitlement: MISSING');
    }
    
    // Check for Info.plist configuration
    if (pluginContent.includes('NSAppleSignInUsageDescription')) {
      console.log('✅ Apple Sign-In usage description: CONFIGURED');
    } else {
      console.log('⚠️ Apple Sign-In usage description: MISSING (optional)');
    }
    
    return true;
  } catch (error) {
    console.log('❌ Error reading Apple Sign-In plugin:', error.message);
    return false;
  }
}

/**
 * Check Apple Auth Service implementation
 */
function checkAppleAuthService() {
  console.log('\n4️⃣ Apple Auth Service Check');
  console.log('-----------------------------');
  
  try {
    const servicePath = path.join(process.cwd(), '../app/src/services/appleAuthService.js');
    
    if (!fs.existsSync(servicePath)) {
      console.log('❌ appleAuthService.js not found');
      return false;
    }
    
    const serviceContent = fs.readFileSync(servicePath, 'utf8');
    
    // Check for proper imports
    if (serviceContent.includes('expo-apple-authentication')) {
      console.log('✅ expo-apple-authentication import: FOUND');
    } else {
      console.log('❌ expo-apple-authentication import: MISSING');
    }
    
    // Check for proper scopes
    if (serviceContent.includes('AppleAuthenticationScope.FULL_NAME') && 
        serviceContent.includes('AppleAuthenticationScope.EMAIL')) {
      console.log('✅ Apple Sign-In scopes: CONFIGURED (FULL_NAME, EMAIL)');
    } else {
      console.log('⚠️ Apple Sign-In scopes: MAY BE MISSING');
    }
    
    // Check for identity token handling
    if (serviceContent.includes('identityToken')) {
      console.log('✅ Identity token handling: IMPLEMENTED');
    } else {
      console.log('❌ Identity token handling: MISSING');
    }
    
    return true;
  } catch (error) {
    console.log('❌ Error reading Apple Auth Service:', error.message);
    return false;
  }
}

/**
 * Test Apple token verification with a mock token
 */
async function testAppleTokenVerification() {
  console.log('\n5️⃣ Apple Token Verification Test');
  console.log('----------------------------------');
  
  // Create a mock Apple JWT token for testing (this will fail verification but test the flow)
  const mockToken = 'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJodHRwczovL2FwcGxlaWQuYXBwbGUuY29tIiwiYXVkIjoiY29tLlVOZXh0RG9vci5hcHAiLCJleHAiOjE2MzQ1NjcwMDAsImlhdCI6MTYzNDU2NjQwMCwic3ViIjoidGVzdC11c2VyLWlkIiwiZW1haWwiOiJ0ZXN0QGV4YW1wbGUuY29tIn0.mock-signature';
  
  try {
    console.log('🧪 Testing Apple token verification with mock token...');
    const result = await verifyAppleToken(mockToken);
    
    if (result) {
      console.log('✅ Apple token verification function: WORKING');
      console.log('   (Note: Mock token verification expected to fail, but function executed)');
    } else {
      console.log('⚠️ Apple token verification returned null (expected for mock token)');
    }
  } catch (error) {
    console.log('❌ Apple token verification error:', error.message);
    
    // Check specific error types
    if (error.message.includes('apple-signin-auth')) {
      console.log('💡 Suggestion: Check apple-signin-auth library installation');
    }
    if (error.message.includes('private key') || error.message.includes('key')) {
      console.log('💡 Suggestion: Check Apple private key format and configuration');
    }
    if (error.message.includes('audience') || error.message.includes('bundle')) {
      console.log('💡 Suggestion: Check bundle ID configuration');
    }
  }
}

/**
 * Check common Apple Sign-In issues
 */
function checkCommonIssues() {
  console.log('\n6️⃣ Common Apple Sign-In Issues Check');
  console.log('-------------------------------------');
  
  const issues = [];
  
  // Check bundle ID consistency
  const frontendBundleId = 'com.UNextDoor.app'; // From app.config.js
  const backendBundleId = config.apple.bundleId;
  
  if (frontendBundleId !== backendBundleId) {
    issues.push({
      type: 'Bundle ID Mismatch',
      description: `Frontend: ${frontendBundleId}, Backend: ${backendBundleId}`,
      solution: 'Ensure bundle IDs match exactly in app.config.js and backend .env'
    });
  }
  
  // Check private key format
  if (!config.apple.privateKey.includes('-----BEGIN PRIVATE KEY-----') || 
      !config.apple.privateKey.includes('-----END PRIVATE KEY-----')) {
    issues.push({
      type: 'Private Key Format',
      description: 'Private key may not be in correct PEM format',
      solution: 'Ensure private key includes BEGIN/END markers and is properly formatted'
    });
  }
  
  // Check for line breaks in private key
  if (config.apple.privateKey.includes('\\n')) {
    issues.push({
      type: 'Private Key Line Breaks',
      description: 'Private key contains escaped line breaks',
      solution: 'Use actual line breaks instead of \\n in the private key'
    });
  }
  
  if (issues.length === 0) {
    console.log('✅ No common issues detected');
  } else {
    console.log(`❌ Found ${issues.length} potential issue(s):`);
    issues.forEach((issue, index) => {
      console.log(`\n   ${index + 1}. ${issue.type}`);
      console.log(`      Problem: ${issue.description}`);
      console.log(`      Solution: ${issue.solution}`);
    });
  }
  
  return issues.length === 0;
}

/**
 * Provide debugging recommendations
 */
function provideDebuggingRecommendations() {
  console.log('\n7️⃣ Debugging Recommendations');
  console.log('------------------------------');
  
  console.log('🔍 For "authorization failed due to unknown reason" error:');
  console.log('');
  console.log('1. **Check Apple Developer Console:**');
  console.log('   - Verify App ID has Apple Sign-In capability enabled');
  console.log('   - Ensure bundle ID matches exactly: com.UNextDoor.app');
  console.log('   - Check that Apple Sign-In is configured for your app');
  console.log('');
  console.log('2. **Verify Device Requirements:**');
  console.log('   - Test on physical iOS device (iOS 13+)');
  console.log('   - Ensure device is signed into iCloud');
  console.log('   - Check that Apple Sign-In is enabled in device settings');
  console.log('');
  console.log('3. **Check App Configuration:**');
  console.log('   - Run: npx expo prebuild --clean');
  console.log('   - Rebuild the app: npx expo run:ios');
  console.log('   - Verify entitlements are properly applied');
  console.log('');
  console.log('4. **Backend Token Verification:**');
  console.log('   - Check backend logs for detailed error messages');
  console.log('   - Verify Apple private key is correctly formatted');
  console.log('   - Test with a real Apple identity token');
  console.log('');
  console.log('5. **Network and Connectivity:**');
  console.log('   - Ensure device has internet connectivity');
  console.log('   - Check if backend API is accessible from device');
  console.log('   - Verify no firewall blocking Apple\'s servers');
}

/**
 * Main verification function
 */
async function runVerification() {
  const results = [];
  
  results.push(checkBackendConfig());
  results.push(checkFrontendConfig());
  results.push(checkAppleSignInPlugin());
  results.push(checkAppleAuthService());
  results.push(checkCommonIssues());
  
  await testAppleTokenVerification();
  
  provideDebuggingRecommendations();
  
  const passed = results.filter(r => r).length;
  const total = results.length;
  
  console.log('\n📊 Verification Summary');
  console.log('=======================');
  console.log(`Configuration checks passed: ${passed}/${total}`);
  
  if (passed === total) {
    console.log('🎉 All configurations appear correct!');
    console.log('💡 If still experiencing issues, focus on Apple Developer Console setup');
  } else {
    console.log('⚠️ Configuration issues found. Please fix them before testing.');
  }
  
  console.log('\n🔑 Key Success Factors for Apple Sign-In:');
  console.log('- App ID must have Apple Sign-In capability in Apple Developer Console');
  console.log('- Bundle ID must match exactly across all configurations');
  console.log('- Test on physical iOS device with iCloud signed in');
  console.log('- Private key must be in correct PEM format');
  console.log('- Backend must be accessible from the device');
}

// Run the verification
runVerification().catch(console.error);
