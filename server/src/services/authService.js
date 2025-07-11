import mongoose from "mongoose";
import userModel, {
  UserRole,
  UserStatus,
  AuthProvider,
} from "../models/User.js";
import otpModel from "../models/OTP.js";
import RefreshToken, { TokenStatus } from "../models/RefreshToken.js";
import {
  generateOTP,
  generateToken,
  generateTokenPair,
  verifyToken,
  TokenType,
} from "../utils/authUtils.js";
import { sendOTPEmail } from "../utils/emailUtils.js";
import {
  verifyGoogleToken,
  verifyAppleToken,
} from "../utils/socialAuthUtils.js";
import {
  isValidEmail,
  isValidUsername,
  isValidOTP,
} from "../utils/validationUtils.js";
import config from "../config/index.js";
import { initializeNewUser } from "./userInitializationService.js";

/**
 * Check if an email exists
 * @param {string} email - Email to check
 * @returns {Promise<Object>} Result with exists flag and error if any
 */
export const checkEmail = async (email) => {
  try {
    if (!email) {
      return { error: "Email is required" };
    }

    if (!isValidEmail(email)) {
      return { error: "Invalid email format" };
    }

    const user = await userModel.findOne({ email });
    console.log(`Email check for ${email}: User exists = ${!!user}`);
    return {
      exists: !!user,
      message: user
        ? "User with this email already exists"
        : "Email is available for registration",
    };
  } catch (error) {
    console.error("Error checking email:", error);
    return { error: "Server error" };
  }
};

/**
 * Send OTP to an email
 * @param {string} email - Email to send OTP to
 * @returns {Object} Result with success flag and error if any
 */
export const sendOTP = async (email) => {
  try {
    if (!email) {
      return { error: "Email is required" };
    }

    if (!isValidEmail(email)) {
      return { error: "Invalid email format" };
    }

    // Check if user exists (for logging purposes only)
    const user = await userModel.findOne({ email });
    console.log(`Sending OTP to ${email}: User exists = ${!!user}`);

    // Generate OTP
    const otp = generateOTP();

    // Store OTP
    await otpModel.create(email, otp);

    // Send OTP via email
    const emailSent = await sendOTPEmail(email, otp);

    if (!emailSent) {
      return { error: "Failed to send OTP" };
    }

    return {
      success: true,
      userExists: !!user,
    };
  } catch (error) {
    console.error("Error sending OTP:", error);
    return { error: "Server error" };
  }
};

/**
 * Verify OTP
 * @param {string} email - User email
 * @param {string} otp - OTP to verify
 * @param {Object} metadata - Additional metadata for token generation
 * @returns {Promise<Object>} Result with success flag, tokens, user data, and error if any
 */
export const verifyOTP = async (email, otp, metadata = {}) => {
  try {
    if (!email || !otp) {
      return { error: "Email and OTP are required" };
    }

    if (!isValidEmail(email)) {
      return { error: "Invalid email format" };
    }

    if (!isValidOTP(otp)) {
      return { error: "Invalid OTP format" };
    }

    // Special case for testing/development - "123456" is always valid
    let isValid = false;
    if (otp === "123456" && config.nodeEnv === "development") {
      isValid = true;
      console.log("Using development OTP bypass");
    } else {
      // Verify OTP
      isValid = await otpModel.verify(email, otp);
    }

    if (!isValid) {
      return { error: "Invalid or expired OTP" };
    }

    // Clear OTP
    await otpModel.delete(email);

    // Check if user exists
    const user = await userModel.findOne({ email });

    if (user) {
      // Convert MongoDB ObjectId to string for consistency
      const userId = user._id.toString();

      // Update last login timestamp
      await user.updateLastLogin();

      // Generate token pair (access and refresh tokens)
      const { accessToken, refreshToken } = generateTokenPair({
        id: userId,
        email: user.email,
        role: user.role || UserRole.USER,
      });

      // Calculate refresh token expiry date
      const refreshExpiresIn = config.jwt.refreshExpiresIn || "30d";
      const refreshExpiryMs = refreshExpiresIn.endsWith("d")
        ? parseInt(refreshExpiresIn.slice(0, -1)) * 24 * 60 * 60 * 1000
        : refreshExpiresIn.endsWith("h")
        ? parseInt(refreshExpiresIn.slice(0, -1)) * 60 * 60 * 1000
        : 30 * 24 * 60 * 60 * 1000; // Default to 30 days

      const refreshExpiresAt = new Date(Date.now() + refreshExpiryMs);

      // Store refresh token in database
      await new RefreshToken({
        token: refreshToken,
        userId: user._id,
        expiresAt: refreshExpiresAt,
        status: TokenStatus.ACTIVE,
        device: metadata.device || "unknown",
        ip: metadata.ip || "",
        userAgent: metadata.userAgent || "",
      }).save();

      return {
        success: true,
        accessToken,
        refreshToken,
        user: {
          id: userId,
          email: user.email,
          username: user.username,
          displayName: user.displayName,
          role: user.role || UserRole.USER,
        },
      };
    } else {
      // User doesn't exist, but OTP is verified
      return {
        success: true,
        requiresRegistration: true,
      };
    }
  } catch (error) {
    console.error("Error verifying OTP:", error);
    return { error: "Server error" };
  }
};

