import jwt from "jsonwebtoken";
import config from "../config/index.js";

/**
 * Token types
 * @enum {string}
 */
export const TokenType = {
  ACCESS: "access",
  REFRESH: "refresh",
};

/**
 * Generate a JWT token
 * @param {Object} payload - Data to be encoded in the token
 * @param {TokenType} [type=TokenType.ACCESS] - Type of token to generate
 * @returns {string} JWT token
 */
export const generateToken = (payload, type = TokenType.ACCESS) => {
  // Ensure the id is a string if it's a MongoDB ObjectId
  const tokenPayload = { ...payload };

  if (
    tokenPayload.id &&
    typeof tokenPayload.id === "object" &&
    tokenPayload.id.toString
  ) {
    tokenPayload.id = tokenPayload.id.toString();
  }

  // Add token type to payload
  tokenPayload.type = type;

  console.log(`Generating ${type} token with payload:`, tokenPayload);

  // Determine expiration based on token type
  const expiresIn =
    type === TokenType.REFRESH
      ? config.jwt.refreshExpiresIn
      : config.jwt.expiresIn;

  return jwt.sign(tokenPayload, config.jwt.secret, {
    expiresIn,
  });
};

/**
 * Generate both access and refresh tokens
 * @param {Object} payload - Data to be encoded in the tokens
 * @returns {Object} Object containing access and refresh tokens
 */
export const generateTokenPair = (payload) => {
  return {
    accessToken: generateToken(payload, TokenType.ACCESS),
    refreshToken: generateToken(payload, TokenType.REFRESH),
  };
};

/**
 * Verify a JWT token
 * @param {string} token - JWT token to verify
 * @param {TokenType} [expectedType] - Expected token type (optional)
 * @returns {Object|null} Decoded token payload or null if invalid
 */
export const verifyToken = (token, expectedType) => {
  try {
    const decoded = jwt.verify(token, config.jwt.secret);

    // If expectedType is provided, verify token type
    if (expectedType && decoded.type !== expectedType) {
      console.warn(
        `Token type mismatch: expected ${expectedType}, got ${decoded.type}`
      );
      return null;
    }

    return decoded;
  } catch (error) {
    console.error("Token verification error:", error.message);
    return null;
  }
};

/**
 * Generate a random OTP
 * @param {number} [length=6] - Length of OTP
 * @returns {string} Random OTP
 */
export const generateOTP = (length = config.otp.length) => {
  // Generate a random number with the specified number of digits
  const min = Math.pow(10, length - 1);
  const max = Math.pow(10, length) - 1;
  return Math.floor(min + Math.random() * (max - min + 1)).toString();
};

/**
 * Extract token from authorization header
 * @param {string} authHeader - Authorization header
 * @returns {string|null} Token or null if not found
 */
export const extractTokenFromHeader = (authHeader) => {
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return null;
  }

  return authHeader.split(" ")[1];
};

/**
 * Create an authentication error
 * @param {string} message - Error message
 * @param {number} [statusCode=401] - HTTP status code
 * @returns {Error} Error object with statusCode property
 */
export const createAuthError = (message, statusCode = 401) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};
