import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { signInWithGoogle, initializeGoogleSignIn } from '../services/googleAuthService';

/**
 * Test Google Authentication Setup
 * Use this to verify that Google Sign-In is properly configured
 */

export const testGoogleAuthSetup = async () => {
  console.log('🧪 Testing Google Authentication Setup...');
  
  const results = {
    initialization: false,
    configuration: false,
    playServices: false,
    signInFlow: false,
    errors: []
  };

  try {
    // Test 1: Initialize Google Sign-In
    console.log('1️⃣ Testing Google Sign-In initialization...');
    const initResult = await initializeGoogleSignIn();
    results.initialization = initResult;
    
    if (initResult) {
      console.log('✅ Google Sign-In initialized successfully');
    } else {
      console.log('❌ Google Sign-In initialization failed');
      results.errors.push('Initialization failed');
    }

    // Test 2: Check configuration
    console.log('2️⃣ Testing Google Sign-In configuration...');
    try {
      const currentUser = await GoogleSignin.getCurrentUser();
      console.log('Current user:', currentUser ? 'Signed in' : 'Not signed in');
      results.configuration = true;
      console.log('✅ Google Sign-In configuration is valid');
    } catch (error) {
      console.log('⚠️ No current user (this is normal if not signed in)');
      results.configuration = true; // This is actually normal
    }

    // Test 3: Check Google Play Services (Android only)
    console.log('3️⃣ Testing Google Play Services...');
    try {
      await GoogleSignin.hasPlayServices();
      results.playServices = true;
      console.log('✅ Google Play Services available');
    } catch (error) {
      console.log('❌ Google Play Services error:', error.message);
      results.playServices = false;
      results.errors.push(`Play Services: ${error.message}`);
    }

    // Test 4: Test sign-in flow (optional - only if user wants to test)
    console.log('4️⃣ Sign-in flow test available (call testGoogleSignInFlow() manually)');
    results.signInFlow = 'not_tested';

  } catch (error) {
    console.error('❌ Error during Google Auth setup test:', error);
    results.errors.push(`Setup test error: ${error.message}`);
  }

  // Summary
  console.log('\n📊 Google Authentication Test Results:');
  console.log('=====================================');
  console.log(`Initialization: ${results.initialization ? '✅' : '❌'}`);
  console.log(`Configuration: ${results.configuration ? '✅' : '❌'}`);
  console.log(`Play Services: ${results.playServices ? '✅' : '❌'}`);
  console.log(`Sign-in Flow: ${results.signInFlow === 'not_tested' ? '⏭️ Not tested' : results.signInFlow ? '✅' : '❌'}`);
  
  if (results.errors.length > 0) {
    console.log('\n❌ Errors found:');
    results.errors.forEach((error, index) => {
      console.log(`${index + 1}. ${error}`);
    });
  } else {
    console.log('\n🎉 All tests passed! Google Authentication is ready to use.');
  }

  return results;
};

/**
 * Test the actual Google Sign-In flow
 * Call this manually when you want to test the sign-in process
 */
export const testGoogleSignInFlow = async () => {
  console.log('🔐 Testing Google Sign-In flow...');
  
  try {
    const result = await signInWithGoogle();
    
    if (result && result.idToken) {
      console.log('✅ Google Sign-In successful!');
      console.log('User info:', {
        id: result.user.id,
        name: result.user.name,
        email: result.user.email,
        photo: result.user.photo
      });
      console.log('ID Token received:', result.idToken ? 'Yes' : 'No');
      return { success: true, user: result.user };
    } else {
      console.log('❌ Google Sign-In failed - no token received');
      return { success: false, error: 'No token received' };
    }
  } catch (error) {
    console.log('❌ Google Sign-In error:', error.message);
    return { success: false, error: error.message };
  }
};

/**
 * Test Google Sign-Out
 */
export const testGoogleSignOut = async () => {
  console.log('🚪 Testing Google Sign-Out...');
  
  try {
    await GoogleSignin.signOut();
    console.log('✅ Google Sign-Out successful');
    return { success: true };
  } catch (error) {
    console.log('❌ Google Sign-Out error:', error.message);
    return { success: false, error: error.message };
  }
};

/**
 * Get current Google user info
 */
export const getCurrentGoogleUserInfo = async () => {
  try {
    const userInfo = await GoogleSignin.signInSilently();
    console.log('Current Google user:', userInfo.user);
    return userInfo.user;
  } catch (error) {
    console.log('No current Google user or error:', error.message);
    return null;
  }
};

/**
 * Complete test suite - run all tests
 */
export const runCompleteGoogleAuthTest = async () => {
  console.log('🚀 Running complete Google Authentication test suite...\n');
  
  // Run setup tests
  const setupResults = await testGoogleAuthSetup();
  
  // If setup is successful, offer to test sign-in flow
  if (setupResults.initialization && setupResults.configuration && setupResults.playServices) {
    console.log('\n🎯 Setup tests passed! You can now test the sign-in flow manually by calling:');
    console.log('testGoogleSignInFlow()');
  } else {
    console.log('\n⚠️ Setup tests failed. Please fix the issues before testing sign-in flow.');
  }
  
  return setupResults;
};
