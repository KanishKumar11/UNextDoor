import { Platform } from 'react-native';

// Try to import GoogleSignin with error handling
let GoogleSignin;
try {
  const googleSigninModule = require('@react-native-google-signin/google-signin');
  GoogleSignin = googleSigninModule.GoogleSignin;
  console.log('✅ Google Sign-In library loaded successfully');
  console.log('GoogleSignin object type:', typeof GoogleSignin);
  console.log('Available methods:', GoogleSignin ? Object.keys(GoogleSignin) : 'None');
} catch (error) {
  console.error('❌ Failed to load Google Sign-In library:', error);
  console.error('💡 Solution: Run "npx expo prebuild --clean" and rebuild your app');
}

/**
 * Google Authentication Service
 * Handles Google Sign-In configuration and authentication
 */

// Google OAuth configuration
// Note: Replace these placeholder client IDs with your actual Google OAuth client IDs from Google Cloud Console
const GOOGLE_CONFIG = {
  webClientId: '670102459133-rde3n2655fu9r5sonqfilg1hl635fa3h.apps.googleusercontent.com', // Web client ID from Google Cloud Console (REQUIRED)
  iosClientId: '670102459133-vr2l1a5hfq84k817lmuj6sprkhkrdotc.apps.googleusercontent.com', // iOS client ID (optional, can use webClientId)
  // Note: Android client ID is automatically detected by the library based on your app's package name and SHA-1 fingerprint
  // configured in Google Cloud Console. You don't need to specify it here unless you want to be explicit:
  // androidClientId: '670102459133-7bq03aetjs4q5cp5ljl610cbjstnbmeg.apps.googleusercontent.com', // Android client ID (optional)
  scopes: ['openid', 'profile', 'email'],
  offlineAccess: true,
  hostedDomain: '',
  forceCodeForRefreshToken: true,
};

/**
 * Initialize Google Sign-In
 * Call this once when the app starts
 */
export const initializeGoogleSignIn = async () => {
  try {
    // Check if GoogleSignin is properly loaded
    if (!GoogleSignin) {
      console.error('❌ Google Sign-In library not loaded');
      console.error('💡 To fix this:');
      console.error('   1. Run: npx expo prebuild --clean');
      console.error('   2. Rebuild your app: npx expo run:android or npx expo run:ios');
      console.error('   3. Make sure you\'re testing on a physical device, not simulator');
      return false;
    }

    if (typeof GoogleSignin.configure !== 'function') {
      console.error('❌ Google Sign-In library incomplete - configure function missing');
      return false;
    }

    GoogleSignin.configure(GOOGLE_CONFIG);
    console.log('✅ Google Sign-In configured successfully');
    return true;
  } catch (error) {
    console.error('❌ Error configuring Google Sign-In:', error);
    console.error('💡 Make sure you have run "npx expo prebuild --clean" and rebuilt the app');
    return false;
  }
};

/**
 * Check if Google Play Services are available (Android only)
 */
export const checkGooglePlayServices = async () => {
  try {
    if (Platform.OS === 'android') {
      await GoogleSignin.hasPlayServices();
    }
    return true;
  } catch (error) {
    console.error('Google Play Services not available:', error);
    return false;
  }
};

/**
 * Sign in with Google
 * @returns {Promise<Object>} Google user info and ID token
 */
export const signInWithGoogle = async () => {
  try {
    // Check if GoogleSignin is properly loaded
    if (!GoogleSignin) {
      throw new Error('Google Sign-In library not loaded. Please run "npx expo prebuild --clean" and rebuild the app.');
    }

    // Check if Google Play Services are available
    const playServicesAvailable = await checkGooglePlayServices();
    if (!playServicesAvailable) {
      throw new Error('Google Play Services not available');
    }

    // Check if user is already signed in (using getCurrentUser instead of isSignedIn)
    try {
      const currentUser = await GoogleSignin.getCurrentUser();
      if (currentUser) {
        console.log('User already signed in, signing out first...');
        await GoogleSignin.signOut();
      }
    } catch (error) {
      // No current user, which is fine
      console.log('No current user signed in');
    }

    // Sign in
    const userInfo = await GoogleSignin.signIn();
    console.log('✅ Google Sign-In successful, user info:', userInfo);

    // Get the ID token
    const tokens = await GoogleSignin.getTokens();
    console.log('✅ Google tokens retrieved');

    // Extract user data - handle the actual response format
    let user, idToken;

    if (userInfo.data) {
      // New format: data is nested
      user = userInfo.data.user;
      idToken = userInfo.data.idToken;
    } else {
      // Old format: direct access
      user = userInfo.user;
      idToken = tokens.idToken;
    }

    console.log('🔍 Debug - userInfo structure:', userInfo.type);
    console.log('🔍 Debug - extracted user:', user);
    console.log('🔍 Debug - extracted idToken:', !!idToken);

    if (!user) {
      console.error('❌ No user data found in Google Sign-In response');
      console.error('❌ Full userInfo:', JSON.stringify(userInfo, null, 2));
      throw new Error('No user data received from Google Sign-In');
    }

    console.log('👤 Raw user data:', user);

    // Extract comprehensive user information
    const extractedUserData = {
      // Basic info
      id: user.id,
      email: user.email,
      name: user.name,
      givenName: user.givenName,
      familyName: user.familyName,
      photo: user.photo,

      // Additional info for pre-filling registration
      firstName: user.givenName || '',
      lastName: user.familyName || '',
      displayName: user.name || '',
      profilePicture: user.photo || '',

      // Generate suggested username from email
      suggestedUsername: user.email ? user.email.split('@')[0].toLowerCase().replace(/[^a-z0-9_]/g, '') : '',
    };

    console.log('📋 Extracted user data for registration:', extractedUserData);

    // Validate that we have the required token
    if (!idToken) {
      throw new Error('Failed to get Google ID token');
    }

    return {
      user: extractedUserData,
      idToken: idToken,
      accessToken: tokens.accessToken,
    };
  } catch (error) {
    console.error('Google Sign-In error:', error);
    throw error;
  }
};

/**
 * Sign out from Google
 */
export const signOutFromGoogle = async () => {
  try {
    await GoogleSignin.signOut();
    console.log('Google Sign-Out successful');
    return true;
  } catch (error) {
    console.error('Google Sign-Out error:', error);
    return false;
  }
};

/**
 * Get current Google user info
 */
export const getCurrentGoogleUser = async () => {
  try {
    const userInfo = await GoogleSignin.signInSilently();
    return userInfo.user;
  } catch (error) {
    console.error('Error getting current Google user:', error);
    return null;
  }
};

/**
 * Revoke Google access
 */
export const revokeGoogleAccess = async () => {
  try {
    await GoogleSignin.revokeAccess();
    console.log('Google access revoked');
    return true;
  } catch (error) {
    console.error('Error revoking Google access:', error);
    return false;
  }
};
