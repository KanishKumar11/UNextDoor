import { OAuth2Client } from 'google-auth-library';
import config from '../config/index.js';

/**
 * Utility functions for social authentication
 */

// Initialize Google OAuth2 client
const googleClient = new OAuth2Client(config.google?.clientId);

/**
 * Verify Google token
 * @param {string} token - Google ID token
 * @returns {Promise<Object|null>} User data or null if invalid
 */
export const verifyGoogleToken = async (token) => {
  try {
    if (!config.google?.clientId) {
      console.error('Google Client ID not configured');
      return null;
    }

    console.log('Verifying Google token with Google Auth Library');

    // Verify the token with Google
    const ticket = await googleClient.verifyIdToken({
      idToken: token,
      audience: config.google.clientId,
    });

    const payload = ticket.getPayload();

    if (!payload) {
      console.error('Invalid Google token payload');
      return null;
    }

    // Extract comprehensive user information from the verified token
    const userData = {
      id: payload.sub,
      email: payload.email,
      name: payload.name,
      givenName: payload.given_name,
      familyName: payload.family_name,
      picture: payload.picture,
      emailVerified: payload.email_verified,
      locale: payload.locale,
    };

    console.log('✅ Google user data extracted:', userData);
    return userData;
  } catch (error) {
    console.error('Error verifying Google token:', error);
    return null;
  }
};

/**
 * Verify Apple token
 * @param {string} token - Apple ID token
 * @returns {Promise<Object|null>} User data or null if invalid
 */
export const verifyAppleToken = async (token) => {
  try {
    // In a real implementation, you would verify the token with Apple
    // For now, we'll simulate this with a placeholder
    console.log('Verifying Apple token:', token);
    
    // Simulate successful verification
    return {
      id: 'apple-user-id',
      email: 'user@example.com',
      name: 'Apple User',
    };
  } catch (error) {
    console.error('Error verifying Apple token:', error);
    return null;
  }
};
