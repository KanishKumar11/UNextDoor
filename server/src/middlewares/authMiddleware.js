import {
  verifyToken,
  extractTokenFromHeader,
  TokenType,
} from "../utils/authUtils.js";
import { sendError } from "../utils/responseUtils.js";
import userModel from "../models/User.js";

/**
 * Middleware to authenticate requests
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
export const authenticate = async (req, res, next) => {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;
    const token = extractTokenFromHeader(authHeader);

    if (!token) {
      return sendError(res, 401, "Authentication required");
    }

    // Verify token as access token
    const decoded = verifyToken(token, TokenType.ACCESS);

    if (!decoded) {
      return sendError(res, 401, "Invalid or expired token");
    }

    // Log the decoded token for debugging (only in development)
    if (process.env.NODE_ENV === "development") {
      console.log("Decoded token:", decoded);
    }

    if (!decoded.id) {
      return sendError(res, 401, "Invalid token: missing user ID");
    }

    // Find user - use await to properly resolve the promise
    const user = await userModel.findById(decoded.id);

    if (process.env.NODE_ENV === "development") {
      console.log("User lookup result:", user ? "Found" : "Not found");
    }

    if (!user) {
      return sendError(res, 404, "User not found");
    }

    // Convert MongoDB ObjectId to string for consistency
    const userId = user._id.toString();

    // Attach user to request
    req.user = {
      id: userId, // Use string version of _id
      email: user.email,
      username: user.username,
      displayName: user.displayName,
      role: user.role || "user",
      createdAt: user.createdAt,
    };

    if (process.env.NODE_ENV === "development") {
      console.log("User attached to request:", req.user);
    }

    next();
  } catch (error) {
    console.error("Authentication error:", error);
    return sendError(res, 500, "Server error");
  }
};

/**
 * Middleware to check if user has required role
 * @param {string|string[]} roles - Required role(s)
 * @returns {Function} Express middleware
 */
export const authorize = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return sendError(res, 401, "Authentication required");
    }

    const userRole = req.user.role || "user";
    const requiredRoles = Array.isArray(roles) ? roles : [roles];

    if (!requiredRoles.includes(userRole)) {
      return sendError(
        res,
        403,
        "You don't have permission to access this resource"
      );
    }

    next();
  };
};

/**
 * Middleware to validate request body
 * @param {Array} requiredFields - Array of required field names
 * @returns {Function} Express middleware
 */
export const validateRequest = (requiredFields) => {
  return (req, res, next) => {
    console.log("validateRequest middleware called for path:", req.path);
    console.log("Content-Type:", req.headers["content-type"]);
    console.log("Request body:", req.body);
    console.log("Request body type:", typeof req.body);

    // Check if req.body exists
    if (!req.body) {
      console.error("Request body is missing");
      return sendError(res, 400, "Request body is missing");
    }

    // Check if req.body is empty
    if (Object.keys(req.body).length === 0) {
      console.error("Request body is empty");
      return sendError(res, 400, "Request body is empty");
    }

    // Check for missing fields
    const missingFields = requiredFields.filter((field) => !req.body[field]);

    if (missingFields.length > 0) {
      console.error(`Missing required fields: ${missingFields.join(", ")}`);
      return sendError(
        res,
        400,
        `Missing required fields: ${missingFields.join(", ")}`
      );
    }

    console.log("Request validation passed");
    next();
  };
};

/**
 * Middleware to validate request query parameters
 * @param {Array} requiredParams - Array of required parameter names
 * @returns {Function} Express middleware
 */
export const validateQueryParams = (requiredParams) => {
  return (req, res, next) => {
    const missingParams = requiredParams.filter((param) => !req.query[param]);

    if (missingParams.length > 0) {
      return sendError(
        res,
        400,
        `Missing required query parameters: ${missingParams.join(", ")}`
      );
    }

    next();
  };
};
