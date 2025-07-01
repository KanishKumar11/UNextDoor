/**
 * API Constants
 * Centralized API configuration constants
 */

// Re-export from the config file to maintain backward compatibility
import { API_BASE_URL, WS_BASE_URL, ENDPOINTS, STATUS_CODES, WS_CONFIG } from '../config/api';

// Export all constants
export {
  API_BASE_URL,
  WS_BASE_URL,
  ENDPOINTS,
  STATUS_CODES,
  WS_CONFIG,
};

// Default export for convenience
export default {
  API_BASE_URL,
  WS_BASE_URL,
  ENDPOINTS,
  STATUS_CODES,
  WS_CONFIG,
};
