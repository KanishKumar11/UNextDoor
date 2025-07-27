import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Location from 'expo-location';
import { Alert } from 'react-native';
import { apiClient } from '../api/apiClient';

/**
 * Currency detection and management service
 * Simplified: India = ₹ (INR), Rest of World = $ (USD)
 */

// Centralized currency configuration with standardized exchange rates
export const SUPPORTED_CURRENCIES = {
  'IN': {
    code: 'INR',
    symbol: '₹',
    name: 'Indian Rupee',
    country: 'India',
    exchangeRate: 1.0 // Base currency
  },
  'DEFAULT': {
    code: 'USD',
    symbol: '$',
    name: 'US Dollar',
    country: 'International',
    exchangeRate: 0.012 // 1 INR = 0.012 USD (approximately 1 USD = 83.33 INR)
  }
};

// Standardized conversion rate - single source of truth
export const CURRENCY_EXCHANGE_RATES = {
  INR_TO_USD: 0.012,
  USD_TO_INR: 83.33
};

export class CurrencyService {
  /**
   * Get user's detected or saved currency with comprehensive error handling
   */
  static async getUserCurrency() {
    const fallbackCurrency = SUPPORTED_CURRENCIES.DEFAULT;

    try {
      console.log('💰 Starting currency detection process...');

      // Step 1: Check backend for user's saved preference
      try {
        console.log('💰 Checking backend for saved currency preference...');
        const response = await apiClient.get('/auth/preferences');

        if (response.data.success && response.data.data.preferences.currency) {
          const currencyCode = response.data.data.preferences.currency;
          const currency = currencyCode === 'INR' ? SUPPORTED_CURRENCIES.IN : SUPPORTED_CURRENCIES.DEFAULT;
          console.log('✅ Using server-saved currency:', currency);
          return currency;
        } else {
          console.log('📍 No currency preference found in backend response');
        }
      } catch (backendError) {
        console.log('📍 Backend preference check failed:', backendError.message);

        // Check if it's a network error vs authentication error
        if (backendError.response?.status === 401) {
          console.log('🔐 User not authenticated, skipping backend check');
        } else if (backendError.code === 'NETWORK_ERROR' || !backendError.response) {
          console.log('🌐 Network error accessing backend preferences');
        }
      }

      // Step 2: Check local storage for user's manually selected currency
      try {
        console.log('💰 Checking local storage for saved currency...');
        const savedCurrency = await AsyncStorage.getItem('user_selected_currency');

        if (savedCurrency) {
          const parsed = JSON.parse(savedCurrency);

          // Validate the parsed currency object
          if (parsed && parsed.code && parsed.symbol && parsed.name) {
            console.log('✅ Using locally saved currency:', parsed);
            return parsed;
          } else {
            console.log('⚠️ Invalid currency data in local storage, removing...');
            await AsyncStorage.removeItem('user_selected_currency');
          }
        } else {
          console.log('📍 No currency preference found in local storage');
        }
      } catch (storageError) {
        console.log('❌ Local storage access failed:', storageError.message);
        // Try to clear corrupted data
        try {
          await AsyncStorage.removeItem('user_selected_currency');
        } catch (clearError) {
          console.log('❌ Failed to clear corrupted currency data:', clearError.message);
        }
      }

      // Step 3: Try to detect automatically
      try {
        console.log('💰 Attempting automatic currency detection...');
        const detectedCurrency = await this.detectCurrency();
        console.log('✅ Auto-detected currency:', detectedCurrency);
        return detectedCurrency;
      } catch (detectionError) {
        console.log('❌ Automatic detection failed:', detectionError.message);
      }

      // Final fallback
      console.log('💰 All detection methods failed, using fallback currency:', fallbackCurrency);
      return fallbackCurrency;

    } catch (error) {
      console.error('💥 Critical error in getUserCurrency:', error);
      return fallbackCurrency;
    }
  }

  /**
   * Alias for getUserCurrency for backward compatibility
   */
  static async getCurrency() {
    return this.getUserCurrency();
  }

