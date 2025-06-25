import mongoose from "mongoose";
import config from "../config/index.js";

// Define the OTP schema
const otpSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    trim: true,
    lowercase: true,
    index: true,
  },
  otp: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: config.otp.expiryTime / 1000, // Convert ms to seconds for TTL index
  },
  expiresAt: {
    type: Date,
    required: true,
  },
});

// Create the OTP model
const OTPModel = mongoose.model("OTP", otpSchema);

// OTP service with methods to interact with the database
class OTP {
  /**
   * Create a new OTP for an email
   * @param {string} email - User email
   * @param {string} otp - Generated OTP
   * @returns {Promise<Object>} OTP data
   */
  async create(email, otp) {
    // Delete any existing OTPs for this email
    await OTPModel.deleteMany({ email });

    // Create new OTP
    const otpData = new OTPModel({
      otp,
      email,
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + config.otp.expiryTime),
    });

    await otpData.save();
    return otpData;
  }

  /**
   * Find OTP data by email
   * @param {string} email - User email
   * @returns {Promise<Object|null>} OTP data or null if not found
   */
  async findByEmail(email) {
    return await OTPModel.findOne({ email });
  }

  /**
   * Verify an OTP
   * @param {string} email - User email
   * @param {string} otp - OTP to verify
   * @returns {Promise<boolean>} Is valid OTP
   */
  async verify(email, otp) {
    const otpData = await this.findByEmail(email);

    if (!otpData) {
      return false;
    }

    // Check if OTP is expired
    if (otpData.expiresAt < new Date()) {
      await this.delete(email);
      return false;
    }

    // Check if OTP matches
    return otpData.otp === otp;
  }

  /**
   * Delete an OTP
   * @param {string} email - User email
   * @returns {Promise<boolean>} Success status
   */
  async delete(email) {
    const result = await OTPModel.deleteMany({ email });
    return result.deletedCount > 0;
  }

  /**
   * Clean up expired OTPs
   * Not needed with MongoDB TTL index, but kept for API compatibility
   */
  async cleanupExpired() {
    // MongoDB TTL index handles this automatically
    return true;
  }
}

// Create and export a singleton instance
const otpModel = new OTP();
export default otpModel;
