import * as authService from "../services/authService.js";
import { sendSuccess, sendError } from "../utils/responseUtils.js";

/**
 * Check if email exists
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const checkEmail = async (req, res) => {
  try {
    const { email } = req.body;
    const result = await authService.checkEmail(email);

    if (result.error) {
      return sendError(res, 400, result.error);
    }

    return sendSuccess(res, 200, "Email check successful", {
      exists: result.exists,
    });
  } catch (error) {
    console.error("Controller error checking email:", error);
    return sendError(res, 500, "Server error");
  }
};

/**
 * Send OTP to email
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const sendOTP = async (req, res) => {
  try {
    const { email } = req.body;
    const result = await authService.sendOTP(email);

    if (result.error) {
      return sendError(res, 400, result.error);
    }

    return sendSuccess(res, 200, "OTP sent successfully", {
      userExists: result.userExists,
    });
  } catch (error) {
    console.error("Controller error sending OTP:", error);
    return sendError(res, 500, "Server error");
  }
};

/**
 * Verify OTP
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;
    const result = await authService.verifyOTP(email, otp);

    if (result.error) {
      return sendError(res, 400, result.error);
    }

    if (result.requiresRegistration) {
      return sendSuccess(
        res,
        200,
        "OTP verified successfully, user registration required",
        { requiresRegistration: true }
      );
    }

    return sendSuccess(res, 200, "OTP verified successfully", {
      accessToken: result.accessToken,
      refreshToken: result.refreshToken,
      user: result.user,
    });
  } catch (error) {
    console.error("Controller error verifying OTP:", error);
    return sendError(res, 500, "Server error");
  }
};

/**
 * Register new user
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const register = async (req, res) => {
  try {
   

    // Check if we have query parameters that might contain the data
    if (req.query && Object.keys(req.query).length > 0) {

      // If we have email and username in query, use those
      if (req.query.email && req.query.username) {
        req.body = {
          email: req.query.email,
          username: req.query.username,
          firstName: req.query.firstName || "",
          lastName: req.query.lastName || "",
          displayName: req.query.displayName || "",
        };
      }
    }

    // Check if req.body exists and is not empty
    if (!req.body || Object.keys(req.body).length === 0) {
      return sendError(
        res,
        400,
        "Request body is missing or empty. Please provide registration details including email and username."
      );
    }

    // Extract all fields from request body
    const { email, username, displayName, firstName, lastName } = req.body;

   

    // Validate required fields
    if (!email || !username) {
      console.error("Missing required fields:", { email, username });
      return sendError(res, 400, "Email and username are required");
    }

    // Pass all fields to the service
    const result = await authService.registerUser({
      email,
      username,
      displayName,
      firstName,
      lastName,
    });

    if (result.error) {
      console.error("Registration error:", result.error);
      return sendError(res, 400, result.error);
    }

    return sendSuccess(res, 201, "User registered successfully", {
      accessToken: result.accessToken,
      refreshToken: result.refreshToken,
      user: result.user,
    });
  } catch (error) {
    console.error("Controller error registering user:", error);
    return sendError(res, 500, "Server error");
  }
};

/**
 * Refresh access token using refresh token
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const refreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;
    const result = await authService.refreshToken(refreshToken);

    if (result.error) {
      return sendError(res, 401, result.error);
    }

    return sendSuccess(res, 200, "Token refreshed successfully", {
      accessToken: result.accessToken,
      user: result.user,
    });
  } catch (error) {
    console.error("Controller error refreshing token:", error);
    return sendError(res, 500, "Server error");
  }
};

/**
 * Get user profile
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const getProfile = async (req, res) => {
  try {
    // Use the user ID from the authenticated request
    const userId = req.user.id;

    if (!userId) {
      return sendError(res, 400, "User ID is missing from request");
    }

    const result = await authService.getUserProfile(userId);

    if (result.error) {
      return sendError(res, 400, result.error);
    }

    return sendSuccess(res, 200, "Profile retrieved successfully", {
      user: result.user,
    });
  } catch (error) {
    console.error("Controller error getting profile:", error);
    return sendError(res, 500, "Server error");
  }
};

/**
 * Update user profile
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const profileData = req.body;

    // Remove sensitive fields that shouldn't be updated directly
    const { email, password, role, ...safeProfileData } = profileData;

    const result = await authService.updateUserProfile(userId, safeProfileData);

    if (result.error) {
      return sendError(res, 400, result.error);
    }

    return sendSuccess(res, 200, "Profile updated successfully", {
      user: result.user,
    });
  } catch (error) {
    console.error("Controller error updating profile:", error);
    return sendError(res, 500, "Server error");
  }
};

/**
 * Logout user
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const logout = async (req, res) => {
  try {
    const userId = req.user.id;

    // Invalidate refresh tokens
    await authService.invalidateUserTokens(userId);

    return sendSuccess(res, 200, "Logged out successfully");
  } catch (error) {
    console.error("Controller error logging out:", error);
    return sendError(res, 500, "Server error");
  }
};

/**
 * Get all users (admin only)
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const getAllUsers = async (req, res) => {
  try {
    const { page = 1, limit = 10, search } = req.query;

    const result = await authService.getAllUsers({
      page: parseInt(page, 10),
      limit: parseInt(limit, 10),
      search,
    });

    if (result.error) {
      return sendError(res, 400, result.error);
    }

    return sendSuccess(res, 200, "Users retrieved successfully", {
      users: result.users,
      pagination: result.pagination,
    });
  } catch (error) {
    console.error("Controller error getting all users:", error);
    return sendError(res, 500, "Server error");
  }
};

/**
 * Authenticate with Google
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const googleAuth = async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return sendError(res, 400, "Google token is required");
    }

    const result = await authService.authenticateWithGoogle(token);

    if (result.error) {
      return sendError(res, 400, result.error);
    }

    return sendSuccess(res, 200, "Google authentication successful", {
      accessToken: result.accessToken,
      refreshToken: result.refreshToken,
      user: result.user,
    });
  } catch (error) {
    console.error("Controller error with Google auth:", error);
    return sendError(res, 500, "Server error");
  }
};

/**
 * Authenticate with Apple
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const appleAuth = async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return sendError(res, 400, "Apple token is required");
    }

    const result = await authService.authenticateWithApple(token);

    if (result.error) {
      return sendError(res, 400, result.error);
    }

    return sendSuccess(res, 200, "Apple authentication successful", {
      accessToken: result.accessToken,
      refreshToken: result.refreshToken,
      user: result.user,
    });
  } catch (error) {
    console.error("Controller error with Apple auth:", error);
    return sendError(res, 500, "Server error");
  }
};