/**
 * Register a new user
 * @param {Object} userData - User data
 * @param {Object} metadata - Additional metadata for token generation
 * @returns {Promise<Object>} Result with success flag, tokens, user data, and error if any
 */
export const registerUser = async (userData, metadata = {}) => {
  try {
    // Extract user data with fallbacks
    const { email, username, displayName, firstName, lastName } =
      userData || {};

    // Log the received data for debugging
    console.log("Registration data received:", {
      email,
      username,
      displayName,
      firstName,
      lastName,
    });

    // Validate required fields
    if (!email || !username) {
      return { error: "Email and username are required" };
    }

    if (!isValidEmail(email)) {
      return { error: "Invalid email format" };
    }

    if (!isValidUsername(username)) {
      return {
        error:
          "Username must be 3-20 characters and contain only letters, numbers, underscores, and hyphens",
      };
    }

    // Check if user already exists
    const existingUserByEmail = await userModel.findOne({ email });
    if (existingUserByEmail) {
      return { error: "User with this email already exists" };
    }

    // Check if username is taken
    const existingUserByUsername = await userModel.findOne({ username });
    if (existingUserByUsername) {
      return { error: "Username is already taken" };
    }

    // Generate display name from firstName and lastName if provided
    let userDisplayName = displayName;
    if (!userDisplayName && (firstName || lastName)) {
      userDisplayName = [firstName, lastName].filter(Boolean).join(" ");
    }

    // Create new user
    const newUser = await userModel.create({
      email,
      username,
      displayName: userDisplayName || username,
      firstName,
      lastName,
      isVerified: true, // User is verified since they completed OTP verification
      authProvider: AuthProvider.EMAIL,
      status: UserStatus.ACTIVE,
      lastLogin: new Date(),
    });

    // Convert MongoDB ObjectId to string for consistency
    const userId = newUser._id.toString();

    // Generate token pair (access and refresh tokens)
    const { accessToken, refreshToken } = generateTokenPair({
      id: userId,
      email: newUser.email,
      role: newUser.role || UserRole.USER,
    });

    // Calculate refresh token expiry date
    const refreshExpiresIn = config.jwt.refreshExpiresIn || "30d";
    const refreshExpiryMs = refreshExpiresIn.endsWith("d")
      ? parseInt(refreshExpiresIn.slice(0, -1)) * 24 * 60 * 60 * 1000
      : refreshExpiresIn.endsWith("h")
      ? parseInt(refreshExpiresIn.slice(0, -1)) * 60 * 60 * 1000
      : 30 * 24 * 60 * 60 * 1000; // Default to 30 days

    const refreshExpiresAt = new Date(Date.now() + refreshExpiryMs);

    // Store refresh token in database
    await new RefreshToken({
      token: refreshToken,
      userId: newUser._id,
      expiresAt: refreshExpiresAt,
      status: TokenStatus.ACTIVE,
      device: metadata.device || "unknown",
      ip: metadata.ip || "",
      userAgent: metadata.userAgent || "",
    }).save();

    // Initialize user with achievement tracking and progress
    console.log(`🔧 Initializing new user: ${userId}`);
    try {
      const initResult = await initializeNewUser(userId, {
        languageLevel: userData.languageLevel || "beginner",
        ...userData.preferences,
      });

      if (initResult.success) {
        console.log(`✅ User initialization completed for: ${userId}`);
      } else {
        console.warn(
          `⚠️ User initialization failed for ${userId}:`,
          initResult.error
        );
        // Don't fail registration if initialization fails
      }
    } catch (initError) {
      console.error(`❌ User initialization error for ${userId}:`, initError);
      // Don't fail registration if initialization fails
    }

    return {
      success: true,
      accessToken,
      refreshToken,
      user: {
        id: userId,
        email: newUser.email,
        username: newUser.username,
        displayName: newUser.displayName,
        firstName: newUser.firstName || "",
        lastName: newUser.lastName || "",
        role: newUser.role || UserRole.USER,
      },
    };
  } catch (error) {
    console.error("Error registering user:", error);
    return { error: "Server error" };
  }
};

