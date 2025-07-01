/**
 * Clear Authentication Data Script
 * 
 * This script clears all authentication data from AsyncStorage
 * to resolve authentication loop issues.
 * 
 * Run this script and then restart the app.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

const clearAuthData = async () => {
  try {
    console.log('🧹 Clearing all authentication data...');
    
    // Clear all auth-related keys
    await AsyncStorage.multiRemove([
      'accessToken',
      'refreshToken', 
      'user',
      'authState',
      'userProfile'
    ]);
    
    console.log('✅ Authentication data cleared successfully!');
    console.log('📱 Please restart the app to complete the reset.');
    
    // Also clear any other keys that might be related
    const allKeys = await AsyncStorage.getAllKeys();
    const authKeys = allKeys.filter(key => 
      key.includes('auth') || 
      key.includes('token') || 
      key.includes('user')
    );
    
    if (authKeys.length > 0) {
      console.log('🔍 Found additional auth-related keys:', authKeys);
      await AsyncStorage.multiRemove(authKeys);
      console.log('✅ Additional keys cleared!');
    }
    
  } catch (error) {
    console.error('❌ Error clearing auth data:', error);
  }
};

// Export for use in the app
export default clearAuthData;

// If running directly (for testing)
if (typeof window !== 'undefined') {
  clearAuthData();
}
