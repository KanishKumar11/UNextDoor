/**
 * Utility functions for error handling
 */

/**
 * Format error messages for display
 * @param {string|Error} error - Error message or Error object
 * @returns {string} Formatted error message
 */
export const formatErrorMessage = (error) => {
  if (!error) return null;
  
  // If error is an Error object, get the message
  const errorMessage = error instanceof Error ? error.message : error;
  
  // Handle common error messages and make them more user-friendly
  if (errorMessage.includes('Network request failed')) {
    return 'Network connection error. Please check your internet connection.';
  }
  
  if (errorMessage.includes('timed out')) {
    return 'Server is not responding. Please try again later.';
  }
  
  if (errorMessage.includes('JSON')) {
    return 'Invalid response from server. Please try again later.';
  }
  
  // Return the original error message if no specific handling is needed
  return errorMessage;
};

/**
 * Parse API error responses
 * @param {Object} response - API response object
 * @returns {string} Error message
 */
export const parseApiError = (response) => {
  if (!response) return 'Unknown error occurred';
  
  // Check for error message in different formats
  if (response.message) {
    return response.message;
  }
  
  if (response.error) {
    return response.error;
  }
  
  if (response.data && response.data.message) {
    return response.data.message;
  }
  
  if (response.data && response.data.error) {
    return response.data.error;
  }
  
  return 'An unexpected error occurred';
};

/**
 * Handle API errors consistently
 * @param {Error} error - Error object
 * @param {Function} setError - Function to set error state
 * @param {Function} dispatch - Redux dispatch function (optional)
 * @param {Function} errorAction - Redux action to dispatch (optional)
 */
export const handleApiError = (error, setError, dispatch = null, errorAction = null) => {
  const formattedError = formatErrorMessage(error);
  
  // Set local error state
  if (setError) {
    setError(formattedError);
  }
  
  // Dispatch to Redux if provided
  if (dispatch && errorAction) {
    dispatch(errorAction(formattedError));
  }
  
  // Log error for debugging
  console.error('API Error:', error);
  
  return formattedError;
};