/**
 * Refresh access token using refresh token
 * @param {string} refreshTokenString - Refresh token
 * @returns {Promise<Object>} Result with success flag, new access token, and error if any
 */
export const refreshToken = async (refreshTokenString) => {
  try {
    if (!refreshTokenString) {
      return { error: "Refresh token is required" };
    }

    // Find the refresh token in the database
    const tokenDoc = await RefreshToken.findActiveToken(refreshTokenString);

    if (!tokenDoc) {
      return { error: "Invalid or expired refresh token" };
    }

    // Get the user associated with the token
    const user = await userModel.findById(tokenDoc.userId);

    if (!user) {
      // Token exists but user doesn't - this shouldn't happen
      await tokenDoc.revoke("User not found");
      return { error: "User not found" };
    }

    // Check if user is active
    if (user.status !== UserStatus.ACTIVE) {
      await tokenDoc.revoke("User account is not active");
      return { error: "User account is not active" };
    }

    // Generate a new access token
    const accessToken = generateToken(
      {
        id: user._id.toString(),
        email: user.email,
        role: user.role || UserRole.USER,
      },
      TokenType.ACCESS
    );

    // Return the new access token
    return {
      success: true,
      accessToken,
      user: {
        id: user._id.toString(),
        email: user.email,
        username: user.username,
        displayName: user.displayName,
        role: user.role || UserRole.USER,
      },
    };
  } catch (error) {
    console.error("Error refreshing token:", error);
    return { error: "Server error" };
  }
};

/**
 * Invalidate all refresh tokens for a user
 * @param {string} userId - User ID
 * @returns {Promise<Object>} Result with success flag and error if any
 */
export const invalidateUserTokens = async (userId) => {
  try {
    if (!userId) {
      return { error: "User ID is required" };
    }

    // Check if userId is a valid MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return { error: "Invalid user ID format" };
    }

    // Revoke all refresh tokens for the user
    const count = await RefreshToken.revokeAllForUser(userId, "User logout");

    return {
      success: true,
      message: `${count} tokens invalidated`,
    };
  } catch (error) {
    console.error("Error invalidating user tokens:", error);
    return { error: "Server error" };
  }
};

/**
 * Get user profile
 * @param {string} userId - User ID
 * @returns {Promise<Object>} Result with success flag, user data, and error if any
 */
export const getUserProfile = async (userId) => {
  try {
    if (!userId) {
      return { error: "User ID is required" };
    }

    // Check if userId is a valid MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return { error: "Invalid user ID format" };
    }

    const user = await userModel.findById(userId);

    if (!user) {
      return { error: "User not found" };
    }

    return {
      success: true,
      user: {
        id: user._id.toString(),
        email: user.email,
        username: user.username,
        displayName: user.displayName,
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        profilePicture: user.profilePicture,
        bio: user.bio,
        location: user.location,
        phoneNumber: user.phoneNumber,
        role: user.role || UserRole.USER,
        status: user.status,
        createdAt: user.createdAt,
        lastLogin: user.lastLogin,
        preferences: user.preferences,
        // Include subscription fields
        currentSubscriptionId: user.currentSubscriptionId,
        subscriptionStatus: user.subscriptionStatus,
        subscriptionTier: user.subscriptionTier,
      },
    };
  } catch (error) {
    console.error("Error getting user profile:", error);
    return { error: "Server error" };
  }
};

/**
 * Update user profile
 * @param {string} userId - User ID
 * @param {Object} profileData - Profile data to update
 * @returns {Promise<Object>} Result with success flag, updated user data, and error if any
 */
