import AsyncStorage from "@react-native-async-storage/async-storage";
import { api } from "../../../shared/services/api";
import {
  setLoading,
  setError,
  setUser,
  setEmailVerificationSent,
  logout,
} from "./authSlice";

// Import auth utilities for consistent token handling
import {
  saveAuthData,
  getAuthToken,
  getRefreshToken,
  clearAuthData,
  getUser,
} from "../../../shared/utils/authUtils";

// Token storage keys - using the same keys as authUtils.js
const ACCESS_TOKEN_KEY = "accessToken";
const REFRESH_TOKEN_KEY = "refreshToken";
const USER_KEY = "user";

// Token refresh status
let isRefreshingToken = false;
let refreshPromise = null;

// Logout status to prevent multiple simultaneous logouts
let isLoggingOut = false;

// Helper to store JWT token
const storeToken = async (
  accessToken,
  refreshToken = null,
  userData = null
) => {
  try {
    // If we only have access token, just store that
    if (!refreshToken && !userData) {
      await AsyncStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
      console.log("Stored access token only");
      return;
    }

    // Otherwise use the saveAuthData utility for consistent storage
    await saveAuthData({
      accessToken,
      refreshToken: refreshToken || "",
      user: userData || {},
    });
    console.log("Stored complete auth data");
  } catch (error) {
    console.error("Error storing token:", error);
  }
};

// Helper to get JWT token
const getToken = async () => {
  try {
    return await getAuthToken();
  } catch (error) {
    console.error("Error getting token:", error);
    return null;
  }
};

// Helper to remove JWT token
const removeToken = async () => {
  try {
    await clearAuthData();
  } catch (error) {
    console.error("Error removing token:", error);
  }
};

// Check if email exists
export const checkEmail = (email) => async (dispatch) => {
  try {
    dispatch(setLoading(true));

    // Call the backend API to check if email exists
    const response = await api.auth.checkEmail(email);

    console.log("Email check response:", response);

    // Check if the response has data property (nested structure)
    const exists =
      response.data && response.data.exists !== undefined
        ? response.data.exists
        : response.exists === true;

    console.log("User exists status from API:", exists);

    return {
      exists: exists,
      message:
        response.message || (response.data && response.data.message) || null,
    };
  } catch (error) {
    console.error("Error checking email:", error);
    dispatch(setError(error.message));
    return { exists: false, error: error.message };
  } finally {
    dispatch(setLoading(false));
  }
};

// Send OTP to email
export const sendOTP = (email) => async (dispatch) => {
  try {
    dispatch(setLoading(true));

    // Call the backend API to send OTP
    const response = await api.auth.sendOTP(email);

    console.log("OTP send response:", response);

    // Check if the response has data property (nested structure)
    const userExists =
      response.data && response.data.userExists !== undefined
        ? response.data.userExists === true
        : response.userExists === true;

    console.log("User exists status from OTP send:", userExists);

    dispatch(setEmailVerificationSent(true));
    return {
      success: true,
      userExists: userExists,
    };
  } catch (error) {
    console.error("Error sending OTP:", error);
    dispatch(setError(error.message));
    return { success: false, error: error.message };
  } finally {
    dispatch(setLoading(false));
  }
};

// Verify OTP
export const verifyOTP = (email, otp) => async (dispatch) => {
  try {
    dispatch(setLoading(true));

    // Call the backend API to verify OTP
    const response = await api.auth.verifyOTP(email, otp);

    console.log("OTP verification API response:", response);

    // Check if the response has data property (nested structure)
    const userData =
      response.data && response.data.user ? response.data.user : response.user;

    // Extract tokens - backend sends accessToken and refreshToken
    const accessToken =
      response.data && response.data.accessToken
        ? response.data.accessToken
        : response.accessToken;

    const refreshToken =
      response.data && response.data.refreshToken
        ? response.data.refreshToken
        : response.refreshToken;

    console.log("Extracted user data:", userData);
    console.log("Access token exists:", !!accessToken);
    console.log("Refresh token exists:", !!refreshToken);

    // Store the complete auth data if provided
    if (accessToken) {
      console.log("Storing auth data");
      try {
        // Store the complete auth data
        await storeToken(accessToken, refreshToken, userData);
        console.log("Auth data stored successfully");

        // Verify token was stored
        const storedToken = await getAuthToken();
        console.log("Token verification after storage:", !!storedToken);

        // Also verify user data was stored if available
        if (userData) {
          const storedUser = await getUser();
          console.log("User data stored:", !!storedUser);
        }
      } catch (tokenError) {
        console.error("Error storing auth data:", tokenError);
      }
    } else {
      console.error("No access token received from server");
    }

    // If user data is provided, set the user in the Redux store
    if (userData) {
      console.log("Setting user in Redux store:", userData);

      // Dispatch the setUser action to update the Redux store
      // This will set isAuthenticated to true
      dispatch(setUser(userData));

      // Log the current auth state
      console.log("User set in Redux store, user should be authenticated now");

      return {
        success: true,
        user: userData,
        requiresRegistration: false, // User exists, no registration needed
      };
    }

    // If registration is required, return that info
    // This is explicitly set by the backend when a user doesn't exist
    if (
      response.requiresRegistration === true ||
      (response.data && response.data.requiresRegistration === true)
    ) {
      console.log("User requires registration");
      return {
        success: true,
        requiresRegistration: true,
      };
    }

    // Default case - we don't know if registration is required
    // The UI will use the userExists flag from the email check
    console.log("No user data or registration info in response");
    return { success: true };
  } catch (error) {
    console.error("Error verifying OTP:", error);
    dispatch(setError(error.message));
    return { success: false, error: error.message };
  } finally {
    dispatch(setLoading(false));
  }
};

