import mongoose from "mongoose";

/**
 * User roles enum
 * @enum {string}
 */
export const UserRole = {
  USER: "user",
  ADMIN: "admin",
  TUTOR: "tutor",
};

/**
 * User status enum
 * @enum {string}
 */
export const UserStatus = {
  ACTIVE: "active",
  INACTIVE: "inactive",
  SUSPENDED: "suspended",
};

/**
 * Auth provider enum
 * @enum {string}
 */
export const AuthProvider = {
  EMAIL: "email",
  GOOGLE: "google",
  APPLE: "apple",
};

// Define the user schema
const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true, // Creates a unique index
      trim: true,
      lowercase: true,
    },
    username: {
      type: String,
      required: true,
      unique: true, // Creates a unique index
      trim: true,
    },
    displayName: {
      type: String,
      trim: true,
    },
    firstName: {
      type: String,
      trim: true,
      default: "",
    },
    lastName: {
      type: String,
      trim: true,
      default: "",
    },
    profilePicture: {
      type: String,
      default: "",
    },
    bio: {
      type: String,
      default: "",
      maxlength: 500,
    },
    location: {
      type: String,
      default: "",
    },
    phoneNumber: {
      type: String,
      default: "",
    },
    authProvider: {
      type: String,
      enum: Object.values(AuthProvider),
      default: AuthProvider.EMAIL,
    },
    authProviderId: {
      type: String,
      default: "",
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    role: {
      type: String,
      enum: Object.values(UserRole),
      default: UserRole.USER,
    },
    status: {
      type: String,
      enum: Object.values(UserStatus),
      default: UserStatus.ACTIVE,
    },
    lastLogin: {
      type: Date,
    },
    preferences: {
      language: {
        type: String,
        default: "en",
      },
      languageLevel: {
        type: String,
        enum: ["beginner", "intermediate", "advanced"],
        default: "beginner",
      },
      notifications: {
        email: {
          type: Boolean,
          default: true,
        },
        push: {
          type: Boolean,
          default: true,
        },
      },
      theme: {
        type: String,
        enum: ["light", "dark", "system"],
        default: "system",
      },
    },
    refreshTokens: [
      {
        token: {
          type: String,
          required: true,
        },
        expiresAt: {
          type: Date,
          required: true,
        },
        createdAt: {
          type: Date,
          default: Date.now,
        },
        device: {
          type: String,
          default: "unknown",
        },
        ip: {
          type: String,
          default: "",
        },
      },
    ],
  },
  {
    timestamps: true,
    toJSON: {
      transform: function (_doc, ret) {
        delete ret.refreshTokens; // Don't include refresh tokens in JSON
        return ret;
      },
    },
  }
);

// Keep index for refreshTokens.token, as it’s not implicitly indexed
userSchema.index({ "refreshTokens.token": 1 });

// Pre-save middleware to set displayName if not provided
userSchema.pre("save", function (next) {
  if (!this.displayName) {
    // Use firstName and lastName if available
    if (this.firstName || this.lastName) {
      this.displayName = [this.firstName, this.lastName]
        .filter(Boolean)
        .join(" ");
    } else {
      // Fall back to username
      this.displayName = this.username;
    }
  }
  next();
});

/**
 * Add a refresh token to the user
 * @param {string} token - Refresh token
 * @param {Date} expiresAt - Expiration date
 * @param {Object} metadata - Additional metadata
 * @returns {Promise<void>}
 */
userSchema.methods.addRefreshToken = async function (
  token,
  expiresAt,
  metadata = {}
) {
  const { device = "unknown", ip = "" } = metadata;

  // Add the new token
  this.refreshTokens.push({
    token,
    expiresAt,
    device,
    ip,
    createdAt: new Date(),
  });

  // Limit the number of refresh tokens per user (keep the most recent 5)
  if (this.refreshTokens.length > 5) {
    this.refreshTokens = this.refreshTokens
      .sort((a, b) => b.createdAt - a.createdAt)
      .slice(0, 5);
  }

  // Remove expired tokens
  const now = new Date();
  this.refreshTokens = this.refreshTokens.filter((t) => t.expiresAt > now);

  await this.save();
};

/**
 * Remove a refresh token from the user
 * @param {string} token - Refresh token to remove
 * @returns {Promise<boolean>} True if token was found and removed
 */
userSchema.methods.removeRefreshToken = async function (token) {
  const initialCount = this.refreshTokens.length;
  this.refreshTokens = this.refreshTokens.filter((t) => t.token !== token);

  if (initialCount !== this.refreshTokens.length) {
    await this.save();
    return true;
  }

  return false;
};

/**
 * Remove all refresh tokens from the user
 * @returns {Promise<number>} Number of tokens removed
 */
userSchema.methods.removeAllRefreshTokens = async function () {
  const count = this.refreshTokens.length;
  this.refreshTokens = [];
  await this.save();
  return count;
};

/**
 * Find a user by refresh token
 * @param {string} token - Refresh token
 * @returns {Promise<Object|null>} User document or null
 */
userSchema.statics.findByRefreshToken = async function (token) {
  return this.findOne({
    "refreshTokens.token": token,
    "refreshTokens.expiresAt": { $gt: new Date() },
  });
};

/**
 * Update last login timestamp
 * @returns {Promise<void>}
 */
userSchema.methods.updateLastLogin = async function () {
  this.lastLogin = new Date();
  await this.save();
};

// Create and export the User model
const User = mongoose.model("User", userSchema);
export default User;