  /**
   * Auto-detect currency based on location with comprehensive error handling
   */
  static async detectCurrency() {
    const detectionMethods = [];

    // Method 1: Location-based detection
    try {
      console.log('📍 Attempting location-based currency detection...');

      const { status } = await Location.requestForegroundPermissionsAsync();
      console.log('📍 Location permission status:', status);

      if (status === 'granted') {
        try {
          const location = await Location.getCurrentPositionAsync({
            accuracy: Location.Accuracy.Low,
            timeout: 8000 // Increased timeout for better reliability
          });

          console.log('📍 Location obtained:', {
            latitude: location.coords.latitude,
            longitude: location.coords.longitude
          });

          // Use reverse geocoding to get country
          const reverseGeocode = await Location.reverseGeocodeAsync({
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
          });

          if (reverseGeocode && reverseGeocode.length > 0) {
            const country = reverseGeocode[0].isoCountryCode?.toUpperCase();
            const region = reverseGeocode[0].region;
            const city = reverseGeocode[0].city;

            console.log('📍 Reverse geocoding result:', { country, region, city });

            if (country === 'IN') {
              console.log('✅ Location detection: India detected, using INR');
              detectionMethods.push('location');
              return SUPPORTED_CURRENCIES.IN;
            } else {
              console.log('📍 Location detection: Non-India country detected:', country);
              detectionMethods.push('location');
              return SUPPORTED_CURRENCIES.DEFAULT;
            }
          } else {
            console.log('⚠️ Reverse geocoding returned empty results');
          }
        } catch (locationError) {
          console.log('❌ Location access failed:', locationError.message);
          if (locationError.code === 'E_LOCATION_TIMEOUT') {
            console.log('⏰ Location request timed out');
          } else if (locationError.code === 'E_LOCATION_UNAVAILABLE') {
            console.log('📍 Location services unavailable');
          }
        }
      } else {
        console.log('❌ Location permission denied or restricted:', status);
      }
    } catch (permissionError) {
      console.log('❌ Location permission request failed:', permissionError.message);
    }

    // Method 2: System locale detection
    try {
      console.log('📍 Attempting locale-based currency detection...');

      const locale = require('react-native').NativeModules.SettingsManager?.settings?.AppleLocale ||
        require('react-native').NativeModules.I18nManager?.localeIdentifier ||
        'en_US';

      console.log('📍 System locale detected:', locale);

      if (locale.includes('IN') || locale.includes('_IN') || locale.toLowerCase().includes('india')) {
        console.log('✅ Locale detection: India detected, using INR');
        detectionMethods.push('locale');
        return SUPPORTED_CURRENCIES.IN;
      } else {
        console.log('📍 Locale detection: Non-India locale detected');
        detectionMethods.push('locale');
      }
    } catch (localeError) {
      console.log('❌ Locale detection failed:', localeError.message);
    }

    // Method 3: Timezone-based detection (additional fallback)
    try {
      console.log('📍 Attempting timezone-based currency detection...');

      const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      console.log('📍 System timezone:', timezone);

      if (timezone && timezone.includes('Asia/Kolkata') || timezone.includes('Asia/Calcutta')) {
        console.log('✅ Timezone detection: India timezone detected, using INR');
        detectionMethods.push('timezone');
        return SUPPORTED_CURRENCIES.IN;
      }
    } catch (timezoneError) {
      console.log('❌ Timezone detection failed:', timezoneError.message);
    }

    // Default fallback
    console.log('📍 All detection methods failed, defaulting to USD');
    console.log('📍 Detection methods attempted:', detectionMethods);
    return SUPPORTED_CURRENCIES.DEFAULT;
  }

  /**
   * Save user's manually selected currency both locally and on server
   */
  static async saveUserCurrency(currency) {
    try {
      // Save locally first
      await AsyncStorage.setItem('user_selected_currency', JSON.stringify(currency));
      console.log('📍 Saved user currency locally:', currency);

      // Save to server
      try {
        await apiClient.put('/auth/preferences', { currency: currency.code });
        console.log('📍 Saved user currency to server:', currency.code);
      } catch (error) {
        console.log('📍 Failed to save currency to server, but local save succeeded:', error.message);
      }
    } catch (error) {
      console.error('Error saving user currency:', error);
    }
  }

  /**
   * Show currency selection dialog with enhanced error handling
   */
  static async showCurrencySelector() {
    return new Promise((resolve) => {
      const handleCurrencySelection = async (currency, currencyName) => {
        try {
          console.log(`💰 User selected ${currencyName}:`, currency);
          await this.saveUserCurrency(currency);
          console.log(`✅ ${currencyName} saved successfully`);
          resolve(currency);
        } catch (error) {
          console.error(`❌ Failed to save ${currencyName}:`, error);

          // Show error and retry option
          Alert.alert(
            'Save Error',
            `Failed to save your currency preference. Would you like to try again?`,
            [
              {
                text: 'Cancel',
                style: 'cancel',
                onPress: () => {
                  // Resolve with the currency anyway (local fallback)
                  console.log(`⚠️ Using ${currencyName} without saving preference`);
                  resolve(currency);
                }
              },
              {
                text: 'Retry',
                onPress: () => handleCurrencySelection(currency, currencyName)
              }
            ]
          );
        }
      };

      Alert.alert(
        'Select Your Currency',
        'Choose your preferred currency for pricing:',
        [
          {
            text: '🇮🇳 Indian Rupee (₹)',
            onPress: () => handleCurrencySelection(SUPPORTED_CURRENCIES.IN, 'Indian Rupee')
          },
          {
            text: '🌍 US Dollar ($)',
            onPress: () => handleCurrencySelection(SUPPORTED_CURRENCIES.DEFAULT, 'US Dollar')
          },
          {
            text: 'Cancel',
            style: 'cancel',
            onPress: () => {
              console.log('💰 User cancelled currency selection, using default');
              resolve(SUPPORTED_CURRENCIES.DEFAULT);
            }
          }
        ],
        {
          cancelable: true,
          onDismiss: () => {
            console.log('💰 Currency dialog dismissed, using default');
            resolve(SUPPORTED_CURRENCIES.DEFAULT);
          }
        }
      );
    });
  }