export const updateUserProfile = async (userId, profileData) => {
  try {
    if (!userId) {
      return { error: "User ID is required" };
    }

    // Check if userId is a valid MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return { error: "Invalid user ID format" };
    }

    // Validate username if provided
    if (profileData.username && !isValidUsername(profileData.username)) {
      return {
        error:
          "Username must be 3-20 characters and contain only letters, numbers, underscores, and hyphens",
      };
    }

    // Check if username is taken if changing username
    if (profileData.username) {
      const existingUser = await userModel.findOne({
        username: profileData.username,
        _id: { $ne: userId }, // Exclude current user
      });

      if (existingUser) {
        return { error: "Username is already taken" };
      }
    }

    // Update user profile
    const updatedUser = await userModel.findByIdAndUpdate(
      userId,
      { $set: profileData },
      { new: true } // Return the updated document
    );

    if (!updatedUser) {
      return { error: "User not found" };
    }

    return {
      success: true,
      user: {
        id: updatedUser._id.toString(),
        email: updatedUser.email,
        username: updatedUser.username,
        displayName: updatedUser.displayName,
        firstName: updatedUser.firstName || "",
        lastName: updatedUser.lastName || "",
        profilePicture: updatedUser.profilePicture,
        bio: updatedUser.bio,
        location: updatedUser.location,
        phoneNumber: updatedUser.phoneNumber,
        role: updatedUser.role || UserRole.USER,
        status: updatedUser.status,
        createdAt: updatedUser.createdAt,
        lastLogin: updatedUser.lastLogin,
        preferences: updatedUser.preferences,
        // Include subscription fields
        currentSubscriptionId: updatedUser.currentSubscriptionId,
        subscriptionStatus: updatedUser.subscriptionStatus,
        subscriptionTier: updatedUser.subscriptionTier,
      },
    };
  } catch (error) {
    console.error("Error updating user profile:", error);
    return { error: "Server error" };
  }
};

/**
 * Get all users (admin only)
 * @param {Object} options - Query options
 * @returns {Promise<Object>} Result with success flag, users data, pagination info, and error if any
 */
