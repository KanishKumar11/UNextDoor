import { Platform } from 'react-native';
import * as AppleAuthentication from 'expo-apple-authentication';

/**
 * Apple Authentication Service
 * Handles Apple Sign-In configuration and authentication
 */
class AppleAuthService {
  constructor() {
    this.isAvailable = false;
    this.checkAvailability();
  }

  /**
   * Check if Apple Authentication is available
   */
  async checkAvailability() {
    try {
      if (Platform.OS === 'ios') {
        this.isAvailable = await AppleAuthentication.isAvailableAsync();
        console.log('✅ Apple Sign-In availability:', this.isAvailable);
      } else {
        console.log('ℹ️ Apple Sign-In is only available on iOS');
        this.isAvailable = false;
      }
    } catch (error) {
      console.error('❌ Error checking Apple Sign-In availability:', error);
      this.isAvailable = false;
    }
  }

  /**
   * Sign in with Apple
   * @returns {Promise<Object>} Apple authentication result
   */
  async signIn() {
    try {
      if (!this.isAvailable) {
        throw new Error('Apple Sign-In is not available on this device');
      }

      console.log('🍎 Starting Apple Sign-In...');

      const credential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
      });

      console.log('✅ Apple Sign-In successful:', {
        user: credential.user,
        email: credential.email,
        fullName: credential.fullName,
        authorizationCode: credential.authorizationCode ? 'Present' : 'Missing',
        identityToken: credential.identityToken ? 'Present' : 'Missing',
      });

      // Validate that we have the required token
      if (!credential.identityToken) {
        throw new Error('Failed to get Apple identity token');
      }

      // Return the credential for backend verification
      return {
        success: true,
        credential,
        user: {
          id: credential.user,
          email: credential.email,
          name: credential.fullName ? {
            firstName: credential.fullName.givenName,
            lastName: credential.fullName.familyName,
          } : null,
        },
      };
    } catch (error) {
      console.error('❌ Apple Sign-In error:', error);

      // Handle specific Apple Sign-In errors
      if (error.code === 'ERR_CANCELED') {
        return {
          success: false,
          error: 'User canceled Apple Sign-In',
          cancelled: true,
        };
      }

      return {
        success: false,
        error: error.message || 'Apple Sign-In failed',
      };
    }
  }

  /**
   * Get credential state for a user
   * @param {string} userID - Apple user ID
   * @returns {Promise<string>} Credential state
   */
  async getCredentialState(userID) {
    try {
      if (!this.isAvailable) {
        return AppleAuthentication.AppleAuthenticationCredentialState.NOT_SUPPORTED;
      }

      const credentialState = await AppleAuthentication.getCredentialStateAsync(userID);
      console.log('🍎 Apple credential state for user', userID, ':', credentialState);

      return credentialState;
    } catch (error) {
      console.error('❌ Error getting Apple credential state:', error);
      return AppleAuthentication.AppleAuthenticationCredentialState.NOT_FOUND;
    }
  }

  /**
   * Check if user is still authenticated with Apple
   * @param {string} userID - Apple user ID
   * @returns {Promise<boolean>} Whether user is still authenticated
   */
  async isUserAuthenticated(userID) {
    try {
      const state = await this.getCredentialState(userID);
      return state === AppleAuthentication.AppleAuthenticationCredentialState.AUTHORIZED;
    } catch (error) {
      console.error('❌ Error checking Apple authentication state:', error);
      return false;
    }
  }

  /**
   * Sign out (Apple doesn't provide a sign out method, but we can clear local data)
   */
  async signOut() {
    try {
      console.log('🍎 Apple Sign-Out (clearing local data)');
      // Apple doesn't provide a programmatic sign-out method
      // The user needs to revoke access in Settings > Apple ID > Sign-In & Security
      return { success: true };
    } catch (error) {
      console.error('❌ Error during Apple sign-out:', error);
      return { success: false, error: error.message };
    }
  }
}

// Create and export a singleton instance
const appleAuthService = new AppleAuthService();
export default appleAuthService;

// Export the class for testing purposes
export { AppleAuthService };

// Export Apple Authentication constants for use in components
export const AppleAuthenticationScope = AppleAuthentication.AppleAuthenticationScope;
export const AppleAuthenticationCredentialState = AppleAuthentication.AppleAuthenticationCredentialState;
