/**
 * Authentication Middleware
 * 
 * This middleware provides authentication functionality for API endpoints.
 */

import jwt from 'jsonwebtoken';
import config from '../config/index.js';

/**
 * Authenticate JWT token middleware
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
export const authenticateToken = (req, res, next) => {
  try {
    // Get token from Authorization header
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ error: 'Authentication token required' });
    }
    
    // Verify token
    jwt.verify(token, config.jwt.secret, (err, decoded) => {
      if (err) {
        if (err.name === 'TokenExpiredError') {
          return res.status(401).json({ error: 'Token expired' });
        }
        
        return res.status(403).json({ error: 'Invalid token' });
      }
      
      // Attach user data to request
      req.user = decoded;
      next();
    });
  } catch (error) {
    console.error('Authentication error:', error);
    res.status(500).json({ error: 'Authentication failed' });
  }
};
