import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  checkEmail,
  sendOTP,
  verifyOTP,
  registerUser,
  signOut,
  getUserProfile,
  googleAuth,
  appleAuth,
  refreshToken,
} from "../services/authService";
import { logout, setUser } from "../services/authSlice";

export const useAuth = () => {
  const dispatch = useDispatch();
  const { user, isAuthenticated, isLoading, error, emailVerificationSent } =
    useSelector((state) => state.auth);
  const [isInitialized, setIsInitialized] = useState(false);
  const [initializationError, setInitializationError] = useState(null);

  // Track auth initialization attempts to prevent infinite loops
  const [authAttempted, setAuthAttempted] = useState(false);

  // Check if user is authenticated on mount - only once
  useEffect(() => {
    let isMounted = true;

    const initAuth = async () => {
      // Skip if already initialized, currently loading, or already attempted
      if (isInitialized || isLoading || authAttempted) return;

      // Mark that we've attempted authentication
      setAuthAttempted(true);

      try {
        console.log("Initializing auth state...");

        // Set a timeout to ensure we don't get stuck
        const timeoutId = setTimeout(() => {
          if (isMounted && !isInitialized) {
            console.log("Auth initialization timed out, proceeding anyway");
            setIsInitialized(true);

            // If we timed out, we should clear any existing token to be safe
            try {
              // Clear all auth data
              AsyncStorage.removeItem("accessToken");
              AsyncStorage.removeItem("refreshToken");
              AsyncStorage.removeItem("user");
              dispatch(logout());
            } catch (error) {
              console.error("Error clearing token after timeout:", error);
            }
          }
        }, 10000); // 10 second timeout

        // Try to get the user profile only if we have a token
        // Use the consistent token key from authUtils
        const token = await AsyncStorage.getItem("accessToken");
        console.log("Auth token exists:", !!token);

        if (token && !isAuthenticated) {
          console.log("Token found, fetching user profile");
          const result = await dispatch(getUserProfile());
          console.log("User profile result:", result);

          // If we get an error, clear auth data immediately (simplified approach)
          if (result.error) {
            console.log("Profile fetch failed, clearing auth data:", result.error);
            // Clear all auth data immediately to prevent loops
            await AsyncStorage.removeItem("accessToken");
            await AsyncStorage.removeItem("refreshToken");
            await AsyncStorage.removeItem("user");
            dispatch(logout());
          }
        } else if (!token) {
          console.log("No token found, logging out");
          // No token, so we're not authenticated
          // Dispatch the logout action from the slice
          dispatch(logout());
        } else if (token && isAuthenticated) {
          console.log("Already authenticated with token");
        }

        // Clear the timeout if we succeeded
        clearTimeout(timeoutId);

        // Mark as initialized if component is still mounted
        if (isMounted) {
          console.log("Auth initialization complete");
          setIsInitialized(true);
        }
      } catch (error) {
        console.error("Error initializing auth:", error);
        if (isMounted) {
          setInitializationError(error.message || String(error));
          setIsInitialized(true); // Still mark as initialized so we don't get stuck

          // If there's an auth error, make sure we're logged out
          // Use the logout action from the slice
          try {
            console.log("Error during auth initialization, logging out");
            // Clear all auth data
            await AsyncStorage.removeItem("accessToken");
            await AsyncStorage.removeItem("refreshToken");
            await AsyncStorage.removeItem("user");
            dispatch(logout());
          } catch (logoutError) {
            console.error("Error during logout:", logoutError);
          }
        }
      }
    };

    initAuth();

    // Cleanup function
    return () => {
      isMounted = false;
    };
  }, []);

  const handleCheckEmail = async (email) => {
    return dispatch(checkEmail(email));
  };

  const handleSendOTP = async (email) => {
    return dispatch(sendOTP(email));
  };

  const handleVerifyOTP = async (email, otp) => {
    return dispatch(verifyOTP(email, otp));
  };

  const handleRegister = async (userData) => {
    return dispatch(registerUser(userData));
  };

  const handleGetProfile = async () => {
    return dispatch(getUserProfile());
  };

  const handleSignOut = async () => {
    return dispatch(signOut());
  };

  const handleGoogleAuth = async (token) => {
    return dispatch(googleAuth(token));
  };

  const handleAppleAuth = async (token) => {
    return dispatch(appleAuth(token));
  };

  const handleRefreshToken = async () => {
    return dispatch(refreshToken());
  };

  // Get the current access token
  const getToken = async () => {
    try {
      const token = await AsyncStorage.getItem("accessToken");
      return token;
    } catch (error) {
      console.error("Error getting token:", error);
      return null;
    }
  };

  // Update user data in the store
  const updateUser = (userData) => {
    dispatch(setUser(userData));
  };

  return {
    user,
    isAuthenticated,
    isLoading: isLoading || !isInitialized,
    error: error || initializationError,
    emailVerificationSent,
    isInitialized,
    initializationError,
    checkEmail: handleCheckEmail,
    sendOTP: handleSendOTP,
    verifyOTP: handleVerifyOTP,
    register: handleRegister,
    getProfile: handleGetProfile,
    signOut: handleSignOut,
    googleAuth: handleGoogleAuth,
    appleAuth: handleAppleAuth,
    refreshToken: handleRefreshToken,
    getToken,
    updateUser, // Add the updateUser function
  };
};
