/**
 * Validate email format
 * @param {string} email - Email to validate
 * @returns {boolean} Is valid email
 */
export const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validate username format
 * @param {string} username - Username to validate
 * @returns {boolean} Is valid username
 */
export const isValidUsername = (username) => {
  // Username should be 3-20 characters and contain only letters, numbers, underscores, and hyphens
  const usernameRegex = /^[a-zA-Z0-9_-]{3,20}$/;
  return usernameRegex.test(username);
};

/**
 * Validate OTP format
 * @param {string} otp - OTP to validate
 * @returns {boolean} Is valid OTP
 */
export const isValidOTP = (otp) => {
  // OTP should be 6 digits
  const otpRegex = /^\d{6}$/;
  return otpRegex.test(otp);
};
