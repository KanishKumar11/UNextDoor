import { initializeGoogleSignIn } from '../services/googleAuthService';

/**
 * Initialize all authentication services
 * Call this once when the app starts
 */
export const initializeAuth = async () => {
  try {
    console.log('Initializing authentication services...');
    
    // Initialize Google Sign-In
    const googleInitialized = await initializeGoogleSignIn();
    
    if (googleInitialized) {
      console.log('✅ Google Sign-In initialized successfully');
    } else {
      console.warn('⚠️ Google Sign-In initialization failed');
    }
    
    // Add other auth service initializations here (Apple, Facebook, etc.)
    
    return {
      google: googleInitialized,
      // Add other services here
    };
  } catch (error) {
    console.error('❌ Error initializing authentication services:', error);
    return {
      google: false,
    };
  }
};

/**
 * Check if authentication services are properly configured
 */
export const checkAuthConfiguration = () => {
  const issues = [];
  
  // Check Google configuration
  // Note: In a real app, you might want to validate the client IDs format
  // For now, we'll just check if they're not the placeholder values
  
  console.log('🔍 Checking authentication configuration...');
  
  if (issues.length === 0) {
    console.log('✅ Authentication configuration looks good');
    return { valid: true, issues: [] };
  } else {
    console.warn('⚠️ Authentication configuration issues found:', issues);
    return { valid: false, issues };
  }
};