// Register new user
export const registerUser = (userData) => async (dispatch) => {
  try {
    console.log("registerUser called with data:", JSON.stringify(userData));
    dispatch(setLoading(true));

    // Validate userData
    if (!userData || !userData.email || !userData.username) {
      console.error("Missing required fields for registration:", userData);
      throw new Error("Email and username are required for registration");
    }

    // Log the userData object properties
    console.log("Registration data properties:");
    for (const key in userData) {
      console.log(`- ${key}: ${userData[key]}`);
    }

    // Call the backend API to register user
    console.log("Calling register API with data:", JSON.stringify(userData));

    let response;
    try {
      response = await api.auth.register(userData);
      console.log("Register API response:", response);
    } catch (apiError) {
      console.error("API error during registration:", apiError);

      // Extract the specific error message and throw it
      const errorMessage = apiError.message || "Registration failed";
      console.error("Extracted error message:", errorMessage);

      // Dispatch the specific error message
      dispatch(setError(errorMessage));
      return { success: false, error: errorMessage };
    }

    // Extract tokens and user data
    const accessToken =
      response.accessToken || (response.data && response.data.accessToken);
    const refreshToken =
      response.refreshToken || (response.data && response.data.refreshToken);
    const userDataResponse =
      response.user || (response.data && response.data.user);

    console.log("Extracted from response:", {
      hasAccessToken: !!accessToken,
      hasRefreshToken: !!refreshToken,
      hasUserData: !!userDataResponse,
    });

    // If we don't have tokens or user data, throw an error
    if (!accessToken || !userDataResponse) {
      console.error("Invalid response format:", response);
      const errorMessage = "Invalid response from server";
      dispatch(setError(errorMessage));
      return { success: false, error: errorMessage };
    }

    // Store the complete auth data
    if (accessToken) {
      await storeToken(accessToken, refreshToken, userDataResponse);
      console.log("Auth data stored during registration");
    }

    // Set the user in the Redux store and mark as authenticated
    if (userDataResponse) {
      dispatch(setUser(userDataResponse));
      console.log("User set in Redux store:", userDataResponse);
    } else {
      console.error("No user data in response");
    }

    return { success: true, user: userDataResponse };
  } catch (error) {
    console.error("Error during registration:", error);

    // Extract the specific error message
    const errorMessage = error.message || "Registration failed";
    console.error("Final error message:", errorMessage);

    dispatch(setError(errorMessage));
    return { success: false, error: errorMessage };
  } finally {
    dispatch(setLoading(false));
  }
};

// Get user profile
export const getUserProfile = () => async (dispatch) => {
  try {
    dispatch(setLoading(true));

    const token = await getToken();

    if (!token) {
      console.log("No token found in getUserProfile");
      dispatch(logout());
      return { success: false, error: "No authentication token found" };
    }

    console.log(
      "Fetching profile with token:",
      token ? "Token exists" : "No token"
    );

    // Call the backend API to get user profile
    const response = await api.auth.getProfile(token);

    console.log("Profile response:", response);

    // Check if we have a valid user object
    // The response might be nested in a data property
    const userData = response.user || (response.data && response.data.user);

    if (!userData || !userData.id) {
      console.error("Invalid user data received:", response);
      throw new Error("Invalid user data received from server");
    }

    // Use the extracted user data
    const user = userData;

    console.log("Setting user in Redux store:", user);
    dispatch(setUser(user));
    return { success: true, user: user };
  } catch (error) {
    console.log("Profile fetch error:", error.message);

    // Handle token errors - but only if we're not already logged out
    if (
      error.message.includes("Invalid or expired token") ||
      error.message.includes("Unauthorized") ||
      error.message.includes("401") ||
      error.message.includes("User ID is required") ||
      error.message.includes("User not found") ||
      error.message.includes("Invalid user ID format") ||
      error.message.includes("Request timed out")
    ) {
      // Check if we're already logged out or logging out to prevent loops
      const currentToken = await getToken();
      if (currentToken && !isLoggingOut) {
        isLoggingOut = true;
        console.log("Auth error detected, logging out:", error.message);
        try {
          await removeToken();
          dispatch(logout());
          dispatch(setError("Your session has expired. Please log in again."));
        } catch (logoutError) {
          console.error("Error during logout:", logoutError);
        } finally {
          isLoggingOut = false;
        }
      } else {
        console.log("Already logged out or logging out, skipping logout action");
      }
    } else {
      dispatch(setError(error.message));
    }

    return { success: false, error: error.message };
  } finally {
    dispatch(setLoading(false));
  }
};

