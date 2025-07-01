import { apiClient } from './apiClient';
import { ENDPOINTS } from '../config/api';

/**
 * Check if an email exists in the system
 * @param {string} email - Email to check
 * @returns {Promise<Object>} Response data
 */
export const checkEmail = async (email) => {
  try {
    const response = await apiClient.post(ENDPOINTS.AUTH.CHECK_EMAIL, { email });
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Send OTP to email
 * @param {string} email - Email to send OTP to
 * @returns {Promise<Object>} Response data
 */
export const sendOTP = async (email) => {
  try {
    const response = await apiClient.post(ENDPOINTS.AUTH.SEND_OTP, { email });
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Verify OTP
 * @param {string} email - Email associated with OTP
 * @param {string} otp - OTP to verify
 * @returns {Promise<Object>} Response data with tokens and user info
 */
export const verifyOTP = async (email, otp) => {
  try {
    const response = await apiClient.post(ENDPOINTS.AUTH.VERIFY_OTP, { email, otp });
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Register a new user
 * @param {Object} userData - User data for registration
 * @returns {Promise<Object>} Response data with tokens and user info
 */
export const registerUser = async (userData) => {
  try {
    const response = await apiClient.post(ENDPOINTS.AUTH.REGISTER, userData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Get user profile
 * @returns {Promise<Object>} Response data with user info
 */
export const getUserProfile = async () => {
  try {
    const response = await apiClient.get(ENDPOINTS.AUTH.PROFILE);
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Update user profile
 * @param {Object} userData - User data to update
 * @returns {Promise<Object>} Response data with updated user info
 */
export const updateUserProfile = async (userData) => {
  try {
    const response = await apiClient.put(ENDPOINTS.AUTH.PROFILE, userData);
    return response.data.user;
  } catch (error) {
    throw error;
  }
};

/**
 * Authenticate with Google
 * @param {string} token - Google auth token
 * @returns {Promise<Object>} Response data with tokens and user info
 */
export const googleAuth = async (token) => {
  try {
    const response = await apiClient.post(ENDPOINTS.AUTH.GOOGLE_AUTH, { token });
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Authenticate with Apple
 * @param {string} token - Apple auth token
 * @returns {Promise<Object>} Response data with tokens and user info
 */
export const appleAuth = async (token) => {
  try {
    const response = await apiClient.post(ENDPOINTS.AUTH.APPLE_AUTH, { token });
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Refresh authentication token
 * @param {string} refreshToken - Refresh token
 * @returns {Promise<Object>} Response data with new tokens
 */
export const refreshAuthToken = async (refreshToken) => {
  try {
    const response = await apiClient.post(ENDPOINTS.AUTH.REFRESH_TOKEN, { refreshToken });
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Logout user
 * @returns {Promise<Object>} Response data
 */
export const logout = async () => {
  try {
    const response = await apiClient.post(ENDPOINTS.AUTH.LOGOUT);
    return response.data;
  } catch (error) {
    throw error;
  }
};
