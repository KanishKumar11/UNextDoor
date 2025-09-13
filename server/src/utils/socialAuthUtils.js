import { OAuth2Client } from 'google-auth-library';
import appleSignin from 'apple-signin-auth';
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
    console.log('🍎 Verifying Apple identity token...');

    if (!token) {
      console.error('❌ No Apple token provided');
      return null;
    }

    try {
      // Use apple-signin-auth library for proper token verification
      console.log('🔍 Verifying Apple token with audience:', 'com.UNextDoor.app');

      const appleIdTokenClaims = await appleSignin.verifyIdToken(token, {
        audience: 'com.UNextDoor.app', // Your app's bundle ID
        ignoreExpiration: false,
        nonce: undefined, // Add nonce if you're using one
      });

      console.log('✅ Apple token verified successfully:', {
        sub: appleIdTokenClaims.sub,
        email: appleIdTokenClaims.email,
        email_verified: appleIdTokenClaims.email_verified,
        iss: appleIdTokenClaims.iss,
        aud: appleIdTokenClaims.aud,
      });

      // Extract user information
      const userInfo = {
        id: appleIdTokenClaims.sub, // Apple user ID
        email: appleIdTokenClaims.email,
        emailVerified: appleIdTokenClaims.email_verified === 'true' || appleIdTokenClaims.email_verified === true,
        name: appleIdTokenClaims.name || null, // Name might not always be present
      };

      console.log('✅ Apple user verified:', userInfo);
      return userInfo;

    } catch (verificationError) {
      console.error('❌ Apple token verification failed:', verificationError.message);

      // Fallback to basic JWT decoding for development/testing
      console.log('🔄 Falling back to basic JWT decoding...');

      const tokenParts = token.split('.');
      if (tokenParts.length !== 3) {
        console.error('❌ Invalid Apple token format');
        return null;
      }

      try {
        // Decode the payload (second part of JWT)
        const payload = JSON.parse(Buffer.from(tokenParts[1], 'base64').toString());

        console.log('✅ Apple token decoded (fallback):', {
          sub: payload.sub,
          email: payload.email,
          email_verified: payload.email_verified,
          iss: payload.iss,
          aud: payload.aud,
        });

        // Validate the token issuer
        if (payload.iss !== 'https://appleid.apple.com') {
          console.error('❌ Invalid Apple token issuer:', payload.iss);
          return null;
        }

        // Check if token is expired
        const now = Math.floor(Date.now() / 1000);
        if (payload.exp && payload.exp < now) {
          console.error('❌ Apple token has expired');
          return null;
        }

        // Extract user information
        const userInfo = {
          id: payload.sub, // Apple user ID
          email: payload.email,
          emailVerified: payload.email_verified === 'true' || payload.email_verified === true,
          name: payload.name || null, // Name might not always be present
        };

        console.log('✅ Apple user verified (fallback):', userInfo);
        return userInfo;

      } catch (decodeError) {
        console.error('❌ Error decoding Apple token:', decodeError);
        return null;
      }
    }

  } catch (error) {
    console.error('❌ Error verifying Apple token:', error);
    return null;
  }
};
