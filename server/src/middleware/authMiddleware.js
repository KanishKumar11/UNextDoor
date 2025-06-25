import jwt from "jsonwebtoken";
import config from "../config/index.js";
import { sendError } from "../utils/responseUtils.js";

/**
 * Verify JWT token
 * @param {string} token - JWT token to verify
 * @returns {Object|null} Decoded token or null if invalid
 */
export const verifyToken = async (token) => {
  try {
    if (!token) {
      return null;
    }

    // Verify token
    const decoded = jwt.verify(token, config.jwt.secret);

    return {
      userId: decoded.id,
      email: decoded.email,
      role: decoded.role,
    };
  } catch (error) {
    console.error("Token verification error:", error);
    return null;
  }
};

/**
 * Middleware to authenticate JWT token
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
export const authenticateJWT = (req, res, next) => {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return sendError(res, 401, "Authorization header is required");
    }

    const token = authHeader.split(" ")[1];

    if (!token) {
      return sendError(res, 401, "Token is required");
    }

    // Verify token
    jwt.verify(token, config.jwt.secret, (err, decoded) => {
      if (err) {
        if (err.name === "TokenExpiredError") {
          return sendError(res, 401, "Token has expired");
        }

        return sendError(res, 401, "Invalid token");
      }

      // Attach user data to request
      req.user = {
        id: decoded.id,
        email: decoded.email,
        role: decoded.role,
      };

      next();
    });
  } catch (error) {
    console.error("Authentication middleware error:", error);
    return sendError(res, 500, "Server error");
  }
};

/**
 * Middleware to check if user has admin role
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
export const requireAdmin = (req, res, next) => {
  try {
    if (!req.user) {
      return sendError(res, 401, "Authentication required");
    }

    if (req.user.role !== "admin") {
      return sendError(res, 403, "Admin access required");
    }

    next();
  } catch (error) {
    console.error("Admin middleware error:", error);
    return sendError(res, 500, "Server error");
  }
};
