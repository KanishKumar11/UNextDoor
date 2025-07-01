import nodemailer from "nodemailer";
import config from "../config/index.js";

// Cache the HTML template for OTP emails (excluding dynamic parts)
const otpEmailTemplate = (otp) => `
  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
    <h2 style="color: #333; text-align: center;">UNextDoor Authentication</h2>
    <p style="font-size: 16px; line-height: 1.5; color: #555;">Your one-time password (OTP) is:</p>
    <div style="background-color: #f5f5f5; padding: 15px; border-radius: 4px; text-align: center; font-size: 24px; font-weight: bold; letter-spacing: 5px; margin: 20px 0;">
      ${otp}
    </div>
    <p style="font-size: 14px; color: #777;">This OTP will expire in 5 minutes.</p>
    <p style="font-size: 14px; color: #777;">If you didn't request this OTP, please ignore this email.</p>
    <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e0e0e0; text-align: center; font-size: 12px; color: #999;">
      © ${new Date().getFullYear()} UNextDoor. All rights reserved.
    </div>
  </div>
`;

// Create nodemailer transporter with connection pooling
const transporter = nodemailer.createTransport({
  host: config.email.host,
  port: config.email.port,
  secure: config.email.port === 465, // Use true for port 465 (SMTPS), false for others (STARTTLS)
  pool: true, // Enable connection pooling
  maxConnections: 5, // Allow up to 5 concurrent connections
  maxMessages: 100, // Allow up to 100 messages per connection
  rateLimit: 10, // Limit to 10 messages per second (adjust based on provider)
  auth: {
    user: config.email.user,
    pass: config.email.pass,
  },
  requireTLS: true, // Enforce TLS for secure connections
  logger: process.env.NODE_ENV === "development", // Enable logging only in development
  debug: process.env.NODE_ENV === "development", // Enable debug output only in development
});

/**
 * Send an email
 * @param {string|string[]} to - Recipient email(s)
 * @param {string} subject - Email subject
 * @param {string} text - Plain text content
 * @param {string} [html] - HTML content (optional)
 * @returns {Promise<boolean>} Success status
 */
export const sendEmail = async (to, subject, text, html = null) => {
  try {
    const mailOptions = {
      from: `"Kanish Kumar" <${config.email.user}>`,
      to, // Supports single email or array of emails
      subject,
      text,
      ...(html && { html }), // Conditionally include HTML
    };

    // In development, log email instead of sending
    if (process.env.NODE_ENV === "development") {
      console.log("Email would be sent:", {
        to,
        subject,
        text,
        ...(html && { html }),
      });
      // return true;
    }

    // Send email
   const res= await transporter.sendMail(mailOptions);
   console.log(res);
    return true;
  } catch (error) {
    console.error("Error sending email:", error.message);
    return false;
  }
};

/**
 * Send OTP email
 * @param {string} to - Recipient email
 * @param {string} otp - One-time password
 * @returns {Promise<boolean>} Success status
 */
export const sendOTPEmail = async (to, otp) => {
  const subject = "Your OTP for UNextDoor";
  const text = `Your OTP is: ${otp}. It will expire in 5 minutes.`;
  const html = otpEmailTemplate(otp); // Use cached template with dynamic OTP

  return sendEmail(to, subject, text, html);
};

// Verify transporter configuration on startup
transporter.verify((error, success) => {
  if (error) {
    console.error("Transporter verification failed:", error.message);
  } else {
    console.log("Email transporter is ready");
  }
});