  /**
   * Format price with currency symbol
   */
  static formatPrice(price, currencyInfo, interval = 'month', intervalCount = 1) {
    const { symbol } = currencyInfo;

    if (intervalCount === 3) return `${symbol}${price}/quarter`;
    if (intervalCount === 12) return `${symbol}${price}/year`;
    return `${symbol}${price}/month`;
  }

  /**
   * Set user's currency preference with comprehensive error handling
   * Saves both locally and to backend
   */
  static async setCurrency(currency) {
    const errors = [];

    try {
      // Validate currency object
      if (!currency || !currency.code || !currency.symbol || !currency.name) {
        throw new Error('Invalid currency object provided');
      }

      console.log('💰 Setting currency preference:', currency);

      // Step 1: Save locally first (most important)
      try {
        await AsyncStorage.setItem('user_selected_currency', JSON.stringify(currency));
        console.log('✅ Currency saved locally:', currency);
      } catch (localError) {
        console.error('❌ Failed to save currency locally:', localError);
        errors.push(`Local storage: ${localError.message}`);
        throw new Error('Failed to save currency preference locally');
      }

      // Step 2: Save to backend (optional, but preferred)
      try {
        console.log('💰 Attempting to save currency to backend...');
        const response = await apiClient.put('/auth/preferences', {
          currency: currency.code
        });

        if (response.data.success) {
          console.log('✅ Currency saved to backend successfully:', currency.code);
        } else {
          console.log('⚠️ Backend save response not successful:', response.data);
          errors.push('Backend save unsuccessful');
        }
      } catch (backendError) {
        console.error('❌ Failed to save currency to backend:', backendError.response?.data || backendError.message);

        // Categorize backend errors
        if (backendError.response?.status === 401) {
          console.log('🔐 User not authenticated - currency saved locally only');
          errors.push('Not authenticated (local save only)');
        } else if (backendError.response?.status >= 500) {
          console.log('🔧 Server error - currency saved locally only');
          errors.push('Server error (local save only)');
        } else if (backendError.code === 'NETWORK_ERROR' || !backendError.response) {
          console.log('🌐 Network error - currency saved locally only');
          errors.push('Network error (local save only)');
        } else {
          errors.push(`Backend error: ${backendError.message}`);
        }
      }

      // Success if local save worked (backend is optional)
      if (errors.length > 0) {
        console.log('⚠️ Currency set with warnings:', errors);
      }

      return { success: true, currency, warnings: errors };

    } catch (error) {
      console.error('💥 Critical error setting currency:', error);
      throw new Error(`Failed to set currency: ${error.message}`);
    }
  }

  /**
   * Reset currency selection (useful for testing or changing preferences)
   */
  static async resetCurrencySelection() {
    try {
      await AsyncStorage.removeItem('user_selected_currency');
      await AsyncStorage.removeItem('has_seen_currency_dialog');
      console.log('📍 Reset currency selection');
    } catch (error) {
      console.error('Error resetting currency selection:', error);
    }
  }

  /**
   * Convert INR price to other currency using standardized rates
   */
  static convertPrice(inrPrice, targetCurrency) {
    if (targetCurrency.code === 'INR') {
      return inrPrice;
    }

    // Use standardized conversion rate
    if (targetCurrency.code === 'USD') {
      return Math.round((inrPrice * CURRENCY_EXCHANGE_RATES.INR_TO_USD) * 100) / 100; // Round to 2 decimal places
    }

    return inrPrice; // Fallback
  }

  /**
   * Convert USD price to INR using standardized rates
   */
  static convertUSDToINR(usdPrice) {
    return Math.round((usdPrice * CURRENCY_EXCHANGE_RATES.USD_TO_INR) * 100) / 100;
  }

  /**
   * Get the actual payment amount in INR (what Razorpay will charge)
   * This ensures users know exactly what they'll be charged
   */
  static getPaymentAmountINR(displayPrice, displayCurrency) {
    if (displayCurrency === 'INR') {
      return displayPrice;
    }

    if (displayCurrency === 'USD') {
      return this.convertUSDToINR(displayPrice);
    }

    return displayPrice; // Fallback
  }
}

// Export the service
// export { CurrencyService };
// export default CurrencyService;
