/**
 * Utility for temporarily storing Google user data for registration pre-filling
 * This is used when a user signs in with Google but needs to complete registration
 */

let temporaryGoogleUserData = null;

/**
 * Store Google user data temporarily
 * @param {Object} userData - Google user data
 */
export const storeTemporaryGoogleUserData = (userData) => {
  console.log('📋 Storing temporary Google user data:', userData);
  temporaryGoogleUserData = userData;
};

/**
 * Get and clear temporary Google user data
 * @returns {Object|null} - Stored Google user data or null
 */
export const getAndClearTemporaryGoogleUserData = () => {
  const data = temporaryGoogleUserData;
  temporaryGoogleUserData = null;
  console.log('📋 Retrieved and cleared temporary Google user data:', data);
  return data;
};

/**
 * Clear temporary Google user data
 */
export const clearTemporaryGoogleUserData = () => {
  console.log('🗑️ Clearing temporary Google user data');
  temporaryGoogleUserData = null;
};

/**
 * Check if temporary Google user data exists
 * @returns {boolean} - True if data exists
 */
export const hasTemporaryGoogleUserData = () => {
  return temporaryGoogleUserData !== null;
};
