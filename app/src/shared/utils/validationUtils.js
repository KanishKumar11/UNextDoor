/**
 * Utility functions for form validation
 */
import { z } from 'zod';

/**
 * Email validation schema
 */
export const emailSchema = z.object({
  email: z.string()
    .email('Please enter a valid email address')
    .min(1, 'Email is required'),
});

/**
 * OTP validation schema
 */
export const otpSchema = z.object({
  otp: z.string()
    .min(6, 'OTP must be 6 digits')
    .max(6, 'OTP must be 6 digits')
    .regex(/^\d+$/, 'OTP must contain only digits'),
});

/**
 * Username validation schema
 */
export const usernameSchema = z.object({
  username: z.string()
    .min(3, 'Username must be at least 3 characters')
    .max(30, 'Username must be at most 30 characters')
    .regex(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores'),
});

/**
 * Registration validation schema
 */
export const registrationSchema = z.object({
  username: z.string()
    .min(3, 'Username must be at least 3 characters')
    .max(30, 'Username must be at most 30 characters')
    .regex(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores'),
  displayName: z.string()
    .max(50, 'Display name must be at most 50 characters')
    .optional(),
});

/**
 * Profile validation schema
 */
export const profileSchema = z.object({
  displayName: z.string()
    .max(50, 'Display name must be at most 50 characters')
    .optional(),
  bio: z.string()
    .max(200, 'Bio must be at most 200 characters')
    .optional(),
});

/**
 * Validate email format
 * @param {string} email - Email to validate
 * @returns {boolean} Whether the email is valid
 */
export const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validate OTP format
 * @param {string} otp - OTP to validate
 * @returns {boolean} Whether the OTP is valid
 */
export const isValidOTP = (otp) => {
  const otpRegex = /^\d{6}$/;
  return otpRegex.test(otp);
};

/**
 * Validate username format
 * @param {string} username - Username to validate
 * @returns {boolean} Whether the username is valid
 */
export const isValidUsername = (username) => {
  const usernameRegex = /^[a-zA-Z0-9_]{3,30}$/;
  return usernameRegex.test(username);
};