// Google authentication
export const googleAuth = (token) => async (dispatch) => {
  try {
    dispatch(setLoading(true));

    // Call the backend API for Google authentication
    const response = await api.auth.googleAuth(token);
    console.log("Google auth API response:", response);

    // Extract tokens and user data - handle both direct response and nested data
    const accessToken = response.accessToken || response.data?.accessToken;
    const refreshToken = response.refreshToken || response.data?.refreshToken;
    const userData = response.user || response.data?.user;

    console.log("Extracted auth data:", {
      hasAccessToken: !!accessToken,
      hasRefreshToken: !!refreshToken,
      userData
    });

    // Store the complete auth data
    if (accessToken && userData) {
      await storeToken(accessToken, refreshToken, userData);
      console.log("✅ Auth data stored during Google authentication");

      // Update Redux state with user data
      dispatch(setUser(userData));
      console.log("✅ User data set in Redux store");

      return { success: true, user: userData };
    } else {
      console.error("❌ Missing auth data in response");
      dispatch(setError("Authentication failed - missing user data"));
      return { success: false, error: "Authentication failed - missing user data" };
    }
  } catch (error) {
    console.error("❌ Google auth error:", error);
    dispatch(setError(error.message));
    return { success: false, error: error.message };
  } finally {
    dispatch(setLoading(false));
  }
};

// Apple authentication
export const appleAuth = (token) => async (dispatch) => {
  try {
    dispatch(setLoading(true));

    // Call the backend API for Apple authentication
    const response = await api.auth.appleAuth(token);

    // Extract tokens and user data
    const accessToken =
      response.accessToken || (response.data && response.data.accessToken);
    const refreshToken =
      response.refreshToken || (response.data && response.data.refreshToken);
    const userData = response.user || (response.data && response.data.user);

    // Store the complete auth data
    if (accessToken) {
      await storeToken(accessToken, refreshToken, userData);
      console.log("Auth data stored during Apple authentication");
    }

    dispatch(setUser(response.user));
    return { success: true };
  } catch (error) {
    dispatch(setError(error.message));
    return { success: false, error: error.message };
  } finally {
    dispatch(setLoading(false));
  }
};

// Refresh token
export const refreshToken = () => async (dispatch) => {
  // If we're already refreshing, return the existing promise
  if (isRefreshingToken && refreshPromise) {
    return refreshPromise;
  }

  // Set refreshing flag
  isRefreshingToken = true;

  // Create a new promise for the refresh operation
  refreshPromise = new Promise(async (resolve) => {
    try {
      dispatch(setLoading(true));

      // Get the refresh token
      const refreshTokenValue = await getRefreshToken();

      if (!refreshTokenValue) {
        console.log("No refresh token found");
        dispatch(logout());
        resolve({ success: false, error: "No refresh token found" });
        return;
      }

      // Call the refresh token API
      const response = await api.auth.refreshToken(refreshTokenValue);

      // Extract tokens and user data
      const accessToken =
        response.accessToken || (response.data && response.data.accessToken);
      const newRefreshToken =
        response.refreshToken || (response.data && response.data.refreshToken);
      const userData = response.user || (response.data && response.data.user);

      if (!accessToken) {
        console.error("No access token received from refresh token request");
        dispatch(logout());
        resolve({ success: false, error: "Token refresh failed" });
        return;
      }

      // Store the new tokens
      await storeToken(
        accessToken,
        newRefreshToken || refreshTokenValue,
        userData
      );
      console.log("Tokens refreshed successfully");

      // Update user in Redux store if provided
      if (userData) {
        dispatch(setUser(userData));
      }

      resolve({ success: true, accessToken });
    } catch (error) {
      console.error("Error refreshing token:", error);

      // Clear auth data and log out on refresh error (only if not already logging out)
      if (!isLoggingOut) {
        isLoggingOut = true;
        try {
          await removeToken();
          dispatch(logout());
          dispatch(setError("Your session has expired. Please log in again."));
        } finally {
          isLoggingOut = false;
        }
      }

      resolve({ success: false, error: error.message });
    } finally {
      dispatch(setLoading(false));
      isRefreshingToken = false;
      refreshPromise = null;
    }
  });

  return refreshPromise;
};

// Sign out
export const signOut = () => async (dispatch) => {
  try {
    dispatch(setLoading(true));

    const token = await getToken();

    if (token) {
      // Call the backend API to logout
      await api.auth.logout(token);
    }

    // Remove the token
    await removeToken();

    dispatch(logout());
    return { success: true };
  } catch (error) {
    // Even if the API call fails, we still want to log out locally
    await removeToken();
    dispatch(logout());
    dispatch(setError(error.message));
    return { success: true };
  } finally {
    dispatch(setLoading(false));
  }
};
