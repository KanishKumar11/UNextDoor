import mongoose from "mongoose";

/**
 * Token status enum
 * @enum {string}
 */
export const TokenStatus = {
  ACTIVE: "active",
  REVOKED: "revoked",
  EXPIRED: "expired",
};

/**
 * Refresh token schema
 * Stores refresh tokens separately from the user model for better scalability
 * and to allow for more detailed token management
 */
const refreshTokenSchema = new mongoose.Schema(
  {
    token: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    expiresAt: {
      type: Date,
      required: true,
      index: true,
    },
    status: {
      type: String,
      enum: Object.values(TokenStatus),
      default: TokenStatus.ACTIVE,
      index: true,
    },
    device: {
      type: String,
      default: "unknown",
    },
    ip: {
      type: String,
      default: "",
    },
    userAgent: {
      type: String,
      default: "",
    },
    revokedAt: {
      type: Date,
    },
    revokedReason: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

/**
 * Check if token is expired
 * @returns {boolean} True if token is expired
 */
refreshTokenSchema.methods.isExpired = function () {
  return new Date() > this.expiresAt;
};

/**
 * Check if token is active
 * @returns {boolean} True if token is active
 */
refreshTokenSchema.methods.isActive = function () {
  return this.status === TokenStatus.ACTIVE && !this.isExpired();
};

/**
 * Revoke token
 * @param {string} reason - Reason for revocation
 * @returns {Promise<void>}
 */
refreshTokenSchema.methods.revoke = async function (reason = "User logout") {
  this.status = TokenStatus.REVOKED;
  this.revokedAt = new Date();
  this.revokedReason = reason;
  await this.save();
};

/**
 * Find active token by token string
 * @param {string} token - Token string
 * @returns {Promise<Object|null>} Token document or null
 */
refreshTokenSchema.statics.findActiveToken = async function (token) {
  const tokenDoc = await this.findOne({ token });
  
  if (!tokenDoc) {
    return null;
  }
  
  // If token is expired but not marked as expired, update it
  if (tokenDoc.isExpired() && tokenDoc.status !== TokenStatus.EXPIRED) {
    tokenDoc.status = TokenStatus.EXPIRED;
    await tokenDoc.save();
    return null;
  }
  
  return tokenDoc.isActive() ? tokenDoc : null;
};

/**
 * Revoke all tokens for a user
 * @param {string} userId - User ID
 * @param {string} reason - Reason for revocation
 * @returns {Promise<number>} Number of tokens revoked
 */
refreshTokenSchema.statics.revokeAllForUser = async function (userId, reason = "User logout") {
  const result = await this.updateMany(
    { 
      userId, 
      status: TokenStatus.ACTIVE 
    },
    { 
      status: TokenStatus.REVOKED,
      revokedAt: new Date(),
      revokedReason: reason,
    }
  );
  
  return result.modifiedCount;
};

/**
 * Clean up expired tokens
 * @param {number} olderThanDays - Remove tokens older than this many days
 * @returns {Promise<number>} Number of tokens removed
 */
refreshTokenSchema.statics.cleanupExpiredTokens = async function (olderThanDays = 30) {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - olderThanDays);
  
  // Mark expired tokens
  await this.updateMany(
    { 
      expiresAt: { $lt: new Date() },
      status: TokenStatus.ACTIVE,
    },
    { 
      status: TokenStatus.EXPIRED,
    }
  );
  
  // Remove old expired or revoked tokens
  const result = await this.deleteMany({
    $or: [
      { status: TokenStatus.EXPIRED, createdAt: { $lt: cutoffDate } },
      { status: TokenStatus.REVOKED, createdAt: { $lt: cutoffDate } },
    ],
  });
  
  return result.deletedCount;
};

// Create and export the RefreshToken model
const RefreshToken = mongoose.model("RefreshToken", refreshTokenSchema);
export default RefreshToken;