export const getAllUsers = async (options = {}) => {
  try {
    const { page = 1, limit = 10, search = "" } = options;

    // Build query
    const query = {};

    // Add search filter if provided
    if (search) {
      query.$or = [
        { username: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { displayName: { $regex: search, $options: "i" } },
      ];
    }

    // Count total documents
    const total = await userModel.countDocuments(query);

    // Calculate pagination
    const totalPages = Math.ceil(total / limit);
    const skip = (page - 1) * limit;

    // Get users
    const users = await userModel
      .find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    // Map users to response format
    const mappedUsers = users.map((user) => ({
      id: user._id.toString(),
      email: user.email,
      username: user.username,
      displayName: user.displayName,
      firstName: user.firstName || "",
      lastName: user.lastName || "",
      profilePicture: user.profilePicture,
      role: user.role || UserRole.USER,
      status: user.status,
      createdAt: user.createdAt,
      lastLogin: user.lastLogin,
    }));

    return {
      success: true,
      users: mappedUsers,
      pagination: {
        total,
        page,
        limit,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    };
  } catch (error) {
    console.error("Error getting all users:", error);
    return { error: "Server error" };
  }
};

/**
 * Authenticate with Google
 * @param {string} token - Google ID token
 * @param {Object} metadata - Additional metadata for token generation
 * @returns {Promise<Object>} Result with success flag, tokens, user data, and error if any
 */
export const authenticateWithGoogle = async (token, metadata = {}) => {
  try {
    if (!token) {
      return { error: "Token is required" };
    }

    // Verify Google token
    const googleUser = await verifyGoogleToken(token);

    if (!googleUser) {
      return { error: "Invalid Google token" };
    }

    // Check if user exists
    let user = await userModel.findOne({ email: googleUser.email });

    if (!user) {
      // Create new user
      const username = googleUser.email.split("@")[0];

      // Check if username is taken
      const existingUsername = await userModel.findOne({ username });
      if (existingUsername) {
        // Generate a unique username
        const uniqueUsername = `${username}${Date.now().toString().slice(-4)}`;

        user = await userModel.create({
          email: googleUser.email,
          username: uniqueUsername,
          displayName: googleUser.name,
          firstName: googleUser.givenName || '',
          lastName: googleUser.familyName || '',
          profilePicture: googleUser.picture,
          authProvider: AuthProvider.GOOGLE,
          authProviderId: googleUser.id,
          isVerified: true,
          status: UserStatus.ACTIVE,
          lastLogin: new Date(),
          subscriptionTier: 'free', // Set default subscription tier for new Google users
        });
      } else {
        user = await userModel.create({
          email: googleUser.email,
          username,
          displayName: googleUser.name,
          firstName: googleUser.givenName || '',
          lastName: googleUser.familyName || '',
          profilePicture: googleUser.picture,
          authProvider: AuthProvider.GOOGLE,
          authProviderId: googleUser.id,
          isVerified: true,
          status: UserStatus.ACTIVE,
          lastLogin: new Date(),
          subscriptionTier: 'free', // Set default subscription tier for new Google users
        });
      }
    } else {
      // Update user with Google info if needed
      if (!user.authProviderId || user.authProvider !== AuthProvider.GOOGLE) {
        // Prepare update data
        const updateData = {
          authProviderId: googleUser.id,
          authProvider:
            user.authProvider === AuthProvider.EMAIL
              ? AuthProvider.GOOGLE
              : user.authProvider,
          lastLogin: new Date(),
        };

        // Fix invalid subscription tier if it exists
        if (user.subscriptionTier && !['free', 'basic', 'standard', 'pro'].includes(user.subscriptionTier)) {
          console.log(`⚠️ Fixing invalid subscription tier for user ${user.email}: ${user.subscriptionTier} -> pro`);
          updateData.subscriptionTier = 'pro'; // Default to 'pro' since they had a paid plan
        }

        await userModel.findByIdAndUpdate(user._id, updateData);
      } else {
        // Update last login and fix subscription tier if needed
        const updateData = { lastLogin: new Date() };

        if (user.subscriptionTier && !['free', 'basic', 'standard', 'pro'].includes(user.subscriptionTier)) {
          console.log(`⚠️ Fixing invalid subscription tier for user ${user.email}: ${user.subscriptionTier} -> pro`);
          updateData.subscriptionTier = 'pro'; // Default to 'pro' since they had a paid plan
        }

        await userModel.findByIdAndUpdate(user._id, updateData);
      }

      // Refresh user data after update
      user = await userModel.findById(user._id);
    }

    // Convert MongoDB ObjectId to string for consistency
    const userId = user._id.toString();

    // Generate token pair (access and refresh tokens)
    const { accessToken, refreshToken } = generateTokenPair({
      id: userId,
      email: user.email,
      role: user.role || UserRole.USER,
    });

    // Calculate refresh token expiry date
    const refreshExpiresIn = config.jwt.refreshExpiresIn || "30d";
    const refreshExpiryMs = refreshExpiresIn.endsWith("d")
      ? parseInt(refreshExpiresIn.slice(0, -1)) * 24 * 60 * 60 * 1000
      : refreshExpiresIn.endsWith("h")
      ? parseInt(refreshExpiresIn.slice(0, -1)) * 60 * 60 * 1000
      : 30 * 24 * 60 * 60 * 1000; // Default to 30 days

    const refreshExpiresAt = new Date(Date.now() + refreshExpiryMs);

    // Store refresh token in database
    await new RefreshToken({
      token: refreshToken,
      userId: user._id,
      expiresAt: refreshExpiresAt,
      status: TokenStatus.ACTIVE,
      device: metadata.device || "unknown",
      ip: metadata.ip || "",
      userAgent: metadata.userAgent || "",
    }).save();

    return {
      success: true,
      accessToken,
      refreshToken,
      user: {
        id: userId,
        email: user.email,
        username: user.username,
        displayName: user.displayName,
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        profilePicture: user.profilePicture || '',
        role: user.role || UserRole.USER,
        authProvider: user.authProvider,
        isVerified: user.isVerified,
        createdAt: user.createdAt,
      },
    };
  } catch (error) {
    console.error("Error authenticating with Google:", error);
    return { error: "Server error" };
  }
};

/**
 * Authenticate with Apple
 * @param {string} token - Apple ID token
 * @param {Object} metadata - Additional metadata for token generation
 * @returns {Promise<Object>} Result with success flag, tokens, user data, and error if any
 */
export const authenticateWithApple = async (token, metadata = {}) => {
  try {
    if (!token) {
      return { error: "Token is required" };
    }

    // Verify Apple token
    const appleUser = await verifyAppleToken(token);

    if (!appleUser) {
      return { error: "Invalid Apple token" };
    }

    // Check if user exists
    let user = await userModel.findOne({ email: appleUser.email });

    if (!user) {
      // Create new user
      const username = appleUser.email.split("@")[0];

      // Check if username is taken
      const existingUsername = await userModel.findOne({ username });
      if (existingUsername) {
        // Generate a unique username
        const uniqueUsername = `${username}${Date.now().toString().slice(-4)}`;

        user = await userModel.create({
          email: appleUser.email,
          username: uniqueUsername,
          displayName: appleUser.name,
          authProvider: AuthProvider.APPLE,
          authProviderId: appleUser.id,
          isVerified: true,
          status: UserStatus.ACTIVE,
          lastLogin: new Date(),
        });
      } else {
        user = await userModel.create({
          email: appleUser.email,
          username,
          displayName: appleUser.name,
          authProvider: AuthProvider.APPLE,
          authProviderId: appleUser.id,
          isVerified: true,
          status: UserStatus.ACTIVE,
          lastLogin: new Date(),
        });
      }
    } else {
      // Update user with Apple info if needed
      if (!user.authProviderId || user.authProvider !== AuthProvider.APPLE) {
        await userModel.findByIdAndUpdate(user._id, {
          authProviderId: appleUser.id,
          authProvider:
            user.authProvider === AuthProvider.EMAIL
              ? AuthProvider.APPLE
              : user.authProvider,
          lastLogin: new Date(),
        });
      } else {
        // Update last login
        await user.updateLastLogin();
      }
    }

    // Convert MongoDB ObjectId to string for consistency
    const userId = user._id.toString();

    // Generate token pair (access and refresh tokens)
    const { accessToken, refreshToken } = generateTokenPair({
      id: userId,
      email: user.email,
      role: user.role || UserRole.USER,
    });

    // Calculate refresh token expiry date
    const refreshExpiresIn = config.jwt.refreshExpiresIn || "30d";
    const refreshExpiryMs = refreshExpiresIn.endsWith("d")
      ? parseInt(refreshExpiresIn.slice(0, -1)) * 24 * 60 * 60 * 1000
      : refreshExpiresIn.endsWith("h")
      ? parseInt(refreshExpiresIn.slice(0, -1)) * 60 * 60 * 1000
      : 30 * 24 * 60 * 60 * 1000; // Default to 30 days

    const refreshExpiresAt = new Date(Date.now() + refreshExpiryMs);

    // Store refresh token in database
    await new RefreshToken({
      token: refreshToken,
      userId: user._id,
      expiresAt: refreshExpiresAt,
      status: TokenStatus.ACTIVE,
      device: metadata.device || "unknown",
      ip: metadata.ip || "",
      userAgent: metadata.userAgent || "",
    }).save();

    return {
      success: true,
      accessToken,
      refreshToken,
      user: {
        id: userId,
        email: user.email,
        username: user.username,
        displayName: user.displayName,
        role: user.role || UserRole.USER,
      },
    };
  } catch (error) {
    console.error("Error authenticating with Apple:", error);
    return { error: "Server error" };
  }
};

/**
 * Update user preferences
 * @param {string} userId - User ID
 * @param {Object} preferences - Preferences to update
 * @returns {Promise<Object>} Result with updated preferences or error
 */
export const updateUserPreferences = async (userId, preferences) => {
  try {
    if (!userId) {
      return { error: "User ID is required" };
    }

    // Build update object with only provided preferences
    const updateObject = {};
    
    if (preferences.currency !== undefined) {
      updateObject['preferences.currency'] = preferences.currency;
    }
    if (preferences.language !== undefined) {
      updateObject['preferences.language'] = preferences.language;
    }
    if (preferences.languageLevel !== undefined) {
      updateObject['preferences.languageLevel'] = preferences.languageLevel;
    }
    if (preferences.theme !== undefined) {
      updateObject['preferences.theme'] = preferences.theme;
    }
    if (preferences.notifications !== undefined) {
      if (preferences.notifications.email !== undefined) {
        updateObject['preferences.notifications.email'] = preferences.notifications.email;
      }
      if (preferences.notifications.push !== undefined) {
        updateObject['preferences.notifications.push'] = preferences.notifications.push;
      }
    }

    const user = await userModel.findByIdAndUpdate(
      userId,
      { $set: updateObject },
      { new: true, runValidators: true }
    ).select('preferences');

    if (!user) {
      return { error: "User not found" };
    }

    console.log(`Updated preferences for user ${userId}:`, user.preferences);

    return {
      success: true,
      preferences: user.preferences,
    };
  } catch (error) {
    console.error("Error updating user preferences:", error);
    return { error: "Server error" };
  }
};

/**
 * Get user preferences
 * @param {string} userId - User ID
 * @returns {Promise<Object>} Result with preferences or error
 */
export const getUserPreferences = async (userId) => {
  try {
    if (!userId) {
      return { error: "User ID is required" };
    }

    const user = await userModel.findById(userId).select('preferences');

    if (!user) {
      return { error: "User not found" };
    }

    return {
      success: true,
      preferences: user.preferences,
    };
  } catch (error) {
    console.error("Error getting user preferences:", error);
    return { error: "Server error" };
  }
};
