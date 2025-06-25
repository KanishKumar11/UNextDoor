import { sendError } from '../utils/responseUtils.js';

/**
 * Middleware to check if the user has admin role
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
export const isAdmin = (req, res, next) => {
  try {
    // Check if user exists in request (should be set by authenticate middleware)
    if (!req.user) {
      return sendError(res, 401, 'Authentication required');
    }

    // Check if user has admin role
    if (req.user.role !== 'admin') {
      return sendError(res, 403, 'Admin access required');
    }

    // User is admin, proceed to next middleware
    next();
  } catch (error) {
    console.error('Error in isAdmin middleware:', error);
    return sendError(res, 500, 'Server error');
  }
};

/**
 * Middleware to check if the user has tutor role
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
export const isTutor = (req, res, next) => {
  try {
    // Check if user exists in request (should be set by authenticate middleware)
    if (!req.user) {
      return sendError(res, 401, 'Authentication required');
    }

    // Check if user has tutor role
    if (req.user.role !== 'tutor' && req.user.role !== 'admin') {
      return sendError(res, 403, 'Tutor access required');
    }

    // User is tutor or admin, proceed to next middleware
    next();
  } catch (error) {
    console.error('Error in isTutor middleware:', error);
    return sendError(res, 500, 'Server error');
  }
};

/**
 * Middleware to check if the user has a specific role
 * @param {string[]} roles - Array of allowed roles
 * @returns {Function} Middleware function
 */
export const hasRole = (roles) => {
  return (req, res, next) => {
    try {
      // Check if user exists in request (should be set by authenticate middleware)
      if (!req.user) {
        return sendError(res, 401, 'Authentication required');
      }

      // Check if user has one of the allowed roles
      if (!roles.includes(req.user.role)) {
        return sendError(res, 403, 'Access denied');
      }

      // User has allowed role, proceed to next middleware
      next();
    } catch (error) {
      console.error('Error in hasRole middleware:', error);
      return sendError(res, 500, 'Server error');
    }
  };
};

export default {
  isAdmin,
  isTutor,
  hasRole,
};
