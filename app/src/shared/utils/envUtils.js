/**
 * Environment Variables Utility
 * Provides access to environment variables in the React Native app
 */

import Constants from "expo-constants";

/**
 * Get an environment variable
 * @param {string} key - The environment variable key
 * @param {any} defaultValue - Default value if the environment variable is not found
 * @returns {string|any} The environment variable value or the default value
 */
export const getEnv = (key, defaultValue = null) => {
  // First try to get from process.env (for development)
  if (process.env && process.env[key]) {
    return process.env[key];
  }

  // Then try to get from Expo Constants
  if (
    Constants.expoConfig &&
    Constants.expoConfig.extra &&
    Constants.expoConfig.extra[key]
  ) {
    return Constants.expoConfig.extra[key];
  }

  // Finally, try to get from .env file via Constants manifest
  if (
    Constants.manifest &&
    Constants.manifest.extra &&
    Constants.manifest.extra[key]
  ) {
    return Constants.manifest.extra[key];
  }

  // Return default value if not found
  return defaultValue;
};

export default {
  getEnv,
};
