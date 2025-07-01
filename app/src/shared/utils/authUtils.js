import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_BASE_URL } from "../config/api";
import axios from "axios";

// Storage keys
const ACCESS_TOKEN_KEY = "accessToken";
const REFRESH_TOKEN_KEY = "refreshToken";
const USER_KEY = "user";

/**
 * Save authentication data to storage
 * @param {Object} data - Authentication data
 * @param {string} data.accessToken - Access token
 * @param {string} data.refreshToken - Refresh token
 * @param {Object} data.user - User data
 * @returns {Promise<void>}
 */
export const saveAuthData = async (data) => {
  try {
    const { accessToken, refreshToken, user } = data;

    await Promise.all([
      AsyncStorage.setItem(ACCESS_TOKEN_KEY, accessToken),
      AsyncStorage.setItem(REFRESH_TOKEN_KEY, refreshToken),
      AsyncStorage.setItem(USER_KEY, JSON.stringify(user)),
    ]);
  } catch (error) {
    console.error("Error saving auth data:", error);
    throw error;
  }
};

/**
 * Get authentication token from storage
 * @returns {Promise<string|null>} Authentication token or null if not found
 */
export const getAuthToken = async () => {
  try {
    const token = await AsyncStorage.getItem(ACCESS_TOKEN_KEY);
    return token;
  } catch (error) {
    console.error("Error getting auth token:", error);
    return null;
  }
};

/**
 * Get refresh token from storage
 * @returns {Promise<string|null>} Refresh token or null if not found
 */
export const getRefreshToken = async () => {
  try {
    const token = await AsyncStorage.getItem(REFRESH_TOKEN_KEY);
    return token;
  } catch (error) {
    console.error("Error getting refresh token:", error);
    return null;
  }
};

/**
 * Get user data from storage
 * @returns {Promise<Object|null>} User data or null if not found
 */
export const getUser = async () => {
  try {
    const user = await AsyncStorage.getItem(USER_KEY);
    return user ? JSON.parse(user) : null;
  } catch (error) {
    console.error("Error getting user data:", error);
    return null;
  }
};

/**
 * Check if user is authenticated
 * @returns {Promise<boolean>} True if authenticated, false otherwise
 */
export const isAuthenticated = async () => {
  try {
    const token = await getAuthToken();
    return !!token;
  } catch (error) {
    console.error("Error checking authentication:", error);
    return false;
  }
};

/**
 * Refresh authentication token
 * @returns {Promise<Object>} Object with success flag, new access token, and error if any
 */
export const refreshAuthToken = async () => {
  try {
    const refreshToken = await getRefreshToken();

    if (!refreshToken) {
      console.log("No refresh token found in refreshAuthToken");
      return { success: false, error: "No refresh token found" };
    }

    console.log("Attempting to refresh token with refresh token");
    const response = await axios.post(`${API_BASE_URL}/auth/refresh-token`, {
      refreshToken,
    });

    // Handle different response structures
    const data = response.data.data || response.data;
    const accessToken = data.accessToken;
    const newRefreshToken = data.refreshToken;
    const user = data.user;

    if (!accessToken) {
      console.error("No access token received from refresh token request");
      return { success: false, error: "Invalid response from server" };
    }

    console.log("Token refresh successful, storing new tokens");

    // Save new access token
    await AsyncStorage.setItem(ACCESS_TOKEN_KEY, accessToken);

    // Save new refresh token if provided
    if (newRefreshToken) {
      await AsyncStorage.setItem(REFRESH_TOKEN_KEY, newRefreshToken);
    }

    // Update user data if provided
    if (user) {
      await AsyncStorage.setItem(USER_KEY, JSON.stringify(user));
    }

    return { success: true, accessToken, user };
  } catch (error) {
    console.error("Error refreshing token:", error);
    return {
      success: false,
      error: error.message || "Failed to refresh token",
    };
  }
};

/**
 * Clear authentication data from storage
 * @returns {Promise<void>}
 */
export const clearAuthData = async () => {
  try {
    await Promise.all([
      AsyncStorage.removeItem(ACCESS_TOKEN_KEY),
      AsyncStorage.removeItem(REFRESH_TOKEN_KEY),
      AsyncStorage.removeItem(USER_KEY),
    ]);
  } catch (error) {
    console.error("Error clearing auth data:", error);
    throw error;
  }
};

/**
 * Set up axios interceptors for authentication
 */
export const setupAuthInterceptors = () => {
  // Request interceptor
  axios.interceptors.request.use(
    async (config) => {
      // Add token to request if available
      const token = await getAuthToken();

      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }

      return config;
    },
    (error) => Promise.reject(error)
  );

  // Response interceptor
  axios.interceptors.response.use(
    (response) => response,
    async (error) => {
      const originalRequest = error.config;

      // Disabled to prevent conflicts with auth service
      // Let auth service handle token refresh

      return Promise.reject(error);
    }
  );
};
